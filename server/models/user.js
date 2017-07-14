const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const _ = require('lodash');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

//instance methods
UserSchema.methods.toJSON = function() {
    var user = this;

    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
}

//instance methods
UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = "auth";
    var token = jwt.sign({
        _id: user._id.toHexString(),
        access: access
    }, 'abc123').toString();

    user.tokens.push({
        access: access,
        token: token
    });

    return user.save().then(() => {
        return token;
    });

};

//static methods or model methods
UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch(e) {
        // return new Promise((resolve, reject) => {
        //     reject();
        // });

        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
}

const User = mongoose.model('user', UserSchema);

module.exports = User;
