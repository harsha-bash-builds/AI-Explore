import test from 'node:test';
import assert from 'node:assert/strict';
import { cards, transactions, DEMO_DATE, CATEGORIES } from '../js/data.js';
import { dateRange, filterTransactions, summarize, recommendCards, aggregateCategories, aggregateTrend, parseQuery, formatMoney } from '../js/domain.js';

test('demo records are deterministic, valid, masked and bounded by the as-of date', () => {
  assert.equal(cards.length, 12);
  assert.ok(transactions.length >= 100);
  assert.equal(new Set(transactions.map((entry) => entry.id)).size, transactions.length);
  for (const card of cards) {
    assert.match(card.last4, /^\d{4}$/);
    assert.ok(card.notes.includes('Illustrative demo'));
  }
  for (const entry of transactions) {
    assert.equal(new Date(`${entry.date}T00:00:00Z`).toISOString().slice(0, 10), entry.date);
    assert.ok(entry.date <= DEMO_DATE);
    assert.ok(CATEGORIES.includes(entry.category));
    assert.ok(cards.some((card) => card.id === entry.cardId));
  }
  const octoberSpend = summarize(filterTransactions(transactions, { period: 'month' }, cards)).spent;
  assert.ok(octoberSpend >= 80000 && octoberSpend <= 150000);
});

test('inclusive ranges handle year, quarter and half-year boundaries without local time', () => {
  assert.deepEqual(dateRange('month', '2026-10-20'), ['2026-10-01', '2026-10-20']);
  assert.deepEqual(dateRange('quarter', '2026-10-01'), ['2026-10-01', '2026-10-01']);
  assert.deepEqual(dateRange('quarter', '2026-03-31'), ['2026-01-01', '2026-03-31']);
  assert.deepEqual(dateRange('half', '2026-06-30'), ['2026-01-01', '2026-06-30']);
  assert.deepEqual(dateRange('half', '2026-07-01'), ['2026-07-01', '2026-07-01']);
  assert.deepEqual(dateRange('year'), ['2026-01-01', '2026-12-31']);
  assert.deepEqual(dateRange('ytd'), ['2026-01-01', DEMO_DATE]);
  assert.deepEqual(dateRange('month', '2026-02-30'), dateRange('month'));
});

const fixtureCards = [
  { id: 'cash', name: 'Cash', owner: 'Harsha', issuer: 'Demo Bank', last4: '1234', rewardType: 'cashback', baseRate: 1, pointValue: 1, rates: { Shopping: 5, Other: 1 }, merchantRates: { amazon: 10 }, monthlyCap: 100 },
  { id: 'points', name: 'Points', owner: 'Shreya', issuer: 'Demo Bank', last4: '5678', rewardType: 'points', baseRate: 2, pointValue: 0.5, rates: { Shopping: 4, Other: 2 }, merchantRates: {}, monthlyCap: null },
];
const fixtureTransactions = [
  { id: '1', date: '2026-10-01', merchant: 'Amazon', category: 'Shopping', cardId: 'cash', amount: 1000, reward: 80, rewardStatus: 'earned', kind: 'cashback', points: 0 },
  { id: '2', date: '2026-10-20', merchant: 'Myntra', category: 'Shopping', cardId: 'points', amount: 500, reward: 20, rewardStatus: 'earned', kind: 'points', points: 40 },
  { id: '3', date: '2026-10-19', merchant: 'Flipkart', category: 'Shopping', cardId: 'cash', amount: 200, reward: 10, rewardStatus: 'pending', kind: 'cashback', points: 0 },
  { id: '4', date: '2026-09-30', merchant: 'Amazon', category: 'Shopping', cardId: 'cash', amount: 1000, reward: 90, rewardStatus: 'earned', kind: 'cashback', points: 0 },
  { id: '5', date: '2026-10-21', merchant: 'Amazon', category: 'Shopping', cardId: 'cash', amount: 1000, reward: 90, rewardStatus: 'earned', kind: 'cashback', points: 0 },
];

test('filters compose owner, card, date, category and case-insensitive search', () => {
  assert.equal(filterTransactions(fixtureTransactions, {}, fixtureCards).length, 5);
  const selected = filterTransactions(fixtureTransactions, { period: 'month', owner: 'harsha', cardId: 'cash', category: 'Shopping', search: 'AMAZON' }, fixtureCards);
  assert.deepEqual(selected.map((entry) => entry.id), ['1']);
  assert.equal(filterTransactions(fixtureTransactions, { owner: 'All', cardId: 'all', category: 'all' }, fixtureCards).length, 5);
  assert.equal(filterTransactions(fixtureTransactions, { search: '5678' }, fixtureCards)[0].id, '2');
  assert.equal(filterTransactions(fixtureTransactions, { owner: 'Nobody' }, fixtureCards).length, 0);
  assert.equal(filterTransactions(fixtureTransactions, { period: 'year' }, fixtureCards).length, 5);
  assert.equal(filterTransactions(fixtureTransactions, { period: 'ytd' }, fixtureCards).length, 4);
});

