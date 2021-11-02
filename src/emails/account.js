const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    const subject = 'Thanks for joining in'
    const text = `Welcome to the app, ${name}. Let me know how you get along with the app.`
    const mail = new MailStructure(email, subject, text)
    sgMail.send(mail)
}

const sendCancelationEmail = (email, name) => {
    const subject = 'We sorry you decide to cancel your account'
    const text = `${name} why did you decide to canceled your account?`
    const mail = new MailStructure(email, subject, text)
    sgMail.send(mail)
}

function MailStructure (to, subject, text) {
    if (!to)
        throw new Error('You must provide a sender')

    if (!subject)
        throw new Error('You must provide a subject')

    if (!text)
        throw new Error('You must provide a text body for the mail')

    this.to = to,
    this.from = 'rguzmanrosales@gmail.com',
    this.subject = subject,
    this.text = text
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}