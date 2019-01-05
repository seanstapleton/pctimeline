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
  app.use(express.static(path.join(__dirname, 'public')));

  // Passport Configuration
  app.use(session({
    secret: 'quart-nightvision-cantaloupe',
    resave: true,
    saveUninitialized: true,
  }));
  app.use(flash());

  app.use('/backendServices', routes(db));
  // app.get('*', (req, res) => {
  //   res.sendFile(`${__dirname}/../build/index.html`);
  // });
  app.use('/public', express.static(`${__dirname}/public`));

  return app;
};
