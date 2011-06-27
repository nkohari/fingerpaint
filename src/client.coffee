window.Fingerpaint = {}

class Fingerpaint.Client
	
	constructor: ->
		
		@users = {}
		@socket = io.connect "http://#{document.location.hostname}/"
		
		@canvas = $('#draw')
		@viewport = $(window)
		
		@resizeCanvas()
		@viewport.resize =>
			@resizeCanvas()
		
		@socket.on 'hello', (me, users) =>
			@me =
				id: me.id
				color: me.color
				avatar: @createAvatar(me)
			@addUser(user) for user in users
		
		@socket.on 'join', (user) =>
			@addUser(user)
			
		@socket.on 'move', (id, position, drawing) =>
			user = @users[id]
			if drawing then @draw user, position
			@moveAvatar user, position
		
		$(document).mousemove (event) =>
			position =
				x: event.pageX - 8
				y: event.pageY - 8
			if @me?
				if @drawing then @draw @me, position
				@moveAvatar @me, position
			@socket.json.emit 'move', position, @drawing
		
		$(document).mousedown (event) =>
			@drawing = true
		
		$(document).mouseup (event) =>
			@drawing = false
	
	resizeCanvas: ->
		@canvas.attr
			width: @viewport.width()
			height: @viewport.height()
	
	addUser: (user) ->
		@users[user.id] =
			id:     user.id
			color:  user.color
			avatar: @createAvatar(user)
	
	draw: (user, position) ->
		offset = user.avatar.position()
		
		old =
			x: offset.left
			y: offset.top
			
		ctx = @canvas.get(0).getContext('2d')
		ctx.lineWidth = 3
		ctx.strokeStyle = "rgba(#{user.color})"
		ctx.beginPath()
		ctx.moveTo(old.x, old.y)
		ctx.lineTo(position.x  , position.y)
		ctx.closePath()
		ctx.stroke()
	
	moveAvatar: (user, position) ->
		user.avatar.css
			left: "#{position.x}px"
			top:  "#{position.y}px"
	
	createAvatar: (user) ->
		avatar = $("<div class='avatar' id='user-#{user.id}'/>").appendTo('body')
		canvas = $('<canvas/>').attr(width: 16, height: 16).appendTo(avatar)
		
		ctx = canvas.get(0).getContext('2d')
		ctx.lineWidth = 0.5
		ctx.fillStyle = "rgba(#{user.color}, 0.2)"
		ctx.strokeStyle = "rgba(#{user.color}, 0.6)"
		ctx.beginPath()
		ctx.arc(8, 8, 6, 0, Math.PI * 2, true)
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		
		nick = $("<div class='nick'>#{user.id}</div>").appendTo(avatar)
		nick.css 'color', "rgba(#{user.color})"
		
		return $(avatar)