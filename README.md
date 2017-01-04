# township-auth

Manage authentication credentials.

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
- [township-access](https://github.com/township/township-access) - manage access authorization scopes
- [township-token](https://github.com/township/township-token) - create & decode JWT tokens with township auth/access data

### Similar modules
- [accountdown](http://npmjs.com/accountdown)
- [authentic](http://npmjs.com/authentic)

## License
[MIT](LICENSE.md)
