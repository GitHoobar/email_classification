'use client';

import { signIn } from 'next-auth/react';
import { Container, Button, Typography } from '@mui/material';

const SignIn = () => {
  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Sign in
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => signIn('google', { callbackUrl: '/' })}
      >
        Sign in with Google
      </Button>
    </Container>
  );
};

export default SignIn;
