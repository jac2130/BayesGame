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

currentDir = os.path.dirname(os.path.realpath(__file__))
baseDir = os.path.dirname(currentDir)
print "baseDir: ", baseDir
sys.path.append(baseDir + "/Betting")
sys.path.append(baseDir + "/serverScripts")
sys.path.append(baseDir + "/bayesian-belief-networks")
sys.path.append(baseDir)

# import logInfo
# from logInfo import logInfo
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

from userIdsDAO import UserIdsDAO

from bayesian.bbn import build_bbn_from_conditionals as build_graph
from bayesian.bbn import *
#here is the true model, which is a constant (the simulated truth)
'''TRUTH = {
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

g = build_bbn_from_conditionals(TRUTH);

results=g.query();

#samples = g.draw_samples(results, 1000);
'''

__author__ = 'johannes castner'

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

def dataTest(args, data):
    output = "module: " + repr(dataDAO) + "\ndata: " + data.__repr__() + "\n"
    return output

def get_time(args, data):
    return dataDAO.getTimeUntilTwoMinuteMark()

def beginFreePeriod(args, data):
    miscDAO.beginFreePeriod()
    return json.dumps({})

def endFreePeriod(args, data):
    miscDAO.endFreePeriod()
    return json.dumps({})

def hasNewData(args, data):
    model_class, period = args
    latest_period = dataDAO.get_latest_period(model_class)
    if latest_period > int(period):
        return '1'
    else:
        return '0'

def isFreePeriod(args, data):
    free_period = miscDAO.getFreePeriod()
    return json.dumps({"free_period": free_period})

def endDemo(args, data):
    miscDAO.endDemo()
    print "Ending Demo"
    #cookie = bottle.request.get_cookie("session")
    #user_id = sessions.get_username(cookie)
    return json.dumps({})

def empty_mclasses():
    mClass.empty_data()
    return

def beginDemo(args, data):
    print "Beginning Demo"
    miscDAO.beginDemo()
    #cookie = bottle.request.get_cookie("session")
    #user_id = sessions.get_username(cookie)
    admin_users = []
    return json.dumps({})

def points_refresh(args, data):
    user = data['user_id']
    point_object = points.get_points(user)
    return json.dumps({"points": point_object["points"], "shares":point_object["shares"]})

def query(args, data):
    print "query args: ", args
    path = args
    query_dict = dict(tuple(elem.split(':')) for elem in path)
    return models.query(_id=data['user_id'], conditions=query_dict)

def removeLatestBettingVar(dataInOrder, mClassName):
    betting_variable = dataInOrder[-1]["betting_var"]
    print "removing betting variable from: ", dataInOrder[-1]
    print "betting variable: ", betting_variable
    del dataInOrder[-1][betting_variable]

def assembleModelClass(mClassName):
    model_class = {
        'model_name': mClassName,
        'betting_variable': mClasses[mClassName]["bettingVar"],
        'vars': mClasses[mClassName]["vars"],
        'domain': mClasses[mClassName]["domain"]
    };
    return model_class

def getTruth(args, data):
    user_id = data['user_id']
    treatmentNum, mClassName, points_assigned = mClass.assign_treatment_if_not_already(user_id)
    demo_mode = miscDAO.getDemoMode()
    print "demo_mode: ", demo_mode
    if demo_mode:
        mClassName = "simple"
    model_class = assembleModelClass(mClassName)

    points.insert_entry(user_id, points_assigned, 10)
    truthData = []
    currPeriod = miscDAO.getCurrPeriod()
    for i in range(40):
        print "getting data for period: ", currPeriod - i
        truthData.append(dataDAO.get_data_for_period(mClassName, currPeriod - i))
    truthData.reverse()
    removeLatestBettingVar(truthData, mClassName)

    retData = {
        'user_id': user_id,
        'model_class': model_class,
        'isAdmin': True,
        'samples': truthData,
        'points': points_assigned,
        'treatmentNum': treatmentNum,
    };
    return json.dumps(retData)

