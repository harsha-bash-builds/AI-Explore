import { CATEGORIES, DEMO_DATE } from './data.js';

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const numeric = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const isAll = (value) => !value || String(value).toLowerCase() === 'all';
const asIso = (date) => date.toISOString().slice(0, 10);
const validIso = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && asIso(new Date(`${value}T00:00:00Z`)) === value;

export function formatMoney(value, compact = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: compact ? 1 : 0,
    ...(compact ? { notation: 'compact' } : {}),
  }).format(numeric(value));
}

/** Inclusive dates. Year is the full calendar year; other periods end at the demo as-of date. */
export function dateRange(period = 'month', anchor = DEMO_DATE) {
  const end = validIso(anchor) ? anchor : DEMO_DATE;
  const [year, month] = end.split('-').map(Number);
  let startMonth = month;
  if (period === 'quarter') startMonth = Math.floor((month - 1) / 3) * 3 + 1;
  if (period === 'half') startMonth = month <= 6 ? 1 : 7;
  if (period === 'year' || period === 'ytd') startMonth = 1;
  return [`${year}-${String(startMonth).padStart(2, '0')}-01`, period === 'year' ? `${year}-12-31` : end];
}

export function filterTransactions(transactions, filters = {}, cards = []) {
  const { period, owner, cardId, search, category } = filters;
  const range = isAll(period) ? null : dateRange(period);
  const byId = new Map(cards.map((card) => [card.id, card]));
  const query = String(search || '').trim().toLowerCase();
  return transactions.filter((transaction) => {
    const card = byId.get(transaction.cardId);
    if (range && (transaction.date < range[0] || transaction.date > range[1])) return false;
    if (!isAll(owner) && card?.owner?.toLowerCase() !== String(owner).toLowerCase()) return false;
    if (!isAll(cardId) && transaction.cardId !== cardId) return false;
    if (!isAll(category) && transaction.category !== category) return false;
    if (query && ![transaction.merchant, transaction.category, card?.name, card?.issuer, card?.owner, card?.last4]
      .filter(Boolean).join(' ').toLowerCase().includes(query)) return false;
    return true;
  });
}

/** Points and cashback are normalized to rupees in rewards; pending benefits are excluded. */
export function summarize(transactions) {
  let spent = 0;
  let cashback = 0;
  let rewards = 0;
  let points = 0;
  for (const transaction of transactions) {
    spent += numeric(transaction.amount);
    if (transaction.rewardStatus !== 'earned') continue;
    rewards += numeric(transaction.reward);
    if (transaction.kind === 'cashback') cashback += numeric(transaction.reward);
    if (transaction.kind === 'points') points += numeric(transaction.points);
  }
  return { spent: round(spent), cashback: round(cashback), rewards: round(rewards), points: round(points), rate: spent > 0 ? round(rewards / spent * 100) : 0, count: transactions.length };
}

const merchantAliases = [
  ['amazon', /\bamazon\b/i], ['flipkart', /\bflipkart\b/i], ['myntra', /\bmyntra\b/i], ['swiggy', /\bswiggy\b/i],
  ['bookmyshow', /\bbook\s*my\s*show\b/i], ['pvr', /\bpvr\b/i], ['inox', /\binox\b/i],
  ['indigo', /\bindigo\b/i], ['airindia', /\bair\s*india\b/i], ['makemytrip', /\bmake\s*my\s*trip\b/i],
  ['bigbasket', /\bbig\s*basket\b/i], ['blinkit', /\bblinkit\b/i], ['zepto', /\bzepto\b/i], ['zomato', /\bzomato\b/i],
];

function normalizeMerchant(merchant = '') {
  return merchantAliases.find(([, expression]) => expression.test(merchant))?.[0] || String(merchant).trim().toLowerCase();
}

