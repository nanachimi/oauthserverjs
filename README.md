# OAuthServerJS

An OAuth2 compliant authorization server with expressjs. This project is built on the implementation of [manjeshpv](https://github.com/manjeshpv/node-oauth2-server-implementation].

## Prerequisites

Make sure MongoDB is install on your local machine before you continue.


## Get started

Install dependencies:

```shell
yarn
```


Start OAuthServerJS:

```shell
yarn start
```



## Client Registration

POST /oauth/client

```
{
   "client_id": "unique id",
   "client_secret": "some secret phrase",
   "redirect_uri":"http://site.com/callback",
   "grants":[
      "password", "implicit"
   ],
   "app_name":"My App",
   "website":"http://site.com",
   "description":"Description of app"
}
```

Note: `client_id` and `client_secret` are optional fields. They can be autogenerated if not set or if missing.

## Generate Access Token

### Password Grant

POST /oauth/token


Note: Content-Type of a request must have a value `application/x-www-form-urlencoded`. In a body of a request `grant_type`, `username`, `password`, `client_id` and `client_secret` must be set with existing value. A valid `username` and `password` for now are respectively `testuser` and  `secret`. The rest of value must be retrieve from a previous request.
