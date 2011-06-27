(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.Fingerpaint = {};
  Fingerpaint.Client = (function() {
    function Client() {
      this.users = {};
      this.socket = io.connect("http://" + document.location.hostname + "/");
      this.canvas = $('#draw');
      this.viewport = $(window);
      this.resizeCanvas();
      this.viewport.resize(__bind(function() {
        return this.resizeCanvas();
      }, this));
      this.socket.on('hello', __bind(function(me, users) {
        var count, id, user;
        this.me = me;
        count = 0;
        for (id in users) {
          user = users[id];
          this.addUser(user);
          count++;
        }
        return $('#status').html("" + count + " " + (count === 1 ? 'user' : 'users') + " connected");
      }, this));
      this.socket.on('join', __bind(function(user) {
        return this.addUser(user);
      }, this));
      this.socket.on('move', __bind(function(id, position, drawing) {
        var user;
        user = this.users[id];
        return this.moveUser(user, position, drawing);
      }, this));
      this.socket.on('nick', __bind(function(id, nick) {
        var user;
        user = this.users[id];
        return this.changeNick(user, nick);
      }, this));
      $(document).mousemove(__bind(function(event) {
        var position;
        position = {
          x: event.pageX,
          y: event.pageY
        };
        return this.socket.json.emit('move', position, this.drawing);
      }, this));
      $(document).mousedown(__bind(function(event) {
        return this.drawing = true;
      }, this));
      $(document).mouseup(__bind(function(event) {
        return this.drawing = false;
      }, this));
      $(document).keyup(__bind(function(event) {
        var nick;
        if (event.keyCode === 78) {
          nick = prompt("what's your name?");
          return this.socket.emit('nick', nick);
        }
      }, this));
    }
    Client.prototype.resizeCanvas = function() {
      return this.canvas.attr({
        width: this.viewport.width(),
        height: this.viewport.height()
      });
    };
    Client.prototype.addUser = function(user) {
      return this.users[user.id] = {
        id: user.id,
        color: user.color,
        avatar: this.createAvatar(user)
      };
    };
    Client.prototype.changeNick = function(user, nick) {
      user.nick = nick;
      return $('.nick', user.avatar).html(nick);
    };
    Client.prototype.moveUser = function(user, position, drawing) {
      var ctx, offset, old;
      if (drawing) {
        offset = user.avatar.position();
        old = {
          x: offset.left + 8,
          y: offset.top + 8
        };
        ctx = this.canvas.get(0).getContext('2d');
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(" + user.color + ", 0.8)";
        ctx.beginPath();
        ctx.moveTo(old.x, old.y);
        ctx.lineTo(position.x, position.y);
        ctx.closePath();
        ctx.stroke();
      }
      return user.avatar.css({
        left: "" + (position.x - 8) + "px",
        top: "" + (position.y - 8) + "px"
      });
    };
    Client.prototype.createAvatar = function(user) {
      var avatar, canvas, ctx, nick;
      avatar = $("<div class='avatar' id='user-" + user.id + "'/>").appendTo('body');
      canvas = $('<canvas/>').attr({
        width: 16,
        height: 16
      }).appendTo(avatar);
      ctx = canvas.get(0).getContext('2d');
      ctx.lineWidth = 0.5;
      ctx.fillStyle = "rgba(" + user.color + ", 0.2)";
      ctx.strokeStyle = "rgba(" + user.color + ", 1)";
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      nick = $("<div class='nick'>" + user.id + "</div>").appendTo(avatar);
      nick.css('color', "rgba(" + user.color + ", 1)");
      return $(avatar);
    };
    return Client;
  })();
}).call(this);
