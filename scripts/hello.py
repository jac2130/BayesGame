from bottle import run, get, post, request, route
import json, pymongo

@route('/hello/<id>')
def hello(id):
    data={123:{"name":"Johannes", "hobby":"music"}, 456:{"name":"Ayla", "hobby":"ants"}}
    #the data above must come from a mongodb. 
    return json.dumps(data[int(id)])

@get('/login') # or @route('/login')
def login():
    return '''
        <form action="/login" method="post">
            Username: <input name="username" type="text" />
            Password: <input name="password" type="password" />
            <input value="Login" type="submit" />
        </form>
    '''
@route('/login', method='POST')
def do_login():
    username = request.forms.get('username')
    password = request.forms.get('password')
    #if check_login(username, password):
    print """<p>Your user name is</p>
<p>%s</p>"""  % username    

@route("/posthere", method="POST")
def postResource():
    #do code
    data=request.json
    print data

@route("/")
def index():
    connection=pymongo.MongoClient('localhost', 27017)
    db=connection.test
    name=db.names
    item=name.find_one()
    return "<b>Hello %s</b>" % item['name']


run(host='0.0.0.0', port=8080)
