# OAuthServerJS

An OAuth2 compliant authorization server with expressjs

## Before you start

Make sure MongoDB is install on your local machine before you continue.

## Dependencies Installation

To install dependencies:

```shell
yarn
```

or

```shell
npm install
```

## Initialize MongoDB

To populate some clients and users in a database run:

```shell
yarn seed
```

or

```shell
npm run seed
```

## Generate Access Token

### Password Grant

POST /oauth/token
