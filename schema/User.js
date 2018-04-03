"use strict";

import axios from "axios";
import Promise from "bluebird";

var User = {};

const httpClient = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 1000
});

User.auth = (username, password) => {
  //return httpClient.post('/v1/auth', {
    //username: username,
    //password: password
  //});
  return new Promise(function(resolve, reject){
    if(username === "testuser" && password === "secret")
      return resolve(
        {
          username: username, 
          user_id: "382191-30103-3dno91-3179381d",
          roles: {}
      });
    reject();
  })
}


module.exports = User;
