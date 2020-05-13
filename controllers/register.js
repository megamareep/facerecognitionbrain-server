
const handleRegister = (db, bcrypt) => (req, res) => {

    const { email, name, password } = req.body;
    if(!email || !name || !password) {
        return res.status(400).json('Incorrect form submission');
    }

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
            .catch(err => res.status(400).json('Unable to register'))
            
        });
    })
}

module.exports = {
    handleRegister: handleRegister
}