const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: false },
    password: { type: String, required: false },
    name: { type: String, required: false, default: 'Kvizoman' },
    title: { type: String, required: false, default: 'Pocetnik 1' },
    score: { type: Number, required: true, default: 0 },
    lives: { type: Number, required: true, default: 3 },
    daily_price: {type: Number, required: true, default: Date.now()},
    tickets: {type: Number, required: true, default: 0},
    playing: {type: Boolean, required: true, default: false},
    roles: [{type: String,required: true, default: 'USER'}],
    lives_timer_ms: {type: Number, require: true, default: 0},
    fbId: {type: Number, required: false},
    notifications:{
        achievements: {type: Boolean, required: true, default: false},
        questions: { type: Boolean, required: true, default: false },
        ranking: { type: Boolean, required: true, default: false }
    },
    achievements: [
        {
            category: {type: String, required: true},
            answered: {type: Number, required: true, default: 0},
            achievement_ticket_ids: {type: [String], default: []},
        },
    ],
    categories: [{
        category: {type: String, required: true}, 
        questions_added: {type: Number, required: true}
    }],
    reset_password_token: {type: String, required: false, default: null},
    lives_reset_timer_set: {type: Boolean, required: false, default: false},
    reset_lives_at: { type: Number, required: false, default: null },
    contributions: [{type: String, required: true}],
    avatar_url: { type: String, required: false, default: 'https://cdnjs.cloudflare.com/ajax/libs/admin-lte/2.4.0/img/avatar.png'},
    questions: []
});


module.exports = mongoose.model('User', userSchema)
