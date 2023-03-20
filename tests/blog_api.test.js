const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const login = async () => {
  const result = await api.post('/api/login').send({
    username: 'tduyphat',
    password: '1234',
  });
  return result.body.token;
}

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('1234', 10)
  const user = new User({ username: 'tduyphat', passwordHash })
  await user.save()
  const userToAdd = await User.findOne({ username: 'tduyphat' })

  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})
afterAll(() => {
  mongoose.connection.close()
})


test('all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs')
  // .set({ Authorization: 'Bearer ' + token })
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const title = response.body.map(r => r.title)
  expect(title).toContain(
    'F Araska'
  )
})

test('a valid blog can be added', async () => {
  const token = await login()
  const newBlog = {
    title: 'F Oraska',
    author: 'adam',
    url: 'www.forasaka.com',
    likes: 77,
  }

  await api
    .post('/api/blogs')
    .set({ Authorization: 'Bearer ' + token })
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .get('/api/blogs')
    .set({ Authorization: 'Bearer ' + token })

  const titles = response.body.map((r) => r.title)

  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain(newBlog.title)
})

test('a specific blog can be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb()

  const blogToView = blogsAtStart[0]

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

  expect(resultBlog.body).toEqual(processedBlogToView)
})

test('a blog can be deleted', async () => {
  const token = await login()
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set({ Authorization: 'Bearer ' + token })
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

  const titles = blogsAtEnd.map(r => r.title)
  expect(titles).not.toContain(blogToDelete.title)
})

test('Update the information of an individual blog post', async () => {
  const token = await login()
  const blogs = await helper.blogsInDb()
  const blogToBeUpdated = blogs[0]
  const update = {
    likes: 20,
  };

  await api
    .put(`/api/blogs/${blogToBeUpdated.id}`)
    .set({ Authorization: 'Bearer ' + token })
    .send(update)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const updatedBlog = await api
    .get(`/api/blogs/${blogToBeUpdated.id}`)
    .set({ Authorization: 'bearer ' + token })

  expect(updatedBlog.body).toEqual(expect.objectContaining(update))
})

test('verify id property is unique and defined', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const ids = response.body.map((r) => r.id)
  const confirmIfArrayUnique = (array) =>
    Array.isArray(array) && new Set(array).size === array.length

  response.body.forEach((blog) => {
    expect(blog.id).toBeDefined()
  })
  expect(confirmIfArrayUnique(ids)).toBeTruthy()
})

test('if the likes property is missing from the request, it will default to the value 0', async () => {
  const token = await login()
  const newBlog = {
    title: 'hehe',
    author: 'hoho',
    url: 'www.nahnah.com',
  }

  await api
    .post('/api/blogs')
    .set({ Authorization: 'Bearer ' + token })
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .get('/api/blogs')
    .set({ Authorization: 'Bearer ' + token })
  expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
  expect(response.body[helper.initialBlogs.length].likes).toBe(0)
})

test('if title and url are missing from the request, return 400 Bad request', async () => {
  const token = await login()
  const newBlog = {
    author: 'hoho',
    likes: 40,
  };

  await api
    .post('/api/blogs')
    .set({ Authorization: 'Bearer ' + token })
    .send(newBlog)
    .expect(400)

  const blogsResult = await helper.blogsInDb()
  expect(blogsResult).toHaveLength(helper.initialBlogs.length)
})

test('return error 401 Unauthorized if token is not provided', async () => {
  const blogs = await helper.blogsInDb()
  const blogToUpdate = blogs[0]
  const update = {
    author: 'timmy'
  };
  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(update)
    .expect(401)
})