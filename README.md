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

## See also
- [township-access](https://github.com/township/township-access) - manage access authorization scopes
- [township-token](https://github.com/township/township-token) - create & decode JWT tokens with township auth/access data

### Similar modules
- [accountdown](http://npmjs.com/accountdown)
- [authentic](http://npmjs.com/authentic)

## License
[MIT](LICENSE.md)
