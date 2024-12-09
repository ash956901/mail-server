import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Compose.css';

const ComposeEmail = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ to, subject, message, attachments });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="email-compose">
      <div className="compose-container">
        <div className="compose-header">
          <h2>New Message</h2>
          <button className="close-btn" onClick={() => navigate('/inbox')}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="to">To</label>
            <input
              type="email"
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows="5"
              required
            />
          </div>

          {attachments.length > 0 && (
            <div className="attachments">
              {attachments.map((file, index) => (
                <div key={index} className="attachment">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(index)}>&times;</button>
                </div>
              ))}
            </div>
          )}

          <div className="actions">
            <button type="submit" className="send-btn">Send</button>
            <label className="attach-btn">
              📎 Attach Files
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                hidden
              />
            </label>
            <button type="button" className="discard-btn" onClick={() => navigate('/inbox')}>Discard</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEmail;
