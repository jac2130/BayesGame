import bottle
import requests

path = 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-prn1/t1.0-1/c28.28.351.351/s120x120/150785_10100648375801492_180581528_n.jpg'

@bottle.route("/")
def index():
    bottle.response.content_type = 'image/jpeg'
    return requests.get(path).content

bottle.debug(True)
bottle.run(host='0.0.0.0', port=8081)
