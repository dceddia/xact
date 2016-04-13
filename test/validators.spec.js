var validators = require('../validators');
var expect = require('chai').expect;
var should = require('chai').should();

describe('getTransactionType', function() {
  it('supports "credit"', function() {
    validators.getTransactionType('credit').name.should.eq('credit');
  });
  it('supports prefixes', function() {
    validators.getTransactionType('c').name.should.eq('credit');
    validators.getTransactionType('cre').name.should.eq('credit');
  });
});

describe('buildTransaction', function() {
  it('builds a "credit" transaction given all required params', function() {
    var args = {_: ['credit', 'Lunch', '9.53', 'Expenses:Food:Lunch']} 
    var txn = validators.buildTransaction(args);
    txn.fromAccount.should.eq('Liabilities:Credit Card:CapitalOne');
    txn.reason.should.eq('Lunch');
    txn.amount.should.eq('9.53');
    txn.toAccount.should.eq('Expenses:Food:Lunch');
  });

  function testThatItThrows(error, withArgs) {
    expect(() => {
      validators.buildTransaction(withArgs);
    }).to.throw(error);
  }

  it('throws an error if the transaction is invalid', () => {
    var args = {_: ['credit', 'Lunch', '9.53']} 
    testThatItThrows(/Usage:/, args);
  });

  it('throws if no transaction type is found', () => {
    var args = {_: ['invalid']} 
    testThatItThrows(/Transaction type/i, args);
  });

  it('throws if no arguments are provided', () => {
    var args = {_: []} 
    testThatItThrows(/at least one/, args);
  });

  it('throws if amount is not valid', () => {
    var args = {_: ['credit', 'Lunch', 'x9.53', 'Valid:Account']} 
    testThatItThrows(/invalid amount/i, args);
  });

  it('throws if amount is negative', () => {
    var args = {_: ['credit', 'Lunch', -9.53, 'Valid:Account']} 
    testThatItThrows(/should be positive/i, args);
  });

  it('throws if amount is 0', () => {
    var args = {_: ['credit', 'Lunch', 0, 'Valid:Account']} 
    testThatItThrows(/should be positive/i, args);
  });

  it('throws if toAccount is a top-level account', () => {
    var args = {_: ['credit', 'Lunch', '9.53', 'VeryHighLevel']} 
    testThatItThrows(/top-level account/, args);
  });
});
