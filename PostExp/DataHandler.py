import operator
import time
import calendar
import os, sys
from random import random
import requests
import pymongo
os.chdir('/var/www/Betting/')
#import blogPostDAO
import mClassDAO
import pointsDAO
import sessionDAO
import pictureDAO
import dataDAO
import putsDAO
import modelDAO
import userDAO
import computerValueDAO
#import bottle
import cgi
import re
import json
from bayesian.bbn import build_bbn_from_conditionals as build_graph
from numpy import sort
from itertools import product
os.chdir('/var/www/PostExp/')
connection_string = "mongodb://localhost" #The name of the mongo connection
connection = pymongo.MongoClient(connection_string) 
#The actual connection object
database = connection.blog #The directory in the Mongo Database that we use. 
mClass = mClassDAO.mClassDAO(database) 
#Access to the classes of models seen by the participants 
#posts = blogPostDAO.BlogPostDAO(database) #Optimistic Bets 
puts  = putsDAO.PutsDAO(database) #Pessimistic Bets
users = userDAO.UserDAO(database) #Access to the information on participants 
models=modelDAO.ModelDAO(database) 
#Access to the statistical models proposed by participants; Bayes Nets
sessions = sessionDAO.SessionDAO(database) #Access to information about sessions
data = dataDAO.DataDAO(database) #The data stream seen by participants over time
points=pointsDAO.PointsDAO(database) #budget for user i over time (betting periods).
cvd = computerValueDAO.ComputerValueDAO(database) #The computer's buying and selling behavior, which was randomly drawn at each period. 

#First two helper functions, used to match models in time 

def match(ls,i):
    try: return max([item for item in ls if item <= i]) 
    except: 
        return None

def n_nary_list_match(list_of_lists):
    combined=sorted(set(reduce(operator.add, list_of_lists)))
    new_list=[list(sort(l)) for l in list_of_lists]
    return [tuple(match(l, j) for l in new_list) for j in combined] 

#######################################################################
#Some graph helper functions that should really be graph methods
#######################################################################
def names(graph):
    args=[item for item1, item in sorted([(len(node.argspec), node.argspec) for node in graph.nodes])]
    name_set=set()
    names=[]
    for name_list in args:
        for name in name_list:
            names.append(name) if name not in name_set else None
            name_set.add(name)
    return names

def get_prob(g, item):
    g.names=names(g)
    g.marginal = lambda name: {item: g.query()[(name, item)] for item in g.domains[name]}
    g.cross_prod=set(product(*[list(g.domains[name]) for name in g.names])) 
    pr=1
    item_dict= dict(zip(g.names, item))
    for i in range(len(g.names)):
        #print g.marginal(g.names[i])[item[i]]
        incr = g.marginal(g.names[i])[item[i]] if i==0 else g.query(**{name:item_dict[name] for name in g.names[:i]})[(g.names[i], item[i])]
        pr*=incr
    return pr

def graph_tools(g):
    g.names=names(g)
    g.prob=lambda item: get_prob(g, item)
    g.cross_prod=set(product(*[list(g.domains[name]) for name in g.names])) 
    g.probs=[g.prob(item) for item in g.cross_prod]
    return g

#####################################################################################################
def get_time(month, day, year=15, hour=12):
    months=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"]
    out= str(day)+ " " + str(months[month-1]) + " " + str(year)+ " 05" #For NYC time this is midnight.
    return calendar.timegm(time.strptime(out, "%d %b %y %H"))

def find_ids(month, day, year=15):
    t=get_time(month, day, year);
    try:
        t1=get_time(month, day+1, year);
    except:
        t1=get_time(month+1, 1, year);
    query={'entry_time':{"$gt":t, "$lt": t1}}
    projection={"_id":0, "id":1, 'entry_time':1}
    sorted_by_time = sort([(thing['entry_time'], thing['id']) for thing in users.users.find(query, projection)])
    id_dict={}
    out=[]
    for t, i in sorted_by_time:
        if id_dict.get(i, 0): continue
        else: 
            id_dict[i]=time.ctime(eval(t))
            out.append(i)
    return out

def find_models(user_id, day, month="", year=15): 
    months=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"]
    if not month:
        month=months.index(time.ctime(time.time()).split(" ")[1])+1;
    t=get_time(month, day, year);
    try:
        t1=get_time(month, day+1, year);
    except:
        t1=get_time(month+1, 1, year);
    query={'id':user_id, 'entry_time':{"$gt":t, "$lt": t1}}
    projection={"_id":0, user_id:1, 'entry_time':1}
    out={}
    out[user_id]={entry['entry_time']: entry[user_id] for entry in models.models.find(query, projection)}
    return out


def find_all_models(day, month="", year=15):
    months=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"]
    if not month:
        month=months.index(time.ctime(time.time()).split(" ")[1])+1; 
    ids=find_ids(month, day, year)
    return [find_models(i, day, month, year) for i in ids]
    
def get_ordered_tuplets(mods):
    return n_nary_list_match([m[m.keys()[0]].keys() for m in mods])

def get_ordered_models(tuplet, mods):
    ids=[m.keys()[0] for m in mods]
    key_model_zip=zip(ids, tuplet, mods)
    out_list=[m[i][t] for i, t, m in key_model_zip if None not in set([i, t])]
    j=0
    for i, t, m in key_model_zip:
        if None in set([i, t]):
            out_list.insert(j, {})
        j+=1
    return tuple(out_list)

def ordered_graphs(ordered_mods):
    graphs=[] 
    for i, m in enumerate(ordered_mods):
        try:
            g=build_graph(yaml.load(json.dumps(m)))
            graph_tools(g)
            graphs.insert(i, g)
        except:
            graphs.insert(i, None)
    return graphs

def get_all_graphs(day, month="", year=15):
    months=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"]
    if not month:
        month=months.index(time.ctime(time.time()).split(" ")[1])+1;

    mods=find_all_models(day, month, year)
    #ids=find_ids(month, day, year)
    return [ordered_graphs(get_ordered_models(tuplet, mods)) for tuplet in get_ordered_tuplets(mods)]




    
