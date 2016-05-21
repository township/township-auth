# township-auth

Authentication management module. Inspired by [accountdown](http://npmjs.com/accountdown).

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
    key: account.key,
    email: 'hi@example.com',
    password: 'supersecret'
  }, function (err, result) {
    console.log(err, result)
  })
})
```

## See also
- [accountdown](http://npmjs.com/accountdown)
- [authentic](http://npmjs.com/authentic)

## License

[MIT](LICENSE.md)
