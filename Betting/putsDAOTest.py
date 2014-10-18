import putsDAO
connection_string ="mongodb://localhost"
import pymongo
connection=pymongo.MongoClient()
database=connection.blog
puts=putsDAO.PutsDAO(database)
puts.accept_put('54288300559cd94800b181dd', '121211')
print puts.get_put_by_id('54288300559cd94800b181dd')
#100006471334363
