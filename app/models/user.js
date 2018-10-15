var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var Users = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  username: null,
  password: null,
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      console.log('users.js initialize: model', model );
      console.log('users.js initialize: attrs', attrs );
      console.log('users.js initialize: options', options );
      //shasum.update(model.get('username'));
      model.set('username', model.attributes.username);
      model.set('password', model.attributes.password);
    });
  }
});

module.exports = Users;