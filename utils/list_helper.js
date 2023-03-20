const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (total, blog) => total + blog.likes
    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return ('blog list is empty!')
    }
    const reducer = (favorite, blog) => {
        if (favorite.likes >= blog.likes) {
            return favorite
        }
        else {
            return blog
        }
    }
    return blogs.reduce(reducer, blogs[0])
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return ('blog list is empty!')
    }
    const authors = lodash.countBy(blogs, 'author')
    const authorList = Object.entries(authors)
    const reducer = (highest, count) => {
        if (count[1] >= highest[1]) {
            return count
        }
        else {
            return highest
        }
    }
    const mostBlogger = authorList.reduce(reducer)
    return {
        author: mostBlogger[0],
        blogs: mostBlogger[1],
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return ('blog list is empty!')
    }
    const authors = [...new Set(blogs.map((blog) => blog.author))]
    const likes = Array(authors.length).fill(0)
    blogs.map((blog) => {
        authors.map((author) => {
            if (blog.author === author) {
                return likes[authors.indexOf(author)] += blog.likes
            }
        })
    })
    return {
        author: authors[likes.indexOf(Math.max(...likes))],
        likes: Math.max(...likes)
    }
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}