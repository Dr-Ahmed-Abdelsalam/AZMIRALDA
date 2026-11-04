# AZMIRALDA — remediation verification report

Branch: `audit/fix-forms-courses-mobile-20261105`

## Changes
1. **Turnstile:** optional public site key in `index.html`, explicit widget loading and tokens for both forms, protected hostname verification on backend. The site key is blank pending Cloudflare configuration.
2. **Request limits:** streamed JSON request reading enforces 12,000 bytes even without a Content-Length header.
3. **Catalogue:** `assets/courses.json` is canonical, with a deterministic generated `assets/courses.js`. Matrix/explorer records remain separate.
4. **Code organization:** extracted six inline style blocks and two inline script blocks from `courses.html` to `assets/courses-page.css` and `assets/courses-page.js`.
5. **Typography:** increased small text and mobile input sizes; visual browser verification still required.
6. **Link and API checks:** `npm run check` runs syntax checks, form handler tests, catalogue comparison and local link/anchor verification.

## Manual Cloudflare Pages checks (not automatable with repository access alone)
- Configure **both** public Turnstile site key and private Cloudflare Pages `TURNSTILE_SECRET_KEY` for the matching deployment; optionally set `TURNSTILE_EXPECTED_HOSTNAME`.
- Configure `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and verified `MAIL_FROM` under production/preview environment settings. Do **not** commit secrets.
- Open preview deployment; send real consented contact and instructor requests, confirm arrival at intended mailbox, and confirm rejection of missing/expired Turnstile tokens.
- At widths 375px, 390px, 768px and desktop: inspect navigation, training cards, forms, typography, overflowing matrices, and bilingual layouts.
- Confirm `courses.html?view=matrix#training-views` and all links; inspect browser console and network responses.
- Review and merge PR only after CI passes and these live checks are complete.

**Status:** Code changes committed; live delivery and device/browser results are not claimed until actually verified.

## Cleanup revision
- Removed the obsolete 14px course-explorer font reset, retaining current responsive typography.
- Removed excess empty lines in courses.html.
- Tightened request JSON content-type parsing.
- Added media-type and invalid-body tests, plus a CI source hygiene check.
- No maritime training datasets or unpublished governance documents were deleted.
