/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    username: {
        type: 'string',
        required: true,
        notEmpty: true,
        unique: true
    },
    displayName: {
        type: 'string',
        required: true
    },
    admin: {
        type: 'boolean'
    },
    active: {
        type: 'boolean',
        defaultsTo: true,
        required: true
    },
    latestCode: {
        type: 'string',
        required: true
    },
    currentScore: {
        type: 'float',
    }
  }
};
