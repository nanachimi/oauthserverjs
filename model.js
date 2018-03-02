/**
 * Module dependencies.
 */
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Schema definitions.
 */
const OAuthTokenModel = mongoose.model(
  "OAuthToken",
  new Schema({
    accessToken: { type: String },
    accessTokenExpiresOn: { type: Date },
    client: { type: Object }, // `client` and `user` are required in multiple places, for example `getAccessToken()`
    clientId: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresOn: { type: Date },
    user: { type: Object },
    userId: { type: String }
  })
);

const OAuthClientModel = mongoose.model(
  "OAuthClient",
  new Schema({
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUris: { type: Array },
    grants: { type: Array }
  })
);

const OAuthUserModel = mongoose.model(
  "OAuthUser",
  new Schema({
    userId: { type: String },
    password: { type: String },
    username: { type: String }
  })
);

/**
 * Get client.
 */
module.exports.getClient = (clientId, clientSecret) => {
  console.log("getClient");
  return OAuthClientModel.findOne({
    clientId: clientId,
    clientSecret: clientSecret
  }).lean();
};

/**
 * Get user.
 */
module.exports.getUser = (username, password) => {
  console.log("getUser");
  OAuthUserModel.findOne({ username, password }).lean();
};

/**
 * Generate a new access token.
 */
//module.exports.generateAccessToken = (client, user, scope) =>
//  OAuthTokenModel.findOne({ accessToken: bearerToken }).lean(); //TODO

/**
 * Generate a new refresh token.
 */
//module.exports.generateRefreshToken = (client, user, scope) =>
//  OAuthTokenModel.findOne({ accessToken: bearerToken }).lean(); //TODO

/**
 * Check if the requested scope is valid for a particular client/user combination.
 */
module.exports.validateScope = (user, client, scope) => {
  console.log("validateScope");
  OAuthTokenModel.findOne({ accessToken: bearerToken }).lean(); //TODO
};

/**
 * Save token.
 */
module.exports.saveToken = (token, client, user) => {
  console.log("saveToken");
  const accessToken = new OAuthTokenModel({
    accessToken: token.accessToken,
    accessTokenExpiresOn: token.accessTokenExpiresOn,
    client,
    clientId: client.clientId,
    refreshToken: token.refreshToken,
    refreshTokenExpiresOn: token.refreshTokenExpiresOn,
    user,
    userId: user._id
  });
  // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
  return new Promise((resolve, reject) => {
    accessToken.save((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  }).then(saveResult => {
    // `saveResult` is mongoose wrapper object, not doc itself. Calling `toJSON()` returns the doc.
    const temp =
      saveResult && typeof saveResult === "object"
        ? saveResult.toJSON()
        : saveResult;

    // Unsure what else points to `saveResult` in oauth2-server, making copy to be safe
    const data = {};
    for (let i = 0; i < temp.length; i += 1) {
      data[i] = temp[i];
    }

    // fields `client` and `user` are required in response.
    data.client = data.clientId;
    data.user = data.userId;

    return data;
  });
};

/**
 * Revoke a refresh token.
 */
module.exports.revokeToken = token => {
  console.log("revokeToken");
  OAuthTokenModel.findOne({ refreshToken: token }).lean();
};
