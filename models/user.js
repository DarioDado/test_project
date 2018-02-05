let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    _id: Number,
    firstName: String,
    surname: String,
    age: Number,
    gender: {
        type: String,
        enum: ["female", "male"]
    },
    friends: [Number]
});

module.exports = mongoose.model('User', userSchema);