var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var Users = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  username: null,
  password: null,
  checkPassword: function() {
    usernameFromDB = model.get('username', username);
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      console.log('***** users.js initialize: model', model );
      this.username = model.attribures.username;
      this.password = model.attribures.password;
      model.set('username', model.attributes.username);
      model.set('password', model.attributes.password);
    });
  }
});

module.exports = Users;