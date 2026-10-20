# From the demo to a private card tracker

Research checked on 20 October 2026. This is an implementation plan, not a live connection. The prototype should use fictional transactions and illustrative reward rules until Harsha and Shreya confirm their cards and issuer terms.

## Hosting and private data

Keep the frontend source and public demo on GitHub Pages. Pages serves static files and does not run server-side application languages. A live version therefore needs a separate authenticated API and database, or must keep its imported data entirely on the user's device. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

A private repository does not by itself make its Pages deployment private. GitHub's private Pages access control requires an eligible organization on GitHub Enterprise Cloud. For this personal repository, treat every deployed HTML, JavaScript, JSON and asset as public; never put real card or transaction records in the build. [GitHub Pages access control](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

Recommended live architecture: GitHub Pages frontend → authenticated API → private database, with a separate scheduled importer. Allow only the two intended user accounts; enforce ownership in the API/database, not merely the UI owner filter. Keep secrets in server environment variables or a managed secret store. An authenticated endpoint must verify the session on every request; CORS alone is not access control.

## Transaction sources

| Source | Proposed use | Limitations and next validation |
| --- | --- | --- |
| Manual entry and issuer CSV | First real-data release: local upload, column mapping, preview and confirm | No bank login needed. Confirm the export formats actually offered by each owned card. Handle refunds, duplicates, posting dates, fees and payments explicitly. |
| Statement PDF | Optional fallback after CSV | Password-protected statements and bank-specific layouts add complexity. Parse locally where practical; show a reconciliation preview and do not save statement passwords. |
| Gmail transaction alerts | Optional frequent updates after statement import works | Alerts are evidence of activity, not a complete settled ledger. Reconcile with statements, including reversals and missing alerts. Each owner should authorize their own mailbox. |
| Issuer API or Account Aggregator partner | Investigate card by card later | Do not promise a universal live credit-card feed. Validate eligible access, issuer/card coverage, supported fields, data freshness, pricing and consent terms before selecting a provider. |

Gmail body access through `gmail.readonly` is a restricted scope. Google documents verification requirements and exceptions, including qualifying personal-use applications; server handling of restricted data can introduce security assessment requirements. Confirm the applicable exception and obligations for this two-person app rather than assuming a public-app review or an exemption. Request read-only access only, process allowlisted issuer alerts, and provide disconnect/delete controls. [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [verification and exceptions](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)

For unattended Gmail updates, use a backend poller initially. Gmail push uses Cloud Pub/Sub, requires watch renewal at least every seven days, and can delay or drop notifications, so it still needs recovery synchronization. Show the actual last successful sync and import source in the UI. [Gmail push documentation](https://developers.google.com/workspace/gmail/api/guides/push)

India's Account Aggregator framework is a consented financial-data-sharing system. The government describes Financial Information Users as entities registered with and regulated by a financial-sector regulator; a personal website should not assume it can enroll directly as an FIU. ReBIT publishes ecosystem interfaces and schemas, but that alone does not establish that every owned credit card has transaction coverage through a chosen provider. This is a feasibility gate to check with an authorized partner, not a dependency for the first release. [Department of Financial Services](https://financialservices.gov.in/account-aggregator-framework), [ReBIT specifications](https://api.rebit.org.in/)

## Card information to keep

Recommended fields: issuer, product name, owner, network, last four digits, card nickname, annual fee, statement/due dates, optional limit, primary categories, user notes and benefit-rule sources. Store only masked details needed by the tracker. Use a password manager for full card credentials; omit full card numbers, CVV, PIN, OTP and banking passwords from this application's data model. This recommendation minimizes collection; it is not a claim that a personal tracker is a payment merchant. PCI SSC's payment-system guidance separately prohibits retaining verification codes after transaction authorization. [PCI SSC FAQ](https://www.pcisecuritystandards.org/faqs/1280/)

Browser storage in the demo is convenient persistence, not an encrypted card vault. For multi-device use, add authenticated private storage, encryption at rest, owner-scoped authorization, backups and deletion/export controls before accepting real financial data. Keep raw alert text and statement files only as long as needed for a reviewed import.

## Card recommendation assistant

Start with deterministic calculations over the user's owned cards and versioned, verified rules. A rule should record category/merchant, channel, spend threshold, rounding, cashback/point cap, exclusions, expiry, point-to-rupee valuation, issuer source URL and last reviewed date. Track cap consumption by the relevant billing or calendar period. Keep estimated rewards separate from rewards actually credited.

For a purchase, collect amount, merchant, category, online/offline channel and eligible owner. Return the eligible card ranking, points or cashback, estimated rupee value, effective rate, cap remaining and assumptions. If the merchant classification or valuation is unknown, label the result as an estimate. Let a model interpret the question and explain the computed result; do not use generated text as the reward calculator or source of issuer terms.

For genuine AI answers, send only the necessary masked card/rule context to a backend calling the OpenAI API. Keep the API key on that server; official OpenAI documentation explicitly says not to expose it in browser code. Add session checks, request limits and spending controls to the endpoint. The demo tile should identify its offline rule-based behavior until this connection exists. [Official OpenAI API authentication guidance](https://developers.openai.com/api/reference/overview#authentication)

## Suggested order

1. Approve the dummy-data dashboard, card library, owner/period filters and recommendation interaction.
2. Confirm actual cards, category preferences, points valuations, billing cycles, calendar versus financial-year reporting, and shared versus separate account access.
3. Add a reviewed CSV import and manual adjustments; reconcile one statement for each issuer. Define spend net of refunds, exclude bill payments, and show reward value divided by eligible spend for the selected period.
4. Add private authentication/storage for multi-device use, then a read-only Gmail pilot for one issuer with statement reconciliation.
5. Add the server-side assistant and a small dated news feed with publisher links. Keep demonstration news clearly labeled until a real source is connected.
6. Evaluate direct issuer/partner feeds only after confirming real coverage and access.
