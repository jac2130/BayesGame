import json

def application(environ, start_response):
    import Cookie
    cookie = Cookie.SimpleCookie()
    cookieInfo = {'user_id': 'asdfasdf'}
    cookie['access_token'] = json.dumps(cookieInfo)
    #access_token = cookie['access_token'].value
    output = "Cookie Set"
    start_response('200 OK', [('Set-Cookie', cookie["access_token"].OutputString()),
                              ('Content-type', 'text/plain'),
                              ('Content-Length', str(len(output)))])
    return [output]
