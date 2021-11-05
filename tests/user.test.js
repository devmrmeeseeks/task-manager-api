const { userOneId, userOne, configureDatabase } = require('./fixtures/db')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

beforeEach(configureDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users')
        .send({
            name: 'Robert',
            email: 'rguzman@example.com',
            password: 'test1234U!'
        })
        .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'Robert',
            email: 'rguzman@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('test1234U!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).not.toBeNull()

    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login')
        .send({
            email: 'test@test.com',
            password: 'test1234'
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for anauthenticate user', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})

test('SHould upload avatar image', async () => {
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Gregory House'
        })
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.name).toBe('Gregory House')
})

test('Should not update invalid user fields', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Guatemala, Guatemala'
        })
        .expect(400)
})

test('Should not signup user with invalid password', async () => {
    await request(app).post('/users/login')
        .send({
            email: userOne.email,
            password: 'Test1234'
        })
        .expect(400)
})

test('Should not signup user with invalid email', async () => {
    await request(app).post('/users/login')
        .send({
            name: 'maria',
            email: 'maria.example.com',
            password: 'Test1234'
        })
        .expect(400)
})

test('Should not signup user with invalid password', async () => {
    await request(app).post('/users')
        .send({
            name: 'maria',
            email: 'maria@example.com',
            password: 'password'
        })
        .expect(400)
})

test('Should not signup user with invalid name', async () => {
    const response = await request(app).post('/users')
        .send({
            email: 'juan@example.com',
            password: 'rG4831720'
        })
        .expect(400)
})

test('Should not update user if unauthenticated', async () => {
    await request(app).patch('/users/me')
        .send({
            name: 'Molly'
        })
        .expect(401)
})

test('Should not udpate user with invalid email', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'test.example.com'
        })
        .expect(400)
})

test('Should not update user with invalid password', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'password'
        })
        .expect(400)
})

test('Should not update user with invalid name', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: undefined
        })
        .expect(400)
})

test('Should not delete user if unauthenticate', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})