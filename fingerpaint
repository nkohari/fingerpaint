#!/usr/bin/env ./node_modules/coffee-script/bin/coffee

sys      = require 'sys'
express  = require 'express'
socketio = require 'socket.io'

config =
	port:      3000
	publicDir: 'public'

# set up express

app = express.createServer()

app.use express.compiler
	src:    'src'
	dest:   config.publicDir
	enable: ['coffeescript']

app.use express.static(config.publicDir)

app.listen config.port, ->
	addr = app.address()
	sys.puts "[fingerpaint] listening on http://#{addr.address}:#{addr.port}"

# set up socket.io

randomColor = ->
	"#{Math.floor(Math.random() * 128 + 32)},#{Math.floor(Math.random() * 128 + 32)},#{Math.floor(Math.random() * 128 + 32)}"
	
io = socketio.listen app
io.set 'log level', 0

users = {}

io.sockets.on 'connection', (socket) ->
	
	sys.puts "[fingerpaint] user #{socket.id} connected"
	
	user =
		id:    socket.id
		nick:  socket.id
		color: randomColor()
		
	users[socket.id] = user
	
	socket.json.emit 'hello', user, users
	socket.broadcast.json.emit 'join', user
	
	socket.on 'move', (position, drawing) ->
		io.sockets.json.emit 'move', socket.id, position, drawing
	
	socket.on 'nick', (nick) ->
		user.nick = nick
		io.sockets.json.emit 'nick', socket.id, nick
		
	socket.on 'disconnect', ->
		delete users[socket.id]
		socket.broadcast.emit 'part', user
		sys.puts "[fingerpaint] user #{socket.id} disconnected"
