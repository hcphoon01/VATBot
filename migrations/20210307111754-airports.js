'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('airports', {
    id: {type: 'int', primaryKey: true},
    icao: {type: 'string', unique: true},
    name: {type: 'string'},
    latitude: {type: 'decimal'},
    longitude: {type: 'decimal'}
  });
};

exports.down = function(db) {
  return db.dropTable('airports');
};

exports._meta = {
  "version": 1
};
