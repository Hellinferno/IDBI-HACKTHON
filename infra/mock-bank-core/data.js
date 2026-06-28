const CUSTOMERS = {
  CUST_001: {
    id: 'CUST_001',
    name: 'Rahul Sharma',
    accounts: [
      { id: 'ACC_001', type: 'savings', balance: 150000.00 },
      { id: 'ACC_002', type: 'demat', balance: 350000.00 },
    ],
  },
  CUST_002: {
    id: 'CUST_002',
    name: 'Priya Patel',
    accounts: [
      { id: 'ACC_003', type: 'savings', balance: 85000.00 },
    ],
  },
};

function generateTransactions(accountId, count = 20) {
  const categories = [
    { desc: 'SALARY CREDIT', dir: 'credit', amounts: [85000, 92000, 78000] },
    { desc: 'RENT PAYMENT', dir: 'debit', amounts: [18000, 18000, 18000] },
    { desc: 'GROCERIES - BIGBASKET', dir: 'debit', amounts: [4500, 3800, 5200] },
    { desc: 'DINING - ZOMATO', dir: 'debit', amounts: [1200, 800, 1500] },
    { desc: 'SIP INVESTMENT', dir: 'debit', amounts: [5000, 5000, 10000] },
    { desc: 'ELECTRICITY BILL', dir: 'debit', amounts: [2200, 1800, 2500] },
    { desc: 'UBER RIDE', dir: 'debit', amounts: [350, 280, 420] },
    { desc: 'FLIPKART PURCHASE', dir: 'debit', amounts: [2500, 1800, 3200] },
    { desc: 'MEDICAL PHARMACY', dir: 'debit', amounts: [650, 450, 800] },
    { desc: 'INSURANCE PREMIUM', dir: 'debit', amounts: [3500, 3500, 3500] },
  ];
  const txns = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length];
    const amount = cat.amounts[i % cat.amounts.length];
    const daysAgo = Math.floor(i * 3.5);
    const txnDate = new Date(now);
    txnDate.setDate(txnDate.getDate() - daysAgo);
    txns.push({
      id: `TXN_${accountId}_${String(i + 1).padStart(4, '0')}`,
      accountId,
      amount,
      direction: cat.dir,
      description: cat.desc,
      txnDate: txnDate.toISOString().split('T')[0],
      sourceRef: `SRC_${accountId}_${i + 1}`,
    });
  }
  return txns;
}

module.exports = { CUSTOMERS, generateTransactions };
