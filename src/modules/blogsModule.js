const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "title is required",
        trim: true
    },
    body: {
        type: String,
        required: "body is required",
        trim: true
    },
    authorId: {
        type: ObjectId,
        ref: 'Author',
        required: "authorId is required"
    },
    tags: {
        type: [String],
        trim: true
    },
    category: {
        type: String,
        required: "category is required",
        trim: true
    },
    subcategory: {
        type: [String],
        trim: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Blog', blogsSchema) //blogs