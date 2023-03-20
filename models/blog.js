const mongoose = require('mongoose')
// const uniqueValidator = require('mongoose-unique-validator')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    type:String
  }]
})

// blogSchema.plugin(uniqueValidator)

blogSchema.set('toJSON', {
  transform: (blog, returnedBlog) => {
    returnedBlog.id = returnedBlog._id.toString()
    delete returnedBlog._id
    delete returnedBlog.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)