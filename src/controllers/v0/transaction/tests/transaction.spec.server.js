const mongoose = require('mongoose');
const userModel = require('../models/user.model.server');
const transactionModel = require('../models/transaction.model.server');

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../server');
let uid = 0;
let tid = 0;

chai.use(chaiHttp);
describe('Transaction', () => {
  beforeEach((done) => {
    done();
  });
  before(done => {
      userModel.deleteMany({}).then(udata => {
        transactionModel.deleteMany({}).then(tdata => {
          const user = new userModel({
            username: 'AAA',
            password: 'AAA',
            balance: 100,
            threshold: 10
          });
          uid = user['_id'];
          user.save().then(usave => {
            done();
          });
        });
      });
  });
  after (done => {
    app.httpserver.close(function () {
      process.exit(0);
      done();
    });
  });
  it('Should GET 0 transactions', done => {
    chai.request(app)
    .get('/api/transaction/'+ uid)
    .end((err, res) => {
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(res.body).to.deep.equal([]);
      done();
    });
  });
  it('Should CREATE a new transaction', (done) => {
    let transaction = {
      uid: uid,
      description: "Movies",
      amount: 17.98,
      type: 'Debit',
      date: new Date()
    };
    chai.request(app)
    .post('/api/transaction/create/')
    .send(transaction)
    .end((err, res) => {
      chai.expect(res.status).to.equal(201);
      done();
    });
  });
  it('Should GET 1 transaction', done => {
    chai.request(app)
    .get('/api/transaction/'+ uid)
    .end((err, res) => {
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(res.body).to.have.lengthOf(1);
      done();
    });
  });
  it('Should GET updated balance', done => {
    chai.request(app)
    .get('/api/user/balance/'+ uid)
    .end((err, res) => {
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(res.body).to.deep.equal({balance: 82.02});
      done();
    });
  });
  it('Should CREATE a new transaction', (done) => {
    let transaction = {
      uid: uid,
      description: "Movies",
      amount: 200,
      type: 'Credit',
      date: new Date()
    };
    chai.request(app)
    .post('/api/transaction/create/')
    .send(transaction)
    .end((err, res) => {
      tid = res.body.tid;
      chai.expect(res.status).to.equal(201);
      done();
    });
  });
  it('Should GET updated balance', done => {
    chai.request(app)
    .get('/api/user/balance/'+ uid)
    .end((err, res) => {
      chai.expect(res.statusCode).to.equal(200);
      chai.expect(res.body).to.deep.equal({balance: 282.02});
      done();
    });
  });
  it('Should DELETE transaction', done => {
    chai.request(app)
    .delete('/api/transaction/delete/'+ tid)
    .end((err, res) => {
      chai.expect(res.statusCode).to.equal(200);
    })
  });
});