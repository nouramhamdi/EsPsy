var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const cors = require('cors');
const {connectToMongoDB} = require('./db/BD')
const bodyParser = require("body-parser");
const passport = require('./config/passport');

require("dotenv").config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const chatbotRoutes = require("./routes/chatbot");
const authGoogle = require('./routes/authGoogle');
const testRoutes = require('./routes/testRoutes');

const session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000', // Your client URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


app.use(session({
  secret: "token",
  resave: false,
  saveUninitialized : true,
  cookie: { secure: false , maxAge: 6 *60 * 60 * 1000,httpOnly: true} 
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/api", chatbotRoutes);
app.use("/auth", authGoogle);
app.use('/tests', testRoutes);  // This mounts your test routes

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json('error');
});

var server = http.createServer(app);
server.listen(process.env.PORT || 5000, () => {
  connectToMongoDB();
  console.log("app is running on port", process.env.PORT || 5000);
});

module.exports = app;
