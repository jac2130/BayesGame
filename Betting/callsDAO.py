__author__ = 'aje'


#
# Copyright (c) 2008 - 2013 10gen, Inc. <http://10gen.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#

import sys
import re
import datetime
import time
from bson.objectid import ObjectId


# The Blog Post Data Access Object handles interactions with the Posts collection
class CallsDAO:

    # constructor for the class
    def __init__(self, database):
        self.db = database
        self.posts = database.posts

    # inserts the blog entry and returns a permalink for the entry
    def insert_entry(self, userid, treatment, valToBetOn, price, shares, period, opend):
        post = { "userid": userid,
                 "treatment": treatment,
                 "valToBetOn": valToBetOn,
                 "price": int(price),
                 "shares": int(shares),
                 "date": datetime.datetime.utcnow(),
                 "period": period,
                 "open": opend}

        try:
            print "Inserting the post", post
            newId = self.posts.insert(post)
            return str(newId)
        except:
            print "Error inserting post"
            print "Unexpected error:", sys.exc_info()[0]

    # returns an array of num_posts posts, reverse ordered
    def get_posts(self, treatment, period, demo_mode):
        l = []
        if demo_mode:
            cursor=self.posts.find({'period':period, 'open':1}).sort('price',-1)
        else:
            cursor=self.posts.find({'treatment': treatment, 'period':period, 'open': True}).sort('price',-1)
        for post in cursor:
            post['date'] = str(time.time())  # fix up date
            post['id'] = str(post['_id']);
            post['price'] = str(post['price'])
            post["_id"] = str(post['_id']);
            if 'period' not in post:
                post['period'] = 0
            else:
                post['period'] = str(post['period']);
            l.append(post)
        return l

    def get_post_by_id(self, id):

        post = None
        #Work here to retrieve the specified post
        post=self.posts.find_one({'_id':ObjectId(id)})
        print post;
        if post is not None:
            # fix up date
            post['date'] = post['date'].strftime("%A, %B %d %Y at %I:%M%p")

        return post

    def accept_call(self, id, accepter_id):
        call=self.get_post_by_id(id)
        callId = call['_id']
        callMods = {}
        callMods["open"] = False
        callMods['accepted'] = accepter_id
        self.posts.update({'_id': callId}, {"$set": callMods}, upsert=False)

    def computer_accept(self, id):
        call = self.get_post_by_id(id)
        callId = call['_id']
        callMods = {}
        callMods["open"] = False
        callMods['accepted'] = -1
        self.posts.update({'_id': callId}, {"$set": callMods}, upsert=False)

    # add a comment to a particular blog post
    def add_comment(self, id, name, email, body, commentId):

        comment = {'author': name, 'body': body, 'id':commentId}
        print comment;
        if (email != ""):
            comment['email'] = email

        try:
            last_error = {'n':-1}           # this is here so the code runs before you fix the next line
            # XXX HW 3.3 Work here to add the comment to the designated post
            post=self.posts.find_one({'_id':ObjectId(id)})
            post['comments'].append(comment);
            self.posts.save(post)
            return last_error['n']          # return the number of documents updated

        except:
            print "Could not update the collection, error"
            print "Unexpected error:", sys.exc_info()[0]
            return 0








