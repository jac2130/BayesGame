import sys
from pprint import pformat
import pymongo
import os
from random import random
#import requests
#import cgi
import re
import json
#from gevent import monkey; monkey.patch_all()
from time import time
from time import sleep;
import time
import threading
import thread

sys.path.append("/var/www/Betting")

import logInfo
from logInfo import logInfo
from dataDAO import DataDAO
import blogPostDAO
import mClassDAO
from mClassDAO import mClasses, currMClass
import pointsDAO
import sessionDAO
import pictureDAO
import dataDAO
import putsDAO
import modelDAO
import userDAO
import computerValueDAO

connection = pymongo.MongoClient()
db = connection.blog
dataDb = DataDAO(db)

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
mClass = mClassDAO.mClassDAO(database)
pictures=pictureDAO.PictureDAO(database)
posts = blogPostDAO.BlogPostDAO(database)
puts  = putsDAO.PutsDAO(database)
users = userDAO.UserDAO(database)
models=modelDAO.ModelDAO(database)
sessions = sessionDAO.SessionDAO(database)
data = dataDAO.DataDAO(database)
points=pointsDAO.PointsDAO(database)
cvd = computerValueDAO.ComputerValueDAO(database)


def hello(args, data):
    output = "args: " + args.__repr__() + "\ndata: " + data.__repr__() + "\n"
    return output

def dataTest(args, data):
    output = "module: " + repr(dataDb) + "\ndata: " + data.__repr__() + "\n"
    return output

def get_time(args, data):
    return data.getTimeUntilTwoMinuteMark()

free_period = True
def beginFreePeriod(args, data):
    user_id = int(args[0])
    global free_period
    free_period = True
    #cookie = bottle.request.get_cookie("session")
    #user_id = sessions.get_username(cookie)
    admin_users = []
    return user_id

def endFreePeriod(args, data):
    user_id = str(args[0])
    global free_period
    free_period = False
    #cookie = bottle.request.get_cookie("session")
    #user_id = sessions.get_username(cookie)
    admin_users = []
    return user_id

def hasNewData(args, data):
    model_class, period = args
    latest_period = data.get_latest_period(model_class)
    if latest_period > int(period):
        return '1'
    else:
        return '0'

def isFreePeriod(args, data):
    return {"free_period": free_period}

demo_mode = True
def end_demo(args, data):
    user_id = str(args[0])
    global demo_mode
    demo_mode = False
    #cookie = bottle.request.get_cookie("session")
    #user_id = sessions.get_username(cookie)
    admin_users = []
    return user_id

def empty_mclasses():
    mClass.empty_data()
    return

def reset_demo(args, data):
    user_id = int(args[0])
    global demo_mode
    demo_mode = True
    #cookie = bottle.request.get_cookie("session")
    #user_id = sessions.get_username(cookie)
    admin_users = []
    return user_id

def points_refresh(args, data):
    user = args[0]
    point_object = points.get_points(user)
    return json.dumps({"points": point_object["points"], "shares":point_object["shares"]})

def getCalls(args, data):
    # username is user_id
    username, treatmentNum, period = args
    username = int(username)
    #cookie = bottle.request.get_cookie("session")
    #username = sessions.get_username(cookie)
    # even if there is no logged in user, we can show the blog
    l = posts.get_posts(int(treatmentNum), int(period), demo_mode)
    #print "printing myposts: " +str(l);
    return json.dumps(dict(myposts=l, username=username))

def getPuts(args, data):
    username, treatmentNum, period = args
    username = int(username)

    # cookie = bottle.request.get_cookie("session")
    # username = sessions.get_username(cookie)

    # even if there is no logged in user, we can show the blog
    l = puts.get_puts(int(treatmentNum), int(period), demo_mode)
    #print "printing myposts: " +str(l);
    return json.dumps(dict(myputs=l, username=username))

