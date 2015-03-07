# a series of key value fields
class MiscDAO:
    def __init__(self, db):
        self.db = db
        self.misc = self.db.misc
        varsDict = self.misc.find_one()
        if not varsDict:
            self.misc.insert({})

    def getCurrPeriod(self):
        varsDict = self.misc.find_one()
        if 'currPeriod' not in varsDict:
            self.setCurrPeriod(40)
            varsDict = self.misc.find_one()
        return varsDict['currPeriod']

    def setCurrPeriod(self, newPeriod):
        self.misc.update({}, {'$set': {'currPeriod': newPeriod}})

    def incrementPeriod(self):
        varsDict = self.misc.find_one()
        if 'currPeriod' not in varsDict:
            self.setCurrPeriod(41)
        elif varsDict['currPeriod'] == 10000:
            self.setCurrPeriod(40)
        else:
            self.setCurrPeriod(varsDict['currPeriod'] + 1)

    def getTimeUntilNextData(self):
        varsDict = self.misc.find_one()
        return varsDict['timeUntilNextData']

    def setTimeUntilNextData(self, timeUntilNextData):
        self.misc.update({}, {'$set': {'timeUntilNextData': timeUntilNextData}})

    def beginFreePeriod(self):
        self.misc.update({}, {'$set': {'freePeriod': True}})

    def endFreePeriod(self):
        self.misc.update({}, {'$set': {'freePeriod': False}})

    def getFreePeriod(self):
        varsDict = self.misc.find_one()
        if 'freePeriod' not in varsDict:
            self.startFreePeriod()
            varsDict = self.misc.find_one()
        return varsDict['freePeriod']

    def beginDemo(self):
        self.misc.update({}, {'$set': {'demoMode': True}})

    def endDemo(self):
        self.misc.update({}, {'$set': {'demoMode': False}})

    def getDemoMode(self):
        varsDict = self.misc.find_one()
        if 'demoMode' not in varsDict:
            self.beginDemo()
            varsDict = self.misc.find_one()
        return varsDict['demoMode']

    def reset(self):
        self.misc.remove({})
        self.misc.insert({})
