import { cards as seedCards, transactions as seedTransactions, CATEGORIES, SAMPLE_NEWS, DEMO_DATE } from './data.js';
import { formatMoney, dateRange, filterTransactions, summarize, recommendCards, aggregateCategories, aggregateTrend, parseQuery } from './domain.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const num = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0);
const paths = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  wallet: '<path d="M20 8V5a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v11H6a3 3 0 0 1-3-3V6"/><path d="M20 12h-5v5h5M17 14.5h.01"/>',
  transactions: '<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4M4 18v4m-2-2h4"/>',
  settings: '<path d="m10 3-.7 2.2-2 .9L5 5.6 3 9l1.5 1.8v2.4L3 15l2 3.4 2.3-.5 2 .9L10 21h4l.7-2.2 2-.9 2.3.5 2-3.4-1.5-1.8v-2.4L21 9l-2-3.4-2.3.5-2-.9L14 3Z"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
  card: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20M6 15h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chart: '<path d="M4 3v17h17M8 15V9m5 6V5m5 10v-4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  contactless: '<path d="M7 8a6 6 0 0 1 0 8m4-11a10 10 0 0 1 0 14m4-17a14 14 0 0 1 0 20"/>',
  coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3m-6-3v5c0 1.7 2.7 3 6 3"/><ellipse cx="16" cy="14" rx="5" ry="2.5"/><path d="M11 14v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5"/>',
  percent: '<path d="m5 19 14-14"/><circle cx="6.5" cy="6.5" r="3"/><circle cx="17.5" cy="17.5" r="3"/>',
  flight: '<path d="m21 3-6 18-3-9-9-3 18-6Zm-9 9 9-9"/>',
  shopping: '<path d="M4 7h16l1 14H3L4 7Zm4 0V5a4 4 0 0 1 8 0v2"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.card}</svg>`;
