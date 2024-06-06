
const fetchEmails = async (session, numEmails) => {
  if (!session?.accessToken) {
    throw new Error('Unauthorized');
  }

  try {
    const gmailResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const { messages } = await gmailResponse.json();

    const emails = await Promise.all(
      messages.slice(0, numEmails).map(async (message) => {
        const messageData = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        ).then((res) => res.json());

        return {
          id: message.id,
          sender: messageData.payload.headers.find((header) => header.name === 'From').value,
          content: messageData.snippet,
          category: 'Unclassified',
        };
      })
    );

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

module.exports = { fetchEmails };