def getNewData(args, data):
    treatmentNum, clientPeriod = args
    treatmentNum = int(treatmentNum)
    clientPeriod = int(clientPeriod)

    mClassName, _ = mClass.get_treatment_from_num(int(treatmentNum))
    demo_mode = miscDAO.getDemoMode()
    print "demo_mode: ", demo_mode
    if demo_mode:
        mClassName = "simple"

    currPeriod = miscDAO.getCurrPeriod()
    retData = {}
    if currPeriod != clientPeriod:
        retData['dataAvail'] = True
        prevPeriod = currPeriod - 1
        if prevPeriod < 1:
            prevPeriod = 10000
        newData = []
        newData.append(dataDAO.get_data_for_period(mClassName, prevPeriod))
        newData.append(dataDAO.get_data_for_period(mClassName, currPeriod))
        removeLatestBettingVar(newData, mClassName)
        retData['newData'] = newData
    else:
        retData['dataAvail'] = False
        retData['timeUntilNextData'] = miscDAO.getTimeUntilNextData()

    return json.dumps(retData)

def accept_put(args, data):
    put_id, accepter_id, poster_id = args

    point_count = int(data["points"])
    puts.accept_put(put_id, accepter_id)
    points.accept_put(poster_id, accepter_id, point_count)
    return json.dumps({})

def accept_call(args, data):
    call_id, accepter_id, poster_id = args
    point_count = int(data["points"])
    posts.accept_call(call_id, accepter_id)
    points.accept_call(poster_id, accepter_id, point_count)
    return json.dumps({})

def getCalls(args, data):
    # username is user_id
    treatmentNum, period = args
    # even if there is no logged in user, we can show the blog
    demo_mode = miscDAO.getDemoMode()
    l = posts.get_posts(int(treatmentNum), int(period), demo_mode)
    #print "printing myposts: " +str(l);
    return json.dumps(dict(myposts=l))

def getPuts(args, data):
    treatmentNum, period = args
    # even if there is no logged in user, we can show the blog
    demo_mode = miscDAO.getDemoMode()
    l = puts.get_puts(int(treatmentNum), int(period), demo_mode)
    #print "printing myposts: " +str(l);
    return json.dumps(dict(myputs=l))

def post_newpost(args, data):
    userid = data['user_id']
    treatmentNum = int(data['treatmentNum'])
    valToBetOn = data['valToBetOn']
    price = int(data['price'])
    shares = int(data['shares'])
    period = int(data["period"])

    newId = posts.insert_entry(userid, treatmentNum, valToBetOn, price, shares, period, True)

    computerShareValue = cvd.getComputerValue()
    if price > computerShareValue:
        print "computer accepting call", newId
        posts.computer_accept(newId)
        points.computer_accept_call(userid, price, shares)

    return json.dumps({})

def put_newput(args, data):
    userid = data['user_id']
    treatmentNum = int(data['treatmentNum'])
    valToBetOn = data['valToBetOn']
    price = int(data['price'])
    shares = int(data['shares'])
    period = int(data["period"])

    newId = puts.insert_entry(userid, treatmentNum, valToBetOn, price, shares, period, True)

    computerShareValue = cvd.getComputerValue()
    if price < computerShareValue:
        print "computer accepting put", newId
        puts.computer_accept(newId)
        points.computer_accept_put(userid, price, shares)

    return json.dumps({})

def process_login(args, data):
    username = int(data['id']);
    users.add_user(user);
    session_id = sessions.start_session(username)

    if session_id is None:
        print "Error: there is no session id!!"
    cookie = session_id
    return json.dumps({})

def no_fb_login(args, data):
    return json.dumps({'user_id': user_id})

def add_model(args, data):
    # model = bottle.request.json
    model = data
    user = data['user_id'];
    del model['user_id']
    print "model: ", model
    modelInfo = model[user]
    if not models.detect_cyclic_model(modelInfo):
        models.add_model(model)
    else:
        return json.dumps(["CYCLIC MODEL DETECTED"])
    return json.dumps({})

def hasQuery(args, data):
    return json.dumps(models.has_query(_id))

