require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator=require('validator')

//db config
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/Login-Singup')

let user_schema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        uppercase: true,
    },
    last_name: {
        type: String,
        required: true,
        uppercase: true,
    },
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        },
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirm_password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//generate token
user_schema.methods.generateAuthToken=(async function () {
    try {
        let token = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;

    } catch (error) {
        console.log(error);
    }
})

//hash password
user_schema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
        this.confirm_password = await bcrypt.hash(this.password, 10)
        
        // this.confirm_password = undefined;
    }
    next()
})
let signup_users = mongoose.model('users', user_schema)
module.exports = signup_users