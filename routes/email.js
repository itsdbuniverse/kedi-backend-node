const nodemailer = require('nodemailer');
const config = require('./../config');

let transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    auth: {
        user: config.emailUser,
        pass: config.emailPassword
    }
})

module.exports = transporter;