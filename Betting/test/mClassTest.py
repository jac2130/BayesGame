

import pymongo
import mClassDAO

db = pymongo.MongoClient().blog
dao = mClassDAO.mClassDAO(db)

