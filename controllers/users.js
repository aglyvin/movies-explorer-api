const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');
const { NotFoundError } = require('../errors/NotFoundError');
const user = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getLoggedUser = (req, res, next) => {
  user.findById(req.user._id)
    .then((founduser) => {
      if (!founduser) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        res.send(founduser);
      }
    })
    .catch((e) => {
      next(e);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      user.create({
        name,
        email,
        password: hash,
      })
        .then((usr) => res.send({
          name, about, avatar, email, _id: usr.id,
        }))
        .catch((e) => {
          if (e.name === 'ValidationError') {
            next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
          } else if (e.code === 11000) {
            next(new ConflictError('Пользователь существует'));
          } else {
            next(e);
          }
        });
    })
    .catch((e) => {
      next(e);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  user.findByIdAndUpdate(req.user._id, { name, email }, { runValidators: true, new: true })
    .then((usr) => {
      if (!usr) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        res.send(usr);
      }
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      } else if (e.code === 11000) {
        next(new ConflictError('Пользователь с таким email существует'));
      } else {
        next(e);
      }
    });
};

module.exports.login = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  user.findUserByCredentials(email, password)
    .then((usr) => {
      const token = jwt.sign(
        { _id: usr._id },
        NODE_ENV === 'production'
          ? JWT_SECRET
          : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((e) => {
      next(e);
    });
};
