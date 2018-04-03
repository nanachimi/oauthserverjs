/**
 * Created by Manjesh on 14-05-2016.
 */
'use strict';
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OAuthClientSchema = new Schema({
  client_id:  String,
  client_secret: String,
  redirect_uri: String,
  grants: {
    type: Array
  },
  app_name: String,
  website: String,
  description: String,
  logo: String,
  user_id: String
});

module.exports = mongoose.model('OAuthClient', OAuthClientSchema);

