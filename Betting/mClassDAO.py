import hmac
import random
import string
import hashlib
import pymongo
import time
from pprint import pprint
import datetime

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
        self.next_treatment = 0
        self.treatments = [
            #('simple', 1000),
                ('demo', 1000),
                ('complex', 1000),
            #('simple', 2000),
                ('demo', 2000),
                ('complex', 2000)
        ]
        # creates a new user in the users collection
        lastUserAddedList = list(self.mClass.find().sort('timeAdded', -1).limit(1))
        if not lastUserAddedList:
            self.next_treatment = 0
        else:
            self.next_treatment = lastUserAddedList[0]['treatmentNum']

        #self.min_group_users = 8
        #mClass, points = self.get_group_treatment(self.next_group)
        #treatment_ndx = self.treatments.index((mClass, points))
        #self.next_treatment = treatment_ndx + 1

    #def new_group(self):
    #    self.next_group += 1
    #    self.assign_treatment(self.next_group)
    #    return self.next_group
    def get_treatment_from_num(self, treatmentNum):
        return self.treatments[treatmentNum]

    def empty_data(self):
        self.mClass.remove({})

    def assign_treatment(self, user_id):
        assignedTreatmentNum = self.next_treatment
        self.next_treatment += 1
        if self.next_treatment >= len(self.treatments):
            self.next_treatment = 0
        mClass, points = self.treatments[assignedTreatmentNum]
        self.mClass.insert({
            'user' : user_id,
            'mClass': mClass,
            'points': points,
            'timeAdded': datetime.datetime.now(),
            'treatmentNum': assignedTreatmentNum,
        })
        return assignedTreatmentNum, mClass, points

    #def get_num_users_in_group(self, group_id):
    #    num_users_in_group = self.user_groups.find({
    #        'group': group_id
    #    }).count()
    #    return num_users_in_group

    def assign_treatment_if_not_already(self, user_id):
        prevTreatment = self.mClass.find_one({'user': user_id})
        if not prevTreatment:
            return self.assign_treatment(user_id)
        else:
            return prevTreatment['treatmentNum'], prevTreatment['mClass'], prevTreatment['points']

    #def assign_group_if_not_already(self, user_id):
    #    prevGroup = self.user_groups.find_one({'user': user_id})
    #    if not prevGroup:
    #        return self.assign_group(user_id)
    #    else:
    #        return prevGroup['group']

    #def assign_group(self, user_id):
    #    total_num_users = self.user_groups.find().count()
    #    if total_num_users < 200:
    #        num_users_in_next_group = self.get_num_users_in_group(self.next_group)
    #        if num_users_in_next_group >= 8:
    #            group_id = self.new_group()
    #        else:
    #            group_id = self.next_group
    #    else:
    #        group_id = self.get_min_usr_grp()

    #    self.user_groups.insert({
    #        'user': user_id,
    #        'group': group_id
    #    })
    #    return group_id

    #def get_num_groups(self):
    #    return self.group_treatments.find().count()

    #def get_min_usr_grp(self):
    #    for group_num in range(self.get_num_groups()):
    #        num_group_users = self.get_num_users_in_group(group_num)
    #        if num_group_users <= self.min_group_users:
    #            return group_num
    #    self.min_group_users += 1
    #    return self.get_min_usr_grp()

    #def get_group_mClass(self, group_num):
    #    group_entry = self.group_treatments.find_one({'group': group_num})
    #    if group_entry == None:
    #        return -1
    #    else:
    #        return group_entry['mClass']

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

    #def get_user_treatment(self, user_id):
    #    user_group = self.get_user_group(user_id)
    #    return self.get_group_treatment(user_group)

    #def get_group_treatment(self, group_id):
    #    group_entry = self.group_treatments.find_one({'group': group_id})
    #    if group_entry:
    #        return group_entry['mClass'], group_entry['points']
    #    else:
    #        raise ValueError("group id ", group_id, " not found")

    #def get_user_group(self, user_id):
    #    user_entry = self.user_groups.find_one({'user': user_id})
    #    if user_entry:
    #        return user_entry['group']
    #    else:
    #        raise ValueError ("group id not found")

