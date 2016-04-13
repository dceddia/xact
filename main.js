var validators = require('./validators');
var argv = require('minimist')(process.argv.slice(2));

var txn = validators.buildTransaction(argv);
console.log(validators.buildLedgerEntry(txn));
