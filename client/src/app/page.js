'use client'
import Image from 'next/image'
import styles from './page.module.css'
import {ReactComponentElement, useState} from 'react';
import { TextField, Button, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const config = require('./config.json');

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`http://${config.server_host}:${config.server_port}/signin`, {
        params: {
          username: username,
          password: password,
        },
      });

      const userData = response.data;
      console.log(userData);

      if (Object.keys(userData).length > 0) {
        // User authenticated successfully, redirect to home page or user dashboard
        router.push('/home2');
      } else {
        // Handle authentication failure (e.g., show error message)
        console.log('Authentication failed');
      }
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Error during login:', error);
    }
  };

  const handleCreateAccount = () => {
    router.push('/createaccount');
  };

  router.push('/home2')
  return (
    <main className={styles.main}>
      <div>
        <h1>Welcome</h1>
        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // ... (other input props)
          />
          <br />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // ... (other input props)
          />
          <br />
          <Button type="submit" variant="contained" color="primary">
            Login
          </Button>
          <Button onClick={handleCreateAccount} variant="contained" color="secondary">
            Create Account
          </Button>
        </form>
        <div>{/* Show error message if needed */}</div>
      </div>
    </main>
  );
}
