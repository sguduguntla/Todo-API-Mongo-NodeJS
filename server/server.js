const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const {
    mongoose
} = require("./db/mongoose.js");
const Todo = require('./models/todo');
const User = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post("/todos", (req, res, next) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then(todo => {
        res.send(todo);
    }).catch(e => {
        res.status(400).send(e); //400 bad request
    });
});

app.get('/todos', (req, res, next) => {
    Todo.find().then(todos => {
        res.send({
            todos
        });
    }).catch(e => {
        res.status(400).send(e);
    })
})
app.listen(PORT, () => {
    console.log("Started on port 3000");
});

module.exports = {
    app
};
