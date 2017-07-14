require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT;

const {
    mongoose
} = require("./db/mongoose.js");
const {
    ObjectId
} = require("mongodb");
const Todo = require('./models/todo');
const User = require('./models/user');
const {
    authenticate
} = require("./middleware/authenticate");

var app = express();

app.use(bodyParser.json());

app.post("/todos", authenticate, (req, res, next) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then(todo => {
        res.send(todo);
    }).catch(e => {
        res.status(400).send(e); //400 bad request
    });
});

app.get('/todos', authenticate, (req, res, next) => {
    Todo.find({
        _creator: req.user._id
    }).then(todos => {
        res.send({
            todos
        });
    }).catch(e => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res, next) => {
    var todoId = req.params.id;

    if (ObjectId.isValid(todoId)) {

        Todo.findOne({
            _id: todoId,
            _creator: req.user._id
        }).then(todo => {
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

app.delete("/todos/:id", authenticate, (req, res, next) => {
    var todoId = req.params.id;

    if (ObjectId.isValid(todoId)) {
        Todo.findOneAndRemove({
            _id: todoId,
            _creator: req.user._id
        }).then(todo => {
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

app.patch("/todos/:id", authenticate, (req, res, next) => {
    var todoId = req.params.id;

    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectId.isValid(todoId)) {
        return res.status(400).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: todoId,
        _creator: req.user._id
    }, body, {
        new: true
    }).then(todo => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({
            todo
        });
    }).catch(e => {
        res.status(400).send();
    })
});

// POST /users
app.post("/users", (req, res, next) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then(token => {
        res.header('x-auth', token).send(user);
    }).catch(e => {
        res.status(400).send();
    });
});

// GET /users/me

app.get("/users/me", authenticate, (req, res, next) => {
    res.send(req.user);
});

app.post("/users/login", (req, res, next) => {
    var body = _.pick(req.body, ["email", "password"]);

    User.findByCredentials(body.email, body.password).then(user => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        });
    }).catch(e => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res, next) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch(e => {
        res.status(400).send();
    });
});

app.listen(PORT, () => {
    console.log(`Started on port ${PORT}`);
});

module.exports = {
    app
};
