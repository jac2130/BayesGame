import sys
import json
import random
import string
import time
import pymongo
import yaml
from bayesian.bbn import build_bbn_from_conditionals as build_graph

# The session Data Access Object handles interactions with the sessions collection

def json_convert(query):
    """
    function used to convert queries into useful json files
    that can be served by bottle and imported into the game
    using ajax.
    """
    d={k[0]:{} for k in query.keys()}
    [d[k[0]].update({k[1]:r}) for k, r in query.items()]
    return json.dumps(d)

class ModelDAO:

    def __init__(self, database):
        self.db = database
        self.models = database.models

    def add_model(self, model):
        model['entry_time']=time.time()
        try:
            self.models.insert(model);
            print model['id'], "HERE!!!"
        except pymongo.errors.OperationFailure:
            print "oops, mongo error"
            return False
         
        return True


    def get_newest(self, _id):
        '''
        gets the newest model and turns it into a graph.
        '''
        model_cursor= self.models.find({'id':str(_id)}).sort("entry_time", pymongo.DESCENDING).limit(1)#{'id':str(id), 'width':width, 'height':height})
  #      print pic
        l=[]
        for cur in model_cursor: l.append(cur)
        return build_graph(yaml.load(json.dumps(l[-1][str(_id)])));
        #return picture['url'] 

    def query(self, _id, conditions={}):
        '''
        queries the newest graph and returns the query object.
        '''
        j=self.get_newest(_id)
 	try: 
            return json_convert(j.query(**conditions))
 	except: 
            #print "sorry the model is not fully defined yet"
            return json.dumps("You have not yet fully specified your model");

    def has_query(self, _id):
        '''
        This function is used to assess whether a model can be queried.
        '''
        if self.query(_id):
            return 1*True
        else: 
            return 0
        
        
