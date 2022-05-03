const mongoose = require('mongoose')


const authorSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: "fname is required",
        trim: true
    },
    lname: {
        type: String,
        required: "lname is required",
        trim: true
    },
    title: {
        type: String,
        required: "title is required",
        enum: ['Mr', 'Mrs', 'Miss']
    },
    email: {
        type: String,
        required: "email is required",
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            }, message: "Please fill a valid email.", isAsync: false
        }
    },
    password: {
        type: String,
        required: "password is required",
        trim:true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Author', authorSchema) //authors