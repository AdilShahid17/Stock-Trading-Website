import Image from 'next/image'
import styles from '../src/app/page.module.css'
import {ReactComponentElement, useState} from 'react';
import { TextField, Button, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';


const config = require('../src/app/config.json');
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    console.log("test")
    e.preventDefault();
    console.log("test2")
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
        router.push({
            pathname: '/portfolio',
            query: { data: JSON.stringify(userData) }, // Include userData in the query parameter
          });
      } else {
        // Handle authentication failure (e.g., show error message)
        console.log('Authentication failed');
        alert('Invalid login');
      }
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Error during login:', error);
      alert('Invalid login');
    }
  };

  const handleCreateAccount = () => {
    router.push('/createaccount');
  };

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
          <Button onClick={handleLogin}type="submit" variant="contained" color="primary">
            Login
          </Button>
        </form>
        <div>{/* Show error message if needed */}</div>
      </div>
    </main>
  );
}