#!/usr/bin/env python

import socket, threading, time

def handle(s):
  print repr(s.recv(4096))
  s.send('''
HTTP/1.1 101 Web Socket Protocol Handshake\r
Upgrade: WebSocket\r
Connection: Upgrade\r
WebSocket-Origin: http://bettingisbelieving.com:8888\r
WebSocket-Location: ws://bettingisbelieving.com:9876/\r
WebSocket-Protocol: sample
  '''.strip() + '\r\n\r\n')
  time.sleep(1)
  s.send('\x00hello\xff')
  time.sleep(1)
  s.send('\x00world\xff')
  s.close()

s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(('', 9876));
s.listen(1);
while 1:
  t,_ = s.accept();
  threading.Thread(target = handle, args = (t,)).start()
