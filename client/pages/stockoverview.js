import React, { useState } from 'react';
import { Tabs, Tab, TextField, Button, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import NavBar from './navbar'
import styles from '../src/app/page.module.css'
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const config = require('../src/app/config.json');

export default function StockAnalysis() {
    const [tabIndex, setTabIndex] = useState(0); // State to manage active tab index

    // State variables for input fields
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [ticker, setTicker] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [specificTicker, setSpecificTicker] = useState('');
    const [specificYear, setSpecificYear] = useState('');
    const [specificQuarter, setSpecificQuarter] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0); // State to manage selected index
    const [data, setData] = useState([]);


    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const handleStartDateChange = (event) => {
        console.log(event.target.value)
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    const handleTimeframeAnalysisSearch = async () => {
        try {
            let responseData;
            switch (selectedIndex) {
                case 0:
                    // Fetch data for top performing stocks
                    const topStockResponse = await axios.get(`http://${config.server_host}:${config.server_port}/topstock?start_date=${startDate}&end_date=${endDate}`);
                    responseData = topStockResponse.data.data;
                    console.log(startDate)
                    console.log(' top stock data: ' + responseData)
                    break;
                case 1:
                    // Fetch data for most traded stocks
                    const tradedStockResponse = await axios.get(`http://${config.server_host}:${config.server_port}/tradedstock?start_date=${startDate}&end_date=${endDate}`);
                    responseData = tradedStockResponse.data;
                    break;
                case 2:
                    // Fetch data for most volatile stocks
                    const volatileStockResponse = await axios.get(`http://${config.server_host}:${config.server_port}/volatilestock?start_date=${startDate}&end_date=${endDate}`);
                    responseData = volatileStockResponse.data;
                    break;
                case 3:
                    const priceResponse = await axios.get(`http://${config.server_host}:${config.server_port}/price_trend/${ticker}?start_date=${startDate}&end_date=${endDate}`);
                    responseData = priceResponse.data;
                    break;
                default:
                    responseData = [];
                    break;
            }

            if (responseData == undefined || JSON.stringify(responseData) == '{}') {
              alert('Bad input');
          }
            // Use responseData to populate the table
            // Update state or renderResultsTable to display fetched data in the table
            console.log(responseData)
            setData(responseData)
        } catch (error) {
            // Handle error
            console.error("Error fetching data:", error);
            alert('Bad input');
        }
    };

    const handleSpecificStockSearch = async () => {
        try {
            let responseData = [];
            switch (selectedIndex) {
                // Other cases handling

                case 1: // Stock News
                    console.log(ticker)
                    const stockNewsResponse = await axios.get(`http://${config.server_host}:${config.server_port}/stock_news/${specificTicker}`);
                    responseData = stockNewsResponse.data;
                    break;

                case 4: // Profit and Loss Statement
                    console.log("quarter: " + specificQuarter)
                    const profitLossResponse = await axios.get(`http://${config.server_host}:${config.server_port}/profit_and_loss_statement/${specificTicker}?year=${specificYear}&quarter=${specificQuarter}`);
                    responseData = profitLossResponse.data;
                    break;

                case 0: // Balance Sheet
                    const balanceSheetResponse = await axios.get(`http://${config.server_host}:${config.server_port}/balance_sheet/${specificTicker}?year=${specificYear}&quarter=${specificQuarter}`);
                    responseData = balanceSheetResponse.data;
                    break;

                case 3: // Market Share
                    console.log("market share query")
                    const marketShareResponse = await axios.get(`http://${config.server_host}:${config.server_port}/market_share/${specificTicker}`);
                    responseData = marketShareResponse.data;
                    console.log(responseData)
                    break;

                default:
                    break;
            }
            setData(responseData);
            console.log(responseData);

            if (responseData == undefined || JSON.stringify(responseData) == '{}') {
              alert('Bad input');
          }

            // Use responseData to populate the table
            // Update state or renderResultsTable to display fetched data in the table
        } catch (error) {
            // Handle error
            alert('Bad input');
            console.error("Error fetching data:", error);
        }
    };

    const renderTabContent = (index) => {
        switch (index) {
            case 0: // Timeframe Analysis Tab
                return (
                    <Box>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{ mr: 1 }} // Add margin to the input field
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{ mr: 1 }} // Add margin to the input field
                    />
                    <TextField
                      label="Option"
                      select
                      value={tabIndex === 0 ? selectedIndex : ''}
                      onChange={(e) => setSelectedIndex(e.target.value)}
                      sx={{ mr: 1 }}
                    >
                      <MenuItem value={0}>Top Stocks</MenuItem>
                      <MenuItem value={1}>Traded Stocks</MenuItem>
                      <MenuItem value={2}>Volatile Stocks</MenuItem>
                      <MenuItem value={3}>Price Trend</MenuItem>
                    </TextField>
                    {selectedIndex === 3 && ( // Show Ticker box if Price Trend is selected
                      <TextField
                        label="Ticker"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                      />
                    )}
                    <Button variant="contained" onClick={handleTimeframeAnalysisSearch}>
                      Search
                    </Button>
                    {/* Table to display results */}
                  </Box>
                );
                case 1: // Specific Stock Tab
                return (
                    <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                        label="Ticker"
                        value={specificTicker}
                        onChange={(e) => setSpecificTicker(e.target.value)}
                        sx={{ mr: 1 }}
                        />
                        {selectedIndex !== undefined && selectedIndex % 4 === 0 && (
                        <>
                            <TextField
                            label="Year"
                            value={specificYear}
                            onChange={(e) => setSpecificYear(e.target.value)}
                            sx={{ mr: 1 }}
                            />
                            <TextField
                            select
                            label="Quarter"
                            value={specificQuarter}
                            onChange={(e) => setSpecificQuarter(e.target.value)}
                            sx={{ mr: 1 }}
                            >
                            <MenuItem value="Q1">Q1</MenuItem>
                            <MenuItem value="Q2">Q2</MenuItem>
                            <MenuItem value="Q3">Q3</MenuItem>
                            <MenuItem value="Q4">Q4</MenuItem>
                            </TextField>
                        </>
                        )}
                        <TextField
                        label="Option"
                        select
                        value={tabIndex === 2 ? selectedIndex : ''}
                        onChange={(e) => setSelectedIndex(e.target.value)}
                        sx={{ mr: 1 }}
                        >
                        <MenuItem value={0}>Balance Sheet</MenuItem>
                        <MenuItem value={1}>Stock News</MenuItem>
                        <MenuItem value={3}>Market Share</MenuItem>
                        <MenuItem value={4}>Profit and Loss Statement</MenuItem>
                        </TextField>
                    </Box>
                    <Button variant="contained" onClick={handleSpecificStockSearch} sx={{ mt: 1 }}>
                        Search
                    </Button>
                    {/* Table to display results */}
                    </Box>
                );
            default:
                return null;
        }
    };
    const renderTableHeaders = () => {
        let headers = null;

        if (!Array.isArray(data)) {
          headers = data ? Object.keys(data) : null;
        } else {
          if (data && data.length > 0) {
            headers = Object.keys(data[0]);
          }
        }

        if (headers && headers !== undefined) {
          return (
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index}><b>{header}</b></TableCell>
                ))}
              </TableRow>
            </TableHead>
          );
        } else {
          return null;
        }
      };
    const renderResultsTable = () => {
        if (!Array.isArray(data)) {
            // If data is a singular object, create a single table row
            if (!(data === undefined) && data) {
                return (
                    <TableRow>
                        {Object.values(data).map((cell, idx) => (
                            <TableCell key={idx}>{cell}</TableCell>
                        ))}
                    </TableRow>
                );
            }
        }

        // If data is an array of objects, render each object as a table row
        if (!data || typeof data !== 'object' || data === undefined) {
            return null;
          }

          return (
            <>
              {data.map((item, index) => (
                <TableRow key={index}>
                  {Object.keys(item).map((key, i) => (
                    <TableCell key={i}>{item[key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          );
    };

    const renderResults = () => {
        if (tabIndex === 0 && selectedIndex === 3) { // Check if on "Timeframe Analysis" tab and "Price Trend" option
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid stroke="#f5f5f5" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          );
        } else {
          return (
            <TableContainer>
              <Table>
                {/* Render table headers based on fetched data */}
                {renderTableHeaders()}
                {/* Render table rows based on fetched data */}
                <TableBody>
                  {renderResultsTable()}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }
      };

    return (
        <div>
            <NavBar />
            <Box>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Timeframe Analysis" />
                    <Tab label="Specific Stock" />
                </Tabs>
                <Typography variant="h5" mb={2}>
                    {tabIndex === 0 && 'Timeframe Analysis Content'}
                    {tabIndex === 1 && 'Specific Stock Content'}
                </Typography>
                {renderTabContent(tabIndex)}
                <TableContainer>
                    <Table>
                        {/* Render table headers based on fetched data */}
                        {/* Render table rows based on fetched data */}
                        {renderResults()}
                    </Table>
                </TableContainer>
            </Box>
        </div>
    );
}