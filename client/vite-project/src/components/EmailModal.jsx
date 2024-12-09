import PropTypes from 'prop-types';
import '../styles/EmailModal.css';

const EmailModal = ({ email, onClose }) => {
  if (!email) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="email-details">
          <div className="email-field">
            <strong>From:</strong>
            <span>{email.sender} &lt;{email.senderEmail}&gt;</span>
          </div>
          <div className="email-field">
            <strong>Subject:</strong>
            <span>{email.subject}</span>
          </div>
          <div className="email-field">
            <strong>Date:</strong>
            <span>{new Date(email.createdAt).toLocaleString()}</span>
          </div>
          <div className="email-body">
            {email.body}
          </div>
        </div>
      </div>
    </div>
  );
};

EmailModal.propTypes = {
  email: PropTypes.shape({
    sender: PropTypes.string.isRequired,
    senderEmail: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    isRead: PropTypes.bool
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default EmailModal;
