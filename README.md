# township-accounts

Account management module. Inspired by [accountdown](http://npmjs.com/accountdown).

## Usage

```js
var level = require('level')
var basic = require('township-accounts/basic')

var db = level('db')

var accounts = require('township-accounts')(db, {
  providers: { basic: basic }
})

accounts.create({
  basic: {
    email: 'hi@example.com',
    password: 'supersecret'
  }
}, function (err, account) {
  accounts.verify('basic', {
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
