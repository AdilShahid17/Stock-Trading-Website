# Stock Trading Website (Equity Eagle)

## Overview
Equity eagle is a website designed to help investors to gain insights on the stock market. The application has two goals, to allow investors to view trends in the general stock market as well as the performance of their own portfolio. To this end the application breaks data down between stocks and Exchange Traded Funds (which are company managed portfolios composed of other stocks). Users can view price trends, correlation between stock prices, company financial statements etc. If they log in they can view a portfolio page where the performance of their own investments can be viewed. Currently user login and data is artificially generated but the app lays the groundwork for an account creation feature (which would require given users update access). 

## Preprocessing
Please view the README_Preprocessing.md file under the preprocessing folder, or the notebook detailing the process.

## How to run
To start the server, from the root directory go to `cd server/server` then run `npm start`.
Then, on another terminal, from the root directory go to `cd client` then run `npm run dev` and follow the link.

## Folders
The `client` folder holds all the code related to the frontend and client. The `server` folder contains the code for the backend.

## Dependencies
For our project, we used a _MySQL_ database, _Next.js_ client, _Node.js_ backend, and _Express.js_.
