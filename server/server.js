const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const {
    mongoose
} = require("./db/mongoose.js");
const {
    ObjectId
} = require("mongodb");
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
    });
});

app.get('/todos/:id', (req, res, next) => {
    var todoId = req.params.id;

    if (ObjectId.isValid(todoId)) {

        Todo.findById(todoId).then(todo => {
            if (!todo) {
                return res.status(404).send();
            } else {
                return res.send({
                    todo
                });
            }
        }).catch(e => {
            return res.status(404).send(e);
        });
    } else {
        return res.status(400).send();
    }

});

app.delete("/todos/:id", (req, res, next) => {
    var todoId = req.params.id;

    if (ObjectId.isValid(todoId)) {
        Todo.findByIdAndRemove(todoId).then(todo => {
            if (!todo) {
                return res.status(404).send();
            }

            return res.send({
                todo
            });
        });
    } else {
        return res.status(400).send();
    }
})
app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
});

module.exports = {
    app
};
