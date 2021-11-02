const mongodb = require('mongodb');

const { MongoClient, ObjectId } = require('mongodb');

const connection = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

// const id = new ObjectId();
// console.log(id.getTimestamp(), id.toString(), id.id, id.id.length, id.toHexString);

MongoClient.connect(connection, { useNewUrlParser: true }, (error, client) => {
    if (error)
        return console.log('Unable to connect to database');

    const db = client.db(databaseName);

    // db.collection('users').deleteMany({
    //     age: 34
    // }).then((result) => {
    //     console.log(result);
    // }).catch((error) => {
    //     console.log(error);
    // })

    db.collection('tasks').deleteOne({
        description: 'Task2'
    }).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);
    })

});