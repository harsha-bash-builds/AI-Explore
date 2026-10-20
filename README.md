# Folio · Personal credit card dashboard

A navy-and-gold portfolio for Harsha and Shreya: spending, rewards, card purposes and a card concierge. The first release is a public UI demo with synthetic spending and masked card metadata.

## Run locally

Use Node.js 20 or newer. There are no external dependencies or build steps.

```powershell
cd cardfolio
npm run dev
```

Open **http://127.0.0.1:4173**. Keep the terminal running; press Ctrl+C to stop.

```powershell
npm test
npm run check
```

Tests verify spending filters, reward calculations and recommendation behavior. The check command validates JavaScript syntax and local asset/import paths.

## Demo features

- Overview with month, quarter, half-year, year and YTD filters, plus card and owner filters.
- Spending, credited cashback, estimated reward value and effective reward rate.
- Wallet with editable masked card details, intended uses and illustrative benefit rules.
- Searchable transactions, manual demo spends and CSV export.
- Rule-based card comparisons by merchant/category and amount; ChatGPT connectivity is a future phase.
- Three clearly labeled editorial news placeholders.

The demo uses 20 October 2026 as its reporting date. Card edits and manually entered spends persist in the current browser. **Reset demo data** restores the seed data. Use synthetic data in this public preview; it is not a credential vault. Card names may match the owned portfolio, but limits, dates, last-four digits, spending and benefit rates are sample data.

## Publish on GitHub Pages

1. Push the reviewed files to the `main` branch of `harsha-bash-builds/AI-Explore`.
2. In the repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Open **Actions → Deploy Folio to GitHub Pages** and check the run, or choose **Run workflow**.

The workflow runs the Node.js 20 tests and resource checks, then uploads the static `cardfolio` directory. Its `index.html` is the published entry point, so the expected site URL is **https://harsha-bash-builds.github.io/AI-Explore/**. The workflow's deployment output is the authoritative URL after a successful run. [GitHub's Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

No API keys, banking credentials or real financial records belong in this repository or its Pages artifact. All files inside `cardfolio` are published. Future real-data imports, private storage and an OpenAI-powered assistant need a separate privacy architecture; see [the integration plan](cardfolio/docs/INTEGRATIONS.md).

## Files

`cardfolio/index.html`, `styles.css` and `js/` contain the app. `tests/` verifies its business logic, `scripts/` contains dependency-free local tooling, and `.github/workflows/deploy-pages.yml` handles publishing. No framework, package installation or compilation is required.
