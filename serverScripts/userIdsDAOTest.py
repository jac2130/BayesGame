import pymongo
import sys
import os

currentDir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(currentDir + "../serverScripts")

from userIdsDAO import UserIdsDAO

client = pymongo.MongoClient()
db = client.bayesGame

userIdsDAO = UserIdsDAO(db)
newId = str(userIdsDAO.createNewId())
print newId

print userIdsDAO.idInDb(newId)
print userIdsDAO.idInDb('0')

