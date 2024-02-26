import React, { useState, useEffect } from 'react';
import { Button, MenuItem, Box, TextField, AppBar, Tabs, Tab, Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { useRouter } from 'next/router';
import NavBar from './navbar'
import styles from '../src/app/page.module.css'
import axios from 'axios';

const config = require('../src/app/config.json');
export default function Home2() {
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newsRecommendations, setNewsRecommendations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [data, setData] = useState([])

  const handleRealtimeStatsSearch = async () => {
    try {
      let response;
      if (tabIndex === 0) {
        response = await axios.get(`http://${config.server_host}:${config.server_port}/most_valued_companies`, {
          params: {
            page: page,
            page_size: pageSize,
          },
        });
      }

      // Handle the response data based on the selected tab
      const responseData = response.data;
      setData(responseData);
      console.log(responseData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = async () => {
    try {
      let response;
      if (tabIndex === 1) {
        response = await axios.get(`http://${config.server_host}:${config.server_port}/correlation`, {
          params: {
            page: page,
            page_size: pageSize,
          },
        });

        const responseData = response.data;
        setData(responseData);
        console.log(responseData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (tabIndex === 0) {
      handleRealtimeStatsSearch(); // Automatically execute query for first tab
    }
  }, [tabIndex, page, pageSize]);

  return (
    <div>
      <NavBar />
      <h2>Home</h2>
      <Box>
        <TextField
          label="Page"
          type="number"
          value={page}
          onChange={(e) => setPage(e.target.value)}
          sx={{ mr: 1 }}
        />
        <TextField
          label="Page Size"
          type="number"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
          <Tab label="Most Valued Companies" />
          <Tab label="Correlation" />
        </Tabs>
        {tabIndex === 1 && (
          <Button variant="contained" onClick={handleSearch} sx={{ mt: 1 }}>
            Search
          </Button>
        )}
        {/* Table to display results */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* Table header cells based on the fetched data structure */}
                {tabIndex === 0 && (<>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Market Cap</b></TableCell>
                </>)}
                {tabIndex === 1 && (
                  <>
                    <TableCell><b>First Stock</b></TableCell>
                    <TableCell><b>Second Stock</b></TableCell>
                    <TableCell><b>Correlation Coefficient</b></TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Table body rows based on the fetched data */}
              {data.map((item, index) => (
                <TableRow key={index}>
                  {tabIndex === 0 && (
                    <>
                      <TableCell>{item['name']}</TableCell>
                      <TableCell>{item['market_cap']}</TableCell>
                    </>
                  )}
                  {tabIndex === 1 && (
                    <>
                      <TableCell>{item['Stock1_Name']}</TableCell>
                      <TableCell>{item['Stock2_Name']}</TableCell>
                      <TableCell>{item['CorrelationCoefficient']}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

    </div>
  );
}