# Preprocessing Steps

## Overview
For the preprocessing, besides simply removing NaN and Null values, we must ensure
consistency across the tables. We need to make sure that date columns are parsed
correctly and, in particular, we must assert that all tables have consistent
Ticker values. That is, since they come from different datasets, it could be
that some datasets only share some tickers with one another. Hence, we need to
find the common intersection of tickers across all datasets to ensure
consistency across tables.

Note that before anything, we needed to concatenate the `csv` files for the prices
of each ticker, since they came in separate files for each company. This was done in
the `csv_parser.py` script, which outputted the stock and etf files.

## 1. Read in files
First we read in all csv files according to the expected schema and remove any
rows containing NaN/Null values. We also ensure consistency for dates in this step,
and some basic individual preprocessing.

## 2. Find Ticker intersection
Now, we need to find the intersection of all tickers, for stocks and ETFs
separately. To do so, we find the intersection of things that use stocks
and the intersection of tables that use ETFs, storing the results in two
different pandas Series.

## 3. Filtering out tickers
With the desired tickers for each, we now filter out the rows that have
tickers not in the intersection series. To do so, we simply use a filter using
the `.isin()` method.

## 4. Validation
To validate our process, we must ensure that all tickers are consistent. That is,
that no ticker will be missing some data that was expected. Moreover, we can check if
the columns expected to be primary keys are unique and non-null to ensure that it
can be properly read into our table.

## 5. Export files
Finally, with the final dataframes for each table, we simply save them to `csv`
files to be imported into the _MySQL_ database.