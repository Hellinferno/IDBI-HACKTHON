const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { CUSTOMERS, generateTransactions } = require('./data');

describe('Mock Bank-Core', () => {
  it('should have customer data for CUST_001', () => {
    assert.ok(CUSTOMERS.CUST_001);
    assert.equal(CUSTOMERS.CUST_001.id, 'CUST_001');
    assert.ok(CUSTOMERS.CUST_001.accounts.length > 0);
  });

  it('should have customer data for CUST_002', () => {
    assert.ok(CUSTOMERS.CUST_002);
    assert.equal(CUSTOMERS.CUST_002.id, 'CUST_002');
  });

  it('should have savings accounts', () => {
    const acc = CUSTOMERS.CUST_001.accounts.find(a => a.type === 'savings');
    assert.ok(acc);
    assert.ok(acc.balance > 0);
  });

  it('should have demat accounts', () => {
    const acc = CUSTOMERS.CUST_001.accounts.find(a => a.type === 'demat');
    assert.ok(acc);
    assert.ok(acc.balance > 0);
  });
});

describe('generateTransactions', () => {
  it('should generate transactions with required fields', () => {
    const txns = generateTransactions('ACC_001', 5);
    assert.equal(txns.length, 5);
    for (const txn of txns) {
      assert.ok(txn.id);
      assert.ok(txn.accountId);
      assert.ok(typeof txn.amount === 'number');
      assert.ok(txn.direction === 'credit' || txn.direction === 'debit');
      assert.ok(txn.description);
      assert.ok(txn.txnDate);
      assert.ok(txn.sourceRef);
    }
  });

  it('should generate different amounts for different categories', () => {
    const txns = generateTransactions('ACC_001', 10);
    const amounts = [...new Set(txns.map(t => t.amount))];
    assert.ok(amounts.length > 1, 'Should have varied amounts');
  });

  it('should have chronological dates', () => {
    const txns = generateTransactions('ACC_001', 10);
    for (let i = 1; i < txns.length; i++) {
      assert.ok(txns[i].txnDate <= txns[i - 1].txnDate, 'Dates should be descending');
    }
  });

  it('should include both credits and debits', () => {
    const txns = generateTransactions('ACC_001', 20);
    const hasCredit = txns.some(t => t.direction === 'credit');
    const hasDebit = txns.some(t => t.direction === 'debit');
    assert.ok(hasCredit, 'Should have credits');
    assert.ok(hasDebit, 'Should have debits');
  });

  it('should include salary credits', () => {
    const txns = generateTransactions('ACC_001', 20);
    const salary = txns.find(t => t.description.includes('SALARY'));
    assert.ok(salary);
    assert.equal(salary.direction, 'credit');
    assert.ok(salary.amount >= 78000);
  });

  it('should include SIP investments', () => {
    const txns = generateTransactions('ACC_001', 20);
    const sip = txns.find(t => t.description.includes('SIP'));
    assert.ok(sip);
    assert.equal(sip.direction, 'debit');
  });

  it('should include rent payments', () => {
    const txns = generateTransactions('ACC_001', 20);
    const rent = txns.find(t => t.description.includes('RENT'));
    assert.ok(rent);
    assert.equal(rent.direction, 'debit');
    assert.equal(rent.amount, 18000);
  });

  it('should generate unique source_ref per transaction', () => {
    const txns = generateTransactions('ACC_001', 20);
    const refs = txns.map(t => t.sourceRef);
    const unique = new Set(refs);
    assert.equal(unique.size, txns.length);
  });

  it('should default to 20 transactions', () => {
    const txns = generateTransactions('ACC_001');
    assert.equal(txns.length, 20);
  });

  it('should respect count parameter', () => {
    const txns = generateTransactions('ACC_001', 50);
    assert.equal(txns.length, 50);
  });
});

describe('Customer data integrity', () => {
  it('all accounts should have positive balances', () => {
    for (const cust of Object.values(CUSTOMERS)) {
      for (const acc of cust.accounts) {
        assert.ok(acc.balance >= 0, `${acc.id} has negative balance`);
      }
    }
  });

  it('all accounts should have valid types', () => {
    for (const cust of Object.values(CUSTOMERS)) {
      for (const acc of cust.accounts) {
        assert.ok(['savings', 'current', 'demat'].includes(acc.type), `${acc.id} has invalid type`);
      }
    }
  });

  it('each customer should have a name', () => {
    for (const cust of Object.values(CUSTOMERS)) {
      assert.ok(cust.name, `${cust.id} missing name`);
    }
  });
});
