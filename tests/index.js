var test = require('tape')
var memdb = require('memdb')

test('create an account with basic provider', function (t) {
  var auth = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })
  auth.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    t.ok(account)
    t.ok(account.key)
    t.ok(account.basic)
    t.equal(account.basic.email, 'hi@example.com')
    t.notOk(account.basic.hash)
    t.notOk(account.basic.salt)
    t.end()
  })
})

test('get an account by key and by email', function (t) {
  var auth = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })
  auth.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    t.ok(account.key)
    t.ok(account.basic)
    t.equal(account.basic.email, 'hi@example.com')
    t.notOk(account.basic.hash)
    t.notOk(account.basic.salt)

    auth.get(account.key, function (err, withkey) {
      t.notOk(err, 'no error')
      t.ok(withkey, 'found account with key')
      auth.findOne('basic', account.basic.email, function (err, withemail) {
        t.notOk(err, 'no error')
        t.ok(withemail, 'found account with email')
        t.ok(withemail.key)
        t.ok(withemail.basic)
        t.equal(withemail.basic.email, 'hi@example.com')
        t.notOk(withemail.basic.hash)
        t.notOk(withemail.basic.salt)
        t.end()
      })
    })
  })
})

test('verify an account using email and password', function (t) {
  var auth = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })
  auth.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    t.ok(account.key)
    t.ok(account.basic)
    t.equal(account.basic.email, 'hi@example.com')
    t.notOk(account.basic.hash)
    t.notOk(account.basic.salt)
    auth.verify('basic', {
      key: account.key,
      email: 'hi@example.com',
      password: 'supersecret'
    }, function (err, result) {
      t.notOk(err)
      t.ok(result)
      t.ok(result.key)
      t.ok(result.basic)
      t.equal(result.basic.email, 'hi@example.com')
      t.notOk(result.basic.hash)
      t.notOk(result.basic.salt)
      t.end()
    })
  })
})

test('list accounts', function (t) {
  var auth = require('../index')(memdb(), {
    providers: {
      basic: require('../basic')
    }
  })

  auth.create({
    basic: {
      email: 'hi@example.com',
      password: 'supersecret'
    }
  }, function (err, account) {
    t.notOk(err)
    var stream = auth.list()
    stream.on('data', function (data) {
      t.ok(data)
      t.ok(data.key)
      t.ok(data.basic)
      t.equal(data.basic.email, 'hi@example.com')
      t.notOk(data.basic.hash)
      t.notOk(data.basic.salt)
    })

    stream.on('error', console.log)
    stream.on('end', function () {
      t.end()
    })
  })
})
