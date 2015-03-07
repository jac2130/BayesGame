import json

def application(environ, start_response):
    import Cookie
    cookie = Cookie.SimpleCookie()
    cookie.load(environ['HTTP_COOKIE'])
    access_token = cookie['access_token'].value

    user_id = str(json.loads(access_token)['user_id'])
    output = "user id = %s" %(user_id)


    start_response('200 OK', [('Content-type', 'text/plain'),
                              ('Content-Length', str(len(output)))])
    return [output]
