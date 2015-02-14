import datetime
import random

class ComputerValueDAO:
    # constructor for the class
    def __init__(self, database):
        self.db = database
        self.computerValue = database.computerValue

    def getComputerValue(self):
        return self.computerValue.find().sort('timeAdded', -1).limit(1)[0]['value']

    def changeComputerValue(self, newValue):
        newValueEntry = {
            'value': newValue,
            'timeAdded': datetime.datetime.now()
        }
        self.computerValue.insert(newValueEntry)

    def newRandomValue(self):
        newValue = random.randint(0, 100)
        self.changeComputerValue(newValue)

