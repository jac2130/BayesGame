import hmac
import random
import string
import hashlib
import pymongo
import time
from pprint import pprint
import datetime

mClasses = {
    #"monty": {
    #    "vars": ["prize_door", "contestant_door", "monty_door"],
    #    "bettingVar": "prize_door",
    #    "domain": ["A", "B", "C"]
    #},
    "banking": {
        "vars": ["bank_1", "bank_2"],
        "bettingVar": "bank_2",
        "domain": ['H', 'L']
    },
    "demo": {
        "vars": ["interest_rate", "unemployment", "production", "exports"],
        "bettingVar": "interest_rate",
        "domain": ['H', 'L']
    },
    "complex": {
        "vars": ["interest_rate", "bank_income", "general_motors", "consumer_spending"],
        "bettingVar": "interest_rate",
        "domain": ['H', 'L']
    },
    "simple": {
        "vars": ["interest_rate", "bank_income", "general_motors"],
        "bettingVar": "interest_rate",
        "domain": ['H', 'L']
    }
}

currMClass = "simple"
# The Data Access Object handles all interactions with the Data collection.

class mClassDAO:
    def __init__(self, db):
        self.mClass = db.mClass
        self.treatments = [
            #('simple', 1000),
                ('demo', 1000),
                ('complex', 1000),
            #('simple', 2000),
                ('demo', 2000),
                ('complex', 2000)
        ]
        # creates a new user in the users collection

    def get_treatment_from_num(self, treatmentNum):
        return self.treatments[treatmentNum]

    def empty_data(self):
        self.mClass.remove({})

    def assign_treatment(self, user_id):
        lastUserAddedList = list(self.mClass.find().sort('timeAdded', -1).limit(1))
        if not lastUserAddedList:
            next_treatment = 0
        else:
            next_treatment = lastUserAddedList[0]['treatmentNum'] + 1
            if next_treatment > 3:
                next_treatment = 0

        mClass, points = self.treatments[next_treatment]
        self.mClass.insert({
            'user' : user_id,
            'mClass': mClass,
            'points': points,
            'timeAdded': datetime.datetime.now(),
            'treatmentNum': next_treatment,
        })
        return next_treatment, mClass, points

    def assign_treatment_if_not_already(self, user_id):
        prevTreatment = self.mClass.find_one({'user': user_id})
        if not prevTreatment:
            return self.assign_treatment(user_id)
        else:
            return prevTreatment['treatmentNum'], prevTreatment['mClass'], prevTreatment['points']

    def clear(self):
        self.mClass.remove()

    def reset(self):
        self.mClass.remove()
        self.next_treatment = 0

    def show(self):
        user_treatments = self.mClass.find()
        print "user_treatments:"
        pprint(list(user_treatments))
        print
