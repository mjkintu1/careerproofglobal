# SEO, answer-engine optimisation (AEO) and edge protection

Branch `feat/seo-hardening`, 11 Nov 2026. What the code now does, and what to set up in Vercel, Cloudflare and Google.

## 1. In the code (this branch)

**Search (SEO)**

- Every page has its own canonical URL and its own Open Graph and Twitter title, description and URL (`src/lib/seo.ts`). Before this, every shared link previewed as the home page.
- Branded `not-found` (404) and `error` pages. Next.js returns status 404 with `noindex` automatically.
- `robots.txt` allows every crawler on public pages and keeps `/api/` and the simulator's result lists out. API responses also send `X-Robots-Tag: noindex`.
- Unchanged and already in place:
  - `sitemap.xml` (about 4,900 canonical URLs, within Google's 50,000 limit);
  - the site-wide Open Graph image;
  - Organization and WebSite data;
  - Occupation and BreadcrumbList data on careers;
  - FAQPage data on `/faqs`.

**Answer engines (AEO)**: ChatGPT search, Perplexity, Gemini, Claude, Google AI Overviews

- **Answer-first career pages.** A "Quick answers" block near the top of all 938 career pages answers the questions people ask assistants:
  - what the job involves;
  - how to become one (routes with durations);
  - which school subjects help;
  - who regulates it in the chosen country.

  It is built only from data already on the page. The same answers are published as FAQPage structured data, so the visible text and the data always match.
- **`/llms.txt`.** A plain-language map of the site for AI assistants. It lists the main sections with live counts, where the data comes from, that we never predict admission chances, and how to cite us.
- **Crawler policy.** AI *search and answer* crawlers are allowed, because being cited is how students find us. To opt out of AI *training* only, see the note in `src/app/robots.ts`; that does not affect citations.
- **Why it works for AEO.** Answer engines prefer pages that answer directly, name their sources and are consistent. Every figure on the site already names its official publisher and year, which is our strongest signal.

**Protection**

- **Security headers on every response:**
  - **Content-Security-Policy:** only the site's own scripts, styles, images and fonts; no framing by other sites.
  - **Strict-Transport-Security:** two years, including subdomains.
  - **X-Content-Type-Options:** `nosniff`.
  - **X-Frame-Options:** `DENY`.
  - **Referrer-Policy:** `strict-origin-when-cross-origin`.
  - **Permissions-Policy:** camera, microphone, location, payment and USB off.
  - **Cross-Origin-Opener-Policy:** `same-origin`.
- **API hardening.** `/api/paths` and `/api/pay`:
  - reject over-long input before doing any work;
  - let Vercel's CDN cache answers for a day (`s-maxage`), so repeated or abusive queries don't reach the route search.
- **The CSP has no nonces on purpose.** Nonces would force every page to render dynamically and lose static prerendering. The site loads nothing from third parties, so the policy is still tight.

## 2. Vercel (dashboard: project → Firewall)

The firewall is available on all plans, and DDoS mitigation is automatic.

| Setting | Value | Why |
|---|---|---|
| **Bot Protection** (managed ruleset) | **On**, action *Challenge* | Stops scripted scraping and abuse. Verified search and AI crawlers are not challenged. |
| **AI Bots** (managed ruleset) | **Off**, or block *AI crawlers (training)* only | Keep *AI assistants and search* allowed, or ChatGPT and Perplexity cannot cite us. |
| **Custom rule: rate limit `/api/`** | Path starts with `/api/` → rate limit, e.g. 60 requests per minute per IP → *Deny* (429) | Protects the route search. Check your plan's rate-limit allowance in the rule editor. |
| **Custom rule: block bad paths** | Path matches `/wp-admin`, `/.env`, `/xmlrpc.php`, `/.git` → *Deny* | Common vulnerability scanners; we have none of these paths. |
| **Attack Mode** | Off; turn **on** only during an attack | Challenges every visitor while it is on. |
| **Firewall alerts** | On, to careerproofglobal@gmail.com | Early warning. |

After deploying, open **Firewall → Traffic** for a day to confirm that real visitors and Googlebot are allowed.

## 3. Cloudflare: DNS only (no proxy)

We chose Cloudflare as **DNS only**, as Vercel recommends. Protection comes from Vercel (section 2) and the app (section 1), not from Cloudflare's proxy.

1. **Add the domain:** Cloudflare → Add a domain → `careerproofglobal.com` → Free plan. Cloudflare imports the records from Namecheap.
2. **Check the records:** exactly these two, both **DNS only** (grey cloud):
   - `A @ 216.198.79.1`;
   - `CNAME www` → *Vercel's value*.

   Delete any parking or AAAA records.
3. **Switch nameservers:** Namecheap → Domain → Nameservers → **Custom DNS** → Cloudflare's two nameservers. The site keeps working throughout, because the records are the same.
4. **Once Cloudflare shows Active:**
   - **DNSSEC** on in Cloudflare, then add the DS record at Namecheap (Advanced DNS → DNSSEC);
   - **Email Routing**, if wanted: `hello@careerproofglobal.com` → Gmail (see `DOMAIN_HANDOVER.md`, section 3).
5. **Leave proxy, WAF and caching off.** Cloudflare's WAF and bot rules apply only to proxied (orange) records. With DNS only, Vercel's firewall does that job.

Optional later: a **CAA** record, so only Vercel's certificate authority (Let's Encrypt) can issue certificates: `CAA @ 0 issue "letsencrypt.org"`. If hosting ever moves to Google, add `pki.goog` first.

## 4. Google and Bing

1. **Google Search Console:**
   - add a **Domain** property and verify it with a TXT record;
   - submit `https://careerproofglobal.com/sitemap.xml`;
   - use **Change of address** from the vercel.app property once the redirect is on.
2. **Bing Webmaster Tools:** import from Search Console. Bing powers ChatGPT search and Copilot results, so this matters for AEO.
3. **Check the new tags:**
   - **Rich Results Test:** run it on one career page and on `/faqs` (FAQPage, Occupation, BreadcrumbList);
   - **Link previews:** share one career link in WhatsApp or LinkedIn. It should show that career's title, not the home page.

## 5. Ideas not done yet

- An `Organization` `sameAs` list, once the social accounts exist (`SOCIAL_PROFILES` in `src/lib/site.ts`).
- A last-reviewed date on data pages, so answer engines can see freshness. Use real review dates only.
- `Dataset` structured data on `/pay-coverage` and the admission pages.
- HSTS preload, once every subdomain is permanently HTTPS.
