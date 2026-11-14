# Organic Capital — Seller Valuation Prompt Tool

A public web tool for business owners who are thinking about selling. The owner answers a few
general, non-proprietary questions (industry, age of the business, province and so on) and the
tool gives them a prompt to paste into their own AI assistant. That prompt has their AI interview
them privately about their financials and write a valuation report using Organic Capital's
framework. If they like the result, they can choose to get in touch.

**Nothing the owner types is sent to Organic Capital.** The prompt is assembled in their browser.
The only thing that can ever leave the page is the contact form, and only when they press Send.

## What is in here

| File | What it is |
|---|---|
| `index.html` | The page |
| `assets/js/config.js` | **Settings you can edit**: contact email, booking link, contact form endpoint |
| `assets/js/prompt.js` | The form questions, the "fit" notes and the valuation prompt itself |
| `assets/js/app.js` | Page behaviour (copy, download, email, contact form, embedding) |
| `assets/css/styles.css` | Styling, following the Organic Capital brand guidelines |
| `assets/img/` | Logo files |

There is no build step and no server. It is a plain static site, so any static host will serve it.

## Settings (`assets/js/config.js`)

| Setting | What it does |
|---|---|
| `contactName`, `contactEmail` | Who the "Email" button and the prompt point sellers to |
| `website` | Where the logo links, and the address given in the prompt |
| `bookingUrl` | Scheduling page. **Empty = the "Book a call" card is hidden** |
| `contactFormEndpoint` | Where the on-page contact form is delivered (see below). **Empty = the form opens the seller's own email app instead** |
| `contactFormExtraFields` | Extra fields a form service may require, e.g. an access key |
| `promptVersion` | Printed at the top of each prompt so you can tell which version a seller used |

### Receiving the contact form

The contact form needs somewhere to deliver messages. Create a form on a service such as
[Formspree](https://formspree.io) (free tier available), point it at your inbox, and paste the
endpoint it gives you into `contactFormEndpoint`. Until then the form still works, by opening a
ready-written email in the seller's own email app.

## Putting it online

1. **Host it.** With this repository on GitHub, the simplest route is GitHub Pages:
   *Settings → Pages → Deploy from a branch → `main` / root*. The tool will then be live at
   `https://todd-oc.github.io/ValuationReport/`. (GitHub Pages needs a public repository or a paid
   plan. Netlify, Cloudflare Pages and Vercel all work the same way with a private one.)
2. **Embed it** in the Webflow or Framer page where you want it to appear, using the code below.

### Embed code (Webflow "Embed" element, or Framer "Embed" → HTML)

Replace the address in both places if you host it somewhere else.

```html
<iframe id="oc-valuation"
        src="https://todd-oc.github.io/ValuationReport/"
        title="Organic Capital valuation prompt"
        allow="clipboard-write"
        loading="lazy"
        style="width:100%; border:0; min-height:900px;"></iframe>
<script>
  window.addEventListener("message", function (event) {
    if (event.origin !== "https://todd-oc.github.io") return;
    var frame = document.getElementById("oc-valuation");
    var data = event.data || {};
    if (data.type === "oc-valuation-height") frame.style.height = data.height + "px";
    if (data.type === "oc-valuation-scroll") frame.scrollIntoView({ behavior: "smooth", block: "start" });
  });
</script>
```

What this does:

- The tool detects that it is inside another page and hides its own header, so it sits inside
  your site's design.
- The short script lets the frame grow and shrink to fit its content, so there is no second
  scrollbar, and scrolls back to the top when the prompt appears.
- `allow="clipboard-write"` lets the "Copy the prompt" button work inside the frame.

You can also simply link to the hosted address as a standalone page. A custom address such as
`valuation.organic-capital.com` can be pointed at it from your domain settings.

### Brand typeface

The brand typeface, Drummond Variable, is an Adobe Fonts family. The page uses it when it is
available and falls back to Georgia otherwise. To load it for every visitor, add your Adobe Fonts
web project `<link>` tag to the `<head>` of `index.html`.

## Changing the questions or the prompt

Everything a seller sees in the form, and every word of the prompt, lives in
`assets/js/prompt.js`:

- `SECTIONS` — the form questions and answer choices.
- `fitNotes` — the "first read on fit" shown beside the prompt.
- `buildPrompt` — the valuation prompt.

The prompt is the public, seller-facing version of OC's valuation framework. It publishes the
method and criteria (how earnings are normalised, the 1.50x debt service coverage test, the size
and margin preferences) and asks for a single indicative fair-value range plus an illustrative
deal structure. It deliberately does **not** include OC's internal attractive / maximum price
tiers or anything about specific past deals.

## Trying it locally

Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit
`http://localhost:8000`.
