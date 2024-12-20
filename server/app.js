const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());


connectDB();


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
