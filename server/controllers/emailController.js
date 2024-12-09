const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Email = require('../models/Email');


const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',  
  port: 993,              
  tls: true,
  tlsOptions: { 
    rejectUnauthorized: false,
    servername: 'imap.gmail.com'
  },
  connTimeout: 30000,     
  authTimeout: 15000,     
};

const fetchEmailsFromIMAP = () => {
  return new Promise((resolve, reject) => {
    let timeoutId;
    const emails = [];
    const imap = new Imap(imapConfig);

    console.log('Attempting IMAP connection with config:', {
      user: imapConfig.user,
      host: imapConfig.host,
      port: imapConfig.port,
      tls: imapConfig.tls
    });

   
    timeoutId = setTimeout(() => {
      console.log('Global IMAP timeout reached');
      cleanup('Global timeout reached');
      reject(new Error('IMAP operation timed out after 60 seconds'));
    }, 60000);

    const cleanup = (reason) => {
      console.log('Cleaning up IMAP connection:', reason);
      clearTimeout(timeoutId);
      try {
        if (imap.state !== 'disconnected') {
          imap.end();
        }
      } catch (err) {
        console.error('Error during imap cleanup:', err);
      }
    };

    imap.once('ready', () => {
      console.log('IMAP connection ready');
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          cleanup('Error opening inbox');
          return reject(new Error('Failed to open inbox: ' + err.message));
        }

        console.log('Mailbox opened:', box.name);

     
        const date = new Date();
        date.setDate(date.getDate() - 3);
        const searchCriteria = ['ALL', ['SINCE', date]];

        imap.search(searchCriteria, (err, results) => {
          if (err) {
            cleanup('Search error');
            return reject(new Error('Search failed: ' + err.message));
          }

          console.log('Search results count:', results.length);

          if (!results.length) {
            cleanup('No results');
            return resolve([]);
          }

        
          const fetchResults = results.slice(-10);
          const fetch = imap.fetch(fetchResults, { bodies: '' });
          let completed = 0;

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (err) {
                  console.error('Parser error:', err);
                  return;
                }
                
                try {
                  const email = {
                    from: parsed.from?.text || 'Unknown',
                    fromEmail: parsed.from?.value[0]?.address || 'unknown@email.com',
                    subject: parsed.subject || '(No Subject)',
                    body: parsed.text || '',
                    date: parsed.date || new Date()
                  };
                  console.log('Parsed email:', { 
                    from: email.from,
                    subject: email.subject,
                    date: email.date 
                  });
                  emails.push(email);
                } catch (parseError) {
                  console.error('Error processing parsed email:', parseError);
                }

                completed++;
                console.log(`Completed ${completed} of ${fetchResults.length}`);
                
                if (completed === fetchResults.length) {
                  cleanup('All messages processed');
                  resolve(emails);
                }
              });
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
            cleanup('Fetch error');
            reject(new Error('Fetch failed: ' + err.message));
          });

          fetch.once('end', () => {
            console.log('Fetch operation ended');
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      cleanup('IMAP error');
      reject(new Error('IMAP connection failed: ' + err.message));
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

  
    try {
      console.log('Initiating IMAP connection...');
      imap.connect();
    } catch (err) {
      console.error('IMAP connect error:', err);
      cleanup('Connect error');
      reject(new Error('Failed to initiate IMAP connection: ' + err.message));
    }
  });
};

exports.sendEmail = async (req, res) => {
  try {
    const { recipient, subject, body } = req.body;

   
    if (!isValidEmail(recipient)) {
      return res.status(400).json({ message: 'Invalid recipient email address' });
    }

   
    const email = new Email({
      sender: req.user._id,  
      senderEmail: req.user.email,
      recipient,
      subject,
      body,
      isRead: false
    });
    await email.save();

   
    await transporter.sendMail({
      from: req.user.email,
      to: recipient,
      subject,
      text: body
    });

    res.status(201).json({ message: 'Email sent successfully', emailId: email._id });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

exports.getInbox = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  try {
    console.log('Starting inbox retrieval for user:', req.user.email);
    
   
    const dbEmails = await Email.find({ recipient: req.user.email })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Email.countDocuments({ recipient: req.user.email });
    
    
    res.json({
      emails: dbEmails,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      isSync: false
    });

  
    try {
      console.log('Fetching IMAP emails...');
      const imapEmails = await fetchEmailsFromIMAP();
      console.log('IMAP emails fetched:', imapEmails.length);
      
    
      for (const email of imapEmails) {
        try {
          const existingEmail = await Email.findOne({
            recipient: req.user.email,
            subject: email.subject,
            createdAt: email.date
          });

          if (!existingEmail) {
            await Email.create({
              sender: email.from,
              senderEmail: email.fromEmail,
              recipient: req.user.email,
              subject: email.subject,
              body: email.body,
              isRead: false,
              createdAt: email.date
            });
          }
        } catch (emailError) {
          console.error('Error processing individual email:', emailError);
          continue;
        }
      }
    } catch (imapError) {
      console.error('IMAP sync error:', imapError);
     
    }
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ message: 'Error retrieving inbox', details: error.message });
  }
};

exports.getEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

   
    if (!email.isRead) {
      email.isRead = true;
      email.readAt = new Date();
      await email.save();
    }

    res.json(email);
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ message: 'Error retrieving email' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { emailId } = req.params;
    
    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }


    if (!email.isRead) {
      email.isRead = true;
      email.readAt = new Date();
      await email.save();
    }

    res.json({ message: 'Email marked as read', email });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking email as read' });
  }
};
