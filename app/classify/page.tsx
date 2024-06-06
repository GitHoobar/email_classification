'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container, Button, Typography, Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions, Grid } from '@mui/material';
import axios from 'axios';

interface Email {
  id: string;
  sender: string;
  content: string;
  category: string;
}

const Classify = () => {
  const { data: session, status } = useSession();
  const [numEmails, setNumEmails] = useState<number>(3);
  const [emails, setEmails] = useState<Email[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      handleUnauthenticated();
    } else if (session) {
      fetchEmails();
    }
  }, [status, session, numEmails]);

  const handleUnauthenticated = () => {
    router.push('/api/auth/signin');
  };

  const fetchEmails = async () => {
    if (!session?.accessToken) return;

    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    const data = await response.json();

    const messages = await Promise.all(
      data.messages.slice(0, numEmails).map(async (message: any) => {
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
          sender: messageData.payload.headers.find((header: any) => header.name === 'From').value,
          content: messageData.snippet,
          category: 'Unclassified',
        };
      })
    );

    classifyEmails(messages);
  };

  const classifyEmails = async (emailsToClassify: Email[]) => {
    if (!emailsToClassify.length) return;

    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return;
    }

    try {
      const classifiedEmails = await Promise.all(emailsToClassify.map(async (email) => {
        if (email.category === 'Unclassified') {
          try {
            const content = `Classes: ["Important", "Promotions", "Social", "Marketing", "Spam", "General"]
            Text: ${email.content}
            
            Classify the text into one of the above classes.`;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: 'gpt-3.5-turbo-0125',
              temperature: 0.6,
              messages: [
                { role: 'user', content: content }
              ]
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
            });

            const category = mapSubcategory(response.data.choices[0]?.message?.content) ?? 'General';
            return { ...email, category };
          } catch (error) {
            console.error('Error classifying email:', error);
            return { ...email, category: 'Rate Limit Exceeded' };
          }
        } else {
          return email;
        }
      }));

      setEmails(classifiedEmails);
    } catch (error) {
      console.error('Error classifying emails:', error);
    }
  };

  const mapSubcategory = (text: string) => {
    const regex = /Class: "(.+)"/;
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return null; // If no match is found, return null
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Important':
        return 'green';
      case 'Promotions':
        return 'blue';
      case 'Social':
        return 'purple';
      case 'Marketing':
        return 'orange';
      case 'Spam':
        return 'red';
      case 'General':
        return 'gray';
      case 'Rate Limit Exceeded':
        return 'gray';
      default:
        return 'black';
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          {session?.user?.name} ({session?.user?.email})
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => signOut()}>
          Logout
        </Button>
      </Grid>
      <FormControl fullWidth variant="outlined" style={{ marginTop: '1rem' }}>
        <InputLabel>Select number of emails to display</InputLabel>
        <Select
          value={numEmails}
          onChange={(e) => setNumEmails(Number(e.target.value))}
          label="Select number of emails to display"
        >
          {[3, 5, 10, 15, 20].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container spacing={3} style={{ marginTop: '1rem' }}>
        {emails.map((email) => (
          <Grid item xs={12} key={email.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{email.sender}</Typography>
                <Typography variant="body2">{email.content}</Typography>
              </CardContent>
              <CardActions>
                <Typography variant="button" style={{ marginLeft: 'auto', color: getCategoryColor(email.category) }}>
                  {email.category}
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Important':
      return 'green';
    case 'Promotions':
      return 'blue';
    case 'Social':
      return 'purple';
    case 'Marketing':
      return 'orange';
    case 'Spam':
      return 'red';
    case 'General':
      return 'gray';
    case 'Rate Limit Exceeded':
      return 'gray';
    default:
      return 'black';
  }
};

export default Classify;
