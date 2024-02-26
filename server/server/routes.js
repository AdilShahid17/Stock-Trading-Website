const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly


const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));


// Route 1: GET /signin
const signin = async function(req, res) {
  const username = req.query.username;
  const password = req.query.password;
  console.log(username);
  console.log(password);

  connection.query(`
    SELECT id, first_name, last_name, balance
    FROM Users
    WHERE email = '${username}' AND password = '${password}'`,
    (err, data) => {
        if (err || data.length == 0) {
          console.log("error");
          res.json({});
        } else {
          console.log("redirect");
          res.json(data[0]);
        }
    }
  );
}

// Route 2: GET /topstock
const topstock = async function(req, res) {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const etf = req.query.etf ?? 'Y'
  connection.query(`
    WITH StartPrices AS (
      SELECT sp.Ticker, sp.Close AS StartClose
      FROM SecurityPrices sp
      JOIN Securities s ON sp.Ticker = s.Ticker
      WHERE s.ETF = '${etf}' AND sp.Date = '${start_date}'
    ),
    EndPrices AS (
    SELECT sp.Ticker, sp.Close AS EndClose
    FROM SecurityPrices sp
    JOIN Securities s ON sp.Ticker = s.Ticker
    WHERE s.ETF = '${etf}' AND sp.Date = '${end_date}'
    )
    SELECT st.Ticker, st.Name, ((ep.EndClose - sp.StartClose) / sp.StartClose) * 100 AS Appreciation
    FROM StartPrices sp
    JOIN EndPrices ep ON sp.Ticker = ep.Ticker
    JOIN StockInfo st ON sp.Ticker = st.Ticker
    ORDER BY Appreciation DESC
    LIMIT 25
    `,
    (err, data) => {
        if (err || data.length == 0) {
          console.log("error");
          console.log(err)
          res.json({});
        } else {
          res.json({data})
        }
    }
  );
}

// Route 3: GET /tradedstock
const tradedstock = async function(req, res) {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const etf = req.query.etf ?? 0
  connection.query(`
  SELECT sp.Ticker, s.Name, SUM(sp.Volume) AS TotalVolume
  FROM SecurityPrices sp
  JOIN Securities s ON sp.Ticker = s.Ticker
  WHERE date BETWEEN '${start_date}' AND '${end_date}' AND s.ETF = ${etf}
  GROUP BY sp.Ticker, s.Name
  ORDER BY TotalVolume DESC
  LIMIT 10;
  `, (err, data) => {
    if (err || data.length == 0) {
      console.log("error");
      res.json({});
    } else {
      res.json(data)
    }
  });

}

// Route 4: GET /volatilestock
const volatilestock = async function(req, res) {
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const etf = req.query.etf ?? 'Yes'
  connection.query(`
  WITH DailyVolatility AS (
    SELECT sp.Ticker,DATE(sp.Date) AS Date,(sp.High - sp.Low) AS DailyRange
    FROM SecurityPrices sp
    WHERE sp.Date BETWEEN '${start_date}' AND '${end_date}'
  )
  SELECT dv.Ticker,s.Name,STDDEV(dv.DailyRange) AS Volatility
  FROM DailyVolatility dv
  JOIN Securities s ON dv.Ticker = s.Ticker
  WHERE s.ETF = '${etf}'
  GROUP BY dv.Ticker, s.Name
  ORDER BY Volatility DESC
  LIMIT 25
  `, (err, data) => {
    if (err || data.length == 0) {
      console.log("error");
      res.json({});
    } else {
      res.json(data)
    }
  });
}

