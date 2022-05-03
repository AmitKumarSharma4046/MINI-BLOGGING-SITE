const res = require("express/lib/response")
const jwt = require("jsonwebtoken")
const authorModule = require("../modules/authorModule")
const blogsModule = require("../modules/blogsModule")

const authentication = (req, res, next) => {
    try {

        let token = req.headers["x-api-key"]
        if (!token) return res.status(400).send({ status: false, msg: "Authentication token(x-api-key) is required" })
        const decodedToken = jwt.verify(token, 'Group 27')
        if (!decodedToken) return res.status(403).send({ status: false, msg: "invalid token. please enter a valid token" })
        req["decodedToken"] = decodedToken
        next()
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const authorization = async (req, res, next) => {
    try {
        let authorId;
        let authorIdFromToken= req.decodedToken.authorId
        // console.log(author_Id)
        let blogId = req.params.blogId
        let data=req.query
        if(Object.keys(data).length===0){
            if(!blogId)return res.status(400).send({status:false,msg:"No query params received.Delete operation will be aborted"})
            authorId=await blogsModule.findOne({_id:blogId}).select({authorId:1,_id:0})
        }else{
            authorId=await blogsModule.findOne(data).select({authorId:1,_id:0})
        }
        if(authorId.authorId.toString() != authorIdFromToken){
            return res.status(401).send({status:false,msg:"Unauthorized User"})
        }
        next()
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.authentication = authentication
module.exports.authorization = authorization