var crypto = require('crypto')
var shasum = require('shasum')

module.exports = function townshipAuthBasic (auth, options) {
  return {
    // key must be named with pattern {providername}.{propertykey} for indexing
    key: 'basic.email',
    create: function create (key, opts) {
      var salt = crypto.randomBytes(16)
      var password = Buffer(opts.password)
      return {
        email: opts.email,
        hash: shasum(Buffer.concat([salt, password])),
        salt: salt.toString('hex')
      }
    },
    verify: function (opts, callback) {
      if (!opts) return new Error('provider credentials required')
      auth.db.get(opts.key, function (err, account) {
        if (err) return callback(err)
        var password = Buffer(opts.password)
        var salt = Buffer(account.basic.salt, 'hex')
        var hash = shasum(Buffer.concat([salt, password]))
        if (hash !== account.basic.hash) return callback(new Error('Account not verified'))
        else return callback(null, { key: account.key, basic: { email: account.basic.email } })
      })
    }
  }
}
