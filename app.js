var createError = require("http-errors");
var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var cors = require('cors');
var logger = require("morgan");
var multer = require("multer");

var dbCon = require("./lib/db");

var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/user");
var feedbackRouter = require("./routes/feedBack");
var roomRouter = require("./routes/room");
var rtcAndRtmTokenRouter = require("./routes/rtcAndRtmToken");
var recodingRouter = require("./routes/recoding");

var app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, authorization");
  next();
});

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());
app.use(cookieParser());
app.use(cors());

// Request Logger
if (app.get("env") === "development") {
  app.use(logger("dev"));
}

app.use("/admin", adminRouter);
app.use("/user", usersRouter);
app.use("/feedback", feedbackRouter);
app.use("/room", roomRouter);
app.use("/token", rtcAndRtmTokenRouter);
app.use("/recording", recodingRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;

//mongodb+srv://api_client:metaverse-client@metaverseapi.ehc3j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
