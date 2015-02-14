from urllib2 import urlopen
baseUrl = "http://www.bettingisbelieving.com/ajax"

user_id = 1
a = urlopen('%s/hasNewData/monty/%d' %(baseUrl, user_id)).read()
b = urlopen("%s/clock" %(baseUrl)).read()
c = urlopen("%s/truth/%d" %(baseUrl, user_id)).read()
c = urlopen("%s/isFreePeriod" %(baseUrl)).read()
c = urlopen("%s/newData" %(baseUrl)).read()
print a
print b
print c
