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
        var user, _i, _len, _results;
        this.me = {
          id: me.id,
          color: me.color,
          avatar: this.createAvatar(me)
        };
        _results = [];
        for (_i = 0, _len = users.length; _i < _len; _i++) {
          user = users[_i];
          _results.push(this.addUser(user));
        }
        return _results;
      }, this));
      this.socket.on('join', __bind(function(user) {
        return this.addUser(user);
      }, this));
      this.socket.on('move', __bind(function(id, position, drawing) {
        var user;
        user = this.users[id];
        if (drawing) {
          this.draw(user, position);
        }
        return this.moveAvatar(user, position);
      }, this));
      $(document).mousemove(__bind(function(event) {
        var position;
        position = {
          x: event.pageX - 8,
          y: event.pageY - 8
        };
        if (this.me != null) {
          if (this.drawing) {
            this.draw(this.me, position);
          }
          this.moveAvatar(this.me, position);
        }
        return this.socket.json.emit('move', position, this.drawing);
      }, this));
      $(document).mousedown(__bind(function(event) {
        return this.drawing = true;
      }, this));
      $(document).mouseup(__bind(function(event) {
        return this.drawing = false;
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
    Client.prototype.draw = function(user, position) {
      var ctx, offset, old;
      offset = user.avatar.position();
      old = {
        x: offset.left,
        y: offset.top
      };
      ctx = this.canvas.get(0).getContext('2d');
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(" + user.color + ")";
      ctx.beginPath();
      ctx.moveTo(old.x, old.y);
      ctx.lineTo(position.x, position.y);
      ctx.closePath();
      return ctx.stroke();
    };
    Client.prototype.moveAvatar = function(user, position) {
      return user.avatar.css({
        left: "" + position.x + "px",
        top: "" + position.y + "px"
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
      ctx.strokeStyle = "rgba(" + user.color + ", 0.6)";
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      nick = $("<div class='nick'>" + user.id + "</div>").appendTo(avatar);
      nick.css('color', "rgba(" + user.color + ")");
      return $(avatar);
    };
    return Client;
  })();
}).call(this);
