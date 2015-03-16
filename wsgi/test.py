import sys 
from pprint import pformat
import pymongo
import os
from random import random

import urllib
import re
import json
#from gevent import monkey; monkey.patch_all()
from time import time
from time import sleep;
import time
import threading
import thread
import Cookie
from dataDAO import DataDAO
import callsDAO
import mClassDAO
from mClassDAO import mClasses, currMClass
import pointsDAO
import sessionDAO
import pictureDAO
import putsDAO
import modelDAO
import userDAO
import computerValueDAO
from miscDAO import MiscDAO
currentDir = os.getcwd()
baseDir = os.path.dirname(currentDir)
print "baseDir: ", baseDir
sys.path.append(baseDir + "/Betting")
sys.path.append(baseDir + "/serverScripts")
sys.path.append(baseDir + "/bayesian-belief-networks")
sys.path.append(baseDir)
from userIdsDAO import UserIdsDAO

from bayesian.bbn import build_bbn_from_conditionals as build_graph
from bayesian.bbn import *
connection_string = "mongodb://localhost"
connection = pymongo.MongoClient(connection_string)
database = connection.blog
pictures=pictureDAO.PictureDAO(database)
users = userDAO.UserDAO(database)
models = modelDAO.ModelDAO(database)
sessions = sessionDAO.SessionDAO(database)

db2 = connection.bayesGame
cvd = computerValueDAO.ComputerValueDAO(db2)
mClass = mClassDAO.mClassDAO(db2)
dataDAO = DataDAO(db2)
userIdsDAO = UserIdsDAO(db2)
miscDAO = MiscDAO(db2)
posts = callsDAO.CallsDAO(db2)
puts  = putsDAO.PutsDAO(db2)
points = pointsDAO.PointsDAO(db2)

def hello(args, data):
    output = "args: " + args.__repr__() + "\ndata: " + data.__repr__() + "\n"
    return output
