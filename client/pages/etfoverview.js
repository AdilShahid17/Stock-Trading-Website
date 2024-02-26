import React, { useState } from 'react';
import { Tabs, Tab, TextField, Button, Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useRouter } from 'next/router';
import NavBar from './navbar';
import styles from '../src/app/page.module.css';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const config = require('../src/app/config.json');

export default function ETFOverview() {
    const [activeTab, setActiveTab] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);

    const handleTabChange = (event, newIndex) => {
        setActiveTab(newIndex);
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };

    const handleETFSearch = async () => {
        try {
            let responseData;
            console.log("hello")
            switch (activeTab) {
                case 0:
                    const topETFResponse = await axios.get(`http://${config.server_host}:${config.server_port}/topstock?start_date=${startDate}&end_date=${endDate}&etf=1`);
                    responseData = topETFResponse.data.data;
                    break;
                case 1:
                    console.log("traded etf")
                    const tradedETFResponse = await axios.get(`http://${config.server_host}:${config.server_port}/tradedstock?start_date=${startDate}&end_date=${endDate}&etf=1`);
                    responseData = tradedETFResponse.data;
                    console.log("traded etf finished")
                    break;
                case 2:
                    console.log("volatile etf")
                    const volatileETFResponse = await axios.get(`http://${config.server_host}:${config.server_port}/volatilestock?start_date=${startDate}&end_date=${endDate}&etf=1`);
                    responseData = volatileETFResponse.data;
                    console.log("volatile etf finished")
                    break;
                default:
                    responseData = [];
                    break;
            }
            if (responseData == undefined || JSON.stringify(responseData) == '{}') {
                alert('Bad input');
            }
            console.log("response: " + responseData)
            setData(responseData);
        } catch (error) {
            console.error("Error fetching data:", error);
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
            </TableContainer>)

    };

    return (
        <div>
            <NavBar />
            <Box>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Top ETFs" />
                    <Tab label="Traded ETFs" />
                    <Tab label="Volatile ETFs" />
                </Tabs>
                <Typography variant="h5" mb={2}>
                    {activeTab === 0 && 'Top ETFs Content'}
                    {activeTab === 1 && 'Traded ETFs Content'}
                    {activeTab === 2 && 'Volatile ETFs Content'}
                </Typography>
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
                <Button variant="contained" onClick={handleETFSearch}>
                    Search
                </Button>
                {renderResults()}
                {/* Render date inputs, search button */}
                {/* Render chart or table based on fetched data */}
                {/* Render table headers and rows */}
            </Box>
        </div>
    );
}