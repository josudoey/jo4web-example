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

var view = require('view4pug')();
app.use(function* () {
  this.body = view('view4pug/example', {
    youAreUsingPug: (Math.random() > 0.5)
  });
});

co(function* () {
  var createServer = require('jo4web/koa/createServer');
  var setCert = require('jo4web/self-signed');
  setCert(app);
  var server = createServer(app);
  server.on('listening', function () {
    var web_listen = server.address().address + ':' + server.address().port;
    Log.info('service listein on ' + web_listen);
  });
  server.listen(3000);
}).catch(function (err) {
  Log.error(err);
});

