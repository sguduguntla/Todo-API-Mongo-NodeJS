var User = require("./../models/user");

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');

    User.findByToken(token).then(user => {
        if (!user) {
            return Promise.reject(); //Goes to catch clause
        }

        req.user = user;
        req.token = token;
        next();
    }).catch(e => {
        res.status(401).send(); //401 Authentication required
    });
};

module.exports = {
    authenticate
};
