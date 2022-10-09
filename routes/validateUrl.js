function validateUrl(url) {
  const regex = /^https?:\/\/(www\.)?[a-zA-Z\d]+\.[\w\-._~:/?#[\]@!$&'()*+,;=]{2,}#?$/g;
  if (regex.test(url)) {
    return url;
  }
  throw new Error('Ошибка валидации адреса');
}
module.exports = { validateUrl };
