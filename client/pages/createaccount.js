import React from 'react';
import { TextField, Button } from '@mui/material';
import styles from '../src/app/page.module.css'

const config = require('../src/app/config.json');
export default function CreateAccount() {

  const handleCreateAccount = (e) => {
    // Create account logic
    // Validate username, password, and confirmation
  };

  return (
    <main className={styles.main}>
      <div>
        <h1>Create Account</h1>
        <form onSubmit={handleCreateAccount}>
          <TextField
            label="Choose Username"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Create Account
          </Button>
        </form>
      </div>
    </main>
  );
}