def getUserId(args, data):
    #print "userId: ", data['user_id']
    return json.dumps({'user_id': data['user_id']})

def queryList(args, data):
    print "query args: ", args
    path = [elem for elem in args][0]
    #query_dict = dict(tuple(elem.split(':')) for elem in path)
    #return json.dumps(models.query(_id=data['user_id'], path))
    #variable = args
    #return args
    #query_dict = dict(tuple(elem.split(':')) for elem in path)
    return json.dumps(models.query_all_possible(_id=data['user_id'], variable=path))
    #return models.query(_id=data['user_id'], conditions=query_dict)

#http://www.bettingisbelieving.com/js/query/banking:H/gm:L
#query -> [banking:H, gm:L]
#data -> {}

handlerDict = {
        'hello': hello,
        'dataTest': dataTest,
        'clock': get_time,
        'beginFreePeriod': beginFreePeriod,
        'endFreePeriod': endFreePeriod,
        'hasNewData': hasNewData,
        'isFreePeriod': isFreePeriod,
        'endDemo': endDemo,
        'emptyData': empty_mclasses,
        'beginDemo': beginDemo,
        'pointsRefresh': points_refresh,
        'calls': getCalls,
        'puts': getPuts,
        'query': query,
        'truth': getTruth,
        'newData': getNewData,
        'accept_put': accept_put,
        'accept_call': accept_call,
        'newpost': post_newpost,
        'newput': put_newput,
        'login': process_login,
        'model': add_model,
        'has_query': hasQuery,
        'getUserId': getUserId,
        'queryList': queryList
}

# user environ['HTTP_COOKIE'] to access
def getUserIdFromCookie(http_cookie):
    cookie = Cookie.SimpleCookie()
    #cookieInfo = {'user_id': 'asdfasdf'}
    cookie.load(http_cookie)
    if 'access_token' in cookie:
        cookieInfo = json.loads(cookie['access_token'].value)
        if 'user_id' in cookieInfo:
            return str(cookieInfo['user_id'])
        else:
            return None
    else:
        return None

def setUserIdInCookie(userId, http_cookie):
    cookie = Cookie.SimpleCookie()
    cookie.load(http_cookie)
    cookieInfo = {}
    cookieInfo = {'user_id': userId}
    cookie['access_token'] = json.dumps(cookieInfo)
    return cookie

def makeNewCookieWithUserId(userId):
    cookie = Cookie.SimpleCookie()
    cookieInfo = {}
    cookieInfo = {'user_id': userId}
    cookie['access_token'] = json.dumps(cookieInfo)
    return cookie

def getGETData(environ):
    try:
        unquotedJson = urllib.unquote(environ['QUERY_STRING'].split("&")[0])
        return json.loads(unquotedJson)
    except:
        return {}

def application(environ, start_response):
    status = '200 OK'
    script_name = environ['SCRIPT_NAME']

    pathNames = script_name.split('/')[2:]
    handlerWord = pathNames[0]
    args = pathNames[1:]
    data = environ['wsgi.input'].read()
    if 'HTTP_COOKIE' in environ:
        userId = getUserIdFromCookie(environ['HTTP_COOKIE'])
    else:
        userId = None

    if userId == None:
        newUserId = True
        userId = userIdsDAO.createNewId()

        if 'HTTP_COOKIE' in environ:
            cookie = setUserIdInCookie(userId, environ['HTTP_COOKIE'])
        else:
            cookie = makeNewCookieWithUserId(userId)
    else:
        newUserId = False

    if data:
        data = json.loads(data)
    else:
        data = {}

    getData = getGETData(environ)
    for entry in getData:
        data[entry] = getData[entry]

    data['user_id'] = userId

    print "QUERY: ", script_name
    print "DATA: ", data

    output = handlerDict[handlerWord](args, data)

    response_headers = [('Content-type', 'text/plain'),
                        ('Content-Length', str(len(output)))]

    if newUserId:
        response_headers.append(('Set-Cookie', cookie["access_token"].OutputString()))

    start_response(status, response_headers)

    return [output]
