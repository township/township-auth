const crypto = require('crypto')
const shasum = require('shasum')

module.exports = function townshipAuthBasic (options) {
  const { get } = options

  function create (key, opts, callback) {
    const salt = crypto.randomBytes(16)
    const password = Buffer.from(opts.password)
    const res = {
      email: opts.email,
      hash: shasum(Buffer.concat([salt, password])),
      salt: salt.toString('hex')
    }
    callback(null, res)
  }

  function verify (opts, callback) {
    if (!opts) return new Error('provider credentials required')

    get(opts.key, function (err, account) {
      if (err) return callback(err)
      const password = Buffer.from(opts.password)
      const salt = Buffer.from(account.basic.salt, 'hex')
      const hash = shasum(Buffer.concat([salt, password]))
      if (hash !== account.basic.hash) return callback(new Error('Account not verified'))
      else return callback(null, { key: account.key, basic: { email: account.basic.email } })
    })
  }

  return {
    // key must be named with pattern {providername}.{propertykey} for indexing
    // TODO: turn this into `name` and `indexKey` properties
    key: 'basic.email',
    create,
    verify
  }
}
