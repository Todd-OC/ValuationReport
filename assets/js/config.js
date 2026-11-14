/*
 * Organic Capital — Seller Valuation Prompt Tool
 * Site settings. This is the only file you should need to edit day to day.
 */
window.OC_CONFIG = {
  // Who sellers reach when they choose to get in touch.
  contactName: "Todd Lajeunesse",
  contactEmail: "todd@organic-capital.com",
  website: "https://www.organic-capital.com",

  // Scheduling page (Calendly, Google Calendar booking page, etc.).
  // Leave empty and the "Book a call" option is hidden.
  bookingUrl: "",

  // Where the on-page contact form is sent. Paste the endpoint from a form
  // service such as Formspree ("https://formspree.io/f/xxxxxxx").
  // Leave empty and the form opens the seller's own email app instead.
  contactFormEndpoint: "",

  // Extra fields some form services require with every submission,
  // e.g. Web3Forms needs { access_key: "..." }.
  contactFormExtraFields: {},

  // Shown in the generated prompt so you can tell which version a seller used.
  promptVersion: "1.0"
};