// Route 5: GET /most_valued_companies
const most_valued_companies = async function(req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      SELECT name, market_cap
      FROM StockInfo
      ORDER BY market_cap DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    const offset = pageSize * (page-1);

    connection.query(`
      SELECT name, market_cap
      FROM StockInfo
      ORDER BY market_cap DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}

// Route 6: GET /correlation
const correlation = async function(req, res) {
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
    WITH TopStocks AS (
      SELECT DISTINCT sp.Ticker
      FROM SecurityPrices sp
      JOIN Securities s ON s.Ticker = sp.Ticker
      WHERE ETF = 0
      GROUP BY Ticker
      ORDER BY SUM(Volume) DESC
      LIMIT 10
    ),
    PriceChanges AS (
        SELECT SP.Date, SP.Ticker, (SP.Close - LAG(SP.Close) OVER (PARTITION BY SP.Ticker ORDER BY SP.Date)) / LAG(SP.Close) OVER (PARTITION BY SP.Ticker ORDER BY SP.Date) AS PriceChange
        FROM SecurityPrices SP
        JOIN TopStocks TS ON SP.Ticker = TS.Ticker
    ),
    CorrelationData AS (
        SELECT
            PC1.Ticker AS Ticker1,
            PC2.Ticker AS Ticker2,
            AVG(PC1.PriceChange * PC2.PriceChange) AS Covariance,
            STDDEV(PC1.PriceChange) AS StdDev1,
            STDDEV(PC2.PriceChange) AS StdDev2
        FROM PriceChanges PC1
        JOIN PriceChanges PC2 ON PC1.Date = PC2.Date AND PC1.Ticker < PC2.Ticker
        GROUP BY PC1.Ticker, PC2.Ticker
    )
    SELECT
        S1.Name AS Stock1_Name,
        S2.Name AS Stock2_Name,
        CD.Covariance / (CD.StdDev1 * CD.StdDev2) AS CorrelationCoefficient
    FROM CorrelationData CD
    JOIN Securities S1 ON CD.Ticker1 = S1.Ticker
    JOIN Securities S2 ON CD.Ticker2 = S2.Ticker
    ORDER BY CorrelationCoefficient DESC
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  } else {
    const offset = pageSize * (page-1);

    connection.query(`
    WITH TopStocks AS (
      SELECT DISTINCT sp.Ticker
      FROM SecurityPrices sp
      JOIN Securities s ON s.Ticker = sp.Ticker
      WHERE ETF = 0
      GROUP BY Ticker
      ORDER BY SUM(Volume) DESC
      LIMIT 10
    ),
    PriceChanges AS (
        SELECT SP.Date, SP.Ticker, (SP.Close - LAG(SP.Close) OVER (PARTITION BY SP.Ticker ORDER BY SP.Date)) / LAG(SP.Close) OVER (PARTITION BY SP.Ticker ORDER BY SP.Date) AS PriceChange
        FROM SecurityPrices SP
        JOIN TopStocks TS ON SP.Ticker = TS.Ticker
    ),
    CorrelationData AS (
        SELECT
            PC1.Ticker AS Ticker1,
            PC2.Ticker AS Ticker2,
            AVG(PC1.PriceChange * PC2.PriceChange) AS Covariance,
            STDDEV(PC1.PriceChange) AS StdDev1,
            STDDEV(PC2.PriceChange) AS StdDev2
        FROM PriceChanges PC1
        JOIN PriceChanges PC2 ON PC1.Date = PC2.Date AND PC1.Ticker < PC2.Ticker
        GROUP BY PC1.Ticker, PC2.Ticker
    )
    SELECT
        S1.Name AS Stock1_Name,
        S2.Name AS Stock2_Name,
        CD.Covariance / (CD.StdDev1 * CD.StdDev2) AS CorrelationCoefficient
    FROM CorrelationData CD
    JOIN Securities S1 ON CD.Ticker1 = S1.Ticker
    JOIN Securities S2 ON CD.Ticker2 = S2.Ticker
    ORDER BY CorrelationCoefficient DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data);
      }
    });
  }
}


