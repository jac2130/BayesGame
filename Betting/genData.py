import dataDAO
import time
import pymongo
from random import random
from mClassDAO import mClasses
from pprint import pprint
import json
from bayesian.bbn import build_bbn_from_conditionals as build_graph
import computerValueDAO

connection = pymongo.MongoClient()
database = connection.blog

data = dataDAO.DataDAO(database)
computerValue = computerValueDAO.ComputerValueDAO(database)

#build_graph(yaml.load(json.dumps(l[-1][str(_id)]))) the object we will have in modelDAO

TRUTH = {
        "prize_door": [
            # For nodes that have no parents
            # use the empty list to specify
            # the conditioned upon variables
            # ie conditioned on the empty set
            [[], {"A": float(1)/3, "B": float(1)/3, "C": float(1)/3}]],
        "contestant_door": [
            [[], {"A": float(1)/3, "B": float(1)/3, "C": float(1)/3}]],
        "monty_door": [
            [[["prize_door", "A"], ["contestant_door", "A"]], {"A": 0, "B": 0.5, "C": 0.5}],
            [[["prize_door", "A"], ["contestant_door", "B"]], {"A": 0, "B": 0, "C": 1}],
            [[["prize_door", "A"], ["contestant_door", "C"]], {"A": 0, "B": 1, "C": 0}],
            [[["prize_door", "B"], ["contestant_door", "A"]], {"A": 0, "B": 0, "C": 1}],
            [[["prize_door", "B"], ["contestant_door", "B"]], {"A": 0.5, "B": 0, "C": 0.5}],
            [[["prize_door", "B"], ["contestant_door", "C"]], {"A": 1, "B": 0, "C": 0}],
            [[["prize_door", "C"], ["contestant_door", "A"]], {"A": 0, "B": 1, "C": 0}],
            [[["prize_door", "C"], ["contestant_door", "B"]], {"A": 1, "B": 0, "C": 0}],
            [[["prize_door", "C"], ["contestant_door", "C"]], {"A": 0.5, "B": 0.5, "C": 0}],
        ]
    }


g=build_graph(TRUTH)

def indep_wrap(varName, d={}, p=0.5):
    d[varName]= [[[],{"H":p , "L":1.0-p}]]
    return d

def one_cause_wrap(depVar, indepVar, d, p=0.5, neg=set()):
    if indepVar not in neg:
        d[depVar]=[
            [[[indepVar, "H"]], {"H": p, "L": 1-p}],
            [[[indepVar, "L"]], {"H": 0, "L": 1.0}]]
    else:
        d[depVar]=[
            [[[indepVar, "H"]], {"H": 0, "L": 1.0}],
            [[[indepVar, "L"]], {"H": p, "L": 1.0-p}]]
    return d
        
gaph_a=build_graph(TRUTH)
def relabel(label='H'):

    if label=='L':
        return 0
    else:
        return 1
def sub_dict(d, var_list):
    s={}
    for var in var_list:
        s[var]=d[var]
    return s

def noisy_Or(depVar, p=1.0/2, d={}, neg=set([])):
    '''
    this puts out the next 'H' or 'L' value for one dependent variable, given 
    some independent variables and a parameter p, according to Pearl's 1988
    noisy-Or function. 
    depVar is the name of the dependent variable, a string
    indepVars is a list of dictionaries with variable names and values 'H', 'L'
    neg is a parameter that is either an empty set, in which case every
    causal effect is positive, or it contains a set of negative effect
    variables.
    '''
    posProb=1
    
    '''for val in neg:
        print val, 1-relabel(d[val])
        posProb *= (1-p)**(1-relabel(d[val]))'''
    for val in d.keys(): 
#indepVars must be a list of dictionaries: {'monty':"H"}
        if val not in neg:
            posProb *= (1-p)**relabel(d[val])
        else:
            posProb *= (1-p)**(1-relabel(d[val]))

    prob=1-posProb
    d[depVar] = "H" if random() < prob else "L"
    return d

