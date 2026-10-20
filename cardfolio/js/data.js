// Everything in this file is illustrative demo data. The reward rules are
// fictional assumptions for UI review, not verified issuer terms or offers.
export const DEMO_DATE = '2026-10-20';
export const CATEGORIES = ['Shopping', 'Flights', 'Movies', 'Dining', 'Groceries', 'Other'];

const sampleNote = 'Illustrative demo rule only. Verify issuer terms, exclusions, fees and caps before choosing a card.';

export const cards = [
  {
    id: 'amex-travel-platinum', name: 'Amex Travel Platinum', issuer: 'American Express', network: 'Amex', owner: 'Harsha', last4: '4821',
    limit: 600000, statementDay: 8, dueDay: 28, annualFee: 3500, color: 'gold', bestFor: ['Flights', 'Dining'],
    rewardType: 'points', pointValue: 0.5, baseRate: 1,
    rates: { Shopping: 1, Flights: 5, Movies: 1, Dining: 2, Groceries: 1, Other: 1 },
    merchantRates: { amazon: 1, flipkart: 1, myntra: 1, swiggy: 2 }, monthlyCap: null,
    notes: `Sample points valued at ₹0.50 each; milestone benefits are not modeled. ${sampleNote}`,
  },
  {
    id: 'swiggy-hdfc', name: 'Swiggy HDFC', issuer: 'HDFC Bank', network: 'Mastercard', owner: 'Harsha', last4: '6729',
    limit: 180000, statementDay: 21, dueDay: 11, annualFee: 500, color: 'coral', bestFor: ['Dining', 'Shopping'],
    rewardType: 'cashback', pointValue: 1, baseRate: 1,
    rates: { Shopping: 5, Flights: 1, Movies: 1, Dining: 5, Groceries: 1, Other: 1 },
    merchantRates: { amazon: 5, flipkart: 5, myntra: 5, swiggy: 10 }, monthlyCap: 1500,
    notes: `Sample combined ₹1,500 monthly cap, simplified for this prototype. ${sampleNote}`,
  },
  {
    id: 'flipkart-axis', name: 'Flipkart Axis', issuer: 'Axis Bank', network: 'Mastercard', owner: 'Harsha', last4: '7306',
    limit: 300000, statementDay: 12, dueDay: 2, annualFee: 500, color: 'green', bestFor: ['Shopping'],
    rewardType: 'cashback', pointValue: 1, baseRate: 1,
    rates: { Shopping: 1, Flights: 1, Movies: 1, Dining: 1, Groceries: 1, Other: 1 },
    merchantRates: { amazon: 1, flipkart: 5, myntra: 4, swiggy: 1 }, monthlyCap: 4000,
    notes: `Sample Flipkart and Myntra rates; merchant eligibility is simplified. ${sampleNote}`,
  },
  {
    id: 'phone-sbi-black', name: 'Phone SBI Black', issuer: 'SBI Card', network: 'Visa', owner: 'Harsha', last4: '1648',
    limit: 700000, statementDay: 18, dueDay: 8, annualFee: 1500, color: 'blue', bestFor: ['Flights', 'Other'],
    rewardType: 'points', pointValue: 1, baseRate: 2,
    rates: { Shopping: 2, Flights: 6, Movies: 2, Dining: 2, Groceries: 2, Other: 2 },
    merchantRates: { amazon: 2, flipkart: 2, myntra: 2, swiggy: 2 }, monthlyCap: 3000,
    notes: `Name preserved as entered. Product identity and all sample terms need confirmation. ${sampleNote}`,
  },
  {
    id: 'amazon-icici', name: 'Amazon ICICI', issuer: 'ICICI Bank', network: 'Visa', owner: 'Harsha', last4: '9052',
    limit: 250000, statementDay: 15, dueDay: 5, annualFee: 0, color: 'purple', bestFor: ['Shopping', 'Groceries'],
    rewardType: 'cashback', pointValue: 1, baseRate: 1,
    rates: { Shopping: 1, Flights: 1, Movies: 1, Dining: 1, Groceries: 2, Other: 1 },
    merchantRates: { amazon: 5, flipkart: 1, myntra: 1, swiggy: 1 }, monthlyCap: null,
    notes: `Sample Amazon rate assumes Prime membership; rewards are shown as rupee value. ${sampleNote}`,
  },
  {
    id: 'icici-sapphiro', name: 'ICICI Sapphiro', issuer: 'ICICI Bank', network: 'Mastercard', owner: 'Harsha', last4: '3185',
    limit: 400000, statementDay: 25, dueDay: 15, annualFee: 3500, color: 'silver', bestFor: ['Movies', 'Dining'],
    rewardType: 'points', pointValue: 0.25, baseRate: 0.5,
    rates: { Shopping: 0.5, Flights: 1, Movies: 4, Dining: 2, Groceries: 0.5, Other: 0.5 },
    merchantRates: { amazon: 0.5, flipkart: 0.5, myntra: 0.5, swiggy: 2 }, monthlyCap: null,
    notes: `Sample movie benefit expressed as a 4% effective reward for comparison. ${sampleNote}`,
  },
  {
    id: 'tata-neu-infinity', name: 'Tata Neu Infinity', issuer: 'HDFC Bank', network: 'RuPay', owner: 'Harsha', last4: '4407',
    limit: 350000, statementDay: 14, dueDay: 4, annualFee: 1499, color: 'purple', bestFor: ['Groceries', 'Shopping'],
    rewardType: 'points', pointValue: 1, baseRate: 1.5,
    rates: { Shopping: 3, Flights: 1.5, Movies: 1.5, Dining: 1.5, Groceries: 5, Other: 1.5 },
    merchantRates: { amazon: 1.5, flipkart: 1.5, myntra: 1.5, swiggy: 1.5 }, monthlyCap: 2500,
    notes: `Sample NeuCoins valued at ₹1 each; ecosystem and UPI exclusions are not modeled. ${sampleNote}`,
  },
  {
    id: 'amex-membership-rewards', name: 'Amex Membership Rewards', issuer: 'American Express', network: 'Amex', owner: 'Shreya', last4: '8904',
    limit: 300000, statementDay: 9, dueDay: 29, annualFee: 1500, color: 'gold', bestFor: ['Dining', 'Shopping'],
    rewardType: 'points', pointValue: 0.5, baseRate: 1,
    rates: { Shopping: 2, Flights: 1, Movies: 1, Dining: 3, Groceries: 1, Other: 1 },
    merchantRates: { amazon: 2, flipkart: 2, myntra: 2, swiggy: 3 }, monthlyCap: null,
    notes: `Sample points valued at ₹0.50 each; monthly milestones are not modeled. ${sampleNote}`,
  },
  {
    id: 'citi-corporate', name: 'Citi Corporate', issuer: 'Citi', network: 'Visa', owner: 'Shreya', last4: '5518',
    limit: 500000, statementDay: 5, dueDay: 25, annualFee: 0, color: 'silver', bestFor: ['Flights', 'Other'],
    rewardType: 'points', pointValue: 0.5, baseRate: 0.5,
    rates: { Shopping: 0.5, Flights: 2, Movies: 0.5, Dining: 1, Groceries: 0.5, Other: 1 },
    merchantRates: { amazon: 0.5, flipkart: 0.5, myntra: 0.5, swiggy: 1 }, monthlyCap: null,
    notes: `Name preserved as entered. Corporate usage and rewards depend on employer policy. ${sampleNote}`,
  },
  {
    id: 'hsbc-live', name: 'HSBC Live+', issuer: 'HSBC', network: 'Visa', owner: 'Shreya', last4: '2763',
    limit: 250000, statementDay: 16, dueDay: 6, annualFee: 999, color: 'coral', bestFor: ['Dining', 'Groceries'],
    rewardType: 'cashback', pointValue: 1, baseRate: 1,
    rates: { Shopping: 1, Flights: 1, Movies: 1, Dining: 10, Groceries: 10, Other: 1 },
    merchantRates: { amazon: 1, flipkart: 1, myntra: 1, swiggy: 10 }, monthlyCap: 1000,
    notes: `Sample combined ₹1,000 monthly cap on category cashback. ${sampleNote}`,
  },
  {
    id: 'axis-airtel-master', name: 'Axis Airtel Master', issuer: 'Axis Bank', network: 'Mastercard', owner: 'Shreya', last4: '6091',
    limit: 200000, statementDay: 20, dueDay: 10, annualFee: 500, color: 'blue', bestFor: ['Dining', 'Groceries', 'Other'],
    rewardType: 'cashback', pointValue: 1, baseRate: 1,
    rates: { Shopping: 1, Flights: 1, Movies: 1, Dining: 5, Groceries: 5, Other: 2 },
    merchantRates: { amazon: 1, flipkart: 1, myntra: 1, swiggy: 10 }, monthlyCap: 500,
    notes: `Sample ₹500 combined monthly cap; telecom-specific benefits are not modeled. ${sampleNote}`,
  },
  {
    id: 'sbi-online-cc', name: 'SBI Online CC', issuer: 'SBI Card', network: 'Visa', owner: 'Shreya', last4: '8320',
    limit: 280000, statementDay: 11, dueDay: 1, annualFee: 999, color: 'green', bestFor: ['Shopping'],
    rewardType: 'cashback', pointValue: 1, baseRate: 1,
    rates: { Shopping: 5, Flights: 1, Movies: 1, Dining: 1, Groceries: 1, Other: 1 },
    merchantRates: { amazon: 5, flipkart: 5, myntra: 5, swiggy: 1 }, monthlyCap: 5000,
    notes: `Name preserved as entered. Sample online cashback assumptions need product confirmation. ${sampleNote}`,
  },
];

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const merchantKey = (merchant) => merchant.toLowerCase().split(' ')[0];
const cardById = new Map(cards.map((card) => [card.id, card]));

