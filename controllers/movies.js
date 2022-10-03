const movie = require('../models/movie');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ForbiddenError } = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  movie.find({ owner: req.user._id })
    .then((mvs) => res.send(mvs))
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  movie.findOne({ _id: req.params.movieId })
    .then((foundMovie) => {
      if (!foundMovie) {
        next(new NotFoundError('Фильм не найден'));
      } else if (!foundMovie.owner.equals(req.user._id)) {
        next(new ForbiddenError('Нельзя удалить фильм, добавленный другим пользователем'));
      } else {
        return foundMovie.remove()
          .then(() => {
            res.send({ message: 'Фильм удален' });
          });
      }
      return null;
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(e);
      }
    });
};

module.exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink: trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((mv) => res.send(mv))
    .catch((e) => {
      if (e.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании фильма.'));
      } else if (e.code === 11000) {
        next(new ConflictError('Фильм существует'));
      } else {
        next(e);
      }
    });
};
