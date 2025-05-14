module.exports = (req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.isAgent = req.session.user?.user_type === 'agent' || false;
  res.locals.userName = req.session.user
    ? `${req.session.user.First_Name} ${req.session.user.Last_Name}`
    : '';
  next();
};