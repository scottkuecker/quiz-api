const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: false, default: 'Kvizoman' },
    title: { type: String, required: false, default: 'Pocetnik 1' },
    score: { type: Number, required: true, default: 0 },
    lives: { type: Number, required: true, default: 3 },
    roles: [{type: String,required: true, default: 'USER'}],
    reset_password_token: {type: String, required: false, default: null},
    increase_lives_at: {type: Number, required: false, default: null},
    reset_lives_at: { type: Number, required: false, default: null },
    contributions: [{type: String, required: true}],
    avatar_url: { type: String, required: false, default: 'https://cdnjs.cloudflare.com/ajax/libs/admin-lte/2.4.0/img/avatar.png'},
    questions: []
});


module.exports = mongoose.model('User', userSchema)
