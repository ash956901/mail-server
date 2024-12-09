# Mail Server Client

## Overview
This project is a mail server client that allows users to send and receive emails securely. It is built using React for the frontend and Node.js with Express for the backend, leveraging MongoDB for data storage.

## Setup Guide

### Prerequisites
- **Node.js** (version 14 or higher)
- **MongoDB** (for database integration)
- **Environment Variables**: Ensure you have the necessary credentials for your email service and MongoDB.

### Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mailServer
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the `server` directory and add the following environment variables:
   ```plaintext
   EMAIL_HOST=<your-email-host>
   EMAIL_PORT=<your-email-port>
   EMAIL_USER=<your-email-username>
   EMAIL_PASS=<your-email-password>
   IMAP_HOST=<your-imap-host>
   IMAP_PORT=<your-imap-port>
   MONGO_URI=<your-mongodb-uri>
   ```
4. **Start the server**:
   ```bash
   npm start
   ```

## API Documentation
### Authentication
- **POST /api/auth/login**: Login a user with email and password.
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
  - **Response**:
    ```json
    {
      "token": "jwt-token",
      "user": { ... }
    }
    ```

- **POST /api/auth/register**: Register a new user.
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
  - **Response**:
    ```json
    {
      "message": "User registered successfully"
    }
    ```

### Email Operations
- **POST /api/email/send**: Send an email.
  - **Headers**:
    - `Authorization`: Bearer token required for authentication.
  - **Request Body**:
    ```json
    {
      "recipient": "recipient@example.com",
      "subject": "Subject of the email",
      "body": "Email body content"
    }
    ```
  - **Response**:
    ```json
    {
      "message": "Email sent successfully"
    }
    ```

- **GET /api/email/received**: Retrieve a list of received emails for the authenticated user.
  - **Headers**:
    - `Authorization`: Bearer token required for authentication.
  - **Response**:
    ```json
    [
      {
        "subject": "Subject of the email",
        "from": "sender@example.com",
        "date": "2024-12-09T13:37:00Z"
      },
      ...
    ]
    ```

## Design Choices
- **Architecture**: The application follows a client-server architecture, where the client is built using React and Vite, and the server is built using Node.js and Express. The separation of concerns allows for better scalability and maintainability.
- **Technology Stack**:
  - **Frontend**: React, Vite
  - **Backend**: Node.js, Express
  - **Database**: MongoDB
- **State Management**: React's built-in state management is used for handling user input and application state.

## Security Measures
- **Email Encryption**: Emails are encrypted during transmission using STARTTLS for sending and TLS for receiving.
- **User Authentication**: User credentials are securely managed, with passwords hashed before storage and JWT tokens used for session management.
- **Environment Variables**: Sensitive information such as API keys and database URIs are stored in environment variables to prevent exposure in the codebase.

## Database Integration
- **MongoDB**: Integrated for storing user credentials and email logs. The connection is established using Mongoose, which provides a straightforward way to interact with MongoDB.
- **Data Handling**: User credentials are securely stored, and email data is logged for retrieval.

## Contribution Guidelines
If you would like to contribute to this project, please fork the repository and submit a pull request. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

## Conclusion
This project provides a simple and secure way to manage emails with support for multiple accounts. For any issues or contributions, please refer to the project's issue tracker.