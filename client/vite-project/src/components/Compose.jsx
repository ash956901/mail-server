import { useState } from 'react';
import { sendEmail } from '../services/emailService';
import '../styles/Compose.css';
function Compose() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendEmail(recipient, subject, body);
      alert('Email sent successfully!');
    } catch (error) {
      console.log(error);
      alert('Failed to send email');
    }
  };

  return (
    <div>
      <h2>Compose Email</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Recipient" 
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Subject" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea 
          placeholder="Email Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        ></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Compose;