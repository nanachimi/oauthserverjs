/**
 * Created by Manjesh on 14-05-2016.
 */

import _ from "lodash";
import mongoose from "mongoose";
import Promise from "bluebird";
import jwt from "jsonwebtoken";
import User from "./schema/User";
import OAuthClient from "./schema/OAuthClient";
import OAuthAccessToken from "./schema/OAuthAccessToken";
import OAuthAuthorizationCode from "./schema/OAuthAuthorizationCode";
import OAuthRefreshToken from "./schema/OAuthRefreshToken";

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/oauth2", { keepAlive: true});

mongoose.connection.on("error", err => {
  console.error("Connection to mongodb server failed");
  console.error(err);
});

mongoose.connection.once("open", () => {
  console.info("Connection to mongodb server was successful");
});

const generateAccessToken = (client, user, scope) => {
  console.log("generateAccessToken is called");
  return jwt.sign(
    { 
      identity: user.username, 
      client_id: client.client_id, 
      user_id: user.user_id,
      roles: user.roles
    }, 
    "terces");
}

const generateRefreshToken = (client, user, scope) => {
  console.log("generateRefreshToken is called");
  return jwt.sign(
    { 
      identity: user.username, 
      client_id: client.client_id, 
      user_id: user.user_id,
      roles: user.roles
    }, 
    "secret");
}

const getAccessToken = bearerToken => {
  console.log("getAccessToken is called");
  return (
    OAuthAccessToken
      //User,OAuthClient
      .findOne({ access_token: bearerToken })
//      .populate("User")
      .populate("OAuthClient")
      .then(function(accessToken) {
        console.log("accessToken");
        if (!accessToken) return false;
        var token = accessToken;
        token.user = token.User;
        token.client = token.OAuthClient;
        token.scope = token.scope;
        return token;
      })
      .catch(function(err) {
        console.error("getAccessToken - Err: ");
      })
  );
};


const getClient = (clientId, clientSecret) => {
  console.log("getClient is called");
  const options = { client_id: clientId };
  if (clientSecret) options.client_secret = clientSecret;

  return OAuthClient.findOne(options)
    .then(function(client) {
      if (!client) return new Error("client not found");

      var clientWithGrants = client;
      clientWithGrants.grants = clientWithGrants.grants;
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri];
      delete clientWithGrants.redirect_uri;
      return clientWithGrants;
    })
    .catch(function(err) {
      console.log("getClient - Err: ", err);
    });
};

const getUser = (username, password) => {
  return User.auth(username, password)
    .then(function(user) {
      if(!user) return false;
      return user;
    }).catch(function(err) {
      console.error("getUser - Err: ", err);
    });
};

const revokeAuthorizationCode = code => {
  console.log("revokeAuthorizationCode", code);
  return OAuthAuthorizationCode.findOne({
    where: {
      authorization_code: code.code
    }
  })
    .then(function(rCode) {
      var expiredCode = code;
      var now = new Date();
      expiredCode.expiresAt = now.setHours(now.getHours() + 0.2);
      return expiredCode;
    })
    .catch(function(err) {
      console.error("getUser - Err: ", err);
    });
};

const revokeToken = token => {
  console.log("revokeToken is called");
  return OAuthRefreshToken.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  })
    .then(function(rT) {
      if (rT) rT.destroy();
      var expiredToken = token;
      var now = new Date();
      expiredToken.refreshTokenExpiresAt = now.setHours(now.getHours() + 1);
      return expiredToken;
    })
    .catch(function(err) {
      console.error("revokeToken - Err: ", err);
    });
};

const saveToken = (token, client, user) => {
  console.log("saveToken is called");
  const accessToken = OAuthAccessToken.create({
    access_token: token.accessToken,
    expires: token.accessTokenExpiresAt,
    OAuthClient: client._id,
    user_id: user.user_id,
    scope: token.scope
  });

  const refreshToken =  token.refreshToken ? OAuthRefreshToken.create({
    // no refresh token for client_credentials
    refresh_token: token.refreshToken,
    expires: token.refreshTokenExpiresAt,
    OAuthClient: client._id,
    user_id: user.user_id,
    scope: token.scope
  }) : {}; 
  return Promise.all([accessToken, refreshToken])
    .then(function(resultsArray) {
      return _.assign(
        // expected to return client and user, but not returning
        {
          client: client,
          user: user,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken // proxy
        },
        token
      );
    })
    .catch(function(err) {
      console.error("revokeToken - Err: ", err);
    });
};

const getAuthorizationCode = code => {
  console.log("getAuthorizationCode is called");
  return OAuthAuthorizationCode.findOne({ authorization_code: code })
    .populate("User")
    .populate("OAuthClient")
    .then(function(authCodeModel) {
      if (!authCodeModel) return false;
      var client = authCodeModel.OAuthClient;
      var user = authCodeModel.User;
      return (reCode = {
        code: code,
        client: client,
        expiresAt: authCodeModel.expires,
        redirectUri: client.redirect_uri,
        user: user,
        scope: authCodeModel.scope
      });
    })
    .catch(function(err) {
      console.error("getAuthorizationCode - Err: ", err);
    });
};

const saveAuthorizationCode = (code, client, user) => {
  console.log("saveAuthorizationCode is called");
  return OAuthAuthorizationCode.create({
    expires: code.expiresAt,
    OAuthClient: client._id,
    authorization_code: code.authorizationCode,
    User: user._id,
    scope: code.scope
  })
    .then(function() {
      code.code = code.authorizationCode;
      return code;
    })
    .catch(function(err) {
      console.error("saveAuthorizationCode - Err: ", err);
    });
};

const getUserFromClient = client => {
  console.log("getUserFromClient is called");
  var options = { client_id: client.client_id };
  if (client.client_secret) options.client_secret = client.client_secret;
  return OAuthClient.findOne(options)
    .populate("User")
    .then(function(client) {
      console.log(client);
      if (!client) return false;
      if (!client.User) return false;
      return client.User;
    })
    .catch(function(err) {
      console.error("getUserFromClient - Err: ", err);
    });
};

const getRefreshToken = refreshToken => {
  console.log("getRefreshToken is called");
  if (!refreshToken || refreshToken === "undefined") return false;
  //[OAuthClient, User]
  return OAuthRefreshToken.findOne({ refresh_token: refreshToken })
    //.populate("User")
    .populate("OAuthClient")
    .then(function(savedRT) {
      console.log("srt", savedRT);
      var tokenTemp = {
        user: savedRT ? savedRT.User : {},
        client: savedRT ? savedRT.OAuthClient : {},
        refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
        refreshToken: refreshToken,
        refresh_token: refreshToken,
        scope: savedRT.scope
      };
      return tokenTemp;
    })
    .catch(function(err) {
      console.log("getRefreshToken - Err: ", err);
    });
};

const validateScope = (token, client, scope) => {
  console.log("validateScope is called");
  return user.scope === client.scope ? scope : false;
};

const verifyScope = (token, scope) => {
  console.log("verifyScope is called");
  return token.scope === scope;
};

module.exports = {
  generateAccessToken: generateAccessToken,
  getAccessToken: getAccessToken,
  generateRefreshToken: generateRefreshToken,
  getRefreshToken: getRefreshToken,
  saveToken: saveToken,
  getAuthorizationCode: getAuthorizationCode,
  getClient: getClient,
  getUser: getUser,
  //getUserFromClient: getUserFromClient,
  //revokeAuthorizationCode: revokeAuthorizationCode,
  //revokeToken: revokeToken,
  //saveAuthorizationCode: saveAuthorizationCode,
  //verifyScope: verifyScope
};