def causes(depVar, indepList, d, p=1.0/2, neg=set()):
    s = sub_dict(d, indepList)
    s=noisy_Or(depVar, p, s, neg)
    d[depVar]=s[depVar]
    return d

def indepVar(varName, p, d={}):
    num = random()
    if num<p: 
        d[varName]="H"
    else:
        d[varName]="L"
    return d 

class MissingCauseError(Exception):
    def __init__(self, value="the cause was not found!"):
        self.value = value
    def __str__(self):
        return repr(self.value)

def one_cause(depVar, indepVar, p, d, neg=set()):
    if indepVar not in d.keys():
        raise MissingCauseError()

    "if some other label gets in the way:"
    if d[indepVar]!="H":
        d[indepVar]="L"
        
    num = random()
    if (d[indepVar]=="L" and indepVar not in neg) or (d[indepVar]=="H" and indepVar in neg) or num > p:
        d[depVar]="L"
    else:
        d[depVar]="H"
    
    return d

def random_demo(p=0.5):
    '''
    This is the tutorial model that students will be presented with before
    actual game play begins.
    The five variables are named 
    'interest_rate', 'production', 'exports' , 'unemployment'
    There is one parameter that determines all probabilistic relationships,
    called p. Causation follows the noisy-Or parameterization of 
    Judea Pearl 1988: 
    (https://www.cs.berkeley.edu/~russell/papers/hbtnn-bn.pdf).  
    p(A=1|B=b, C=c)= 1-(1-p)**b(1-p)**c
    clearly, when c=b=0, then this probability is 0 and thus either B=1, or
    C=1, or both lead to a posive probability of A being 1. At the extreme,
    where p=1, this is simply the OR gate, when p=0 there is no causation and
    when p=0.5 entropy of causation is maximized (the system is most
    stochastic). 
    '''
    d={};
    d['period']=0;
    d=indepVar("interest_rate", p, d)
    d=one_cause("unemployment", "interest_rate", p, d)
    d=one_cause("production", "unemployment", p, d, set(["unemployment"]))
    d=causes("exports", ["production", "interest_rate", "unemployment"], d, p, set(["unemployment"]))
    return d


def random_intermediate(p=0.5):
    '''
    There will be a less complex and a more complex version of this model
    '''
    d={}
    d['period']=0;
    d=indepVar("interest_rate", p, d)
    d=indepVar("general_motors", p, d)
    d=one_cause("bank_income", "interest_rate", p, d)
    d=causes("consumer_spending", ["interest_rate", "general_motors"], d, p, neg=set(["interest_rate"]))
    return d

def random_simple(p=0.5):
    d={}
    d['period']=0;
    d=indepVar("interest_rate", p, d)
    d=indepVar("bank_income", p, d)
    d=causes("general_motors", ["interest_rate", "bank_income"], d, p, neg=set(["interest_rate"]))
    return d 

def random_complex(p=0.5):
    d={}
    d['period']=0;
    d=indepVar("interest_rate", p, d)
    d=indepVar("bank_income", p, d)
    d=causes("general_motors", ["interest_rate", "bank_income"], d, p, neg=set(["interest_rate"]))
    d=causes("consumer_spending", ["interest_rate", "general_motors"], d, p, neg=set(["interest_rate"]))
    return d

