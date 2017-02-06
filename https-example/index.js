var log4koa = require('log4koa');
var log4js = require('log4js');
var Log = log4js.getLogger();

var koa = require('koa');
var app = koa();

var co = require('co');

app.use(log4koa());

var auth = require('http-auth');
var basic = auth.basic({
  realm: 'User&Password guest/guest',
  file: __dirname + '/users.htpasswd'
});
var authBasic = auth.koa(basic);

app.use(authBasic);

var view = require('jo4web/pug/example')({});
app.use(function* () {
  this.body = yield view;
});

co(function* () {
  var createServer = require('jo4web/koa/createServer');
  var createPrivate = require('jo4web/crypto/createPrivateKey');
  var createCert = require('jo4web/crypto/createCert');
  yield createPrivate(app);
  yield createCert(app);
  var server = createServer(app);
  server.on('listening', function () {
    var web_listen = server.address().address + ':' + server.address().port;
    Log.info('service listein on ' + web_listen);
  });
  server.listen(3000);
});

