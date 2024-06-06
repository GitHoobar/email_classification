const axios = require('axios');

const classifyEmails = async (emailsToClassify, apiKey) => {
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  try {
    const classifiedEmails = await Promise.all(
      emailsToClassify.map(async (email) => {
        if (email.category === 'Unclassified') {
          try {
            const content = `Classes: ["Important", "Promotions", "Social", "Marketing", "Spam", "General"]\nText: ${email.content}\nClassify the text into one of the above classes.`;
            const response = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: 'gpt-3.5-turbo-0125',
                temperature: 0.6,
                messages: [{ role: 'user', content }],
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${apiKey}`,
                },
              }
            );

            const category =
              mapSubcategory(response.data.choices[0]?.message?.content) || 'General';
            return { ...email, category };
          } catch (error) {
            console.error('Error classifying email:', error);
            return { ...email, category: 'Rate Limit Exceeded' };
          }
        } else {
          return email;
        }
      })
    );

    return classifiedEmails;
  } catch (error) {
    console.error('Error classifying emails:', error);
    throw error;
  }
};

const mapSubcategory = (text) => {
  const regex = /Class: "(.+)"/;
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

module.exports = { classifyEmails };