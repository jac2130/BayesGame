import hmac
import random
import string
import hashlib
import pymongo
import time

# The Data Access Object handles all interactions with the Data collection.
class DataDAO:

    def __init__(self, db):
        self.db = db
        self.data = self.db.data
        

        # creates a new user in the users collection
    def add_data(self, data):
        
        data = {'data':data};
        data['entry_time']=time.time()
        try:
            self.data.insert(data, safe=True)
        except pymongo.errors.OperationFailure:
            print "oops, mongo error"
            return False
        except pymongo.errors.DuplicateKeyError as e:
            print "oops, data is already taken"
            return False

        return True

    def get_newest(self):

        
        l = []
        cursor=self.data.find().sort('entry_time',-1).limit(2)
        for point in cursor:

            #point['entry_time'] = point['entry_time'].strftime("%A, %B %d %Y at %I:%M%p") # fix up date
            
            l.extend(point['data'])
        old=l[1]
        new={'contestant_door':l[0]['contestant_door'], 'monty_door':l[0]['monty_door'], 'period':l[0]['period']}
        return [old, new]
    
    def get_first_twenty(self):
        l=[]
        cursor=self.data.find().sort('entry_time',-1).limit(21)
        for point in cursor:
            l.extend(point['data'])

        l.reverse();
        old=l[0: len(l)-2]; #throw away the newest one, because that one will be pulled out in the next round.  
        new=[{'contestant_door':l[-2]['contestant_door'], 'monty_door':l[-2]['monty_door'], 'period':l[-2]['period']}];
        return old+new
