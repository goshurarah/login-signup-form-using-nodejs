require('dotenv').config()
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')

const signup_users = require('./model/user')
const auth = require('./middleware/auth')

//server config
const express = require('express')
const app = express()
const port = process.env.PORT


app.set('view engine', 'ejs')
app.set(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

//routes
app.get('/', (req, resp) => {
    resp.render('sign_up')
})
app.get('/sign_up', (req, resp) => {
    resp.render('sign_up')
})
app.get('/login', (req, resp) => {
    resp.render('login')
})
app.get('/logout', auth, async (req, resp) => {
    try {
        // //logout from current device
        // req.user.tokens = req.user.tokens.filter((currentToken) => {
        //     return currentToken.token !== req.token
        // })

        //logout from all devices and delete all token from database
        req.user.tokens = []
        resp.clearCookie('jwt')
        await req.user.save()
        resp.render('logout')
    } catch (error) {
        resp.status(500).send(error)
    }
})


//set signup data
app.post('/sign_up', async (req, resp) => {
    try {
        let password = req.body.password;
        let cPassword = req.body.confirm_password;

        if (password === cPassword) {
            let data = new signup_users({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: password,
                confirm_password: cPassword
            })
            await data.save()
            resp.render('login')
        } else {
            resp.send('Please! write same password')
        }
    } catch (error) {
        resp.status(400).send(error)
    }
})

//login check
app.post('/login', async (req, resp) => {
    try {
        let email = req.body.email
        let password = req.body.password
        let userEmail = await signup_users.findOne({ email: email })

        //match hash password
        let isMatch = await bcrypt.compare(password, userEmail.password)

        if (isMatch) {
            //token generate
            let token = await userEmail.generateAuthToken()
            //cookies
            resp.cookie('jwt', token, { expires: new Date(Date.now() + 600000), httpOnly: true })
            resp.send('Access Granted')
        } else {
            resp.send('Error')
        }
    } catch (error) {
        resp.status(400).send(error)
    }
})



//server listening
app.listen(port, () => {
    console.log(`server is listening to the port ${port}`);
})