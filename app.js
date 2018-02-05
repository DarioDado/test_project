let express  = require("express"),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    dbConfig = require("./config/database");

let apiUserRoutes = require("./routes/api/users");


mongoose.connect(dbConfig.url);
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, *");
    next();
});

app.use("/api", apiUserRoutes);

// error handling
app.use(function(req, res, next) {
    let err = new Error("Not found");
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        status: "error",
        error: {
            message: err.message
        }
    });
});

app.listen(port, function() {
    console.log("Server running on port: " + port);
});
