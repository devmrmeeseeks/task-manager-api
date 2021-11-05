const { userOneId, userOne, userTwo, taskOne, taskTwo, taskThree, configureDatabase } = require('./fixtures/db')
const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')

beforeEach(configureDatabase)

test('Should create task for user', async () => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should fetch users tasks', async () => {
    const response = await request(app).get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test('Should not delete others users tasks', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not create task with invalid description', async () => {
    await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: undefined
        })
        .expect(400)
})

test('Should not create task with invalid completed', async () => {
    await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'New Task',
            popo: 'test'
        })
        .expect(400)
})

test('Should delete user task', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not delete task if unauthenticate', async () => {
    await request(app).delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
})

test('Should not update others users task', async () => {
    await request(app).patch(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: false
        })
        .expect(404)
})

test('Should fetch user task  by id', async () => {
    await request(app).get(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('SHould not fetch user task by id if unauthenticated', async () => {
    await request(app).get(`/tasks/${taskTwo._id}`)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    await request(app).get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app).get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    response.body.forEach((task) => {
        expect(task.completed).toBe(true)
    })
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app).get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    response.body.forEach((task) => {
        expect(task.completed).toBe(false)
    })
})

test('Should sort tasks by description', async () => {
    const response = await request(app).get('/tasks?sortBy=description:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    response.body.forEach((task, index) => {
        if (0 === index)
            expect(taskTwo.description).toBe(task.description)
        else if (1 === index)
            expect(taskOne.description).toBe(task.description)
    })
})

test('Should sort tasks by completed', async () => {
    const response = await request(app).get('/tasks?sortBy=completed')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    response.body.forEach((task, index) => {
        if (0 === index)
            expect(taskOne.completed).toBe(task.completed)
        else if (1 === index)
            expect(taskTwo.completed).toBe(task.completed)
    })
})

test('Should sort tasks by createdAt', async () => {
    const response = await request(app).get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const dbTaskOne = await Task.findById(taskOne._id)
    const dbTaskTwo = await Task.findById(taskTwo._id)
    expect(dbTaskTwo.createdAt).toMatchObject(new Date(response.body[0].createdAt))
    expect(dbTaskOne.createdAt).toMatchObject(new Date(response.body[1].createdAt))
})

test('Should fetch page of task', async () => {
    const response = await request(app).get('/tasks?limit=1&skip=1')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0]._id).toEqual(taskTwo._id.toString())
})