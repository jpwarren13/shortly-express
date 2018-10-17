var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var Users = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});

module.exports = Users;