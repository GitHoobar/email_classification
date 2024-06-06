'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Importing useRouter from next/navigation
import { Container, Button, Typography, Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions, Grid } from '@mui/material';
import { fetchEmails, classifyEmails } from '@/utils/emailApi';

interface Email {
  id: string;
  sender: string;
  content: string;
  category: string;
}

const Classify: React.FC = () => {
  const { data: session, status } = useSession();
  const [numEmails, setNumEmails] = useState<number>(3);
  const [emails, setEmails] = useState<Email[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      handleUnauthenticated();
    } else if (session) {
      fetchAndClassifyEmails();
    }
  }, [status, session, numEmails]);

  const handleUnauthenticated = () => {
    router.push('/api/auth/signin');
  };

  const fetchAndClassifyEmails = async () => {
    try {
      const fetchedEmails = await fetchEmails(session, numEmails);
      const apiKey = localStorage.getItem('openai_api_key');
      if (apiKey) {
        const classifiedEmails = await classifyEmails(fetchedEmails, apiKey);
        setEmails(classifiedEmails);
      } else {
        console.error('OpenAI API key not found');
      }
    } catch (error) {
      console.error('Error fetching and classifying emails:', error);
    }
  };

  const getCategoryColor = (category: string): string => {
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

export default Classify;
