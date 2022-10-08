const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { UnauthorizeError } = require('../errors/UnauthorizeError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((usr) => {
      if (!usr) {
        return Promise.reject(new UnauthorizeError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, usr.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new UnauthorizeError('Неправильные почта или пароль'));
          }
          return usr;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
