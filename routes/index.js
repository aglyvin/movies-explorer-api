const router = require('express').Router();
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../errors/NotFoundError');

router.use(require('./auth'));

router.use(auth);
router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.use((req, res, next) => {
  next(new NotFoundError('Адрес не существует'));
});

module.exports = router;
