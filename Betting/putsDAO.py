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
import pymongo

# The Blog Post Data Access Object handles interactions with the Posts collection
class PutsDAO:

    def __init__(self, database):
        self.db = database
        self.puts = database.puts

    def insert_entry(self, userid, treatment, valToBetOn, price, period, opend):
        put = { "userid": userid,
                "treatment": treatment,
                "valToBetOn": valToBetOn,
                "price": int(price),
                "date": datetime.datetime.utcnow(),
                "period": period,
                "open": opend}

        try:
            print "Inserting the put", put
            newId = self.puts.insert(put)
            return str(newId)
        except:
            print "Error inserting post"
            print "Unexpected error:", sys.exc_info()[0]
            raise

    # returns an array of num_posts posts, reverse ordered
    def get_puts(self, treatment, period, demo_mode):
        l = []
        if demo_mode:
            cursor = self.puts.find({'period': period, 'open': 1}).sort('price', pymongo.ASCENDING)
        else:
            cursor = self.puts.find({'treatment': treatment, 'period':period, 'open': True}).sort('price', pymongo.ASCENDING)
        for put in cursor:
            put['date'] = str(time.time())  # fix up date
            put['id'] = str(put['_id']);
            put['price'] = str(put['price'])
            put["_id"] = str(put['_id']);
            if 'period' not in put:
                put['period'] = 0
            else:
                put['period'] = str(put['period']);
            l.append(put)
        return l

    def get_put_by_id(self, item_id):
        #put = None
        #Work here to retrieve the specified post
        put=self.puts.find_one({'_id':ObjectId(item_id)})
        #if put is not None:
        # fix up date
        #put['date'] = put['date'].strftime("%A, %B %d %Y at %I:%M%p")
        #new= put.next()
        return put

    def accept_put(self, id, accepter_id):
        put = self.get_put_by_id(id)
        putId = put['_id']
        putMods = {}
        putMods["open"] = False
        putMods['accepted'] = accepter_id
        self.puts.update({'_id': putId}, {"$set": putMods}, upsert=False)

    def computer_accept(self, id):
        put = self.get_put_by_id(id)
        putId = put['_id']
        putMods = {}
        putMods["open"] = False
        putMods['accepted'] = -1
        self.puts.update({'_id': putId}, {"$set": putMods}, upsert=False)

    # add a comment to a particular blog post
    def add_comment(self, id, name, email, body, commentId):

        comment = {'author': name, 'body': body, 'id':commentId}
        if (email != ""):
            comment['email'] = email

        try:
            last_error = {'n':-1}           # this is here so the code runs before you fix the next line
            # XXX HW 3.3 Work here to add the comment to the designated post
            put=self.puts.find_one({'_id':ObjectId(id)})
            put['comments'].append(comment);
            self.puts.save(put)
            return last_error['n']          # return the number of documents updated

        except:
            return 0

