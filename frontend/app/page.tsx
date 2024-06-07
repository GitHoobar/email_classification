'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, TextField, Typography, Alert } from '@mui/material';

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('api/auth/signin');
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }
    setError('');
    console.log('API Key:', apiKey);
    // Save the API key and navigate to email classification page
    localStorage.setItem('openai_api_key', apiKey);
    router.push('/classify');
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {session?.user?.name}
      </Typography>
      <Button variant="contained" color="secondary" onClick={() => signOut()} style={{ marginBottom: '1rem' }}>
        Sign out
      </Button>
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          fullWidth
          label="OpenAI API Key"
          variant="outlined"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '1rem' }}
        >
          Save API Key
        </Button>
      </form>
    </Container>
  );
};

export default Home;
