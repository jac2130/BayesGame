from bson.objectid import ObjectId

class UserIdsDAO(object):
    def __init__(self, db):
        self.db = db.userIds

    def createNewId(self):
        newId = self.db.insert({})
        print "newId: ", str(newId)
        return str(newId)

    def idInDb(self, userId):
        if self.db.find_one({"_id": ObjectId(userId)}):
            return True
        else:
            return False
