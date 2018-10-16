var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

 
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/', 
  function(req, res) {
    res.render('index');
  });

app.get('/create', 
  function(req, res) {
    res.render('index');
  });

app.get('/links', 
  function(req, res) {
    Links.reset().fetch().then(function(links) {
      res.status(200).send(links.models);
    });
  });

app.post('/links', 
  function(req, res) {
    var uri = req.body.url;

    if (!util.isValidUrl(uri)) {
      console.log('Not a valid url: ', uri);
      return res.sendStatus(404);
    }

    new Link({ url: uri }).fetch().then(function(found) {
      if (found) {
        res.status(200).send(found.attributes);
      } else {
        util.getUrlTitle(uri, function(err, title) {
          if (err) {
            console.log('Error reading URL heading: ', err);
            return res.sendStatus(404);
          }

          Links.create({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          })
            .then(function(newLink) {
              console.log('in shortly.js, link.create:', newLink);
              res.status(200).send(newLink);
            });
        });
      }
    });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', function(req, res) {
  // serve up the login page
  res.render('login');
});

app.get('/signup', function(req, res) {
  // go to signup route?
  res.render('signup');
});

app.post('/login', function(req, res) {
  console.log('app.post/login: ', req.body);

  // new User(req.body).fetch().then(function(user) {
  //   debugger;
  //   if (!user) {
  //     res.redirect('/login');
  //   } else {
  //     // we are logged in (?)
  //   }
  // });
 
  var username = req.body.username;
  var password = req.body.password;
 
  if (username === 'demo' && password === 'demo') {
     res.redirect('/index');
//     req.session.regenerate(function() {
//       req.session.user = username;
//       res.redirect('/index');
//     });
  } else {
    res.redirect('/login');
  }     


  // connect to database to verify username and password exists
  // if not wrong password prompt
  //If username doesn't exist go to signup page
  // If it exists then go to users links page.
});

app.post('/signup', function(req, res) {
  console.log('** shortly.js app.post req.body:', req.body);
  const username = req.body.username;
  const password = req.body.password;

  new User({ username, password }).fetch().then(function(found) {
    if (found) {
      // call login function with given username and password
      //res.status(200).send(found.attributes);
    } else {
      // create entry for user
      // use bcrypt to hash password and enter with user

      Users.create({
        username: username,
        password: password
      })
        .then(function(newUser) {
          console.log('*** shortly.js new User:', newUser);
          //redirect to the users link/page
          //render links by the user.
          res.status(201).send(newUser);
        });
    }
  });


// do the signup
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
