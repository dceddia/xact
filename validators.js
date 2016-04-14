var dateFormat = require('dateformat-light');

var transactionTypes = [{
  name: 'credit',
  provides: {
    fromAccount: 'Liabilities:Credit Card:CapitalOne'
  }
}, {
  name: 'lunch',
  provides: {
    fromAccount: 'Liabilities:Credit Card:CapitalOne',
    reason: 'Lunch',
    toAccount: 'Expenses:Food:Lunch'
  }
}]

function getTransactionType(name) {
  var name = name.toLowerCase();

  var txTypes = transactionTypes.filter(tx => 
    tx.name.indexOf(name) === 0);

  return txTypes[0];
}

function buildTransaction(argv) {
  if(argv._.length === 0) {
    throw new Error("Requires at least one argument, a transaction type name");
  }

  var txType = getTransactionType(argv._[0]);

  if(!txType || !txType.provides) {
    var validTxTypes = transactionTypes.map(tx => `  ${tx.name}\n`);
    throw new Error("Transaction type found no matches: " + argv._[0] + "\n" + "Transaction types:\n" + validTxTypes);
  }

  var txn = {
    fromAccount: txType.provides.fromAccount,
    reason: txType.provides.reason,
    amount: txType.provides.amount,
    toAccount: txType.provides.toAccount
  };

  var nextArg = 1;
  txn.reason = txn.reason || argv._[nextArg++];
  txn.amount = txn.amount || argv._[nextArg++];
  txn.toAccount = txn.toAccount || argv._[nextArg++];

  if(!txn.reason || typeof txn.amount === 'undefined' || !txn.toAccount) {
    throw new Error("Usage: <txnType> reason amount toAccount");
  }

  if(isNaN(parseFloat(txn.amount))) {
    throw new Error("Invalid amount: " + txn.amount);
  }

  if(txn.amount <= 0) {
    throw new Error("Amount should be positive: " + txn.amount);
  }

  if(txn.toAccount.indexOf(':') === -1) {
    throw new Error("The 'to' account must be a sub account, like Expenses:Food, not a top-level account like Expenses.");
  }

  return txn;
}

function buildLedgerEntry(txn) {
  var entry = '';
  var todayDate = dateFormat(Date.now(), 'mm/dd/yyyy');
  var fromAccount = txn.fromAccount;

  // Pad the account with spaces
  while(fromAccount.length < 48) {
    fromAccount += ' ';
  }

  entry += `${todayDate} ${txn.reason}\n`;
  // Make the amount negative if it's not already
  if(txn.amount > 0) {
    txn.amount = -txn.amount;
  }
  entry += `  ${fromAccount}${txn.amount}\n`
  entry += `  ${txn.toAccount}\n`;

  return entry;
}

module.exports = {
  getTransactionType,
  buildTransaction,
  buildLedgerEntry
};
