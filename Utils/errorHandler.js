function handleError(res, message) {
  console.error(message);
  res.render("error", { errorMessage: message });
}

module.exports = { handleError };