def query(args, data):
    i, path = args
    query_dict = dict(tuple(elem.split(':')) for elem in path.split("/"))
    return models.query(_id=i, conditions=query_dict)

def getTruth(args, data):
    user_id = int(args[0])
    # if mClass.user_needs_updating(user_id):
    #     mClass.assign_mClass(user_id)
    # model_name = mClass.get_user_mClass(user_id)

    #group_id = mClass.assign_group_if_not_already(user_id)
    #model_name, points_assigned = mClass.get_group_treatment(group_id)

    treatmentNum, model_name, points_assigned = mClass.assign_treatment_if_not_already(user_id)
    points.insert_entry(user_id, points_assigned, 10)
    #model_name = currMClass

    if demo_mode:
        model_name = "simple"

    model_class = {
        'model_name': model_name,
        'betting_variable': mClasses[model_name]["bettingVar"],
        'vars': mClasses[model_name]["vars"],
        'domain': mClasses[model_name]["domain"]
    }
    if user_id in set(["121211", "100006471334363"]):
        isAdmin=True
    else:
        isAdmin=False

    samples = data.get_first_twenty(model_class)
    retData = {'model_class': model_class,
               'isAdmin': isAdmin,
               'samples': samples,
               'points': points_assigned,
               'treatmentNum': treatmentNum,
               }
    return json.dumps(retData)

def getNewData(args, data):
    treatmentNum = int(args[0])
    #newMClassAssigned = False
    #if mClass.user_needs_updating(user_id):
    #    mClass.assign_mClass(user_id)
    #    newMClassAssigned = True
    #model_name = mClass.get_user_mClass(user_id)
    #model_name = currMClass

    model_name, _ = mClass.get_treatment_from_num(int(treatmentNum))
    if demo_mode:
        model_name = "simple"

    model_class = {
        'model_name': model_name,
        'betting_variable': mClasses[model_name]["bettingVar"],
        'vars': mClasses[model_name]["vars"],
    }
    samples = data.get_newest(model_class)
    retData = samples
    #retData = {'samples': samples}
    #if newMClassAssigned:
    #    retData['newModelClass'] = model_class;
    #else:
    #    retData['newModelClass'] = None

    return json.dumps(retData)

def accept_put(args, data):
    put_id, accepter_id, poster_id = args
    #postAll= bottle.request.json

    point_count = data["points"]
    puts.accept_put(put_id, accepter_id)
    points.accept_put(poster_id, accepter_id, point_count)
# used to insert a person's facebook picture in the mongodb database. 
    return json.dumps({})

def accept_call(args, data):
    call_id, accepter_id, poster_id = args
    #postAll= bottle.request.json
    point_count = data["points"]
    posts.accept_call(call_id, accepter_id)
    points.accept_call(poster_id, accepter_id, point_count)
    return json.dumps({})

def post_newpost(args, data):
    #postAll = bottle.request.json
    title = data['subject'];
    post = data['price'];
    comments = data['comments']
    username = data['username']
    userid = data['userid']
    # variable = postAll["variable"]
    treatmentNum = data['treatmentNum']
    period = data["period"]
    # extract tags
    # tags = cgi.escape(tags)
    tags_array = [] #extract_tags(tags)
    opend = data['open']
    # looks like a good entry, insert it escaped
    escaped_post = cgi.escape(post, quote=True)

    # substitute some <p> for the paragraph breaks
    newline = re.compile('\r?\n')
    formatted_post = newline.sub("<p>", escaped_post)
    #formatted_post

    permalink = posts.insert_entry(title, formatted_post, comments, tags_array, username, userid, treatmentNum, period, opend)

    #computerShareValue = cvd.getComputerValue()
    #print "formatted_post: ", formatted_post
    #print "formatted isinstance ", isinstance(formatted_post, int)
    #pointVal = int(formatted_post)
    #if pointVal > computerShare:
    #    points.computer_accept_call(userid, pointVal)
    #    posts.computer_accept()

    return json.dumps({})

