const createIndexer = require('level-simple-indexes')
const sublevel = require('subleveldown')
const createLock = require('level-lock')
const through = require('through2')
const each = require('each-async')
const uuid = require('uuid')
const pump = require('pump')

/**
* Create a township auth db
* @name createTownshipAuth
* @namespace townshipAuth
* @param {object} leveldb - an instance of a leveldb created using [level](https://github.com/level/)
* @param {object} options
* @param {object} options.providers
* @return {object}
* @example
* const createTownshipAuth = require('township-auth')
* const level = require('level')
*
* const db = level('./db')
* const auth = createTownshipAuth(db)
*/
class TownshipAuth {
  constructor (leveldb, options) {
    this.providers = {}
    this.indexes = []

    this.db = sublevel(leveldb, 'township-auth', { valueEncoding: 'json' })
    this.indexdb = sublevel(leveldb, 'township-auth-indexes')

    Object.keys(options.providers).forEach((key) => {
      options.get = (key, callback) => this.db.get(key, callback)
      const plugin = options.providers[key](options)
      // TODO: instead of plugin.key use `${plugin.name}-${plugin.indexKey}`
      this.indexes.push(plugin.key)
      this.providers[key] = plugin
    })

    this.indexer = createIndexer(this.indexdb, {
      properties: this.indexes,
      map: (key, next) => {
        this.get(key, next)
      }
    })
  }

  lock (key, mode) {
    return createLock(this.db, key, mode)
  }

  _getAuthProviders (key, callback) {
    const account = {}

    this.db.get(key, (err, data) => {
      if (err) return callback(err)
      const keys = Object.keys(data)

      each(keys, (key, i, next) => {
        if (key === 'key') {
          account.key = data.key
          return next()
        }

        const provider = this.providers[key]
        account[key] = {}
        const providerKey = providerNameAndKey(provider.key).key
        account[key][providerKey] = data[key][providerKey]
        next()
      }, function () {
        callback(null, account)
      })
    })
  }

  _setAuthProviders (data, opts, callback) {
    const keys = Object.keys(opts)
    if (!keys.length) throw new Error('providers required')

    each(keys, (key, i, next) => {
      const provider = this.providers[key]
      const auth = opts[key]

      provider.create(key, auth, function (err, val) {
        if (err) return callback(err)
        data[key] = val
        next()
      })
    }, () => {
      this.db.put(data.key, data, callback)
    })
  }

  /**
  * Get auth providers for a user
  *
  * @name auth.get
  * @memberof townshipAuth
  * @param {string} key - the key for the auth providers
  * @param {function} callback - callback with `err`, `data` arguments
  */
  get (key, callback) {
    this._getAuthProviders(key, callback)
  }

  /**
  * Get a specific auth provider for a user
  *
  * @name auth.findOne
  * @memberof townshipAuth
  * @param {string} provider - the name of the provider
  * @param {string} key - the key for the auth providers
  * @param {function} callback - callback with `err`, `data` arguments
  */
  findOne (provider, key, callback) {
    this.indexer.findOne(this.providers[provider].key, key, callback)
  }

  /**
  * Get auth providers for all users
  *
  * @name auth.list
  * @memberof townshipAuth
  * @param {object} options - options object
  * @param {string} key - the key for the auth providers
  * return {object} a stream where each `data` event is a user and their providers
  */
  list (options) {
    const self = this

    function iterator (chunk, enc, next) {
      const stream = this

      self.get(chunk.key, (err, authData) => {
        if (err) return next(err)
        stream.push(authData)
        next()
      })
    }

    return pump(this.db.createReadStream(options), through.obj(iterator))
  }

  /**
  * Create a user with auth providers
  *
  * @name auth.create
  * @memberof townshipAuth
  * @param {object} options - options object
  * @param {string} key - the key for the auth providers
  * return {object} a stream where each `data` event is a user and their providers
  */
  create (options, callback) {
    if (!options) throw new Error('providers required')
    if (!callback) throw new Error('callback required')
    const data = { key: uuid() }
    const unlock = this.lock(data.key)

    this._setAuthProviders(data, options, (err) => {
      if (err) {
        unlock()
        return callback(err)
      }

      this.indexer.addIndexes(data, (err) => {
        if (err) {
          unlock()
          return callback(err)
        }

        this.get(data.key, (err, result) => {
          unlock()
          if (err) return callback(err)
          callback(null, result)
        })
      })
    })
  }

  update (options, callback) {
    if (!options.key) throw new Error('account key is required')
    const unlock = this.lock(options.key)

    this.db.get(options.key, (err, data) => {
      if (err) {
        unlock()
        return callback(err)
      }
      delete options.key

      this._setAuthProviders(data, options, (err) => {
        if (err) {
          unlock()
          return callback(err)
        }

        this.indexer.updateIndexes(data, (err) => {
          if (err) {
            unlock()
            return callback(err)
          }

          this.get(data.key, (err, result) => {
            unlock()
            if (err) return callback(err)
            callback(null, result)
          })
        })
      })
    })
  }

  destroy (key, callback) {
    if (!key) throw new Error('account key is required')
    this.db.del(key, callback)
  }

  verify (providerName, opts, callback) {
    const provider = this.providers[providerName]
    const key = opts[providerNameAndKey(provider.key).key]
    if (!key) return callback(new Error('Authorization failed'))

    this.findOne(providerName, key, function (err, data) {
      if (err) return callback(err)
      if (!data) return callback(new Error('Authorization failed'))
      opts.key = data.key
      provider.verify(opts, callback)
    })
  }
}

function providerNameAndKey (key) {
  const split = key.split('.')
  return { name: split[0], key: split[1] }
}

module.exports = TownshipAuth
