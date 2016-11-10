const rp = require('request-promise')
const storage = require('node-persist')

const config = require('../../config/auth_server');

function initUser (app) {
  storage.initSync();
  app.get('/', renderWelcome)
  app.get('/profile', renderProfile)
  app.post('/sso', (req, res) => {  
    rp({
      method: 'GET',
      uri: config.ith_auth_server_login_url,
      headers: {
        'User-Agent': 'Request-Promise',
        'Authorization': 'Bearer ' + req.body.id_token
      },
      json: true
      })
      .then((data) => {
        authenticate(req, res)
      })
      .catch((err) => {
        console.log(err)
        renderWelcome(req, res)
      })
  })

  app.post('/login', (req, res) => {  
    rp({
      method: 'POST',
      uri: config.ith_auth_server_login_url,
      body: {
        email: req.body.email,
        password: req.body.password
      },
      json: true
      })
      .then((data) => {
        storage.setItem('userToken', data.id_token)
        renderProfile(req, res)
      })
      .catch((err) => {
        console.log(err)
        renderWelcome(req, res)
      })
  })
}

function authenticate (req, res) {
  console.log(req)
  res.render('user/profile', {
    email: req.body.id_token
  })
}

function renderWelcome (req, res) {
  res.render('user/welcome')
}

function renderProfile (req, res) {
  res.render('user/profile', {
    email: req.body.email
  })
}

module.exports = initUser