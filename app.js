const express = require('express');
const path = require('path');
const logger = require('morgan');
const compress = require('compression');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');

const routes = require('./routes');

module.exports = (db) => {
  const app = express();

  app.use(logger('dev'));
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Passport Configuration
  app.use(session({
    secret: 'quart-nightvision-cantaloupe',
    resave: true,
    saveUninitialized: true,
  }));
  app.use(flash());

  app.use(express.static(path.join(__dirname, 'build')));
  app.use('/backendServices', routes(db));
  app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  return app;
};
