var log4js = require("jo4web/log4js");
var Log = log4js.getLogger();

var koa = require("koa");
var app = koa();

var co = require("co");

app.use(function* (next) {
  var remote = this.remote = this.socket.remoteAddress;
  var x = this.headers["x-forwarded-for"];
  if (x) {
    this.proxy = remote;
    this.remote = x.split(",")[0];
    remote = this.remote;
  }
  var t = Date.now();
  var self = this;
  this.res.on('finish', function () {
    var dt = Date.now() - t;
    Log.info(remote, "-", self.method, self.path, self.response.status, "time:" + dt);
  });
  yield next;
});

var auth = require('http-auth');
var basic = auth.basic({
  realm: "User&Password guest/guest",
  file: __dirname + "/users.htpasswd"
});
var authBasic = auth.koa(basic);

app.use(authBasic);

var view = require("jo4web/pug/example")({});
app.use(function* () {
  this.body = yield view;
});

co(function* () {
  var createServer = require("jo4web/koa/createServer");
  var createPrivate = require("jo4web/crypto/createPrivateKey");
  var createCert = require("jo4web/crypto/createCert");
  yield createPrivate(app);
  yield createCert(app);
  var server = createServer(app);
  server.on('listening', function () {
    var web_listen = server.address().address + ":" + server.address().port;
    Log.info("service listein on " + web_listen);
  });
  server.listen(3000);
});

