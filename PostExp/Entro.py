# Copyright 2010 Allen B. Downey
#
# License: GNU GPLv3 http://www.gnu.org/licenses/gpl.html

"""Functions for building PMFs (probability mass functions)."""
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
os.chdir('/var/www/PostExp/')
from gaussint import gaussint # to do quite precise integration, using Mark Newman's gaussian quadrature integration.

#The below code links to a handful of python modules, which are interfaces for the participants' expressed mental models --stored in MongoDB-- over time and information about the participants, such as their scores and active points in the game --their constraints and their share holdings of a bet, as well as what that bet was:

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

#ids=users.get_ids(); #This will fetch a list of all participants' id numbers (useful for getting an individual's time series data).

class Hist(object):
    def __init__(self, d=None, name=''):
        if d == None:
            d = {}
        self.d = d
        self.name = name

    def GetDict(self):
        return self.d

    def Count(self, x):
        """Increment the counter associated with the value x.

        Args:
            x: number value
        """
        self.d[x] = self.d.get(x, 0) + 1

    def Freq(self, x):
        """Get the frequency associated with the value x.

        Args:
            x: number value

        Returns:
            int frequency
        """
        return self.d.get(x, 0)

    def Render(self):
        """Generates a sequence of points suitable for plotting.

        Returns:
            sequence of (value, prob) pairs.
        """
        items = self.d.items()
        items.sort()
        return zip(*items)


class Pmf(object):
    """Represents a probability mass function.

    Attributes:
        map: dictionary that maps from values to probabilities
    """
    def __init__(self, d=None, name=''):
        if d == None:
            d = {}
        self.d = d
        self.name = name

    

    def keys(self):
        return self.d.keys()

    def Normalize(self, denom=None):
        """Normalizes this PMF so the sum of all probs is 1.

        Args:
            denom: float divisor; if None, computes the total of all probs
        """
        denom = denom or self.Total()
        denom=float(denom)
        for x, p in self.d.iteritems():
            self.d[x] = p / denom
    
    def Total(self):
        """Returns the total of the frequencies in the map."""
        total = sum(self.d.values())
        return float(total)

    def GetDict(self):
        return self.d

    def Prob(self, x):
        """Returns the probability that corresponds to value x.

        Args:
            x: number

        Returns:
            int frequency or float probability
        """
        p = self.d.get(x, 0)
        return p

    def values(self):
        values =self.d.values()
        return values

    def Mean(self):
        """Computes the mean of a PMF.

        Returns:
            float mean
        """

    def Render(self):
        """Generates a sequence of points suitable for plotting.

        Returns:
            sequence of (value, prob) pairs.
        """
        items = self.d.items()
        items.sort()
        return zip(*items)
    
    

def MakeHist(t, name=''):
    """Makes a histogram from an unsorted sequence of values.

    Args:
        t: sequence of numbers

        name: string name for this histogram

    Returns:
        Hist object
    """
    hist = Hist(name=name)
    [hist.Count(x) for x in t]
    return hist


def MakePmfFromList(t, name=''):
    """Makes a PMF from an unsorted sequence of values.

    Args:
        t: sequence of numbers

        name: string name for this PMF

    Returns:
        Pmf object
    """
    hist = MakeHist(t, name)
    return MakePmfFromHist(hist)

def MakePmfFromHist(hist):
    """Makes a PMF from a Hist object.

    Args:
        hist: Hist object

    Returns:
        Pmf object
    """
    d = dict(hist.GetDict())
    pmf = Pmf(d, hist.name)
    pmf.Normalize()
    return pmf

############## End of Downey's Pmfs

from math import log, sqrt, exp
from numpy import array as arr

def MakeMixture(Pr1, Pr2, lamb=0.5):
    "if the order of names is different between to different distributions, the probability vectors must be first reordered"
    if (type(Pr1)==type(Pr2) and type(Pr1)==type({})):

        if set(Pr1.keys())==set(Pr2.keys()):
            probs=[(Pr1[key], Pr2[key]) for key in Pr1.keys()]
            return dict(zip(Pr1.keys(), [(lamb*a+(1-lamb)*b) for a, b in probs])) #mixing the two probability distributions
        else: 
            raise IndexError
    elif (type(Pr1)==type(Pr2) and type(Pr1)==type([])):
        if (len(Pr1)==len(Pr2)):
            return [(lamb*a+(1-lamb)*b) for a, b in zip(Pr1, Pr2)]
        else: 
            raise IndexError

def KL_divergence(first, second):
    """ 
    Compute KL divergence of two lists or dictionaries.
    The arguments are called first and second because the 
    KL_divergence is assymetric, so that KL_divergence(first, second)!=KL_divergence(second, first)
    """
    if (type(first)==type(second) and type(first)==type({})):
        if (set(first.keys())==set(second.keys())):
            keys=first.keys()
            probs1=[float(first[key])/sum(first.values()) for key in keys] 
            probs2=[float(second[key])/sum(second.values()) for key in keys]
        else: 
            raise IndexError
    elif (type(first)==type(second) and type(first)==type([])):
        if (len(first)==len(second)):
            probs1=[float(item)/sum(first) for item in first]
            probs2=[float(item)/sum(second) for item in second]
        else: 
            raise IndexError
    try:
        return sum(p * log((p /q)) for p, q in zip(probs1, probs2) if p != 0.0 or p != 0)
    except ZeroDivisionError:
        return float("inf")


