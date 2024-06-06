const express = require('express');
const router = express.Router();
const { fetchEmails } = require('./utils/fetchEmails');
const { classifyEmails } = require('./utils/classifyEmails');

router.get('/', async (req, res) => {
  const { session, numEmails } = req.query;

  try {
    const fetchedEmails = await fetchEmails(session, numEmails);
    res.json(fetchedEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { emailsToClassify, apiKey } = req.body;

  try {
    const classifiedEmails = await classifyEmails(emailsToClassify, apiKey);
    res.json(classifiedEmails);
  } catch (error) {
    console.error('Error classifying emails:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;