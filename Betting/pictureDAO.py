import sys
import random
import string
import time
import pymongo
# The session Data Access Object handles interactions with the sessions collection

class PictureDAO:

    def __init__(self, database):
        self.db = database
        self.pictures = database.pictures

    def add_picture(self, _id, url, width, height):
        picture={}
        print width, "X", height
        picture['id']=_id;
        picture['url']=url;
        picture['width']=width;
        picture['height']=height;
        picture['entry_time']=time.time()
        try:
            self.pictures.insert(picture);
            print _id, width, height, "HERE!!!"
        except pymongo.errors.OperationFailure:
            print "oops, mongo error"
            return False
        except pymongo.errors.DuplicateKeyError as e:
            print "oops, username is already taken"
            return False

        return True

    def get_newest(self, id, width, height):
        
        pic= self.pictures.find_one({'id':str(id)})#{'id':str(id), 'width':width, 'height':height})
        print pic
        return pic['url'];
        #return picture['url']
        
