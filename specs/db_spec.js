var Database = require('../api/models/db');
var ObjectID = require('mongodb').ObjectID;
var Q = require('q');
var should = require('should');
var _ = require('lodash');
var MONGO_URL = 'mongodb://localhost:27017/selfbin';
var COLL_NAME = 'users_test';


describe('db', function() {

  var db = null;
  var fakeUsers = [];
  var fakeUserIds = [
    '538cbb7d48723fab69833d5e',
    '538cbe5cd28a46a16c3f118b',
    '538cbd7748723fab69833d68'
  ];

  before(function(done) {
    db = new Database(MONGO_URL);

    _.forEach(fakeUserIds, function(id) {
      fakeUsers.push({
        _id: new ObjectID(id)
      });
    });

    db.insert(COLL_NAME, fakeUsers)
      .then(function(inserted) {
        done();
      }).done(null, done);

  });

  after(function(done) {
    db.deleteAll(COLL_NAME).then(function(count) {
      done();
    }).done(null, done);
  });


  it('should get db', function(done) {
    db.getDb().then(function(d) {
      d.should.be.ok;
      done();
    }).done(null, done);
  });


  it('should add user', function(done) {
    var user = {
      name: 'homer'
    };

    db.insert(COLL_NAME, user)
      .then(function(inserted) {
        user.name.should.equal(inserted[0].name);
        done();
      }).done(null, done);
  });


  it('should find all users', function(done) {
    db.findAll(COLL_NAME)
      .then(function(users) {
        users.should.be.ok;
        users.length.should.above(0);
        done();
      }).done(null, done);
  });


  it('should find user by criteria', function(done) {
    db.find(COLL_NAME, {
      name: 'homer'
    })
      .then(function(users) {
        users.length.should.above(0);
        done();
      }).done(null, done);
  });


  it('should find user by id', function(done) {
    db.findById(COLL_NAME, fakeUserIds[0])
      .then(function(doc) {
        doc._id.toString().should.equal(fakeUserIds[0]);
        done();
      }).done(null, done);
  });


  it('should delete user', function(done) {
    db.deleteById(COLL_NAME, fakeUserIds[1])
      .then(function(count) {
        count.should.be.above(0);
        done()
      }).done(null, done);
  });


  it('should update user', function() {
    Q.all([
      db.insert(COLL_NAME, {
        name: 'marge'
      }),
      db.find(COLL_NAME, {
        name: 'marge'
      }),
      db.update(COLL_NAME, {
        name: 'marge'
      }, {
        name: 'marge updated'
      }),
      db.find(COLL_NAME, {
        name: 'marge updated'
      })
    ]).then(function(result) {
      result[3].name.should.equal('marge updated');
    });
  });

});