def JensenShannonDivergence(g, h):
    '''
    g and h can again be dictionaries or lists, but order does not matter here
    JensenShannonDivergence(g, h)==JensenShannonDivergence(h, g)
    '''
    JSD = 0.0
    lamb=0.5
    mix=MakeMixture(g, h, lamb)
    JSD=lamb * KL_divergence(g, mix) + (1-lamb) * KL_divergence(h, mix)
    return JSD


def Entropy(pr):
    try:
        vals=pr.values()
    except:
        vals=pr
    tot=1.0/sum(vals)
    return -sum([float(p)*tot*log(float(p)*tot, 2) for p in vals if p != 0.0 or p != 0])


def MixedN(ls):
    """
    ls: a list of either lists or dictionaries.
    """
    #for g in ls:
    # if type(g)!=BayesNet:
    # raise TypeError
    if (len(ls)==1):
        if type(ls[0])==type([]):
            return [item/float(sum(ls[0])) for item in ls[0]]
        elif type(ls[0])==type({}):
            return {key:value/float(sum(ls[0].values())) for key, value in ls[0].items()}
        elif (type(ls[0])==type(Pmf())):
            return ls[0]

    lamb = 1.0/len(ls)
    if (sum([type(it)==type([]) for it in ls])==len(ls)):
        total=arr([0]*len(ls[0]));
        for it in ls:
            total= total + arr([n/float(sum(it)) for n in it])
        mix = total*lamb
        return mix

    elif (sum([(type(it)==type({})) for it in ls])==len(ls)):
        keys=set([])
        for it in ls:
            keys.update(set(it.keys()))
        mix={key:sum([(float(1)/sum(it.values()))*it.get(key, 0)*lamb for it in ls]) for key in keys}
        return mix

    elif sum([type(it.values())==type([]) for it in ls])==len(ls):
        #total=arr([0]*len(ls[0].values()));
        keys=set([])
        
        for it in ls:
            keys.update(set(it.keys()))
        return Pmf({key:sum(it.Prob(key)*lamb for it in ls) for key in keys})
            
             
    

def N_point_JSD(ls):
    mix=MixedN(ls)
    try:
        keys=set(mix.keys())
        orderedList=[[g.Prob(key) for key in keys] for g in ls]
    except:
        try:
            keys=set(mix.keys())
            orderedList=[[g.get(key, 0)/float(sum(g.values())) for key in keys] for g in ls]
        except:
            orderedList=ls
    return Entropy(mix) - (1.0/len(ls))*sum([Entropy(g) for g in orderedList])
    
def Diversity(ls):
    n=len(ls)
    return sqrt(N_point_JSD(ls)/log(n, 2))

def GraphDiversity(tup):
    ls=[graph.probs for graph in tup if graph!=None]
    if len(ls)<=1: return 0
    return Diversity(ls)

def DiversityTimeSeries(day, month="", year=15):
    graphs=get_all_graphs(day, month, year)
    return [GraphDiversity(tup) for tup in graphs]

Entropy([0.7, 0.7, 0.7])

log(3, 2)

Entropy([5, 10, 10, 0.01])
Entropy([5, 10, 10, 1])
Entropy([10, 10, 10, 1])
Entropy([10, 10, 10, 10])

N_point_JSD([[1, 0, 0], [0, 1, 0], [0, 0, 1]])

log(3, 2)

N_point_JSD([[7, 0, 0], [0, 1, 0], [0, 0, 1]])

Diversity([[1, 0, 0], [0, 1, 0], [0, 0, 1]])

N_point_JSD([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]])

N_point_JSD([[1, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0]])

N_point_JSD([[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 0]])

N_point_JSD([[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1]])

Diversity([[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [0, 0, 0, 1]])

Diversity([[1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [0, 0, 0, 1]])

Diversity([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0,  0, 1]])

Diversity([Pmf({"a":1}), Pmf({"b":1}), Pmf({"c":1})])

#Diversity for N texts is maximized when each text has an entirely different set of words, i.e. when the texts are in completely different languages. 

N_point_JSD([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0,  0, 1]])

log(4, 2)

pmf = MakePmfFromList([1, 2, 2, 3, 5])
Entropy(pmf)

pmf = MakePmfFromList([1, 2, 3, 4, 5])
Entropy(pmf)

def book_to_words(book):
    with open(book, 'r') as file:
        data = file.readlines()
        words=[]
        for line in data:
            words.extend(line.split())
    return words
"""
words=book_to_words("Bible.txt")

bible = MakePmfFromList(words)
bible.Prob("God")
bible.Prob("Jesus")
bible.Prob("and")

Entropy(bible)

words=book_to_words("Quran.txt")
quran = MakePmfFromList(words)
quran.Prob("God")
quran.Prob("Jesus")
quran.Prob("Muhammad")

words=book_to_words("Gita.txt")
gita = MakePmfFromList(words)
gita.Prob("God")
gita.Prob("Krishna")
gita.Prob("Arjuna")

Entropy(gita)

#Diversity([quran.values()[:1000], bible.values()[:1000], gita.values()[:1000]])

bible.Prob("and")
quran.Prob("and")
quran.Prob("and")

Diversity([bible, quran, gita])
Diversity([bible, quran])
Diversity([bible, gita])
Diversity([quran, gita])
"""
