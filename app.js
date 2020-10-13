var express = require('express');
var path = require('path');
var mysql = require('mysql');
var url = require('url');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './pictures/activities/');
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage
});


/////////

var app = express();

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'dpdltm137',
    database: 'lab',
    debug: false
});

app.use(expressSession({
    secret: 'mykey',
    resave: false,
    saveUninitialized: true
}));

app.set('views', __dirname + '/views');
app.set('view engin', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/pictures', express.static('pictures'));
app.use('/css', express.static('css'));

app.use(bodyParser.urlencoded({
    extended: false
}));


app.get('/', function (req, res) {
    console.log('새로운 접속자 출현!!');
    res.redirect('/index');
});

app.get('/index', function (req, res) {
    res.render('index.ejs');
});

app.get('/about', function (req, res) {
    res.render('about.ejs');
});

app.get('/researchers', function (req, res) {
    res.render('researchers.ejs');
});

app.get('/professor', function (req, res) {
    res.render('professor.ejs');
});

app.get('/publications', function (req, res) {
    res.render('publications.ejs');
});

app.get('/researches', function (req, res) {
    res.render('researches.ejs');
});


app.get('/activities', function (req, res) {
    pool.getConnection(function (err, conn) {
        conn.query('select * from activities', function (err, rows) {
            conn.release();
            var data = {
                rows: rows
            };
            res.render('activities.ejs', data);
        });
    });
});

app.get('/content', function (req, res) {
    var curUrl = url.parse(req.url);
    var params = querystring.parse(curUrl.query);

    data = {
        title: params.title,
        date: params.date,
        picture: params.picture,
        contents: params.contents
    };

    res.render('content.ejs', data);
});

app.get('/delete', function (req, res) {
    var curUrl = url.parse(req.url);
    var params = querystring.parse(curUrl.query);

    data = {
        title: params.title,
        date: params.date,
        picture: params.picture,
        contents: params.contents
    };

    pool.getConnection(function (err, conn) {
        var exec = conn.query('delete from activities where date = ?', params.date, function (err, result) {
        });
    });

    res.redirect('/activities');
});


app.post('/upload', upload.single('picture'), function (req, res) {
    var date = new Date();

    pool.getConnection(function (err, conn) {
        conn.release();
        
        var data = {
            title: req.body.title,
            contents: req.body.contents,
            date: date
        };

        if (req.file) {
             data.picture = req.file.originalname;
        } else {
            data.picture = 'null';
        }

        var exec = conn.query('insert into activities set ?', data, function (err, result) {});
    });

    res.redirect('/activities');
});


app.get('/write', function (req, res) {
    res.render('write.ejs');
});

app.listen(3000, function () {
    console.log('서버가 시작되었습니다.');
});
