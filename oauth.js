import uuid from "uuid/v4";
import OAuthServer from "express-oauth-server";
import OAuthClient from "./schema/OAuthClient";
import dataModel from "./model";

var oauth = {}

oauth = new OAuthServer({ 
        model: dataModel, 
        debug: true , 
        allowExtendedTokenAttributes: true, 
        alwaysIssueNewRefreshToken: false, 
        requireClientAuthentication: {}, 
        accessTokenLifetime:1800,
        refreshTokenLifetime: 3600});

oauth.client = () => {
    
    return (req, res, next) => {   
        const oauthClient = new OAuthClient({
            client_id: req.body.client_id || uuid(), 
            client_secret: req.body.client_secret || uuid(), 
            redirect_uri: req.body.redirect_uri || "",
            grants:  req.body.grants || ["authorization_code"],
            app_name: req.body.app_name || "Demo App",
            website: req.body.website || "",
            description: req.body.description || "",
            logo: req.body.logo || "",
            user_id: "382191-30103-3dno91-3179381d",
        });
        
        oauthClient.save(function(err, savedClient){
            if(err) {
                console.error(err);
                res.status(500).json({"message":"Error occurs during registration"})
            }
            console.log("client sucessfully saved");
            res.status(200).json(savedClient);
            next();
        });
    }
}
  
module.exports = oauth;