/** Cap usage reserves earned and pending recorded rewards this month, independent of dashboard filters. */
export function recommendCards(cards, transactions, { amount = 1000, category = 'Other', merchant = '', owner, asOf = DEMO_DATE } = {}) {
  const spend = Math.max(0, numeric(amount));
  const merchantId = normalizeMerchant(merchant);
  const chosenCategory = CATEGORIES.includes(category) ? category : 'Other';
  const [start, end] = dateRange('month', asOf);
  return cards.filter((card) => isAll(owner) || card.owner.toLowerCase() === String(owner).toLowerCase()).map((card) => {
    const merchantRate = card.merchantRates?.[merchantId];
    const nominalRate = Math.max(0, numeric(merchantRate ?? card.rates?.[chosenCategory] ?? card.baseRate));
    const recordedThisMonth = transactions.filter((transaction) => transaction.cardId === card.id && ['earned', 'pending'].includes(transaction.rewardStatus) && transaction.date >= start && transaction.date <= end)
      .reduce((total, transaction) => total + Math.max(0, numeric(transaction.reward)), 0);
    const hasCap = card.monthlyCap !== null && card.monthlyCap !== undefined;
    const remainingCap = hasCap ? round(Math.max(0, numeric(card.monthlyCap) - recordedThisMonth)) : null;
    const uncappedReward = round(spend * nominalRate / 100);
    const reward = round(hasCap ? Math.min(uncappedReward, remainingCap) : uncappedReward);
    const capped = hasCap && uncappedReward > remainingCap;
    const rate = spend > 0 ? round(reward / spend * 100) : nominalRate;
    const points = card.rewardType === 'points' && card.pointValue > 0 ? round(reward / card.pointValue) : 0;
    const basis = merchantRate !== undefined ? `${merchantId.charAt(0).toUpperCase()}${merchantId.slice(1)}` : chosenCategory.toLowerCase();
    const reason = `${nominalRate}% sample ${basis} rate${capped ? `; limited by ${formatMoney(remainingCap)} remaining monthly cap` : ''}${card.rewardType === 'points' ? `; points valued at ₹${card.pointValue} each` : ''}.`;
    return { card, rate, reward, points, capped, remainingCap, reason };
  }).sort((a, b) => b.reward - a.reward || b.rate - a.rate || a.card.name.localeCompare(b.card.name));
}

export function aggregateCategories(transactions) {
  const totals = new Map();
  for (const transaction of transactions) totals.set(transaction.category, (totals.get(transaction.category) || 0) + numeric(transaction.amount));
  return [...totals].map(([category, amount]) => ({ category, amount: round(amount) })).sort((a, b) => b.amount - a.amount);
}

/** Daily buckets for month; monthly for longer periods. Year includes empty future months. */
export function aggregateTrend(transactions, { period = 'month' } = {}) {
  const [start, end] = dateRange(period);
  const daily = period === 'month';
  const buckets = new Map();
  const cursor = new Date(`${start}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-IN', daily ? { day: 'numeric', month: 'short', timeZone: 'UTC' } : { month: 'short', timeZone: 'UTC' });
  while (asIso(cursor) <= end) {
    const key = asIso(cursor).slice(0, daily ? 10 : 7);
    buckets.set(key, { label: formatter.format(cursor), spent: 0, rewards: 0 });
    if (daily) cursor.setUTCDate(cursor.getUTCDate() + 1);
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  for (const transaction of transactions) {
    if (transaction.date < start || transaction.date > end) continue;
    const bucket = buckets.get(transaction.date.slice(0, daily ? 10 : 7));
    if (!bucket) continue;
    bucket.spent += numeric(transaction.amount);
    if (transaction.rewardStatus === 'earned') bucket.rewards += numeric(transaction.reward);
  }
  return [...buckets.values()].map((bucket) => ({ ...bucket, spent: round(bucket.spent), rewards: round(bucket.rewards) }));
}

function amountFromMatch(match) {
  const value = Number(match[1].replace(/,/g, ''));
  const unit = (match[2] || '').toLowerCase();
  return value * (/^(l|lac|lakh)/.test(unit) ? 100000 : /^(cr|crore)/.test(unit) ? 10000000 : unit === 'k' ? 1000 : 1);
}

export function parseQuery(text = '') {
  const input = String(text);
  const units = '(k|lakhs?|lacs?|l|crores?|cr)?';
  const number = '([0-9]+(?:,[0-9]{2,3})*(?:\\.[0-9]+)?)';
  const currency = input.match(new RegExp(`(?:₹|\\brs\\.?\\s*|\\binr\\s*)${number}\\s*${units}\\b`, 'i'));
  const candidates = [...input.matchAll(new RegExp(`\\b${number}\\s*${units}\\b`, 'gi'))];
  const amount = currency ? amountFromMatch(currency) : candidates.length ? Math.max(...candidates.map(amountFromMatch)) : 1000;
  const merchant = normalizeMerchant(merchantAliases.find(([, expression]) => expression.test(input))?.[0] || '');
  let category = 'Other';
  if (/\b(flights?|airlines?|airfare|indigo|air\s*india|travel|make\s*my\s*trip)\b/i.test(input)) category = 'Flights';
  else if (/\b(movies?|cinema|pvr|inox|book\s*my\s*show)\b/i.test(input)) category = 'Movies';
  else if (/\b(grocer(?:y|ies)|supermarket|big\s*basket|blinkit|zepto|instamart|dmart)\b/i.test(input)) category = 'Groceries';
  else if (/\b(dining|restaurants?|swiggy|zomato|food|dinner|lunch|meals?|coffee)\b/i.test(input)) category = 'Dining';
  else if (/\b(shopping|shop|amazon|flipkart|myntra|laptop|phone|clothes|fashion)\b/i.test(input)) category = 'Shopping';
  return { amount: round(amount), merchant, category };
}
