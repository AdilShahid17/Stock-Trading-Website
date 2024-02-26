import React from 'react';
import { AppBar, Tabs, Tab } from '@mui/material';
import { useRouter } from 'next/router';
import styles from '../src/app/page.module.css'

const NavBar = () => {
  const router = useRouter();

  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        router.push('/home2');
        break;
      case 1:
        router.push('/login');
        break;
      case 2:
        router.push('/stockoverview');
        break;
      case 3:
        router.push('/etfoverview');
      default:
        break;
    }
  };

  return (
    <AppBar position="static">
      <Tabs onChange={handleChange}>
        <Tab label="Home" />
        <Tab label="My Portfolio/News" />
        <Tab label="Stock Overview"/>
        <Tab label="ETF Overview"/>
      </Tabs>
    </AppBar>
  );
};

export default NavBar;