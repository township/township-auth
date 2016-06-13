var createIndexer = require('level-simple-indexes')
var sublevel = require('subleveldown')
var through = require('through2')
var each = require('each-async')
var uuid = require('uuid')

module.exports = function townshipAuth (maindb, options) {
  var auth = {}
  var providers = {}
  var indexes = []

  Object.keys(options.providers).forEach(function (key) {
    var plugin = options.providers[key](auth, options)
    indexes.push(plugin.key)
    providers[key] = plugin
  })

  var db = sublevel(maindb, 'township-auth', { valueEncoding: 'json' })
  var indexdb = sublevel(maindb, 'township-auth-indexes')

  var indexer = createIndexer(indexdb, {
    properties: indexes,
    map: function (key, next) {
      auth.get(key, next)
    }
  })

  auth.db = db
  auth.indexdb = indexdb
  auth.indexer = indexer

  function getAuthProviders (key, callback) {
    var account = {}
    db.get(key, function (err, data) {
      if (err) return callback(err)
      var keys = Object.keys(data)

      each(keys, function (key, i, next) {
        if (key === 'key') {
          account.key = data.key
          return next()
        }
        var plugin = providers[key]
        account[key] = {}
        var pluginKey = pluginNameAndKey(plugin.key).key
        account[key][pluginKey] = data[key][pluginKey]
        next()
      }, function () {
        callback(null, account)
      })
    })
  }

  function setAuthProviders (data, opts, callback) {
    var keys = Object.keys(opts)
    if (!keys.length) throw new Error('providers required')
    each(keys, function (key, i, next) {
      var plugin = providers[key]
      var auth = opts[key]
      data[key] = plugin.create(key, auth)
      next()
    }, function () {
      db.put(data.key, data, callback)
    })
  }

  auth.get = function get (key, callback) {
    getAuthProviders(key, callback)
  }

  auth.findOne = function findOne (provider, key, callback) {
    indexer.findOne(providers[provider].key, key, callback)
  }

  auth.list = function list (options) {
    function iterator (chunk, enc, next) {
      var stream = this
      auth.get(chunk.key, function (err, authData) {
        if (err) return next(err)
        stream.push(authData)
        next()
      })
    }

    return db.createReadStream(options).pipe(through.obj(iterator))
  }

  auth.create = function create (opts, callback) {
    if (!opts) throw new Error('providers required')
    if (!callback) throw new Error('callback required')
    var data = { key: uuid() }

    setAuthProviders(data, opts, function (err) {
      if (err) return callback(err)
      indexer.addIndexes(data, function (err) {
        if (err) return callback(err)
        auth.get(data.key, callback)
      })
    })
  }

  auth.update = function update (opts, callback) {
    if (!opts.key) throw new Error('account key is required')

    db.get(opts.key, function (err, data) {
      if (err) return callback(err)
      delete opts.key

      setAuthProviders(data, opts, function (err) {
        if (err) return callback(err)
        indexer.updateIndexes(data, function (err) {
          if (err) return callback(err)
          auth.get(data.key, callback)
        })
      })
    })
  }

  auth.destroy = function destroy (key, callback) {
    if (!key) throw new Error('account key is required')
    db.del(key, callback)
  }

  auth.verify = function verify (provider, opts, callback) {
    var plugin = providers[provider]
    var key = opts[pluginNameAndKey(plugin.key).key]
    if (!key) return callback(new Error('Authorization failed'))
    auth.findOne(provider, key, function (err, data) {
      if (err) return callback(err)
      if (!data) return callback(new Error('Authorization failed'))
      opts.key = data.key
      plugin.verify(opts, callback)
    })
  }

  return auth
}

function pluginNameAndKey (key) {
  var split = key.split('.')
  return { name: split[0], key: split[1] }
}
