import hmac
import random
import string
import hashlib
import pymongo
import time

mClasses = {
    "monty": {
        "vars": ["prize_door", "contestant_door", "monty_door"],
        "bettingVar": "prize_door",
        "domain": ["A", "B", "C"]
    },
    "banking": {
        "vars": ["bank_1", "bank_2"],
        "bettingVar": "bank_2",
        "domain": ['H', 'L']
    }
}

# The Data Access Object handles all interactions with the Data collection.
class mClassDAO:

    def __init__(self, db):
        self.db = db
        self.mClass = self.db.mClass

        # creates a new user in the users collection
    def assign_mClass(self, user_id):
        entry_time = time.time()
        mClass = random.choice(mClasses.keys())
        self.mClass.insert({'entry_time':entry_time, 'mClass':mClass, 'user_id':user_id})

    def user_needs_updating(self, user_id):
        cursor=self.mClass.find({'user_id':user_id}).sort('entry_time',-1).limit(1)
        foundOne = False
        for point in cursor:
            foundOne = True
            if point['entry_time'] < time.time() -1200:
                return True
        if not foundOne : return True

    def get_user_mClass(self, user_id):
        cursor=self.mClass.find({'user_id':user_id}).sort('entry_time',-1).limit(1)
        for point in cursor: return point['mClass']
        raise ValueError ("user id not found")

