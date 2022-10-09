const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getLoggedUser,
  updateProfile,
} = require('../controllers/users');

router.get('/me', getLoggedUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email().required(),
  }),
}), updateProfile);

module.exports = router;
