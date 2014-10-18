import sys
import re
import datetime
import time
import pymongo
from bson.objectid import ObjectId


# The Blog Post Data Access Object handles interactions with the Posts collection
class PointsDAO:

    # constructor for the class
    def __init__(self, database):
        self.db = database
        self.points = database.points

    # inserts the blog entry and returns a permalink for the entry
    def insert_entry(self, user_id, points, shares):
        #print "inserting blog entry", title, post

        # fix up the permalink to not include whitespace

        entry = {"user_id":user_id,
                "points": points,
                "shares": shares,
                "time": datetime.datetime.utcnow()
        }

        # now insert the post
        try:
            # XXX HW 3.2 Work Here to insert the post
            print "Inserting the put", entry
            self.points.insert(entry)
        except:
            print "Error inserting post"
            print "Unexpected error:", sys.exc_info()[0]
        return 

    # returns an array of num_posts posts, reverse ordered
    def get_points(self, user_id):
        new = self.points.find({"user_id":user_id}).sort([("time", pymongo.DESCENDING)]).limit(1)
        return new.next()
        

    def accept_put(self, poster_id, accepter_id, point_count):
        old_accepter=self.get_points(accepter_id)
        old_poster=self.get_points(poster_id)
        now=datetime.datetime.utcnow()
        print now
        new_accepter= {"user_id": accepter_id,
                       "points": str(int(float(old_accepter["points"])-float(point_count))),
                       "shares": str(int(float(old_accepter["shares"]) + 1)),
                       "time": now
        }
        
        new_poster= {"user_id": poster_id,
                       "points": str(int(float(old_poster["points"])+float(point_count))),
                       "shares": str(int(float(old_poster["shares"]) - float(1))),
                       "time": now
        }
        print new_accepter, new_poster

        self.points.insert(new_accepter)
        self.points.insert(new_poster)

    def accept_call(self, poster_id, accepter_id, point_count):
        old_accepter=self.get_points(accepter_id)
        old_poster=self.get_points(poster_id)
        now=datetime.datetime.utcnow()
        new_accepter= {"user_id": accepter_id,
                       "points": str(int(float(old_accepter["points"])+float(point_count))),
                       "shares": str(int(float(old_accepter["shares"]) - float(1))),
                       "time": now
        }
        
        new_poster= {"user_id": poster_id,
                       "points": str(int(float(old_poster["points"])-float(point_count))),
                       "shares": str(int(float(old_poster["shares"]) + float(1))),
                       "time": now
        }
        
        self.points.insert(new_accepter)
        self.points.insert(new_poster)


