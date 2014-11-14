logFile = open("/var/www/info.log", 'a')

def logInfo(info):
    logFile.write(info)
    logFile.write('\n')
