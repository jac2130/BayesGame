import datetime
import random

class ComputerValueDAO:
    # constructor for the class
    def __init__(self, database):
        self.db = database
        self.computerValue = database.computerValue

    def getComputerValue(self):
        result = self.computerValue.find().sort('timeAdded', -1).limit(1)
        if result.count() == 0:
            print "no computer value found, setting to 0"
            computerValue = 0
        else:
            computerValue = result[0]['value']
        return computerValue

    def changeComputerValue(self, newValue):
        newValueEntry = {
            'value': newValue,
            'timeAdded': datetime.datetime.now()
        }
        self.computerValue.insert(newValueEntry)

    def newRandomValue(self):
        newValue = random.randint(0, 100)
        self.changeComputerValue(newValue)

