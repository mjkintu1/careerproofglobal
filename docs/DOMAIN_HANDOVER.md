# careerproofglobal.com: domain, DNS and hosting handover

Prepared 11 Nov 2026. Domain registered at **Namecheap**. Today it only has Namecheap's parking record (`CNAME www → parkingpage.namecheap.com`).

**Target set-up**

```
Namecheap (registrar only) ──nameservers──▶ Cloudflare (all DNS records)
                                               ├─ careerproofglobal.com      ─▶ Vercel now, Google Cloud later
                                               ├─ www.careerproofglobal.com  ─▶ redirects to the apex
                                               ├─ email (MX, SPF, DKIM, DMARC)
                                               └─ Google verification (TXT)
```

DNS lives in Cloudflare, not Namecheap. Moving hosting from Vercel to Google Cloud later then means editing two records in Cloudflare, with no registrar change and no email downtime.

**Canonical address:** `https://careerproofglobal.com` (apex). `www` and `careerproofglobal.vercel.app` redirect to it.

Every value marked *copy from dashboard* is generated per account or project. Copy it from that screen; never reuse values from another project or a tutorial.

---

## 0. Before you start: account ownership

Do this first. It matters more than any DNS record.

| Account | Owner login | Second admin | 2-step verification |
|---|---|---|---|
| Namecheap | careerproofglobal@gmail.com | [FILL IN] | [ ] on |
| Cloudflare | careerproofglobal@gmail.com | [FILL IN] (Members → Administrator) | [ ] on |
| Vercel | careerproofglobal@gmail.com (team owner) | [FILL IN] | [ ] on |
| Google Cloud / Search Console | careerproofglobal@gmail.com | [FILL IN] (IAM → Owner) | [ ] on |
| GitHub (mjkintu1/careerproofglobal) | [FILL IN] | [FILL IN] | [ ] on |

- **Owner account:** use the shared company account as owner everywhere, not a personal one, so no single founder leaving locks the company out.
- **Backup codes:** store each service's 2-step backup codes in a shared password manager, not in this repo.
- **At Namecheap:**
  - turn on **Auto-Renew**;
  - keep **Domain Privacy** on;
  - keep the **Registrar Lock** on (Domain tab).

---

## 1. Move DNS to Cloudflare

1. **Add the domain:** Cloudflare → **Add a domain** → `careerproofglobal.com` → **Free** plan.
2. **Imported records:** Cloudflare imports existing records. **Delete** the imported `www → parkingpage.namecheap.com` CNAME.
3. **Nameservers:** Cloudflare shows two nameservers, e.g. `xxx.ns.cloudflare.com` and `yyy.ns.cloudflare.com` (*copy from dashboard*).
4. **Point Namecheap at them:** Namecheap → Domain List → careerproofglobal.com → **Domain** tab → **Nameservers** → **Custom DNS** → paste both → save (green tick).
5. **Wait for "Active":** Cloudflare emails you when the domain is active, usually within an hour and at most 24 hours.

After this, Namecheap's **Advanced DNS** tab is no longer used. Records added there are ignored.

**Cloudflare settings once active**

| Setting | Value | Why |
|---|---|---|
| SSL/TLS → Overview → mode | **Full (strict)** | Never **Flexible**: it causes redirect loops with Vercel |
| SSL/TLS → Edge Certificates → Always Use HTTPS | On | |
| SSL/TLS → Edge Certificates → Minimum TLS | 1.2 | |
| DNS → Settings → **DNSSEC** | Enable *after* everything works (step 6) | |

---

## 2. Website on Vercel (now)

**In Vercel:** project → **Settings → Domains → Add Existing**.

1. **Add the apex:** add `careerproofglobal.com`. When Vercel asks to add `www`, accept.
2. **Set the redirect:** make `careerproofglobal.com` the primary domain. Set `www.careerproofglobal.com` to **Redirect to careerproofglobal.com (308)**.
3. **Copy the records:** Vercel shows one **A** record for the apex and one **CNAME** for `www`. The CNAME is project-specific, like `d1d4fc829fe7bc7c.vercel-dns-017.com`.

