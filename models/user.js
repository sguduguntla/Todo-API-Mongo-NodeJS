const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
