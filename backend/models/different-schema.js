const mongoose = require('mongoose')


const formSchema = new mongoose.Schema({
    name: {type: String, required: true},
    sub_name: {type: String},
    fields: {type: Array, required: true},
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createAt : {type: Date, default: Date.now}
})


const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, default: 'user'},
    createAt: {type: Date, default: Date.now}
})



const Form = mongoose.model('Form', formSchema)
const User = mongoose.model('User', userSchema)


module.exports = { Form, User}