**In Cloudflare → DNS → Records**, add exactly what Vercel showed:

| Type | Name | Content | Proxy status | TTL |
|---|---|---|---|---|
| A | `@` | *copy from Vercel* | **DNS only** (grey cloud) | Auto |
| CNAME | `www` | *copy from Vercel* | **DNS only** (grey cloud) | Auto |

- **Why DNS only:** Vercel recommends it, because Vercel already provides the CDN and HTTPS. Turning on Cloudflare's proxy (orange cloud) would:
  - add a second cache that can serve stale pages after a deploy;
  - hide visitors' real location from Vercel;
  - break Vercel's bot protection.
- **No AAAA records:** if Cloudflare imported any for `@` or `www`, delete them.

**Then, in Vercel → Settings → Environment Variables (Production):**

| Name | Value | Effect |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://careerproofglobal.com` | Canonical links, sitemap, Open Graph and structured data use the new domain. This is also the code's default from this branch on. |
| `REDIRECT_FROM_HOSTS` | `careerproofglobal.vercel.app` | Old address permanently redirects to the new one, keeping the path. **Set this only after** the new domain shows "Valid Configuration" in Vercel. |

**Redeploy** production after changing environment variables. Variables apply only to new builds.

**Check:**
- `https://careerproofglobal.com` loads with a padlock;
- `https://www.careerproofglobal.com/faqs` lands on `https://careerproofglobal.com/faqs`;
- `https://careerproofglobal.vercel.app/careers` lands on `https://careerproofglobal.com/careers`;
- `https://careerproofglobal.com/sitemap.xml` lists `careerproofglobal.com` URLs.

---

## 3. Email on the domain (choose one)

A domain can have only one set of MX records, so pick **A** or **B**.

**A. Cloudflare Email Routing (free, recommended for now).** Addresses like `hello@careerproofglobal.com` forward to `careerproofglobal@gmail.com`.

1. **Set up routing:** Cloudflare → **Email → Email Routing → Get started**. Create `hello@`, `admissions@` or `partners@` and set the destination to `careerproofglobal@gmail.com`; verify the link Cloudflare emails.
2. **Records:** Cloudflare adds its own MX records and an SPF TXT record automatically. Accept them and don't type them by hand.
3. **Limitation:** this only *receives*. Replies still come from the Gmail address unless you set up "Send mail as" in Gmail with an SMTP service.

**B. Google Workspace (paid; send and receive as @careerproofglobal.com).**

1. **Sign up:** Workspace sign-up with domain `careerproofglobal.com`. Google gives a verification TXT record (*copy from dashboard*).
2. **Add these in Cloudflare (DNS only):**

| Type | Name | Content | Priority |
|---|---|---|---|
| TXT | `@` | `google-site-verification=…` *copy from Google* | |
| MX | `@` | `smtp.google.com` | 1 |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | |
| TXT | `google._domainkey` | *copy from Admin console → Apps → Gmail → Authenticate email* | |

3. **One SPF record only:** if Cloudflare Email Routing was used before, disable it first and remove its MX and SPF records.

**Either way, add DMARC once SPF works:**

| Type | Name | Content |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:careerproofglobal@gmail.com` |

Start at `p=none` to monitor. After a few weeks of clean reports, move to `p=quarantine`.

Once a domain address works, update the contact email in `apps/web/src/lib/site.ts` (`OPERATOR.email`) and on the legal pages.

---

## 4. Google Cloud Console and Search Console

**4.1 Verify the domain with Google (do this first).** Every other Google step depends on it.

1. **Add the property:** Google Search Console → **Add property → Domain** → `careerproofglobal.com`.
2. **Add the TXT record:** Google shows `google-site-verification=…` (*copy*). Add it in Cloudflare as **TXT** `@`. Keep it forever; removing it un-verifies the domain.
3. **Submit the sitemap:** Search Console → Sitemaps → `https://careerproofglobal.com/sitemap.xml`.
4. **Old property:** if a property exists for the `vercel.app` address, keep it. After the redirect is on, use **Change of address** to the new domain.

