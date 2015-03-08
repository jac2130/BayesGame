import hmac
import random
import string
import hashlib
import pymongo
import time
import sys

from mClassDAO import mClasses
import json

# The Data Access Object handles all interactions with the Data collection.
class DataDAO:
    def __init__(self, db):
        self.db = db
        self.data = self.db.data
        if not self.period_index_exists():
            self.data.create_index("period")

    def period_index_exists(self):
        if "period_1" in self.data.index_information():
            return True
        else:
            return False

    def data_exists(self):
        aData = self.data.find_one()
        if aData == None:
            return False
        else:
            return True

    def data_count(self):
        return self.data.find().count()

    def erase_data(self):
        self.data.remove({})

        # creates a new user in the users collection
    def add_data(self, inputData, model_class):
        dataToInsert = {}
        dataToInsert['period'] = inputData['period']
        dataToInsert['data'] = inputData
        dataToInsert['entry_time'] = time.time()
        dataToInsert['model_class'] = model_class['model_name']
        try:
            self.data.insert(dataToInsert)
        except pymongo.errors.OperationFailure:
            print "oops, mongo error"
            return False
        except pymongo.errors.DuplicateKeyError as e:
            print "oops, data is already taken"
            return False
        return True

    def get_latest_period(self, model_name):
        latest_entry = list(self.data.find({'model_class': model_name}).sort('entry_time',-1).limit(1))
        if latest_entry:
            return latest_entry[0]['data'][0]['period']
        else:
            raise ValueError("model with name of " + model_name + " has no data")

    def get_data_for_period(self, mClassName, period):
        foundData = self.data.find_one({'period': period,
                                        'model_class': mClassName})
        return foundData['data']

    def get_newest(self, model_class):
        modelName = model_class['model_name']
        '''model_class: dictionary object with {model_name: name, betting_variable: betting_var}'''
        l = []
        cursor=self.data.find({'model_class': modelName}).sort('entry_time',-1).limit(2)
        for point in cursor:
            #point['entry_time'] = point['entry_time'].strftime("%A, %B %d %Y at %I:%M%p") # fix up date
            l.extend(point['data'])
        old=l[1]

        new = {}
        for variable in mClasses[modelName]['vars']:
            if variable is not mClasses[modelName]['bettingVar']:
                new[variable] = l[0][variable]
        new['period'] = l[0]['period']
        #new={'contestant_door':l[0]['contestant_door'], 'monty_door':l[0]['monty_door'], 'period':l[0]['period']}
        return [old, new]

    def get_first_twenty(self, model_class):
        modelName = model_class['model_name']
        l = []
        cursor=self.data.find({'model_class': modelName}).sort('entry_time',-1).limit(21)
        for point in cursor:
            l.extend(point['data'])
        l.reverse()
        old=l[:len(l)-2] #throw away the newest one, because that one will be pulled out in the next round.  

        new = {}
        for variable in mClasses[modelName]['vars']:
            if variable is not mClasses[modelName]['bettingVar']:
                new[variable] = l[-2][variable]

        new['period'] = l[-2]['period']
        new['entry_time'] = l[-2]['entry_time']
        new = [new]
        # new=[{'contestant_door':l[-2]['contestant_door'], 'monty_door':l[-2]['monty_door'], 'period':l[-2]['period']}];
        return old + new

    def getTimeUntilTwoMinuteMark(self):
        return json.dumps([(120-int(round(time.time()%120)))/60, (120-int(round(time.time()%120)))%60]);
