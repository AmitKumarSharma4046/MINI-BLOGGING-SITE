const mongoose = require('mongoose')
const blogsModule = require("../modules/blogsModule");
const authorModule = require("../modules/authorModule");


const isValid = function (value) {
    if (typeof value === "undefined" || typeof value === null) return false
    if (typeof value === "string" && value.trim().length == 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}




/*------------------------------------------------------------------------------------------
➡️ POST METHOD, CREATE NEW BLOG USING
------------------------------------------------------------------------------------------ */

const createBlogs = async (req, res) => {
    try {
        // 👇 get all data from body here 🤯
        const requestBody = req.body;
        //authorId will automatically be taken from decodedToken.authorId
        requestBody.authorId = req.decodedToken.authorId

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Invalid request parameters.Please provide blog details" })
        }

        if (!isValid(requestBody.title)) {
            return res.status(400).send({ status: false, msg: "Title is required" })
        }

        if (!isValid(requestBody.body)) {
            return res.status(400).send({ status: false, msg: "Body is required" })
        }
        // if (!isValid(requestBody.authorId)) {
        //     return res.status(400).send({ status: false, msg: "authorId is required" })
        // }
        // if (!isValidObjectId(requestBody.authorId)) {
        //     return res.status(400).send({ status: false, msg: "Valid authorid is required" })
        // }
        if (!isValid(requestBody.category)) {
            return res.status(400).send({ status: false, msg: "category is required" })
        }


        //need to check author id is valid or not 
        const isValidAuthor = await authorModule.findById(requestBody.authorId)
        if (!isValidAuthor) {
            return res.status(401).send({ status: false, msg: "⚠️ Invalid AuthorId, please try with a valid AuthorId" });
        }

        if (requestBody.isPublished === true) {
            requestBody.publishedAt = Date.now()
        }

        // 👇 Create a blog document from request body
        const createBlogs = await blogsModule.create(requestBody);

        res.status(201).send({ status: true, msg: "Blog successfully created", data: createBlogs });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};





/*------------------------------------------------------------------------------------------
 ➡️ GET METHOD, GET ALL LIST OF BLOGS
------------------------------------------------------------------------------------------ */

const getAllBlogs = async (req, res) => {
    try {
        let data = req.query;
        let query = {
            isDeleted: false,
            isPublished: true
        };

        if (Object.keys(data).length > 0) {
            if (isValid(data.authorId) && isValidObjectId(data.authorId)) {
                query['authorId'] = data.authorId
            }
            if (isValid(data.category)) {
                query['category'] = data.category.trim()
            }
            if (isValid(data.tags)) {
                const tagsArr = data.tags.trim().split(',').map(ele => ele.trim())
                query['tags'] = { $all: tagsArr }
            }
            if (isValid(data.subcategory)) {
                const subcategoryArr = data.subcategory.trim().split(',').map(ele => ele.trim())
                query['subcategory'] = { $all: subcategoryArr }
            }
        }
        const allBlogs = await blogsModule.find(query);

        if (allBlogs.length == 0) {
            return res.status(404).send({ status: false, msg: "No blog found" });
        }

        res.status(200).send({ status: true, data: allBlogs });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};





/*------------------------------------------------------------------------------------------
 ➡️ PUT METHOD, UPDATE BY BLOG-ID AS PARAMS
------------------------------------------------------------------------------------------ */

const updateBlogsById = async function (req, res) {
    try {
        let blogId = req.params.blogId;

        let data = req.body;

        if (!isValidRequestBody(data))
            return res.status(400).send({
                status: false,
                msg: "Body is required for updation"
            });


        let blogData = await blogsModule.findOne({
            _id: blogId,
            isDeleted: false
        });
        if (!blogData) return res.status(404).send({
            status: false,
            msg: "blogs-Id related data is not present"
        })


        if (data.title) blogData.title = data.title;
        if (data.body) blogData.body = data.body;
        if (data.category) blogData.category = data.category;
        if (data.tags) {
            if (typeof data.tags == "object") {
                blogData.tags.push(...data.tags);
            } else {
                return res.status(400).send({
                    status: false,
                    msg: "tag value must be an array"
                });
            }
        }
        if (data.subcategory) {
            if (typeof data.subcategory == "object") {
                blogData.subcategory.push(...data.subcategory);
            } else {
                return res.status(400).send({
                    status: false,
                    msg: "subcategory value must be an array"
                });
            }
        }
        if (data.isPublished === true) {
            blogData.isPublished = true
            blogData.publishedAt = Date(); //Fri Apr 29 2022 11:14:26 GMT+0530 (India Standard Time)
        } else if (data.isPublished === false) {
            blogData.isPublished = false
            blogData.publishedAt = null
        }
        blogData.save();


        res.status(200).send({
            status: true,
            data: blogData
        });
    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        });
    }
};







/*------------------------------------------------------------------------------------------
 ➡️ DELETE METHOD, DELETE BY BLOG-ID AS PARAMS
------------------------------------------------------------------------------------------ */

const deleteBlogsById = async function (req, res) {
    try {
        let blogId = req.params.blogId;

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: `${blogId} is not a valid blogId` })
        }
        let result = await blogsModule.findOne({
            _id: blogId,
            isDeleted: false
        });
        if (!result) return res.status(404).send({
            status: false,
            msg: "Blog data not found"
        })

        let updated = await blogsModule.findByIdAndUpdate({
            _id: blogId
        }, {
            isDeleted: true,
            deletedAt: Date()
        }, {
            new: true
        });
        res.status(200).send({
            status: true,
            msg: "Deletion Successfull",
            data: updated
        });
    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        });
    }
};





/*------------------------------------------------------------------------------------------
 ➡️ DELETE METHOD, DELETE BY QUERY
------------------------------------------------------------------------------------------ */

const deleteBlogsByQuery = async function (req, res) {
    try {
        let data = req.query;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "No query params received.Aboting delete operation" })
        }
        // add a query variable and add a default key value [ isDeleted: false ]
        let query = { isDeleted: false };


        if (isValid(data.authorId) && isValidObjectId(data.authorId)) {
            query['authorId'] = data.authorId
        }
        if (isValid(data.category)) {
            query['category'] = data.category
        }
        if (isValid(data.isPublished)) {
            query['isPublished'] = data.isPublished
        }
        //-> if tags defined
        if (isValid(data.tags)) {
            const tagsArr = data.tags.trim().split(',').map(ele => ele.trim())
            query['tags'] = { $all: tagsArr }
        }
        if (isValid(data.subcategory)) {
            const subcategoryArr = data.subcategory.trim().split(',').map(ele => ele.trim())
            query['subcategory'] = { $all: subcategoryArr }
        }

        // console.log(query)
        // check if the query related data exist OR not
        const available = await blogsModule.find(query);
        if (available.length == 0) {
            return res.status(404).send({
                status: false,
                msg: "Query related data not found"
            });
        }

        // perform delete here using update many 
        const deleteData = await blogsModule.updateMany(query, {
            $set: {
                isDeleted: true,
                deletedAt: Date()
            }
        });
        res.status(200).send({
            status: true,
            msg: "Deletion Successfull",
            data: deleteData
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        });
    }
};










module.exports.createBlogs = createBlogs;
module.exports.getAllBlogs = getAllBlogs
module.exports.updateBlogsById = updateBlogsById;
module.exports.deleteBlogsById = deleteBlogsById;
module.exports.deleteBlogsByQuery = deleteBlogsByQuery;
