# township-auth

Manage authentication credentials.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![conduct][conduct]][conduct-url]

[npm-image]: https://img.shields.io/npm/v/township-auth.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/township-auth
[travis-image]: https://img.shields.io/travis/township/township-auth.svg?style=flat-square
[travis-url]: https://travis-ci.org/township/township-auth
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[conduct]: https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-green.svg?style=flat-square
[conduct-url]: CONDUCT.md

## Install

```sh
npm install --save township-auth
```

## Usage

```js
var level = require('level')
var basic = require('township-auth/basic')

var db = level('db')

var auth = require('township-auth')(db, {
  providers: { basic: basic }
})

auth.create({
  basic: {
    email: 'hi@example.com',
    password: 'supersecret'
  }
}, function (err, account) {
  auth.verify('basic', {
    email: 'hi@example.com',
    password: 'supersecret'
  }, function (err, result) {
    console.log(err, result)
  })
})
```

## API
### `auth = Auth(db, providers)`
Create a new instance of `township-auth`. Takes a `levelup` instance and an
object with auth providers. Creates a sublevel named `'township-auth'` on the
`levelup` instance.

### `auth.get(key, callback(err, account))`
Return an account for a given account key (uuid).

### `auth.findOne(provider, key, callback(err, result))`
Return an account for any key on a provider.

### `readableStream = auth.list(options)`
List all entries in the database. `options` is passed internally to
[levelup.createReadStream()](https://github.com/level/levelup#createReadStream).

### `auth.create(opts, callback(err, account))`
Create a new account. `opts` must contain a key that maps to a provider created
in the auth constructor. E.g. if a `basic` provider was passed into the auth
constructor, `basic` account can be created by using `opts.basic`

### `auth.update(opts, callback(err, account))`
Update an account

### `auth.destroy(key, callback(err, account))`
Delete an account

### `auth.verify(provider, opts, callback(err, account))`
Verify an account for a provider name. `opts` is the data objec that is
verified by the provider's `.verify` function

## See also
- [township](https://github.com/township/township) - JSON API handlers for your server endpoints
- [township-client](https://github.com/township/township-client) - JSON API client for your client applications
- [township-accounts](https://github.com/township/township-accounts) - high-level wrapper around township-auth, township-access, township-token
- [township-access](https://github.com/township/township-access) - manage access authorization scopes
- [township-token](https://github.com/township/township-token) - create & decode JWT tokens with township auth/access data

### Similar modules
- [accountdown](http://npmjs.com/accountdown)
- [authentic](http://npmjs.com/authentic)

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Conduct

It's important that this project contributes to a friendly, safe, and welcoming environment for all, particularly for folks that are historically underrepresented in technology. Read this project's [code of conduct](CONDUCT.md)

## Change log

Read about the changes to this project in [CHANGELOG.md](CHANGELOG.md). The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## License
[MIT](LICENSE.md)