// Route 7: GET /price_trend/:ticker
const price_trend = async function(req, res) {
  connection.query(`
  SELECT date, close
  FROM SecurityPrices
  WHERE ticker = '${req.params.ticker}'
  AND date >= '${req.query.start_date}'
  AND date <= '${req.query.end_date}'
  ORDER BY date ASC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 8: GET /stock_news/:ticker
const stock_news = async function(req, res) {
  console.log(req.params.ticker);
  connection.query(`
    SELECT Headline, Date
    FROM FinancialNews
    WHERE Ticker = '${req.params.ticker}'
    ORDER BY Date DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 9: GET /profit_and_loss_statement/:ticker
const profit_and_loss_statement = async function(req, res) {
  connection.query(`
SELECT year, quarter,
SUM(CASE WHEN indicator = 'Final Revenue' THEN amount ELSE 0 END) AS Revenue,
SUM(CASE WHEN indicator = 'Gross Profit' THEN amount ELSE 0 END) AS GrossProfit,
SUM(CASE WHEN indicator = 'Operating Income (Loss)' THEN Amount ELSE 0 END) AS
OperatingIncome,
SUM(CASE WHEN indicator = 'Net Income (Loss)' THEN Amount ELSE 0 END) AS NetIncome
FROM StockFinancials
WHERE ticker = '${req.params.ticker}'
AND year = '${req.query.year}'
AND quarter = '${req.query.quarter}'
GROUP BY year, quarter;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 10: GET /balance_sheet/:ticker
const balanceSheet = async function(req, res) {

  connection.query(`
SELECT
Year,
Quarter,
SUM(CASE WHEN Indicator = 'Assets' THEN Amount ELSE 0 END) AS TotalAssets,
SUM(CASE WHEN Indicator = 'Cash and Cash Equivalents, at Carrying Value' THEN Amount ELSE 0 END) AS CashAndCashEquivalents,
SUM(CASE WHEN Indicator = 'Total Liabilities and Equity' THEN Amount ELSE 0 END) AS TotalLiabilitiesAndEquity,
SUM(CASE WHEN Indicator = 'Total Equity' THEN Amount ELSE 0 END) AS TotalEquity
FROM StockFinancials
WHERE Ticker = '${req.params.ticker}'
AND year = '${req.query.year}'
AND quarter = '${req.query.quarter}'
GROUP BY Year, Quarter;
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 11: GET /market_share/:ticker
const marketShare = async function(req, res) {

  connection.query(`
  WITH IndustryRevenue AS (
      SELECT s.Industry, SUM(sf.Amount) AS TotalIndustryRevenue
      FROM StockFinancials sf
      JOIN StockInfo s ON sf.Ticker = s.Ticker
      WHERE sf.Indicator = 'Final Revenue'
      GROUP BY s.Industry
  ),
  CompanyRevenue AS (
      SELECT s.Industry, sf.Ticker, SUM(sf.Amount) AS CompanyRevenue
      FROM StockFinancials sf
      JOIN StockInfo s ON sf.Ticker = s.Ticker
      WHERE sf.Indicator = 'Final Revenue'
      GROUP BY s.Industry, sf.Ticker
  )
  SELECT
      ir.Industry,
      cr.Ticker,
      (cr.CompanyRevenue / ir.TotalIndustryRevenue) * 100 AS MarketSharePercentage
  FROM CompanyRevenue cr
  JOIN IndustryRevenue ir ON cr.Industry = ir.Industry
  WHERE cr.Ticker = '${req.params.ticker}'
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 12: GET /user_worth/:user_id
const userWorth = async function(req, res) {
  connection.query(`
  WITH CurrentlyOwned AS (
    SELECT UserID, Ticker, SUM(IF(Type = 'BUY', Quantity, -Quantity)) AS NetQuantity
    FROM Transactions
    WHERE UserID = ${req.params.user_id}
    GROUP BY UserID, Ticker
    HAVING NetQuantity > 0
  )
  SELECT u.first_name, u.last_name, SUM(co.NetQuantity * sp.Close) AS worth
  FROM Users AS u
  JOIN CurrentlyOwned co ON u.id = co.UserID
  JOIN (
    SELECT Ticker, MAX(Date) AS MaxDate
    FROM SecurityPrices
    GROUP BY Ticker
  ) max_date ON co.Ticker = max_date.Ticker
  JOIN SecurityPrices sp ON co.Ticker = sp.Ticker AND max_date.MaxDate = sp.Date
  GROUP BY u.first_name, u.id, u.last_name;
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 13: GET /news_recommendation/:ticker
const newsRecommendation = async function(req, res) {
  const industry_limit = req.query.industry_limit ? req.query.industry_limit : 5;
  const limit = req.query.limit ? req.query.limit : 20;

  connection.query(`
    WITH TopIndustries AS (
        SELECT Industry
        FROM Transactions
        JOIN StockInfo ON Transactions.Ticker = StockInfo.ticker
        WHERE UserID = '${req.params.user_id}'
        GROUP BY Industry
        ORDER BY SUM(ABS(Quantity)) DESC
        LIMIT ${industry_limit}
    ),
    Positive AS (
        SELECT Industry
        From Transactions
        JOIN StockInfo ON Transactions.Ticker = StockInfo.ticker
        WHERE UserID = '${req.params.user_id}' AND Quantity > 0
        GROUP BY Industry
        ORDER BY SUM(Quantity) DESC
        LIMIT ${industry_limit}
    )
    SELECT DISTINCT date, Headline, FinancialNews.ticker
    FROM FinancialNews
    JOIN StockFinancials ON FinancialNews.Ticker = StockFinancials.ticker
    WHERE FinancialNews.Ticker IN (
        SELECT StockInfo.ticker
        FROM StockInfo
        JOIN Transactions ON Transactions.Ticker = StockInfo.ticker
        WHERE Industry IN (
            SELECT industry
            FROM TopIndustries
        )
    ) OR FinancialNews.ticker IN (
      SELECT StockInfo.ticker
        FROM StockInfo
        JOIN Transactions ON StockInfo.ticker = Transactions.Ticker
        WHERE Industry IN (
            SELECT industry
            FROM Positive
        )
    )
    ORDER BY date DESC
    LIMIT ${limit};
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 14: GET /net_worth/:user_id
const netWorth = async function(req, res) {
  connection.query(`
  WITH
  # View for negative quantities when selling / positive when buying
  NegativeQuantities AS (
    SELECT
        Transactions.Date,
        Transactions.Ticker,
        (
            IF(Type = 'BUY', Quantity, -1 * Quantity)
        ) AS Quantity
    FROM Transactions
    WHERE UserID = '${req.params.user_id}'
    ORDER BY Transactions.Date
  ),
  # View with all dates and prices but only marginal quantities for each ticker
  # and the closing price for each
  MarginalQuantities AS (
    SELECT
        SecurityPrices.date,
        SecurityPrices.ticker,
        close,
        IF(
            EXISTS(
                SELECT *
                FROM NegativeQuantities
                WHERE SecurityPrices.Date = NegativeQuantities.Date
                  AND SecurityPrices.ticker = NegativeQuantities.Ticker
            ),
            Quantity,
            0
        ) AS IncrQ
    FROM SecurityPrices
    LEFT JOIN NegativeQuantities
        ON NegativeQuantities.Ticker = SecurityPrices.ticker AND
            NegativeQuantities.Date = SecurityPrices.date
    WHERE
        SecurityPrices.date >= (
            SELECT MIN(Date)
            FROM NegativeQuantities
        ) AND
        EXISTS(
            SELECT *
            FROM NegativeQuantities
            WHERE SecurityPrices.ticker = NegativeQuantities.Ticker
        )
    ORDER BY date, SecurityPrices.ticker
  ),
  # For each day, how much of each ticker does the person have (daily portfolio)
  AggregateQuantities AS (
    SELECT
        date,
        ticker,
        close,
        SUM(IncrQ) OVER (
            PARTITION BY ticker
            ORDER BY MarginalQuantities.Date
            ROWS BETWEEN
            UNBOUNDED PRECEDING AND
            CURRENT ROW
        ) AS AggQuantity
    FROM MarginalQuantities
    ORDER BY ticker, date
  )
  SELECT
    date,
    SUM(close * AggQuantity) AS NetWorth
  FROM AggregateQuantities
  GROUP BY date
  ORDER BY date
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// Route 15: GET /moving_avg/:user_id
const movingAvg = async function(req, res) {
  connection.query(`
  WITH TopStocks AS (
    SELECT DISTINCT Ticker
    FROM Transactions
    WHERE UserID = ${req.params.user_id}
    GROUP BY Ticker
    ORDER BY SUM(Quantity) DESC
    LIMIT 3
),
Prices as (
  select ticker, date, close
  from SecurityPrices
  WHERE ticker IN (select  * from TopStocks)
)
SELECT
  name as company,
sp.date,
AVG(close) OVER (PARTITION BY sp.ticker ORDER BY sp.date ROWS BETWEEN 30 PRECEDING AND CURRENT ROW) AS moving_average
FROM Prices as sp
JOIN StockInfo info ON sp.ticker = info.ticker
ORDER BY date
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data);
    }
  });
}

// Route 15: GET /stock_info/:ticker
const stockInfo = async function(req, res) {
  connection.query(`
  SELECT *
FROM StockInfo
WHERE ticker = '${req.params.ticker}'
  `,
  (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

module.exports = {
  signin,
  topstock,
  tradedstock,
  volatilestock,
  profit_and_loss_statement,
  stock_news,
  price_trend,
  correlation,
  most_valued_companies,
  balanceSheet,
  marketShare,
  userWorth,
  newsRecommendation,
  netWorth,
  movingAvg,
  stockInfo
}