import sys
import json
import random
import string
import time
import pymongo
import yaml
from bayesian.bbn import build_bbn_from_conditionals as build_graph
from itertools import product
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

    def sub_deps_once(self, varDeps):
        subbedVarDict = {}
        print "varDeps: ", varDeps
        indepVars = [var for var in varDeps if not varDeps[var]]
        for var in varDeps:
            print "var: ", var
            subbedVarDict[var] = []
            for depVar in varDeps[var]:
                if depVar in indepVars:
                    subbedVarDict[var].append(depVar)
                else:
                    subbedVarDict[var].extend(varDeps[depVar])
        print "subbedVarDict: ", subbedVarDict
        return subbedVarDict

    def cyclic_dep_exists_in_varDeps(self, varDeps):
        for var in varDeps:
            if var in varDeps[var]:
                return True
        return False

    def varDeps_at_base_level(self, varDeps):
        indepVars = [var for var in varDeps if not varDeps[var]]
        for var in varDeps:
            for depVar in varDeps[var]:
                if depVar not in indepVars:
                    return False
        return True

    def all_deps_indep(self, depVars, indepVars):
        for var in depVars:
            if var not in indepVars:
                return False
        return True

    def has_cyclic_dependency(self, var, varDeps):
        print "looking at var: ", var
        if var in varDeps[var]: return True
        indepVars = [avar for avar in varDeps if not varDeps[avar]]
        print "indepVars: ", indepVars
        visitedVars = set([var])
        visitedVars = visitedVars.union([avar for avar in varDeps[var]
                                        if avar not in indepVars])
        print "visited vars: ", visitedVars
        depVars = varDeps[var]
        print "deps: ", depVars
        while not self.all_deps_indep(depVars, indepVars):
            lowerDeps = set([])
            for depVar in depVars:
                if depVar in indepVars:
                    lowerDeps.add(depVar)
                else:
                    lowerDeps = lowerDeps.union(varDeps[depVar])
            depVars = lowerDeps
            print "new deps: ", depVars
            alreadyEncounteredVars = lowerDeps.intersection(visitedVars)
            if alreadyEncounteredVars:
                print "already encountered: ", alreadyEncounteredVars
                return True
            else:
                visitedVars = visitedVars.union([avar for avar in depVars
                                                 if avar not in indepVars])
                print "new visitedVars: ", visitedVars
        return False

    def detect_cyclic_model(self, model):
        varDeps = {}
        print "detecting cyclic model for: ", model
        for varName in model:
            if varName == "user_id" or varName == "id": continue
            conditions = model[varName][0][0]
            print "conditions for ", varName, ": ", conditions
            conditionalVars = [condition[0] for condition in conditions]
            varDeps[varName] = conditionalVars
        indepVars = [var for var in varDeps if not varDeps[var]]
        print "indep vars: ", indepVars
        if not varDeps:
            return False
        elif not indepVars:
            return True
        for var in varDeps:
            if self.has_cyclic_dependency(var, varDeps):
                return True
        return False

    def add_model(self, model):
        model['entry_time']=time.time()
        try:
            self.models.insert(model);
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
        for cur in model_cursor:
            l.append(cur)
        print "latest model: ", l[-1][str(_id)]

        if not l:
            return None
        else:
            return build_graph(yaml.load(json.dumps(l[-1][str(_id)])));
        #return picture['url'] 

    def query(self, _id, conditions={}):
        '''
        queries the newest graph and returns the query object.
        '''
        j = self.get_newest(_id)
        if j == None:
            return json.dumps("Model not found")

        try:
            domains=j.domains
            return json_convert(j.query(**conditions))
        except: 
            #print "sorry the model is not fully defined yet"
            return json.dumps("You have not yet fully specified your model");

    def query_all_possible(self, _id, variable):
        '''
        queries the newest graph and returns the query object.
        '''
        j = self.get_newest(_id)
        if j == None:
            return json.dumps("Model not found")

        try:
            domains = {key: val for key, val in j.domains.items() if key!=variable}
            cr=list(product(*domains.values()))
            names=domains.keys()
            all_possible= [{name: v for name, v in zip(names, c)} for c in cr]
            temp_dict={";".join(list(":".join(it) for it in conditions.items())): eval(json_convert(j.query(**conditions)))[variable] for conditions in all_possible}
            
            return json.dumps(temp_dict)
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
