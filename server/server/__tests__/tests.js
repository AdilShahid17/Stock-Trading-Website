const { expect } = require('@jest/globals');
const supertest = require('supertest');
const app = require('../server');
const results = require("./results.json")
jest.setTimeout(1000000)

test('GET /signin', async () => {
  await supertest(app).get('/signin?username=test0@email.com&password=test0')
    .expect(200)
    .then((res) => {
      console.log(res);
      expect(res.body).toStrictEqual(results.signin);
    });
});

test('GET /signin Fail', async () => {
  await supertest(app).get('/signin?username=test0@gmail.com&password=test')
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({});
    });
});

test('GET /topstock', async () => {
  await supertest(app).get('/topstock?start_date=2010-07-12&end_date=2016-07-12')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.topstock);
    });
});

test('GET /topstock error', async () => {
  await supertest(app).get('/topstock?start_date=2030-07-12&end_date=2040-07-12')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual({});
    });
});

test('GET /tradedstock', async () => {
  await supertest(app).get('/tradedstock?start_date=2010-07-12&end_date=2016-07-12')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.tradedstock)
    });
});

test('GET /tradedstock error', async () => {
  await supertest(app).get('/tradedstock?start_date=2050-07-12&end_date=2060-07-12')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual({})
    });
});

test('GET /volatilestock', async () => {
  await supertest(app).get('/volatilestock?start_date=2010-07-12&end_date=2016-07-12')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.volatilestock)
    });
});

test('GET /volatilestock error', async () => {
  await supertest(app).get('/volatilestock?start_date=2040-07-12&end_date=2050-07-12')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual({})
    });
});

test('GET /most_valued_companies', async () => {
  await supertest(app).get('/most_valued_companies')
    .expect(200)
    .then((res) => {
      expect(res.body[0]).toStrictEqual(results.nopagevalue)
    });
});

test('GET /most_valued_companies error', async () => {
  await supertest(app).get('/most_valued_companies?page=1000')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual([])
    });
});

test('GET /most_valued_companies page and page size', async () => {
  await supertest(app).get('/most_valued_companies?page=2&page_size=5')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.valuecompanies)
    });
});

test('GET /price_trend/:ticker', async () => {
  await supertest(app).get('/price_trend/AAPL?start_date=2010-07-12&end_date=2010-07-20')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.pricetrend)
    });
});

test('GET /stock_news/:ticker', async () => {
  await supertest(app).get('/stock_news/AAPL')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toEqual(469)
      expect(res.body[0]).toStrictEqual(results.stocknews)
    });
});

test('GET /stock_news/:ticker error', async () => {
  await supertest(app).get('/stock_news/PPPP')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual({})
    });
});

test('GET /correlation', async () => {
  await supertest(app).get('/correlation?page_size=1')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toStrictEqual(45)
    });
});



test('GET /profit_and_loss_statement/:ticker', async () => {
  await supertest(app).get('/profit_and_loss_statement/AAPL?year=2014&quarter=Q1')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.profitandloss)
    });
});

test('GET /balance_sheet/:ticker', async () => {
  await supertest(app).get('/balance_sheet/AAPL?year=2014&quarter=Q1')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.balancesheet)
    });
});

test('GET /market_share/:ticker', async () => {
  await supertest(app).get('/market_share/AAPL')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.marketshare)
    });
});

test('GET /user_worth/:user_id', async () => {
  await supertest(app).get('/user_worth/0')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.userworth)
    });
});

test('GET /net_worth/:user_id', async () => {
  await supertest(app).get('/net_worth/test0@email.com')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toStrictEqual(9040)
      expect(res.body[1]).toStrictEqual(results.networth)
    });
});

test('GET /news_recommendation', async () => {
  await supertest(app).get('/news_recommendation/test0@email.com?')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual(results.newsrecs);
    });
});

test('GET /stock_info', async () => {
  await supertest(app).get('/stock_info/AAPL')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual([{
        "CEO": "Timothy D. Cook",
        "description": "Apple Inc is designs, manufactures and markets mobile communication and media devices and personal computers, and sells a variety of related software, services, accessories, networking solutions and third-party digital content and applications.",
        "exchange": "Nasdaq Global Select",
        "industry": "Computer Hardware",
        "market_cap": 807491700000,
        "name": "Apple",
        "ticker": "AAPL",
        "website": "http://www.apple.com",

      }]);
    });
});

test('GET /moving_avg', async () => {
  await supertest(app).get('/moving_avg/0')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toStrictEqual(14762);
      expect(res.body[0]).toStrictEqual({"company": "Copart", "date": "1994-03-17T05:00:00.000Z", "moving_average": 0.61});
    });
});

test('GET /correlation page', async () => {
  await supertest(app).get('/correlation?page_size=1&page=1')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toStrictEqual(1)
    });
});