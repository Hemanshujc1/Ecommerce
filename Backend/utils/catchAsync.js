// A higher-order function to catch errors in async express routes
// and pass them to the global error middleware.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