function makeTransaction(id, date, merchant, category, cardId, amount) {
  const card = cardById.get(cardId);
  const rate = card.merchantRates[merchantKey(merchant)] ?? card.rates[category] ?? card.baseRate;
  const reward = round(amount * rate / 100);
  return {
    id, date, merchant, category, cardId, amount, reward,
    rewardStatus: date > '2026-10-16' ? 'pending' : 'earned',
    kind: card.rewardType,
    points: card.rewardType === 'points' ? round(reward / card.pointValue) : 0,
  };
}

const templates = [
  ['Amazon', 'Shopping', 'amazon-icici', 4499],
  ['Swiggy', 'Dining', 'swiggy-hdfc', 890],
  ['IndiGo', 'Flights', 'phone-sbi-black', 11900],
  ['BigBasket', 'Groceries', 'tata-neu-infinity', 3280],
  ['PVR Cinemas', 'Movies', 'icici-sapphiro', 960],
  ['Flipkart', 'Shopping', 'flipkart-axis', 6999],
  ['Third Wave Coffee', 'Dining', 'amex-membership-rewards', 640],
  ['Myntra', 'Shopping', 'sbi-online-cc', 3499],
  ['DMart', 'Groceries', 'hsbc-live', 2160],
  ['Air India', 'Flights', 'amex-travel-platinum', 8400],
  ['The Pizza Bakery', 'Dining', 'hsbc-live', 1480],
  ['BookMyShow', 'Movies', 'icici-sapphiro', 720],
  ['Swiggy', 'Dining', 'axis-airtel-master', 1499],
  ['Urban Company', 'Other', 'citi-corporate', 1890],
];