function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); }); }
const storageKey = 'folio-demo-v1';
const editableMerchants = ['amazon', 'flipkart', 'myntra', 'swiggy'];
let storageAvailable = true;
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const rateMap = (map) => map && typeof map === 'object' && Object.values(map).every((rate) => Number.isFinite(rate) && rate >= 0 && rate <= 100);
    const validCard = (card) => card && ['id', 'name', 'issuer', 'last4'].every((key) => typeof card[key] === 'string') && /^\d{4}$/.test(card.last4) && ['Harsha', 'Shreya'].includes(card.owner) && ['cashback', 'points'].includes(card.rewardType) && Array.isArray(card.bestFor) && card.bestFor.every((category) => CATEGORIES.includes(category)) && ['limit', 'annualFee', 'statementDay', 'dueDay', 'baseRate', 'pointValue'].every((key) => Number.isFinite(card[key]) && card[key] >= 0) && card.limit > 0 && card.pointValue > 0 && (card.monthlyCap === null || (Number.isFinite(card.monthlyCap) && card.monthlyCap >= 0)) && rateMap(card.rates) && rateMap(card.merchantRates);
    const validTransaction = (tx) => tx && ['id', 'date', 'merchant', 'cardId'].every((key) => typeof tx[key] === 'string') && /^\d{4}-\d{2}-\d{2}$/.test(tx.date) && !Number.isNaN(Date.parse(tx.date)) && ['amount', 'reward', 'points'].every((key) => Number.isFinite(tx[key]) && tx[key] >= 0) && CATEGORIES.includes(tx.category) && ['earned', 'pending'].includes(tx.rewardStatus) && ['points', 'cashback'].includes(tx.kind);
    if (saved?.version === 1 && Array.isArray(saved.cards) && saved.cards.length && saved.cards.every(validCard) && new Set(saved.cards.map((card) => card.id)).size === saved.cards.length && Array.isArray(saved.transactions) && saved.transactions.every((tx) => validTransaction(tx) && saved.cards.some((card) => card.id === tx.cardId))) return saved;
  } catch { storageAvailable = false; }
  return { cards: structuredClone(seedCards), transactions: structuredClone(seedTransactions) };
}
const stored = loadData();
let cards = stored.cards;
let transactions = stored.transactions;
const state = { view: 'overview', period: 'month', owner: 'all', cardId: 'all', search: '', category: 'all', page: 0 };
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4200); }
function persist() { try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, cards, transactions })); storageAvailable = true; } catch { storageAvailable = false; toast('Browser storage is unavailable. Changes will last for this session only.'); } }
const getCard = (id) => cards.find((card) => card.id === id);
const filtered = (extra = {}) => filterTransactions(transactions, { period: state.period, owner: state.owner, cardId: state.cardId, ...extra }, cards).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
const visibleCards = () => cards.filter((card) => (state.owner === 'all' || card.owner === state.owner) && (state.cardId === 'all' || card.id === state.cardId));
const dateLabel = (iso, options = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat('en-IN', { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
const periodNames = { month: 'October 2026', quarter: 'Q4 2026 to date', half: 'Jul–Oct 2026', year: 'Calendar year 2026', ytd: '2026 year to date' };

function populateSelects() {
  const options = cards.filter((card) => state.owner === 'all' || card.owner === state.owner).map((card) => `<option value="${escape(card.id)}">${escape(card.name)}</option>`).join('');
  if (state.cardId !== 'all' && !cards.some((card) => card.id === state.cardId && (state.owner === 'all' || card.owner === state.owner))) state.cardId = 'all';
  $('#card-filter').innerHTML = `<option value="all">All cards</option>${options}`;
  $('#card-filter').value = state.cardId;
  $('#spend-card').innerHTML = cards.map((card) => `<option value="${escape(card.id)}">${escape(card.owner)} · ${escape(card.name)}</option>`).join('');
  $('#nav-card-count').textContent = cards.length;
}
function renderKpis(txs) {
  const summary = summarize(txs);
  const pending = txs.filter((tx) => tx.rewardStatus === 'pending').reduce((sum, tx) => sum + tx.reward, 0);
  $('#kpis').innerHTML = [
    { label: 'Total spent', value: formatMoney(summary.spent), icon: 'wallet', bottom: `<span class="positive">${summary.count} spends</span><span>in the selected period</span>`, sparkline: true },
    { label: 'Cashback earned', value: formatMoney(summary.cashback), icon: 'coins', accent: true, bottom: `<span class="positive">${formatMoney(summary.rewards)} total rewards</span><span>incl. points value</span>` },
    { label: 'Effective reward rate', value: `${summary.rate.toFixed(2)}<span style="font-size:.65em;margin-left:2px">%</span>`, icon: 'percent', bottom: `<span class="positive">${num(summary.points)} points earned</span><span>${formatMoney(pending)} pending value</span>` },
  ].map((item) => `<article class="kpi"><div class="kpi-top">${item.label}<span class="kpi-icon">${icon(item.icon)}</span></div><div class="kpi-value ${item.accent ? 'accent' : ''}">${item.value}</div><div class="kpi-bottom">${item.bottom}</div>${item.sparkline ? '<svg class="kpi-sparkline" viewBox="0 0 80 30" aria-hidden="true"><path d="M1 27 10 24 17 27 27 15 37 18 45 11 53 15 65 5 72 8 79 1" fill="none" stroke="#e4c587" stroke-width="1.5"/></svg>' : ''}</article>`).join('');
}
function renderChart(txs) {
  const trend = aggregateTrend(txs, { period: state.period });
  const summary = summarize(txs);
  $('#chart-total').textContent = formatMoney(summary.spent);
  $('#chart-period').textContent = periodNames[state.period];
  $('#chart-caption').textContent = state.period === 'year' ? 'Calendar-year view · future dates have no spend' : 'Every spend, through 20 October';
  const width = 650, height = 180, left = 46, right = 12, top = 15, bottom = 28;
  const chartWidth = width - left - right, chartHeight = height - top - bottom;
  const max = Math.max(100, ...trend.map((item) => item.spent)) * 1.15;
  const x = (index) => left + index * chartWidth / Math.max(1, trend.length - 1);
  const y = (value) => top + chartHeight - value / max * chartHeight;
  const makePath = (key) => trend.map((item, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(item[key]).toFixed(1)}`).join(' ');
  const spendPath = makePath('spent');
  const grid = Array.from({ length: 4 }, (_, index) => { const value = max * (3 - index) / 3; return `<line class="chart-grid" x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}"/><text class="chart-label" x="${left - 9}" y="${y(value) + 3}" text-anchor="end">${value >= 1000 ? `${Math.round(value / 1000)}k` : Math.round(value)}</text>`; }).join('');
  const labelStep = Math.max(1, Math.ceil(trend.length / 6));
  const labels = trend.map((item, index) => index % labelStep === 0 || index === trend.length - 1 ? `<text class="chart-label" x="${x(index)}" y="${height - 5}" text-anchor="${index === 0 ? 'start' : index === trend.length - 1 ? 'end' : 'middle'}">${escape(item.label)}</text>` : '').join('');
  $('#spend-chart').setAttribute('aria-label', `${periodNames[state.period]}: ${formatMoney(summary.spent)} spent, ${formatMoney(summary.rewards)} earned reward value`);
  $('#spend-chart').innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="presentation"><defs><linearGradient id="spend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e4c587" stop-opacity=".2"/><stop offset="100%" stop-color="#e4c587" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${spendPath} L${x(trend.length - 1)},${y(0)} L${x(0)},${y(0)}Z" fill="url(#spend-fill)"/><path d="${spendPath}" fill="none" stroke="#e4c587" stroke-width="2" stroke-linejoin="round"/><path d="${makePath('rewards')}" fill="none" stroke="#88c8ad" stroke-width="1.5" stroke-dasharray="3 3"/>${trend.map((item, index) => `<circle cx="${x(index)}" cy="${y(item.spent)}" r="3" fill="#e4c587" opacity="0"><title>${escape(item.label)}: ${formatMoney(item.spent)} spent, ${formatMoney(item.rewards)} rewards</title><set attributeName="opacity" to="1" begin="mouseover" end="mouseout"/></circle>`).join('')}${labels}</svg>`;
}
function bankCard(card) {
  const allowedColors = ['gold', 'green', 'purple', 'blue', 'coral', 'silver'];
  return `<button class="bank-card ${allowedColors.includes(card.color) ? card.color : 'gold'}" data-detail="${escape(card.id)}" aria-label="View ${escape(card.name)}, ${escape(card.owner)}"><span class="bank-top"><span class="bank-issuer">${escape(card.issuer)}</span><span class="contactless">${icon('contactless')}</span></span><span class="bank-chip" aria-hidden="true"></span><span class="bank-name" style="display:block">${escape(card.name)}</span><span class="bank-bottom"><span>•••• ${escape(card.last4)}</span><span>${escape(card.owner.toUpperCase())}</span><span class="bank-network">${escape(card.network || 'VISA')}</span></span></button>`;
}
function renderWallet(txs) {
  const owned = visibleCards();
  $('#wallet-count').textContent = owned.length;
  $('#preview-cards').innerHTML = owned.slice(0, 3).map((card) => `<div>${bankCard(card)}<div class="card-preview-meta"><span>${escape(card.owner)}</span><span class="tag">${escape(card.bestFor.slice(0, 2).join(' · ') || 'Everyday')}</span></div></div>`).join('') || '<div class="empty-state">No cards match these filters.</div>';
  $('#wallet-grid').innerHTML = owned.map((card) => {
    const spent = summarize(txs.filter((tx) => tx.cardId === card.id)).spent;
    return `<article class="wallet-item">${bankCard(card)}<div class="wallet-item-meta"><span>${escape(card.owner)}’s card</span><span>${formatMoney(card.limit)} credit limit</span></div><div class="wallet-tags">${card.bestFor.map((tag) => `<span>${escape(tag)}</span>`).join('') || '<span>Everyday</span>'}</div><div class="wallet-spent"><span>Spend · selected period</span><strong>${formatMoney(spent)}</strong></div><div class="utilization-bar" aria-hidden="true"><span style="width:${Math.min(100, spent / card.limit * 100)}%"></span></div><div class="wallet-item-footer"><span>Statement day ${escape(card.statementDay)} · Due day ${escape(card.dueDay)}</span><button data-edit="${escape(card.id)}">Edit details ↗</button></div></article>`;
  }).join('');
  $('#wallet-empty').innerHTML = owned.length ? '' : '<div class="empty-state"><strong>Your wallet is waiting</strong>Add a card to get started.</div>';
}
function renderCategories(txs) {
  const categories = aggregateCategories(txs);
  const total = summarize(txs).spent;
  if (!total) { $('#category-chart').innerHTML = '<div class="empty-state">No spending for these filters.</div>'; return; }
  const colors = ['#e4c587', '#8f9dbb', '#88b5ad', '#a58cae', '#7486aa', '#4f607a'];
  let cursor = 0;
  const stops = categories.map((item, index) => { const start = cursor; cursor += item.amount / total * 100; return `${colors[index % colors.length]} ${start}% ${cursor}%`; }).join(',');
  $('#category-chart').innerHTML = `<div class="category-content"><div class="donut" role="img" aria-label="${escape(categories.map((item) => `${item.category} ${formatMoney(item.amount)}`).join(', '))}" style="background:conic-gradient(${stops})"><div class="donut-center"><small>Total spend</small><strong>${formatMoney(total, true)}</strong></div></div><div class="category-legend">${categories.map((item, index) => `<div><i style="background:${colors[index % colors.length]}"></i><span>${escape(item.category)}</span><strong>${(item.amount / total * 100).toFixed(0)}%</strong></div>`).join('')}</div></div>`;
}
function table(txs) {
  if (!txs.length) return '<div class="empty-state"><strong>A clean slate.</strong>No transactions match your filters. Try another period or log a demo spend.</div>';
  return `<table class="spend-table"><thead><tr><th scope="col">Merchant</th><th scope="col">Card</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col" class="amount-cell">Amount</th><th scope="col" class="reward-cell">Reward value</th></tr></thead><tbody>${txs.map((tx) => { const card = getCard(tx.cardId); return `<tr><td><div class="merchant-cell"><span class="merchant-logo">${escape(tx.merchant.charAt(0).toLowerCase())}</span><span><strong>${escape(tx.merchant)}</strong><small>${escape(card?.owner || 'Unknown owner')}</small></span></div></td><td>${escape(card?.name || 'Unknown card')} <span style="color:#65768e;font-size:8px">· ${escape(card?.last4 || '')}</span></td><td><span class="category-tag">${escape(tx.category)}</span></td><td>${escape(dateLabel(tx.date))}</td><td class="amount-cell">${formatMoney(tx.amount)}</td><td class="reward-cell ${tx.rewardStatus === 'pending' ? 'pending-text' : ''}">+${formatMoney(tx.reward)}<small>${tx.rewardStatus === 'pending' ? 'Pending' : tx.kind === 'points' ? `${num(tx.points)} points` : 'Cashback earned'}</small></td></tr>`; }).join('')}</tbody></table>`;
}
function renderTransactions() {
  const txs = filtered({ search: state.search, category: state.category });
  const pageSize = 12;
  state.page = Math.max(0, Math.min(state.page, Math.ceil(txs.length / pageSize) - 1));
  const start = state.page * pageSize;
  $('#transaction-count').textContent = `${num(txs.length)} transactions · ${formatMoney(summarize(txs).spent)} total spend`;
  $('#all-transactions').innerHTML = table(txs.slice(start, start + pageSize));
  $('#pagination-label').textContent = txs.length ? `${start + 1}–${Math.min(start + pageSize, txs.length)} of ${txs.length} transactions` : '0 transactions';
  $('#prev-page').disabled = state.page === 0;
  $('#next-page').disabled = start + pageSize >= txs.length;
}
function renderNews() {
  $('#news-grid').innerHTML = SAMPLE_NEWS.map((news, index) => `<article class="news-card"><div class="news-art ${index === 1 ? 'green' : index === 2 ? 'warm' : ''}"><span class="art-label">THE CARD EDIT / 0${index + 1}</span>${icon(['flight', 'shopping', 'coins'][index])}</div><div class="news-body"><span class="news-category">${escape(news.category)}</span><h3>${escape(news.title)}</h3><p>${escape(news.excerpt.replace(/^Mock editorial preview\s*·\s*/, ''))}</p><span>Editorial placeholder · not a live article</span></div></article>`).join('');
}
function renderAll() {
  populateSelects();
  const txs = filtered();
  const [start, end] = dateRange(state.period);
  $('#date-label').textContent = `${dateLabel(start)} – ${dateLabel(end)}`;
  renderKpis(txs); renderChart(txs); renderWallet(txs); renderCategories(txs);
  $('#recent-transactions').innerHTML = table(txs.slice(0, 5));
  $('#recent-description').textContent = `${Math.min(txs.length, 5)} most recent of ${txs.length} transactions this period.`;
  renderTransactions(); renderAdvisor();
}
const viewCopy = {
  overview: ['Overview', 'A little more rewarding', 'Your spending, your cards, and the perks in between.'],
  wallet: ['My wallet', 'Good cards. Great possibilities', 'A place for your cards and the things they do best.'],
  transactions: ['Transactions', 'Every spend tells a story', 'The big purchases. The little treats. All in one place.'],
  concierge: ['Card concierge', 'A better card for the moment', 'Compare reward value before your next purchase.'],
};
function setView(name, scroll = true) {
  state.view = Object.hasOwn(viewCopy, name) ? name : 'overview';
  $$('.view').forEach((view) => { view.hidden = view.id !== `${state.view}-view`; });
  $$('.nav-link[data-view]').forEach((link) => { const active = link.dataset.view === state.view; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  const [breadcrumb, title, subtitle] = viewCopy[state.view];
  $('#breadcrumb-name').textContent = breadcrumb;
  $('#page-title').innerHTML = `${escape(title)}<span>.</span>`;
  $('#page-subtitle').textContent = subtitle;
  document.title = `${breadcrumb} — Folio`;
  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
}
function renderAdvisor() {
  const amount = Math.min(10000000, Math.max(1, Number($('#advisor-amount').value) || 10000));
  const category = $('#advisor-category').value || 'Shopping';
  const merchant = $('#advisor-merchant').value.trim();
  const candidates = visibleCards();
  const results = recommendCards(candidates, transactions, { amount, category, merchant, owner: state.owner });
  $('#advisor-context').textContent = `${formatMoney(amount)} · ${merchant || category} · ${state.owner === 'all' ? 'both owners' : state.owner}${state.cardId !== 'all' ? ' · selected card' : ''}`;
  $('#advisor-results').innerHTML = results.length ? results.slice(0, 5).map((result, index) => `<article class="recommendation ${index === 0 ? 'winner' : ''}"><div class="recommendation-rank">${index === 0 ? '✧ YOUR BEST MATCH' : `0${index + 1} / ALSO IN YOUR WALLET`}</div><div class="recommendation-header"><div><h3>${escape(result.card.name)}</h3><p class="recommendation-owner">${escape(result.card.owner)} · ${result.card.rewardType === 'points' ? `${num(result.points)} estimated points` : 'Cashback'}</p></div><div class="recommendation-value">${formatMoney(result.reward)}<small>${result.rate.toFixed(2)}% effective return</small></div></div><p class="recommendation-reason">${escape(result.reason)}${result.remainingCap !== null ? ` <strong>${formatMoney(result.remainingCap)}</strong> monthly cap available before this purchase.` : ''}</p></article>`).join('') + '<p class="advisor-disclaimer">Estimates use sample rules and point values, with recorded monthly rewards counted against caps. Verify merchant eligibility, fees, exclusions, and redemption value with the issuer before relying on a result.</p>' : '<div class="advisor-no-result">No cards match your owner and card filters.</div>';
}
function runQuery(text) {
  const parsed = parseQuery(text);
  $('#advisor-query').value = text;
  $('#advisor-amount').value = Math.min(10000000, Math.max(1, parsed.amount));
  $('#advisor-category').value = parsed.category;
  $('#advisor-merchant').value = parsed.merchant;
  location.hash = 'concierge'; setView('concierge'); renderAdvisor();
}
function openCardForm(cardId) {
  const form = $('#card-form'); form.reset();
  const card = getCard(cardId);
  $('#card-dialog-title').textContent = card ? 'Make this card yours' : 'Add a card';
  form.elements.id.value = card?.id || '';
  const fields = ['name', 'issuer', 'owner', 'last4', 'limit', 'annualFee', 'statementDay', 'dueDay', 'color', 'baseRate', 'rewardType', 'pointValue', 'monthlyCap', 'notes'];
  if (card) fields.forEach((key) => { form.elements[key].value = card[key] ?? ''; });
  $('#best-for-inputs').innerHTML = CATEGORIES.map((category) => `<label><input type="checkbox" name="bestFor" value="${category}" ${card?.bestFor.includes(category) ? 'checked' : ''}>${category}</label>`).join('');
  $('#category-rate-inputs').innerHTML = CATEGORIES.map((category) => `<label>${category} (%)<input name="rate-${category}" type="number" min="0" max="100" step="0.01" value="${escape(card?.rates?.[category] ?? '')}" placeholder="Base rate"></label>`).join('');
  $('#merchant-rate-inputs').innerHTML = editableMerchants.map((merchant) => `<label>${merchant.charAt(0).toUpperCase() + merchant.slice(1)} (%)<input name="merchant-${merchant}" type="number" min="0" max="100" step="0.01" value="${escape(card?.merchantRates?.[merchant] ?? '')}" placeholder="Category rate"></label>`).join('');
  $('#card-dialog').showModal();
}
function showDetails(cardId) {
  const card = getCard(cardId); if (!card) return;
  const spent = summarize(filtered().filter((tx) => tx.cardId === card.id)).spent;
  $('#card-details').innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">A CARD WITH A PURPOSE</p><h2>${escape(card.name)}</h2></div><button class="icon-button close-dialog" aria-label="Close">${icon('close')}</button></div><div class="details-card">${bankCard(card)}</div><dl class="detail-grid"><div><dt>Owner</dt><dd>${escape(card.owner)}</dd></div><div><dt>Credit limit (sample)</dt><dd>${formatMoney(card.limit)}</dd></div><div><dt>Statement day / due day</dt><dd>${escape(card.statementDay)} / ${escape(card.dueDay)} of each month</dd></div><div><dt>Annual fee (sample)</dt><dd>${formatMoney(card.annualFee)}</dd></div><div><dt>Selected-period spend</dt><dd>${formatMoney(spent)}</dd></div><div><dt>Base reward value</dt><dd>${card.baseRate}% · ${card.rewardType === 'points' ? 'points' : 'cashback'}</dd></div></dl><div class="detail-rates">${card.bestFor.map((tag) => `<span>${escape(tag)}${card.rates?.[tag] !== undefined ? ` · ${card.rates[tag]}% sample` : ''}</span>`).join('')}</div><p class="detail-note">${escape(card.notes || 'Add your benefit research and issuer terms in Edit details.')}</p><p class="subtle-note" style="margin-top:13px">All balances, last four digits, fees, and reward rules shown are illustrative. The card name is the label you provided.</p><div class="dialog-actions"><button class="button secondary close-dialog">Close</button><button class="button primary" data-edit="${escape(card.id)}">Edit details</button></div>`;
  $('#details-dialog').showModal();
}
function exportCsv() {
  const txs = filtered(state.view === 'transactions' ? { search: state.search, category: state.category } : {});
  const cell = (value) => `"${String(value ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
  const rows = [['Date', 'Merchant', 'Category', 'Card', 'Owner', 'Amount INR', 'Reward value INR', 'Reward status', 'Points'], ...txs.map((tx) => [tx.date, tx.merchant, tx.category, getCard(tx.cardId)?.name, getCard(tx.cardId)?.owner, tx.amount, tx.reward, tx.rewardStatus, tx.points])];
  const blob = new Blob(['\uFEFF', rows.map((row) => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `folio-demo-${state.period}-${DEMO_DATE}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast(`Exported ${txs.length} demo transactions.`);
}

document.addEventListener('click', (event) => {
  const view = event.target.closest('[data-view]'); if (view) { setView(view.dataset.view); return; }
  const close = event.target.closest('.close-dialog'); if (close) { close.closest('dialog').close(); return; }
  const edit = event.target.closest('[data-edit]'); if (edit) { $('#details-dialog').close(); openCardForm(edit.dataset.edit); return; }
  const detail = event.target.closest('[data-detail]'); if (detail) { if (!$('#details-dialog').open) showDetails(detail.dataset.detail); return; }
  const period = event.target.closest('[data-period]'); if (period) { state.period = period.dataset.period; state.page = 0; $$('[data-period]').forEach((button) => { button.classList.toggle('active', button === period); button.setAttribute('aria-pressed', String(button === period)); }); renderAll(); return; }
  const query = event.target.closest('[data-query]'); if (query) runQuery(query.dataset.query);
});
$('#owner-filter').addEventListener('change', (event) => { state.owner = event.target.value; state.page = 0; renderAll(); });
$('#card-filter').addEventListener('change', (event) => { state.cardId = event.target.value; state.page = 0; renderAll(); });
$('#category-filter').addEventListener('change', (event) => { state.category = event.target.value; state.page = 0; renderTransactions(); });
$('#transaction-search').addEventListener('input', (event) => { state.search = event.target.value; state.page = 0; renderTransactions(); });
$('#prev-page').addEventListener('click', () => { state.page--; renderTransactions(); });
$('#next-page').addEventListener('click', () => { state.page++; renderTransactions(); });
$('#add-button').addEventListener('click', () => openCardForm());
$('#export-button').addEventListener('click', exportCsv);
$('#settings-button').addEventListener('click', () => $('#settings-dialog').showModal());
$('#info-button').addEventListener('click', () => $('#settings-dialog').showModal());
$('#quick-query-form').addEventListener('submit', (event) => { event.preventDefault(); const text = $('#quick-query').value.trim(); if (text) runQuery(text); else { $('#quick-query').focus(); toast('Try an amount and merchant, such as ₹5,000 on Amazon.'); } });
$('#advisor-query').addEventListener('change', () => { if ($('#advisor-query').value.trim()) { const parsed = parseQuery($('#advisor-query').value); $('#advisor-amount').value = Math.min(10000000, Math.max(1, parsed.amount)); $('#advisor-category').value = parsed.category; $('#advisor-merchant').value = parsed.merchant; } });
$('#advisor-form').addEventListener('submit', (event) => { event.preventDefault(); renderAdvisor(); });
$('#card-form').addEventListener('submit', (event) => {
  event.preventDefault(); const data = new FormData(event.target); const existing = getCard(data.get('id'));
  const rates = Object.fromEntries(CATEGORIES.filter((category) => data.get(`rate-${category}`) !== '').map((category) => [category, Number(data.get(`rate-${category}`))]));
  const merchantRates = { ...(existing?.merchantRates || {}) };
  editableMerchants.forEach((merchant) => { const value = data.get(`merchant-${merchant}`); if (value === '') delete merchantRates[merchant]; else merchantRates[merchant] = Number(value); });
  const card = { ...(existing || {}), id: existing?.id || `custom-${crypto.randomUUID()}`, name: data.get('name').trim(), issuer: data.get('issuer').trim(), owner: data.get('owner'), last4: data.get('last4'), limit: Number(data.get('limit')), annualFee: Number(data.get('annualFee')), statementDay: Number(data.get('statementDay')), dueDay: Number(data.get('dueDay')), color: data.get('color'), bestFor: data.getAll('bestFor'), baseRate: Number(data.get('baseRate')), rewardType: data.get('rewardType'), pointValue: Number(data.get('pointValue')), monthlyCap: data.get('monthlyCap') === '' ? null : Number(data.get('monthlyCap')), rates, merchantRates: existing?.merchantRates || {}, network: existing?.network || 'CARD', notes: data.get('notes').trim() };
  if (!card.name || !card.issuer) { toast('Please enter a card name and issuer.'); return; }
  card.merchantRates = merchantRates;
  if (existing) cards = cards.map((item) => item.id === existing.id ? card : item); else cards.push(card);
  persist(); $('#card-dialog').close(); renderAll(); toast(existing ? 'Card details updated in this browser.' : 'A little more possibility added to your wallet.');
});
$('#add-spend-button').addEventListener('click', () => { populateSelects(); $('#spend-form').reset(); $('#spend-form').elements.date.value = DEMO_DATE; if (state.cardId !== 'all') $('#spend-card').value = state.cardId; $('#spend-dialog').showModal(); });
$('#spend-form').addEventListener('submit', (event) => {
  event.preventDefault(); const data = new FormData(event.target); const card = getCard(data.get('cardId')); const amount = Number(data.get('amount')); const merchant = data.get('merchant').trim(); const date = data.get('date');
  if (!card || !merchant || amount <= 0 || amount > 10000000 || date < '2026-01-01' || date > DEMO_DATE) { toast('Please check the spend details and demo date range.'); return; }
  const monthEnd = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const asOf = monthEnd < DEMO_DATE ? monthEnd : DEMO_DATE;
  const estimate = recommendCards([card], transactions, { amount, merchant, category: data.get('category'), asOf })[0];
  transactions.push({ id: `manual-${crypto.randomUUID()}`, date, merchant, category: data.get('category'), cardId: card.id, amount, reward: estimate.reward, points: estimate.points, kind: card.rewardType, rewardStatus: 'pending' });
  persist(); $('#spend-dialog').close(); renderAll(); toast('Demo spend logged. Estimated rewards are pending.');
});
$('#reset-button').addEventListener('click', () => { cards = structuredClone(seedCards); transactions = structuredClone(seedTransactions); state.cardId = 'all'; state.owner = 'all'; state.search = ''; state.category = 'all'; state.page = 0; $('#owner-filter').value = 'all'; $('#transaction-search').value = ''; $('#category-filter').value = 'all'; persist(); $('#settings-dialog').close(); renderAll(); toast('Your original demo workspace is back.'); });
window.addEventListener('hashchange', () => { const view = location.hash.slice(1); if (Object.hasOwn(viewCopy, view)) setView(view); });
$$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));

const categoryOptions = CATEGORIES.map((category) => `<option>${category}</option>`).join('');
$('#category-filter').insertAdjacentHTML('beforeend', categoryOptions);
$('#advisor-category').innerHTML = categoryOptions; $('#advisor-category').value = 'Shopping';
$('#spend-category').innerHTML = categoryOptions;
hydrateIcons(); renderNews(); renderAll(); setView(location.hash.slice(1), false);
if (!storageAvailable) toast('Browser storage is unavailable. You can still explore the demo.');
