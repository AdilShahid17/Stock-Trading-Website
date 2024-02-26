const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');


const app = express();
app.use(cors({
  origin: '*',
}));



app.get('/signin', routes.signin);
app.get('/topstock', routes.topstock);
app.get('/tradedstock', routes.tradedstock);
app.get('/volatilestock', routes.volatilestock);
app.get('/most_valued_companies', routes.most_valued_companies);
app.get('/correlation', routes.correlation);
app.get('/price_trend/:ticker', routes.price_trend);
app.get('/stock_news/:ticker', routes.stock_news);
app.get('/profit_and_loss_statement/:ticker', routes.profit_and_loss_statement);
app.get('/balance_sheet/:ticker', routes.balanceSheet);
app.get('/market_share/:ticker', routes.marketShare);
app.get('/user_worth/:user_id', routes.userWorth);
app.get('/news_recommendation/:user_id', routes.newsRecommendation);
app.get('/net_worth/:user_id', routes.netWorth);
app.get('/moving_avg/:user_id', routes.movingAvg);
app.get('/stock_info/:ticker', routes.stockInfo);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
