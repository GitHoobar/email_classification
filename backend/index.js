const express = require('express');
const cors = require('cors');
const app = express();
const emailRoutes = require('./routes/emailRoutes');

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

app.use('/api/email', emailRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});