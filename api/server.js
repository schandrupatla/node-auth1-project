const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session');
const store = require('connect-session-knex')(session);

const usersRouter = require('./users/users-router.js');
const authRouter = require('./auth/auth-router.js');

/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */

const server = express();
//use session
server.use(session({
  name:'chocolatechip',
  secret: 'this should come from an env var',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false, // if true cookien only gets set if connection is over HTTPS
    httpOnly: false, // if true the cookie cannot be read from the javascript
  },
  rolling: true,
  resave: false, // this is only necessary with some long-term session storage solutions
  saveUninitialized: false, // if true we might be in violation of GDPR laws
  store: new store({
    knex: require('../data/db-config'),
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 60,
  })
}))
server.use(helmet());
server.use(express.json());
server.use('/api/users', usersRouter);
server.use('/api/auth', authRouter);
server.use(cors());

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
