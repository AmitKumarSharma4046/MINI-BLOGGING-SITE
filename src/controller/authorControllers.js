const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const authorModule = require('../modules/authorModule');


/*------------------------------------------------------------------------------------------
 ## Author APIs /authors
 -> Create an author - atleast 5 authors
 -> Create a author document from request body. Endpoint: BASE_URL/authors
------------------------------------------------------------------------------------------ */
const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length == 0) return false
    return true
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}




const createAuthor = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Invalid request parameters.Please provide author details" })
        }

        const { fname, lname, title, email, password } = requestBody

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, msg: "First name is required" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, msg: "Last name is required" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title is required" })
        }

        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, msg: "Title should be among Mr,Mrs,Miss" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "Please enter a valid email address" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "Password is required" })
        }

        const authorDataIsPresent = await authorModule.findOne({ email: email })
        if (authorDataIsPresent) {
            return res.status(400).send({ status: false, msg: `${email} email is already registered` })
        }

        const authorData = { fname, lname, title, email, password }
        const newAuthor = await authorModule.create(authorData)

        res.status(201).send({ status: true, msg: "New author created", data: newAuthor })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}

const authorLogin = async function (req, res) {
    try {
        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please provide login details" })
        }

        const { email, password } = requestBody

        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "Please enter a valid email address" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "Password is required" })
        }

        let findAuthor = await authorModule.findOne({ email: email, password: password })

        if (!findAuthor) return res.status(401).send({ status: false, msg: "Invalid login credentials" })

        //jwt.sign token creation
        const token = jwt.sign({ authorId: findAuthor._id.toString() }, 'Group 27');
        res.header('x-api-key', token)
        res.status(200).send({ status: true, msg: "Author login successful", data: token })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.authorLogin = authorLogin