test('cashback, points and total earned rewards remain distinct; pending still counts as spend', () => {
  assert.deepEqual(summarize(fixtureTransactions.slice(0, 3)), { spent: 1700, cashback: 80, rewards: 100, points: 40, rate: 5.88, count: 3 });
  assert.deepEqual(summarize([]), { spent: 0, cashback: 0, rewards: 0, points: 0, rate: 0, count: 0 });
});

test('recommendations apply merchant overrides, reserve pending cap usage and respect owner eligibility', () => {
  const ranked = recommendCards(fixtureCards, fixtureTransactions, { amount: 1000, category: 'Shopping', merchant: 'Amazon India' });
  assert.equal(ranked[0].card.id, 'points');
  assert.equal(ranked[0].reward, 40);
  assert.equal(ranked[0].points, 80);
  const cash = ranked.find((entry) => entry.card.id === 'cash');
  assert.equal(cash.remainingCap, 10);
  assert.equal(cash.reward, 10);
  assert.equal(cash.rate, 1);
  assert.equal(cash.capped, true);
  assert.match(cash.reason, /10%/);
  assert.equal(recommendCards(fixtureCards, fixtureTransactions, { amount: 1000, owner: 'Harsha' }).length, 1);
  const zero = recommendCards(fixtureCards, fixtureTransactions, { amount: -100 });
  assert.ok(zero.every((entry) => entry.reward === 0 && Number.isFinite(entry.rate)));
});

test('an exhausted cap does not produce negative rewards', () => {
  const exhausted = [{ ...fixtureTransactions[0], reward: 150 }];
  const result = recommendCards(fixtureCards, exhausted, { amount: 500, category: 'Shopping' }).find((entry) => entry.card.id === 'cash');
  assert.equal(result.reward, 0);
  assert.equal(result.remainingCap, 0);
  assert.equal(result.rate, 0);
});

test('historical asOf uses the original month and includes late-month pending rewards', () => {
  const historical = [
    { ...fixtureTransactions[0], date: '2026-09-01', reward: 30 },
    { ...fixtureTransactions[0], id: 'late-earned', date: '2026-09-21', reward: 20 },
    { ...fixtureTransactions[0], id: 'late-pending', date: '2026-09-30', reward: 40, rewardStatus: 'pending' },
    { ...fixtureTransactions[0], id: 'other-month', date: '2026-10-01', reward: 100 },
  ];
  const result = recommendCards(fixtureCards, historical, { amount: 1000, merchant: 'Amazon', category: 'Shopping', asOf: '2026-09-30' }).find((entry) => entry.card.id === 'cash');
  assert.equal(result.remainingCap, 10);
  assert.equal(result.reward, 10);
  assert.equal(result.capped, true);
  const earlier = recommendCards(fixtureCards, historical, { amount: 1000, merchant: 'Amazon', asOf: '2026-09-20' }).find((entry) => entry.card.id === 'cash');
  assert.equal(earlier.remainingCap, 70);
});

test('trend buckets include empty dates and reconcile spend and earned rewards', () => {
  const selected = filterTransactions(fixtureTransactions, { period: 'month' }, fixtureCards);
  const trend = aggregateTrend(fixtureTransactions, { period: 'month' });
  assert.equal(trend.length, 20);
  assert.equal(trend.reduce((total, bucket) => total + bucket.spent, 0), summarize(selected).spent);
  assert.equal(trend.reduce((total, bucket) => total + bucket.rewards, 0), summarize(selected).rewards);
  assert.deepEqual(aggregateCategories(selected), [{ category: 'Shopping', amount: 1700 }]);
  const annual = aggregateTrend([], { period: 'year' });
  assert.equal(annual.length, 12);
  assert.deepEqual(annual.at(-1), { label: 'Dec', spent: 0, rewards: 0 });
  assert.equal(aggregateTrend([], { period: 'ytd' }).length, 10);
});

test('query parsing supports Indian currency, compact amounts and common merchants', () => {
  assert.deepEqual(parseQuery('Which card for ₹25,000 on Amazon?'), { amount: 25000, merchant: 'amazon', category: 'Shopping' });
  assert.deepEqual(parseQuery('Spend Rs. 2.5k on Swiggy'), { amount: 2500, merchant: 'swiggy', category: 'Dining' });
  assert.deepEqual(parseQuery('INR 1.2 lakh on flights'), { amount: 120000, merchant: '', category: 'Flights' });
  assert.deepEqual(parseQuery('PVR movie tickets for 800'), { amount: 800, merchant: 'pvr', category: 'Movies' });
  assert.equal(parseQuery('iPhone 16 for 80,000 on Flipkart').amount, 80000);
  assert.equal(parseQuery('groceries from Swiggy Instamart').category, 'Groceries');
  assert.deepEqual(parseQuery(''), { amount: 1000, merchant: '', category: 'Other' });
  assert.match(formatMoney(123456), /1,23,456/);
});
