var test = require('tape')
var memdb = require('memdb')

test('create an account with basic provider', function (t) {
  var accounts = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })
  accounts.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    t.ok(account)
    t.end()
  })
})

test('get an account by key and by email', function (t) {
  var accounts = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })
  accounts.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    accounts.get(account.key, function (err, withkey) {
      t.notOk(err, 'no error')
      t.ok(withkey, 'found account with key')
      accounts.findOne('basic', account.basic.email, function (err, withemail) {
        t.notOk(err, 'no error')
        t.ok(withemail, 'found account with email')
        t.end()
      })
    })
  })
})

test('verify an account using email and password', function (t) {
  var accounts = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })
  accounts.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    accounts.verify('basic', {
      key: account.key,
      email: 'hi@example.com',
      password: 'supersecret'
    }, function (err, result) {
      t.notOk(err)
      t.ok(result)
      t.end()
    })
  })
})