const history = [];
for (let month = 1; month <= 9; month += 1) {
  templates.forEach(([merchant, category, cardId, baseAmount], index) => {
    const day = String(2 + index * 2).padStart(2, '0');
    const date = `2026-${String(month).padStart(2, '0')}-${day}`;
    const amount = Math.round(baseAmount * (0.84 + ((month * 7 + index * 3) % 13) / 35));
    history.push(makeTransaction(`txn-${month}-${index + 1}`, date, merchant, category, cardId, amount));
  });
}

const october = [
  [1, 'Amazon', 'Shopping', 'amazon-icici', 18999],
  [2, 'Swiggy', 'Dining', 'swiggy-hdfc', 1240],
  [2, 'BigBasket', 'Groceries', 'tata-neu-infinity', 3860],
  [3, 'IndiGo', 'Flights', 'phone-sbi-black', 24980],
  [4, 'PVR Cinemas', 'Movies', 'icici-sapphiro', 1180],
  [5, 'Flipkart', 'Shopping', 'flipkart-axis', 14999],
  [6, 'Third Wave Coffee', 'Dining', 'amex-membership-rewards', 680],
  [7, 'Myntra', 'Shopping', 'sbi-online-cc', 5299],
  [8, 'DMart', 'Groceries', 'hsbc-live', 2940],
  [8, 'Swiggy', 'Dining', 'swiggy-hdfc', 960],
  [9, 'Air India', 'Flights', 'amex-travel-platinum', 12900],
  [10, 'The Pizza Bakery', 'Dining', 'hsbc-live', 2180],
  [11, 'BookMyShow', 'Movies', 'icici-sapphiro', 840],
  [12, 'Amazon', 'Shopping', 'amazon-icici', 6799],
  [13, 'Urban Company', 'Other', 'citi-corporate', 2390],
  [14, 'Swiggy', 'Dining', 'axis-airtel-master', 1540],
  [15, 'Reliance Digital', 'Shopping', 'sbi-online-cc', 8999],
  [16, 'BigBasket', 'Groceries', 'tata-neu-infinity', 3120],
  [17, 'Myntra', 'Shopping', 'swiggy-hdfc', 4299],
  [18, 'INOX', 'Movies', 'icici-sapphiro', 1260],
  [18, 'Swiggy', 'Dining', 'swiggy-hdfc', 1120],
  [19, 'Blue Tokai', 'Dining', 'amex-membership-rewards', 760],
  [20, 'Flipkart', 'Shopping', 'flipkart-axis', 3499],
  [20, 'DMart', 'Groceries', 'hsbc-live', 2450],
].map(([day, merchant, category, cardId, amount], index) =>
  makeTransaction(`txn-10-${index + 1}`, `2026-10-${String(day).padStart(2, '0')}`, merchant, category, cardId, amount));

export const transactions = [...history, ...october].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

// Editorial placeholders, deliberately without fabricated publishers or links.
export const SAMPLE_NEWS = [
  { id: 'mock-news-1', category: 'NEW LAUNCHES', title: 'The next wave of travel cards: what to compare', headline: 'The next wave of travel cards: what to compare', excerpt: 'Mock editorial preview · Look beyond welcome miles to transfer partners, fees and real redemption value.', color: 'blue', isMock: true },
  { id: 'mock-news-2', category: 'CASHBACK WATCH', title: 'Festive shopping? Check the cap before checkout', headline: 'Festive shopping? Check the cap before checkout', excerpt: 'Mock editorial preview · A higher headline rate can earn less once exclusions and monthly caps apply.', color: 'green', isMock: true },
  { id: 'mock-news-3', category: 'REWARDS EXPLAINED', title: 'Your points balance is only half the story', headline: 'Your points balance is only half the story', excerpt: 'Mock editorial preview · Compare what points are worth for the redemption you actually use.', color: 'gold', isMock: true },
];