def put_newput(args, data):
    #postAll= bottle.request.json
    title = data['subject'];
    post = data['price'];
    comments = data['comments']
    username = data['username']
    userid = data['userid']
    # variable=postAll["variable"]
    treatmentNum = data['treatmentNum']
    period = data["period"]
    # extract tags
    #tags = cgi.escape(tags)
    tags_array = [] #extract_tags(tags)
    opend = data['open']
    # looks like a good entry, insert it escaped
    escaped_post = cgi.escape(post, quote=True)

    # substitute some <p> for the paragraph breaks
    newline = re.compile('\r?\n')
    formatted_post = newline.sub("<p>", escaped_post)

    permalink = puts.insert_entry(title, formatted_post, comments, tags_array, username, userid, treatmentNum, period, opend)

    #computerShareValue = cvd.getComputerValue()
    #print "formatted_post: ", formatted_post
    #print "formatted isinstance ", isinstance(formatted_post, int)
    #pointVal = int(formatted_post)
    #if pointVal > computerShare:
    #    computer_accept_put(userid, pointVal)

    return json.dumps({})

def process_login(args, data):
    #user = bottle.request.json
    #username = user['id'];
    username = int(data['id']);
    #print "username: ", username
    users.add_user(user);

    # username is stored in the user collection in the _id key
    session_id = sessions.start_session(username)

    if session_id is None:
        print "Error: there is no session id!!" 

    cookie = session_id
        # Warning, if you are running into a problem whereby the cookie being set here is
        # not getting set on the redirect, you are probably using the experimental version of bottle (.12).
        # revert to .11 to solve the problem.
    #print bottle.response.set_cookie;
    bottle.response.set_cookie("session", cookie)
    return json.dumps({})

def no_fb_login(args, data):
    return json.dumps({'user_id': user_id})

def building_model(args, data):
    model = bottle.request.json
    user = model['id'];
    models.add_model(model)
    return json.dumps({})

def hasQuery(args, data):
    return json.dumps(models.has_query(_id))

handlerDict = {
        'hello': hello,
        'dataTest': dataTest,
        'clock': get_time,
        'beginFreePeriod': beginFreePeriod,
        'endFreePeriod': endFreePeriod,
        'hasNewData': hasNewData,
        'isFreePeriod': isFreePeriod,
        'endDemo': end_demo,
        'emptyData': empty_mclasses,
        'beginDemo': reset_demo,
        'pointsRefresh': points_refresh,
        'calls': getCalls,
        'puts': getPuts,
        'query': query,
        'truth': getTruth,
        'newData': getNewData,
        'accept_put': accept_put,
        'accept_call': accept_call,
        #'newcomment': post_new_comment,
        'newpost': post_newpost,
        'newput': put_newput,
        'login': process_login,
        'model': building_model,
        'has_query': hasQuery,
}

# user environ['HTTP_COOKIE'] to access
def getUserIdFromCookie(http_cookie):
    cookie = Cookie.SimpleCookie()
    #cookieInfo = {'user_id': 'asdfasdf'}
    cookie.load(http_cookie)
    cookieInfo = json.loads(cookie['access_token'].value)
    if 'user_id' in cookieInfo:
        return str(cookieInfo['user_id'])
    else:
        return None

def application(environ, start_response):
    status = '200 OK'
    #output = 'Hello World!'
    #output = sys.path.__repr__()
    #output = pformat(environ)
    script_name = environ['SCRIPT_NAME']

    pathNames = script_name.split('/')[2:]
    handlerWord = pathNames[0]
    args = pathNames[1:]
    data = environ['wsgi.input'].read()
    userId = getUserIdFromCookie(environ['HTTP_COOKIE'])
    if userId == None:
        pass

    data['user_id'] = user_id

    output = handlerDict[handlerWord](args, data)

    response_headers = [('Content-type', 'text/plain'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)

    return [output]
