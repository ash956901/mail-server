const nodemailer = require('nodemailer');
const simpleParser = require('mailparser').simpleParser;
const Imap = require('imap');

class EmailConfig {
  constructor() {
    this.smtpConfig = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };

    this.imapConfig = {
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS,
      host: process.env.IMAP_HOST,
      port: process.env.IMAP_PORT,
      tls: true
    };
  }

  getSmtpTransporter() {
    return nodemailer.createTransport(this.smtpConfig);
  }

  getImapClient() {
    return new Imap(this.imapConfig);
  }

  async fetchEmails() {
    return new Promise((resolve, reject) => {
      const imap = this.getImapClient();
      
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            reject(err);
            return;
          }

          const f = imap.seq.fetch('1:*', {
            bodies: ['HEADER', 'TEXT']
          });

          const emails = [];
          f.on('message', (msg) => {
            msg.on('body', async (stream, info) => {
              const parsedEmail = await simpleParser(stream);
              emails.push({
                subject: parsedEmail.subject,
                from: parsedEmail.from.text,
                text: parsedEmail.text,
                html: parsedEmail.html
              });
            });
          });

          f.once('error', (err) => {
            reject(err);
          });

          f.once('end', () => {
            imap.end();
            resolve(emails);
          });
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    });
  }
}

module.exports = new EmailConfig();