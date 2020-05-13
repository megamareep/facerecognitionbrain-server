import express from 'express'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import knex from 'knex'

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'delltom89',
        database: 'smart-brain'
    }
});

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/register', (req, res) => {
    //new user created
    //learn to write async functions to clean this up.
    const { email, name, password } = req.body;
    const saltRounds = 10;
    const salt = bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            db.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email
                })
                    .into('login')
                    .returning('email')
                    .then(loginEmail => {
                        return trx('users')
                            .returning('*')
                            .insert({
                                email: loginEmail[0],
                                name: name,
                                joined: new Date()
                            }).then(user => {
                                res.json(user[0])
                            })
                            
                    })
                    .then(trx.commit)
                    .catch(err => res.status(400).json('Unable to register'))                    
            })
            
        });
    })
})

app.post('/signin', (req, res) => {

    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            return bcrypt.compare(req.body.password, data[0].hash, (err, result) => {
                if(result) {
                    return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0]);
                    })
                    .catch(err => res.status(400).json('unable to get user'))
                } else {
                    res.status(400).json('wrong credentials')
                }
            })
        })
        .catch(err => res.status(400).json('wrong credentials'))
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('not found')
            }
        })
        .catch(err => res.status(400).json('error getting user'))

})

app.put('/image', (req, res) => {
    const { id } = req.body;

    db('users')
        .where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0]);
        })
        .catch(err => res.status(400).json('unable to get entries'))
})



app.listen(3000, () => {
    console.log('app is running on port 3000')
});

/*
/ --> res this is working.
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT = user
*/