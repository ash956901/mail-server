import { useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import EmailModal from './EmailModal';
import '../styles/Inbox.css';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`http://localhost:5001/api/email/inbox?page=${currentPage}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const sortedEmails = response.data.emails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEmails(sortedEmails);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails(); 
  }, []); 

  const handleEmailClick = async (email) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      
      // Mark email as read if it's not already read
      if (!email.isRead) {
        await axios.post(`http://localhost:5001/api/email/${email._id}/read`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Update the email in the list
        setEmails(prevEmails => 
          prevEmails.map(e => 
            e._id === email._id ? { ...e, isRead: true } : e
          )
        );
      }

      setSelectedEmail(email);
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
  };

  const handleRefresh = debounce(() => {
    fetchEmails();
    setRefreshKey(prev => prev + 1);
  }, 2000); // Debounce for 2 seconds

  const handleCompose = () => {
    window.location.href = '/compose';
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (loading && emails.length === 0) {
    return <div className="loading">Loading your emails...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h2>Inbox</h2>
        <div className='button-container'>
        <button onClick={handleRefresh} className="refresh-button">
          Refresh
        </button>

        <button onClick={handleCompose} className="refresh-button">
          Compose
        </button>
        </div>
      
      </div>

      {loading && <div className="sync-indicator">Syncing...</div>}

      <div className="email-list">
        {emails.length === 0 ? (
          <div className="no-emails">No emails found</div>
        ) : (
          emails.map((email) => (
            <div 
              key={email._id} 
              className={`email-item ${!email.isRead ? 'unread' : ''}`}
              onClick={() => handleEmailClick(email)}
            >
              <div className="email-sender">
                <strong>{email.sender}</strong>
                <span className="email-address">{email.senderEmail}</span>
              </div>
              <div className="email-subject">{email.subject}</div>
              <div className="email-preview">{email.body?.substring(0, 100)}...</div>
              <div className="email-date">
                {formatDate(email.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {selectedEmail && (
        <EmailModal 
          email={selectedEmail} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default Inbox;