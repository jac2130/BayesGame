import pointsDAO
connection_string ="mongodb://localhost"
import pymongo
connection=pymongo.MongoClient()
database=connection.blog
points=pointsDAO.PointsDAO(database)
#puts.accept_put('5429ad3e559cd95646abdee7', '1256')
#print puts.get_put_by_id('5429ad3e559cd95646abdee7')
user_id= "121211"
point_count="1150"
shares="11"
points.insert_entry("100006471334363", "800", "300")
p=points.get_points(user_id)
points.accept_put(user_id, "1234", "50")
print p
