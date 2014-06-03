'use strict';

var Q = require('q');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var conectionPromise = null;

var Database = function(url) {
  this.url = url;
  var self = this;

  this.getDb = function() {
    if (conectionPromise === null) {
      var d = Q.defer();

      Q.nfcall(MongoClient.connect, this.url)
        .then(function(db) {
          d.resolve(db);
        }, d.reject);

      conectionPromise = d.promise;
      return conectionPromise;
    } else {
      return conectionPromise;
    }
  };

  this.getCollection = function(name) {
    var d = Q.defer();

    self.getDb()
      .then(function(db) {
        d.resolve(db.collection(name));
      }, d.reject);

    return d.promise;
  };

  this.insert = function(collName, item) {
    var d = Q.defer();

    self.getCollection(collName).then(function(coll) {
      coll.insert(item, function(err, result) {
        if (err) {
          d.reject(err);
        } else {
          d.resolve(result);
        }
      }, d.reject);
    });

    return d.promise;
  };

  this.findAll = function(collName) {
    return self.find(collName, {});
  };

  this.find = function(collName, criteria, options) {
    var d = Q.defer();
    options = options || {};

    self.getCollection(collName)
      .then(function(coll) {
        coll.find(criteria, options).toArray(function(err, result) {
          if (err) {
            d.reject(err);
          } else {
            d.resolve(result);
          }
        }, d.reject);
      });

    return d.promise;
  };

  this.findById = function(collName, id) {
    var d = Q.defer();

    self.find(collName, {
      _id: new ObjectID(id)
    }, {
      limit: 1
    })
      .then(function(doc) {
        if (doc.length === 1) {
          d.resolve(doc[0]);
        } else {
          d.resolve({});
        }

      }, d.reject);

    return d.promise;
  };

  this.deleteById = function(collName, id) {
    return self.delete(collName, {
      _id: new ObjectID(id)
    });
  };

  this.delete = function(collName, criteria) {
    var d = Q.defer();

    self.getCollection(collName)
      .then(function(coll) {
        coll.remove(criteria, function(err, result) {
          if (err) {
            d.reject(err);
          } else {
            d.resolve(result);
          }
        }, d.reject);
      });

    return d.promise;
  };

  this.deleteAll = function(collName) {
    return self.delete(collName, {});
  };

  this.update = function(collName, criteria, updated, options) {
    var d = Q.defer();

    options = options || {};

    self.getCollection(collName)
      .then(function(coll) {
        coll.update(criteria, updated, options, function(err, result) {
          if (err) {
            d.reject(err);
          }
          else {
            d.resolve(result);
          }
        });
      });

    return d.promise;
  };

};

module.exports = Database;