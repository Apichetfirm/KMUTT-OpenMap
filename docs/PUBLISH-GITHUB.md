# GitHub Pages deployment

Initiated by Firm Impulse · FIBO FRAB11.

Current public path: https://apichetfirm.github.io/KMUTT-OpenMap/. Baseline main deployment succeeded ([run 41229441308](https://github.com/Apichetfirm/KMUTT-OpenMap/actions/runs/41229441308)); old first-time-setup instructions are no longer the current blocker.

The feature branch is prepared for Codex A and must not self-merge. It does not deploy to Pages. Main's workflow installs locked dev tooling, checks syntax/data/unit tests and stages allowlisted static assets in `.site/`, then uses the existing GitHub Pages actions. App assets and data URLs are relative, and sharing preserves `/KMUTT-OpenMap/`. No SPA rewrite is required: building links use query parameters and survive refresh.

Validate locally with `npm ci && npm run check && npm run validate-data && npm test && npm run test:e2e && npm run build`. Serve `.site/` over HTTP to inspect the actual upload artifact. The source root remains directly serveable without npm installation. Do not upload `node_modules`, test traces, credentials or arbitrary workspace files.

CI runs controlled desktop/mobile Chromium fixtures so external tile uptime does not gate every test. Independently check live tiles and actual devices before release; see TEST-RESULTS.md. Main's deployment workflow keeps its existing contents-read/pages-write/id-token-write permissions. CI remains contents-read only. No repository settings or access configuration are changed by this implementation.

Rollback after an independently approved merge: revert the feature commits and rerun main's normal Pages pipeline. The v0.2 draft key is preserved and schema additions are additive; valid local records remain readable by the legacy proposal reader. Preserve the additional recovery key/export before any manual storage cleanup. Never delete local proposals to roll back a visual change.
