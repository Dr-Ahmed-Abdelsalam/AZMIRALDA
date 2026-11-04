# AZMIRALDA Digital Ecosystem — Phase 1

Bilingual Arabic/English corporate website, responsive maritime training catalogue (16 programs), instructor interest form, contact form and Cloudflare Pages Functions.

## Brand / skill
- The official supplied AZMIRALDA logo and banner are in `assets/`.
- Layout follows the uploaded `azmiralda-ui-ux` design skill: Maritime Premium + Modern Corporate, accessibility, localization, careful accreditation language.
- Courses are extracted from the supplied training pathways HTML; course status is **proposed for approval**, not approved.

## Preview
Open `index.html` in a browser for static interface testing. Course search and bilingual switching work locally. Form submission requires deployment; local file previews do **not** send emails.

## GitHub + Cloudflare Pages deployment
1. Put this directory's contents at the repository root and push to GitHub.
2. In Cloudflare dashboard → Workers & Pages → Create Pages project → connect your GitHub repository.
3. Framework preset: None. Build command: leave blank. Build output directory: `/` (repository root; Cloudflare may use `.`).
4. Add encrypted production environment variables in Pages project Settings → Variables and Secrets:
   - `RESEND_API_KEY`: Resend API key created by your authorized mail administrator.
   - `CONTACT_TO_EMAIL`: mailbox receiving enquiries (e.g., official company email).
   - `MAIL_FROM`: verified sender at a verified domain, e.g. `AZMIRALDA <forms@azmiralda.com>` **after verification**.
5. Verify the sending domain at Resend, complete DNS verification, redeploy and test both forms.
6. Attach `www.azmiralda.com` through Cloudflare custom domains after confirming DNS ownership.

**Security and operating notes:** Cloudflare Pages Functions are required for both `/api/contact` and `/api/instructor`. The source includes server validation, HTML escaping, request-size bounds and consent. Add Cloudflare WAF/rate limiting, monitoring, a privacy notice, retention/deletion procedures, spam prevention and (if using Turnstile) a frontend widget before a public campaign. The backend supports a Turnstile secret but the frontend does not yet present the token; do not set `TURNSTILE_SECRET_KEY` until the widget is integrated. Resend is a third-party email provider, so submitted form data is transmitted to it; the static site has no database, no file upload and no certificate issuance or authentication.

## Acceptance checks
- Arabic RTL and English LTR toggle without page reload.
- Responsive menu, keyboard navigation, form labels and errors.
- Courses: 16 total, four sections; filters and detail dialog.
- Institution status described accurately and unambiguously.
- Contact and instructor submissions deliver verified email only after backend configuration.
- No false promise of issued certificates/approval.

## Data provenance
Source files: official logo JPEG and banner PNG provided by the user; `برامج أزميرالدا ومساراتها.html` for structured course details, `كتالوج برامج أزميرالدا.pdf` for course hours, grouping, corporate phone/address and proposed approval status.


## Additional course explorer
`courses.html` is integrated from the user-supplied `مصفوفة_دورات_أزميرالدا.html`. It retains all 68 records, 24 jobs, three interactive tabs, filtering, and original source notes. It is an Arabic-language planning tool. The home page links to it; it does **not** mean all 68 programmes are approved or open for registration. The original 16-programme proposed first-phase catalogue remains on the home page.

## Maritime Dispute Resolution Centre (Project in Formation)

- `dispute-resolution.html`: bilingual Arabic/English landing page, linked from `index.html`.
- Governance rules, mediation procedures and arbitration rules are not published. The Centre has a bilingual Coming Soon page only.
- The Centre is **not operational**; no arbitration, mediation, expert appointments or payments are accepted through this project.
- Before launch: confirm legal form and authorisations, approve rules and fees, establish independent governance, security/privacy controls and formal launch decision. Do not make the drafts operational by removing the notice alone.

## Company news and programme ticker
- `news.html` is a bilingual company updates section linked from the main navigation and footer.
- The home page includes a pauseable accessible scrolling ticker populated from the phase-one proposed programme catalogue (`assets/courses.js`), with no invented announcements or enrollment claims.
- When operational company news becomes available, replace preliminary cards only with reviewed, dated content.