**4.2 Google Cloud project.**

1. **Create the project:** console.cloud.google.com → **New project** `careerproof-global`. Attach billing only when a paid service is needed, and set a **budget alert** (Billing → Budgets, e.g. US$10/month) at the same time.
2. **IAM:** add the second admin as **Owner**. Give everyone else the narrowest role they need.
3. **If you add "Sign in with Google" later:**
   - **APIs & Services → OAuth consent screen:**
     - authorised domain: `careerproofglobal.com`;
     - home page `https://careerproofglobal.com`;
     - privacy policy `https://careerproofglobal.com/privacy`;
     - terms `https://careerproofglobal.com/terms` (these pages already exist).
   - **Credentials → OAuth client (Web):**
     - JavaScript origin `https://careerproofglobal.com`;
     - redirect URIs from the auth provider you use.
   - **Supabase Auth:** set its Site URL to the new domain too.
   - **No sign-in today:** the site has none, so nothing here is needed yet.

---

## 5. Later: moving hosting from Vercel to Google Cloud

Because DNS is in Cloudflare, this is a record swap with no downtime:

1. **Deploy on Google Cloud:**
   - **Firebase App Hosting** is the simplest option for Next.js;
   - or **Cloud Run** in a region near users, with the same environment variables (`NEXT_PUBLIC_SITE_URL`, the database variables).
2. **Add the domain on the Google side:**
   - App Hosting → **Add custom domain**;
   - or Cloud Run → **Domain mappings**, or a load balancer.
   - Google shows the A, AAAA, CNAME and TXT values (*copy from console*). Domain verification from step 4.1 must be done first.
3. **Lower the TTL:** in Cloudflare, set the TTL on `@` and `www` to 5 minutes a day ahead.
4. **Swap the records:**
   - replace Vercel's A record and `www` CNAME with Google's values, keeping them DNS only;
   - add the TXT records Google asks for;
   - if you ever add a CAA record, it must allow both `letsencrypt.org` (Vercel) and `pki.goog` (Google) during the switch.
5. **Wait for the certificate:** wait for Google to show the certificate as active, then test the URLs in section 2.
6. **Keep Vercel running a while:** leave the Vercel project for at least two weeks for rollback. Keep `careerproofglobal.vercel.app` redirecting until **after February 2027**, because the HBS application and older emails link to it.

**Rollback:** put Vercel's original A and CNAME values back in Cloudflare. Changes take effect within the TTL.

---

## 6. Hardening (after everything works)

- **DNSSEC:**
  1. Cloudflare → DNS → Settings → **Enable DNSSEC**. It shows a DS record.
  2. Namecheap → Advanced DNS → **DNSSEC** → add that DS record (key tag, algorithm, digest type, digest).
  3. If you ever move DNS away from Cloudflare, **disable DNSSEC at Namecheap first**.
- **Leave Cloudflare's proxy off** for Vercel records (section 2).
- **Health checks:** add the site to a free uptime monitor, and add the domain to Search Console alerts.

---

## 7. Final record set (Vercel + Cloudflare Email Routing)

| Type | Name | Content | Proxy | Source |
|---|---|---|---|---|
| A | `@` | *Vercel value* | DNS only | Vercel → Domains |
| CNAME | `www` | *Vercel project CNAME* | DNS only | Vercel → Domains |
| TXT | `@` | `google-site-verification=…` | – | Search Console |
| MX ×3 | `@` | added by Cloudflare | – | Email Routing |
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` (added by Cloudflare) | – | Email Routing |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:careerproofglobal@gmail.com` | – | Section 3 |

Nothing else. In particular, no parking record and no AAAA records.

## Order of work, given the HBS deadline (12 Nov 2026)

1. Today: sections 0, 1 and 2. DNS changes can take hours, so start now.
2. Submit the HBS form with `https://careerproofglobal.com` **only if** it already loads with a padlock; otherwise use `https://careerproofglobal.vercel.app`, which will keep working (and later redirect).
3. This week: sections 3, 4.1 and 6.
4. When hosting moves: section 5.