def random_monty():
    d={};
    d['period']=0;
    num = random()
    if num<1.0/3:
        d["prize_door"]="A"
    elif num < 2.0/3:
        d["prize_door"]="B"
    else:
        d["prize_door"]="C"
    num=random()
    if num<1.0/3:
        d["contestant_door"]="A"
    elif num < 2.0/3:
        d["contestant_door"]="B"
    else:
        d["contestant_door"]="C"
    if d["prize_door"]==d["contestant_door"]=="A":
        num=random()
        if num < 0.5:
            d["monty_door"]="B"
        else: d["monty_door"]="C"
    elif d["prize_door"]==d["contestant_door"]=="B":
        num=random()
        if num < 0.5:
            d["monty_door"]="A"
        else: d["monty_door"]="C"
    elif d["prize_door"]==d["contestant_door"]=="C":
        num=random()
        if num < 0.5:
            d["monty_door"]="A"
        else: d["monty_door"]="B"
    elif (d["prize_door"]=="A" and d["contestant_door"]=="B"):
        d["monty_door"]="C"
    elif (d["prize_door"]=="A" and d["contestant_door"]=="C"):
        d["monty_door"]="B"
    elif (d["prize_door"]=="B" and d["contestant_door"]=="C"):
        d["monty_door"]="A"
    elif (d["prize_door"]=="B" and d["contestant_door"]=="A"):
        d["monty_door"]="C"
    elif (d["prize_door"]=="C" and d["contestant_door"]=="B"):
        d["monty_door"]="A"
    elif (d["prize_door"]=="C" and d["contestant_door"]=="A"):
        d["monty_door"]="B"
    return d

def random_banking():
    d={};
    d['period']=0;
    num=random()
    if num<1.0/3:
        d["bank_1"]="H"
    else:
        d["bank_1"]="L"

    if d["bank_1"] =="H" and random() < 0.8:
        d["bank_2"]="H"
    else:
        d["bank_2"]="L"
    return d

def gen_next_period(modelName, count):
    if modelName == "monty":
        new_point = random_monty()
    elif modelName == "banking":
        new_point = random_banking()
    elif modelName == "demo":
        new_point = random_demo()
    elif modelName == "complex":
        new_point = random_complex()
    elif modelName == "simple":
        new_point = random_simple()

    else: raise ValueError ("invalid thread_name")
    new_point['period'] = count + 1
    new_point['modelClass'] = modelName
    new_point['entry_time'] = time.time()
    data.add_data([new_point], {"model_name": modelName})
    #print "%s: %s, period %s" % ( threadName, time.ctime(time.time()), new_point )

def gen_first_twenty(modelName):
    count = 0
    while count<21:
        if modelName == "monty":
            new_point = random_monty()
        elif modelName == "banking":
            new_point = random_banking()
        elif modelName == "demo":
            new_point = random_demo()
        elif modelName == "simple":
            new_point = random_simple()
        elif modelName == "complex":
            new_point = random_complex()
        else: raise ValueError ("invalid thread_name")
        new_point['period'] = count + 1
        new_point['modelClass'] = modelName
        new_point['entry_time'] = time.time()
        data.add_data([new_point], {"model_name": modelName})
        #print "%s: %s, period %s" % ( threadName, time.ctime(time.time()), new_point )
        count += 1

def getClockTime():
    timeJSON = data.getTimeUntilTwoMinuteMark()
    minutes, seconds = json.loads(timeJSON)
    return 60*minutes + seconds

#modelNames = ['monty', 'banking', 'demo']
#betting_variables={"monty":"prize_door", "banking":'bank_2'}
modelNames = mClasses.keys()

for modelName in modelNames:
    gen_first_twenty(modelName)
#pprint(data.get_first_twenty({'model_name': 'demo'}))

count = 20
prevTime = getClockTime()
genTime = 10
currTimeInSecs = -1
while True:
    timeInSecs=-1
    timeInSecs = getClockTime()
    if timeInSecs != prevTime:
        timeUpdated = True
    else:
        timeUpdated = False
    if timeInSecs == 0 and timeUpdated:
        #print "rerun"
        for modelName in modelNames:
            #print count
            gen_next_period(modelName, count)
            computerValue.newRandomValue()
        #pprint(data.get_first_twenty({'model_name': 'demo'}))
        count += 1
    prevTime = timeInSecs
    #print timeInSecs
    #print
    time.sleep(0.1)

