import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

const ForgotPasswordPage = () => {
  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Forgot Password
      </Typography>
      <Box component="form" sx={{ mt: 2 }}>
        <TextField fullWidth label="Email" type="email" margin="normal" required />
        <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Send Reset Link
        </Button>
      </Box>
    </Paper>
  );
};

export default ForgotPasswordPage;
