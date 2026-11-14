/*
 * Organic Capital — Seller Valuation Prompt Tool
 * The form definition, the fit notes, and the valuation prompt itself.
 *
 * Everything in this file runs in the visitor's browser. Nothing is sent anywhere.
 * The prompt text below is the public, seller-facing version of OC's valuation
 * framework: it publishes the method and criteria, but not OC's price limits.
 */
(function (root) {
  "use strict";

  var PROVINCES = [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"
  ];

  var INDUSTRIES = [
    { group: "Home and property services", items: [
      "HVAC, plumbing or electrical", "Landscaping or grounds maintenance", "Pest control",
      "Cleaning or janitorial", "Other home or property service"] },
    { group: "Food and beverage", items: [
      "Restaurant or café", "Pub, bar or brewery", "Bakery or specialty food production",
      "Grocery or specialty food retail", "Coffee roasting or beverage production"] },
    { group: "Retail", items: [
      "Specialty retail store", "Furniture, mattress or home goods",
      "Hardware, building supply or garden centre", "Online or e-commerce retail"] },
    { group: "Manufacturing and trades", items: [
      "Light manufacturing or fabrication", "Signage, printing or packaging",
      "Construction or specialty contracting", "Machine shop or metalwork"] },
    { group: "Automotive and transport", items: [
      "Auto repair or body shop", "Equipment or vehicle sales and rental",
      "Trucking, delivery or logistics"] },
    { group: "Business and professional services", items: [
      "Marketing, creative or media agency", "Accounting, bookkeeping or consulting",
      "IT or managed services", "Staffing, security or facilities services"] },
    { group: "Health, wellness and personal care", items: [
      "Dental, medical or allied health clinic", "Fitness, spa or salon", "Pharmacy",
      "Childcare or education", "Pet care or veterinary"] },
    { group: "Hospitality and recreation", items: [
      "Hotel, motel, resort or campground", "Tourism or recreation operator"] },
    { group: "Distribution and agriculture", items: [
      "Wholesale or distribution", "Farm, nursery or agri-business"] },
    { group: "Something else", items: ["Other (describe it below)"] }
  ];

  /*
   * Form definition. Each field's `label` is what the seller sees; `short` is how
   * the answer is labelled in the prompt and in any email they choose to send.
   */
  var SECTIONS = [
    {
      id: "business",
      title: "Your business",
      intro: "The basics. No business name needed.",
      fields: [
        { id: "industry", short: "Industry", label: "What kind of business is it?",
          type: "select", required: true, groups: INDUSTRIES },
        { id: "description", short: "What the business does", wide: true,
          label: "In a sentence, what does it do?", type: "text", maxLength: 240,
          hint: "Optional. For example: “Residential heating and cooling installs and service.”" },
        { id: "years", short: "Years in operation", label: "How long has it been operating?",
          type: "select", required: true,
          options: ["Under 3 years", "3 to 5 years", "6 to 10 years", "11 to 20 years",
                    "21 to 40 years", "More than 40 years"] },
        { id: "province", short: "Province or territory", label: "Province or territory",
          type: "select", required: true, options: PROVINCES },
        { id: "community", short: "Community", label: "What kind of community is it in?",
          type: "select",
          options: ["Major city", "Mid-size city", "Small town", "Rural or remote"] },
        { id: "locations", short: "Locations", label: "How many locations?",
          type: "select",
          options: ["One location", "Two or three locations", "Four or more locations",
                    "Mobile or home-based, no public premises"] },
        { id: "employees", short: "Employees besides the owners",
          label: "How many employees, besides the owners?", type: "select",
          options: ["None", "1 to 5", "6 to 15", "16 to 30", "31 to 75", "More than 75"] }
      ]
    },
    {
      id: "customers",
      title: "Customers and sales",
      intro: "General patterns only. Your AI will ask for the numbers privately.",
      fields: [
        { id: "customerType", short: "Customers", label: "Who are your customers?",
          type: "select",
          options: ["Mostly consumers", "Mostly other businesses",
                    "Mostly government or institutions", "A mix"] },
        { id: "revenuePattern", short: "How sales come in", label: "How do sales mostly come in?",
          type: "select",
          options: ["Contracts, retainers or subscriptions", "Repeat customers without a contract",
                    "Projects or one-off jobs", "A mix"] },
        { id: "seasonality", short: "Seasonality", label: "How seasonal is it?",
          type: "select",
          options: ["Steady year-round", "Somewhat seasonal", "Highly seasonal"] },
        { id: "revenueBand", short: "Approximate annual sales",
          label: "Roughly, what are annual sales?", type: "select",
          hint: "Optional, and it stays in your browser like everything else here.",
          options: ["Under $500,000", "$500,000 to $1 million", "$1 million to $2 million",
                    "$2 million to $5 million", "Over $5 million"],
          emptyLabel: "I’d rather not say" }
      ]
    },
    {
      id: "people",
      title: "Ownership and people",
      intro: "How much the business depends on you is one of the biggest drivers of value.",
      fields: [
        { id: "owners", short: "Number of owners", label: "How many owners?",
          type: "select", options: ["One", "Two", "Three or more"] },
        { id: "ownerRole", short: "Owner involvement", label: "How involved are the owners day to day?",
          type: "select",
          options: ["Full time and hands-on", "Part time, mostly oversight",
                    "Largely hands-off; a manager runs it"] },
        { id: "management", short: "Could run without the owner",
          label: "Could someone on the team run it without you?", type: "select",
          options: ["Yes", "Partly", "No, it depends on me"] },
        { id: "family", short: "Family members working in the business",
          label: "Do family members work in the business?", type: "select",
          options: ["Yes", "No"] }
      ]
    },
    {
      id: "assets",
      title: "Premises and equipment",
      intro: "",
      fields: [
        { id: "premises", short: "Premises", label: "Where does it operate from?",
          type: "select",
          options: ["Leased from an unrelated landlord", "Property owned by me or a related company",
                    "Home-based or mobile"] },
        { id: "realEstate", short: "Real estate in a sale",
          label: "Would the property be part of a sale?", type: "select",
          showIf: { field: "premises", equals: "Property owned by me or a related company" },
          options: ["Yes, sell it with the business", "No, I would lease it to the buyer",
                    "Open to either"] },
        { id: "equipment", short: "Equipment", label: "How equipment-heavy is it?",
          type: "select",
          options: ["Light: office equipment and hand tools", "Moderate: vehicles or shop equipment",
                    "Heavy: specialized machinery, a fleet or a facility"] },
        { id: "inventory", short: "Inventory", label: "How much inventory does it carry?",
          type: "select", options: ["Little or none", "A moderate amount", "A significant amount"] }
      ]
    },
    {
      id: "plans",
      title: "Your plans",
      intro: "What you want from a sale shapes how a deal would be put together.",
      fields: [
        { id: "reason", short: "Reason for considering a sale", label: "Why are you thinking about selling?",
          type: "select",
          options: ["Retirement", "Health or family reasons", "Ready for something new",
                    "A partner wants out", "Just curious what it is worth", "Another reason"] },
        { id: "timeline", short: "Timeline", label: "When would you like to sell?",
          type: "select",
          options: ["Within 6 months", "In 6 to 12 months", "In 1 to 2 years",
                    "3 or more years away, or just exploring"] },
        { id: "postSale", short: "Involvement after a sale", label: "After a sale, would you stay involved?",
          type: "select",
          options: ["A short handover, then a clean exit", "Several months to help with the transition",
                    "A year or more", "I would like to keep a minority stake", "Not sure yet"] },
        { id: "priorities", short: "What matters most in a sale", wide: true,
          label: "What matters most to you in a sale?", type: "checks",
          hint: "Choose any that apply.",
          options: ["Getting the best price", "Certainty and speed of closing",
                    "Keeping my staff employed", "Preserving the name and legacy",
                    "Staying involved in some way", "Keeping the business local"] }
      ]
    },
    {
      id: "report",
      title: "Your report",
      intro: "",
      fields: [
        { id: "depth", short: "Report length", label: "How detailed should the report be?",
          type: "select", noEmpty: true, exclude: true,
          options: ["Full report", "Quick read, about two pages"] },
        { id: "familiarity", short: "Familiarity with valuation",
          label: "How familiar are you with business valuation?", type: "select",
          noEmpty: true, exclude: true,
          options: ["New to it; plain language please", "Some familiarity",
                    "Very familiar; technical terms are fine"] },
        { id: "assistant", short: "AI assistant", label: "Which AI assistant will you use?",
          type: "select", noEmpty: true, exclude: true,
          options: ["ChatGPT", "Claude", "Gemini", "Copilot", "Another one"] }
      ]
    }
  ];

  function allFields() {
    var out = [];
    SECTIONS.forEach(function (s) { s.fields.forEach(function (f) { out.push(f); }); });
    return out;
  }

  function isVisible(field, answers) {
    if (!field.showIf) return true;
    return answers[field.showIf.field] === field.showIf.equals;
  }

  function hasAnswer(value) {
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" && value.trim() !== "";
  }

  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function formatAnswer(value) {
    return Array.isArray(value) ? value.join("; ") : clean(value);
  }

  /* The seller's general answers as plain "Label: answer" lines. */
  function describeAnswers(answers) {
    var provided = [];
    var missing = [];
    allFields().forEach(function (f) {
      if (f.exclude || !isVisible(f, answers)) return;
      if (hasAnswer(answers[f.id])) {
        provided.push({ label: f.short, value: formatAnswer(answers[f.id]) });
      } else if (f.id !== "description") {
        missing.push(f.short.charAt(0).toLowerCase() + f.short.slice(1));
      }
    });
    return { provided: provided, missing: missing };
  }

  /*
   * Fit notes: an honest first read against OC's published profile, using only
   * the general answers. `tone` is "plus" (lines up) or "note" (worth knowing).
   */
  function fitNotes(answers) {
    var notes = [];
    var years = answers.years;
    if (years === "Under 3 years") {
      notes.push({ tone: "note", text: "Organic Capital usually buys businesses with a longer track record than three years, because value rests on earnings history a lender can rely on." });
    } else if (years === "3 to 5 years" || years === "6 to 10 years") {
      notes.push({ tone: "plus", text: "The business has enough operating history to show a real earnings record." });
    } else if (hasAnswer(years)) {
      notes.push({ tone: "plus", text: "A long operating history is exactly what Organic Capital looks for: established businesses with proven, steady demand." });
    }

    switch (answers.revenueBand) {
      case "Under $500,000":
        notes.push({ tone: "note", text: "Annual sales are below Organic Capital’s usual range of about $1 million to $5 million. Smaller businesses with strong fundamentals are still considered." });
        break;
      case "$500,000 to $1 million":
        notes.push({ tone: "note", text: "Annual sales are a little below Organic Capital’s usual range of about $1 million to $5 million. That is a preference, not a cut-off." });
        break;
      case "$1 million to $2 million":
      case "$2 million to $5 million":
        notes.push({ tone: "plus", text: "Annual sales fall within Organic Capital’s usual range of about $1 million to $5 million." });
        break;
      case "Over $5 million":
        notes.push({ tone: "note", text: "Annual sales are above Organic Capital’s usual range. Larger businesses can still fit where real estate, vendor financing or a partnership reduces the capital needed." });
        break;
    }

    if (answers.reason === "Retirement") {
      notes.push({ tone: "plus", text: "Owner retirement is the situation Organic Capital was set up for." });
    }

    if (answers.revenuePattern === "Contracts, retainers or subscriptions" ||
        answers.revenuePattern === "Repeat customers without a contract") {
      notes.push({ tone: "plus", text: "Recurring or repeat demand supports both value and financing." });
    } else if (answers.revenuePattern === "Projects or one-off jobs") {
      notes.push({ tone: "note", text: "Project-based sales are harder to predict, so the report will look closely at how steady they have been from year to year." });
    }

    if (answers.management === "No, it depends on me") {
      notes.push({ tone: "note", text: "The business depends heavily on you. That is common, and Organic Capital’s model brings in a hands-on daily operator, but a planned handover will matter to value." });
    } else if (answers.management === "Yes") {
      notes.push({ tone: "plus", text: "A team that can run the business without the owner makes the earnings more transferable." });
    }

    if (answers.seasonality === "Highly seasonal") {
      notes.push({ tone: "note", text: "Highly seasonal businesses need more working capital planning, which the report will take into account." });
    }

    return notes;
  }

  function todayString(date) {
    var d = date || new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function languageRule(familiarity) {
    if (/^New to it/.test(familiarity || "")) {
      return "I am new to business valuation. Use plain, everyday language. The first time you use a term such as EBITDA, SDE, normalised earnings, working capital or debt service coverage, explain it in one sentence. Show the arithmetic so I can follow it.";
    }
    if (/^Very familiar/.test(familiarity || "")) {
      return "I am comfortable with valuation and finance terms. Use them freely and do not explain the basics.";
    }
    return "I have some familiarity with business valuation. Use standard terms, with a brief explanation where a term is less common.";
  }

  function reportFormat(depth) {
    if (/^Quick read/.test(depth || "")) {
      return [
        "I have asked for a QUICK READ of about two pages. Keep the interview to roughly ten essential questions, then write these sections only:",
        "",
        "1. The short answer. The indicative value range, the three or four things driving it, and one sentence on fit with OC.",
        "2. Normalised earnings. One small table: the years I gave you, reported earnings, your adjustments, and the representative normalised figure you chose.",
        "3. Indicative value range. One table showing the result of each method you used, then the range you settle on and why.",
        "4. Illustrative deal structure. A short illustration, clearly labelled as illustrative.",
        "5. Fit with Organic Capital. Where my business lines up with OC's profile and where it does not.",
        "6. What would change the answer. The five pieces of information most likely to move the range.",
        "7. Next steps.",
        "",
        "End with the closing note in section 7."
      ].join("\n");
    }
    return [
      "I have asked for a FULL REPORT. Lead with conclusions and use tables where they make the numbers easier to follow. Write these sections:",
      "",
      "1. The short answer. The indicative value range, the three or four things driving it, and one sentence on fit with OC.",
      "2. What this is based on. A table of the key inputs, each with its evidence label from section 4.1.",
      "3. Normalised earnings. A year-by-year table: revenue, reported EBITDA, each adjustment on its own line, SDE and OC-normalised EBITDA. Then the representative figure you chose and why.",
      "4. Business quality. What strengthens value and what weakens it, separating weaknesses a new owner could fix from structural ones.",
      "5. What a lender would finance. The debt capacity calculation with every assumption shown, and which of the three categories in section 4.4 my business falls into.",
      "6. Indicative value range. A table with the result of each method, how you reconcile them into one range, and a bridge from business value to what I might actually receive (debt repaid, working capital, real estate).",
      "7. Illustrative deal structure. How a deal at around the middle of the range might be put together, and how price and structure trade off.",
      "8. What would raise or lower the value. The most useful things I could do before a sale, and the main concerns a careful buyer would raise.",
      "9. Fit with Organic Capital. Where my business lines up with OC's profile and where it does not.",
      "10. What would change the answer. The five pieces of information most likely to move the range.",
      "11. Next steps.",
      "",
      "End with the closing note in section 7."
    ].join("\n");
  }

  /* Build the full prompt from the seller's general answers. */
  function buildPrompt(answers, config, options) {
    config = config || {};
    options = options || {};
    var desc = describeAnswers(answers);
    var notes = fitNotes(answers);
    var email = config.contactEmail || "";
    var website = config.website || "";
    var version = config.promptVersion || "1.0";

    var aboutLines = desc.provided.map(function (p) { return "- " + p.label + ": " + p.value; });
    if (desc.missing.length) {
      aboutLines.push("- Not answered on the form (ask me if it matters): " + desc.missing.join("; ") + ".");
    }

    var fitLines = notes.length
      ? notes.map(function (n) { return "- " + n.text; }).join("\n")
      : "- The form did not have enough to go on. Work it out from what I tell you.";

    var contactLine = "If I want to talk to OC, I can reach them" +
      (email ? " at " + email : "") +
      (email && website ? " or" : "") +
      (website ? " through " + website : "") + ".";

    var p = [];

    p.push("ORGANIC CAPITAL: SELLER VALUATION FRAMEWORK");
    p.push("Version " + version + ", generated " + todayString(options.date));
    p.push("");
    p.push("Please act as my independent business valuation analyst. I own a privately held Canadian business and I am thinking about selling it. Organic Capital Group (\"OC\") is a Canadian buyer of established small businesses. It has published the framework it uses to value a business so that owners like me can see how it thinks before deciding whether to talk to them. I want you to apply that framework to my business and write me a valuation report.");
    p.push("");
    p.push("You are working for me, not for OC. OC has not seen my information and will see nothing from this conversation unless I choose to send it. Read all of the sections below before you reply.");
    p.push("");

    p.push("1. WHO ORGANIC CAPITAL IS");
    p.push("");
    p.push("OC buys established, profitable local businesses, most often from owners who are retiring and have no successor. It pairs each business with a hands-on daily operator who takes over the owner's role and has a pathway to ownership, and it supports that operator with a shared back-office team covering operations, administration, HR, IT, accounting, finance, sales and marketing. Its aim is to keep the business, its jobs and its name going in the community. Its stated values are integrity, transparency and fairness. It looks for simple, proven, people-driven businesses with steady demand.");
    p.push("");

    p.push("2. WHAT I TOLD OC'S FORM ABOUT MY BUSINESS");
    p.push("");
    p.push("These are general answers only. I have not given OC any financial figures.");
    p.push("");
    p.push(aboutLines.join("\n"));
    p.push("");

    p.push("3. HOW TO RUN THIS CONVERSATION");
    p.push("");
    p.push("Step 1. In your first reply, do not write the report. Confirm in two or three sentences what you understand about my business, tell me which documents would be useful to have beside me, and ask your first group of questions.");
    p.push("");
    p.push("Step 2. Interview me. Ask for what you need in small groups of no more than about five questions at a time, so I am not faced with a wall of questions. Round numbers and ranges are fine. I do not need to name the business, my customers or my staff. If I choose to upload financial statements or tax returns, treat them as the primary evidence and tell me where they disagree with what I told you. Cover these areas:");
    p.push("- Revenue for each of the last three to five fiscal years, and the current year to date.");
    p.push("- Profit for the same years: gross profit, operating expenses, net income before tax, interest, and depreciation or amortisation.");
    p.push("- What the owners and any family members are paid in total (salary, dividends, bonuses, benefits), the jobs each of them actually does and for how many hours, and what it would cost to hire someone to do that work.");
    p.push("- Expenses that would not continue under a new owner: personal items paid by the business, one-time costs, and rent paid to a related party above or below market.");
    p.push("- Customers: roughly what share of sales comes from the largest customer and the largest five, any contracts, and how much business repeats.");
    p.push("- Staff: key people, how long they have been there, and whether they would stay.");
    p.push("- Premises: lease term remaining, rent, renewal options and whether the lease can be transferred; or the approximate value of the property if I own it.");
    p.push("- Equipment and inventory: approximate current value, age, anything due for replacement, and what I typically spend each year to keep equipment in working order.");
    p.push("- The balance sheet: debt, shareholder loans, cash, and normal levels of receivables, payables and inventory.");
    p.push("- Anything unusual: disputes, licences, environmental issues, or heavy dependence on one supplier.");
    p.push("- Optionally, whether I have a price in mind and where that figure came from.");
    p.push("");
    p.push("If I cannot answer something, do not stall. Make a reasonable estimate, label it as an estimate, and carry on.");
    p.push("");
    p.push("Step 3. Write the report in the format set out in section 5.");
    p.push("");
    p.push("Step 4. After the report, offer to adjust any assumption I disagree with and show me how the range moves. Then offer to prepare the summary described in section 6.");
    p.push("");

    p.push("4. OC'S VALUATION METHOD");
    p.push("");
    p.push("4.1 Label the evidence. Mark every material figure as one of: FACT (from a document I shared), OWNER-STATED (what I told you, not verified), ESTIMATE (your own calculation or assumption, with the working shown), MARKET DATA (external, with source and date) or UNKNOWN. A real buyer would verify owner-stated figures before closing, so say plainly where the conclusion rests on them.");
    p.push("");
    p.push("4.2 Normalise the earnings. OC values a business on the earnings a new owner could actually expect, not on the best-looking version of the numbers.");
    p.push("- Start with reported EBITDA (earnings before interest, tax, depreciation and amortisation) for each year.");
    p.push("- Work out SDE (seller's discretionary earnings): EBITDA plus the total compensation of one full-time working owner, plus expenses that are genuinely personal, discretionary or one-time.");
    p.push("- Work out OC-normalised EBITDA: take SDE and subtract the market-rate cost of hiring people to do the work the owners do now. OC's rule is that an owner's labour is not automatically an add-back. If I do the work of a manager and a salesperson, both roles have to be paid for.");
    p.push("- Accept an add-back only if it is specific, explainable and could be supported with records. Exclude or discount the ones that could not, and say which.");
    p.push("- Adjust rent to market if I own the premises, and adjust for family members paid above or below what the job is worth.");
    p.push("- Look across three to five years. Consider the average, a weighting toward recent years and the most recent year, then choose the figure that best represents what the business sustainably earns and explain the choice. Do not base the valuation on a single best year. If earnings are declining, lean toward the recent figures.");
    p.push("- Estimate free cash flow: normalised EBITDA less the yearly spending needed to maintain equipment and less any normal growth in working capital.");
    p.push("");
    p.push("4.3 Assess the quality of the business. These factors place a business higher or lower within a value range. OC's stated preferences are shown where it has them; they are preferences, not pass or fail tests.");
    p.push("- Recurring or repeat demand, and how predictable revenue has been.");
    p.push("- Customer diversification. Ask what share the largest customers represent and flag meaningful concentration.");
    p.push("- Gross margin: OC prefers about 40% or more.");
    p.push("- Normalised EBITDA margin: OC prefers about 15% or more.");
    p.push("- How much of the profit turns into cash, and how much has to go back into equipment.");
    p.push("- Dependence on the owner, the depth and stability of the team, and whether the business has documented ways of working.");
    p.push("- Security of the premises, condition of the equipment, and how many years of consistent history there are.");
    p.push("Separate weaknesses a capable new owner could fix from structural weaknesses in the business or its market. They affect value differently.");
    p.push("");
    p.push("4.4 Test what a lender would finance. OC values a business partly by asking what a prudent Canadian lender would lend against it, because most acquisitions are partly financed with debt.");
    p.push("- Cash flow available for debt payments = normalised EBITDA less maintenance spending on equipment, and less cash taxes where relevant.");
    p.push("- OC's usual minimum is a debt service coverage ratio of about 1.50. So the most the business should pay each year in loan principal and interest is that cash flow divided by 1.50.");
    p.push("- Convert that yearly payment into a loan amount using typical current terms for Canadian small business acquisition loans (for example from chartered banks, credit unions and BDC). State the interest rate and repayment period you assume. If you can search the web, use current rates and say where they came from. If you cannot, say that your assumptions come from general knowledge and may be out of date.");
    p.push("- Say which category the business falls into: (1) profitable, (2) profitable and financeable, or (3) able to support substantial acquisition debt. Base debt capacity on sustainable cash flow, never on a percentage of the price.");
    p.push("- Explain what this means for price: a buyer funds a purchase from bank debt, its own equity and often some financing from the seller, and a price the business's own cash flow cannot support is hard for any buyer to pay.");
    p.push("");
    p.push("4.5 Triangulate value. Use every method the information supports, show each result, then reconcile them.");
    p.push("- A multiple of OC-normalised EBITDA. This is the main method where normalised EBITDA is clearly positive.");
    p.push("- A multiple of SDE. This is relevant for smaller businesses where the owner is the main operator.");
    p.push("- Asset value as a floor: what the equipment and inventory would realistically sell for.");
    p.push("- The financing cross-check from 4.4: the price the business's own cash flow can support at about 1.50 times coverage with a sensible amount of equity.");
    p.push("- A multiple of revenue, as a sense check only.");
    p.push("- A discounted cash flow, only if earnings are stable enough to forecast. Otherwise skip it and say why.");
    p.push("OC does not publish a fixed multiple. Use current market evidence for privately held Canadian businesses of my size and in my industry, searching for it if you can and giving the source and date. If you are relying on general knowledge, say so. Smaller and more owner-dependent businesses sell for lower multiples than larger, manager-run ones. Use the quality factors in 4.3 to place my business within the range, and explain the placement.");
    p.push("Value the business on a cash-free, debt-free basis with a normal level of working capital included, and explain that any business debt is repaid from the proceeds. Value any real estate separately from the operating business.");
    p.push("Conclude with ONE indicative fair-value range in Canadian dollars, a low and a high figure, and say where in that range you think the business most likely sits and why. Use ranges, not false precision. Do not give a single number and do not present separate bargain or maximum prices.");
    p.push("Base the value on what the business earns today. Do not add value for improvements a new owner would have to make themselves.");
    p.push("");
    p.push("4.6 Illustrate a deal structure. OC looks at price and structure together, and prefers structures that limit its risk while remaining fair to the seller. Explain the building blocks in terms of my situation:");
    p.push("- Cash paid at closing.");
    p.push("- Deferred payments or a vendor take-back loan, paid to me over time.");
    p.push("- A holdback: part of the price held for a period after closing and released if no claims arise.");
    p.push("- An earn-out tied to future results, where earnings are uncertain.");
    p.push("- Rollover equity: my keeping a minority stake.");
    p.push("- A paid transition period, during which I help hand over to the new operator.");
    p.push("- A working capital adjustment at closing.");
    p.push("- A sale of assets or a sale of shares. Note that in Canada a sale of qualifying small business corporation shares may allow me to use the Lifetime Capital Gains Exemption, that eligibility depends on the facts, and that I should ask my accountant.");
    p.push("- Whether the real estate is sold with the business or leased to the buyer.");
    p.push("Then give one illustration at around the middle of the value range, with approximate proportions suited to my business and to what I said matters most to me. Explain the reasoning: well-documented earnings that do not depend on the owner support more cash at closing, while earnings that are harder to verify or that depend on me usually mean more of the price is deferred or conditional. Label this ILLUSTRATIVE and state that OC has not proposed these terms.");
    p.push("");
    p.push("4.7 Identify what moves value. List the practical steps I could take before a sale that would most improve value or make the business easier to sell, such as cleaner financial records, documented processes, reducing dependence on me, or securing the lease. Also note that OC is particularly interested in businesses with strong fundamentals whose sales and marketing, online presence, customer data, technology, automation, pricing, management systems, capacity or geographic reach are underdeveloped, because that is where its team expects to add value after buying. Tell me which of those apply to my business.");
    p.push("");
    p.push("4.8 Assess fit with OC. For conventional acquisitions OC generally prefers:");
    p.push("- a business value below about C$2 million;");
    p.push("- revenue of about C$1 million to C$5 million;");
    p.push("- normalised EBITDA of about C$350,000 or more;");
    p.push("- gross margin of about 40% or more and EBITDA margin of about 15% or more;");
    p.push("- strong conversion of profit to cash, and reasonable spending needs on equipment;");
    p.push("- diversified customers and recurring or repeat demand;");
    p.push("- historical cash flow a lender would finance.");
    p.push("These are preferences, not automatic exclusions. Larger businesses can qualify where real estate, vendor financing, rollover equity or a partnership reduces the capital OC needs, and OC does consider smaller businesses with strong fundamentals. An owner looking to retire is an advantage in OC's eyes.");
    p.push("OC's form gave this first read from my general answers alone:");
    p.push(fitLines);
    p.push("Now that you have my figures, give your own honest view: a strong fit, a possible fit, or outside OC's usual profile, with the reasons. If it is outside the profile, say so plainly. The valuation is still useful to me with any buyer.");
    p.push("");

    p.push("5. REPORT FORMAT");
    p.push("");
    p.push(reportFormat(answers.depth));
    p.push("");
    p.push(languageRule(answers.familiarity));
    p.push("");

    p.push("6. SUMMARY I CAN CHOOSE TO SHARE");
    p.push("");
    p.push("After the report, offer to write a one-page \"Summary for Organic Capital\" that I could send to OC to start a conversation. Before writing it, ask me whether I want it to show exact figures, rounded ranges, or no financial figures at all, and whether to include the business name. Include only what I approve. " + contactLine + " Sending it is entirely my choice.");
    p.push("");

    p.push("7. RULES");
    p.push("");
    p.push("- Never invent a figure. If something is missing, ask, or estimate and label the estimate.");
    p.push("- Be candid. Do not flatter me or stretch the numbers. If the business is likely worth less than I hope, say so respectfully and explain why.");
    p.push("- All amounts in Canadian dollars.");
    p.push("- Show your working for every calculation.");
    p.push("- Do not present the report as coming from Organic Capital. It is your analysis, using OC's published framework.");
    p.push("- End the report with this closing note, in your own words: this is an indicative estimate produced by an AI assistant from information I supplied and that nobody has verified; it is not an offer or a commitment from Organic Capital, not a formal valuation or appraisal, and not tax, legal or accounting advice; an actual offer would depend on due diligence and could differ materially; and I should speak with my accountant and lawyer, and consider a Chartered Business Valuator, before making decisions.");
    p.push("");
    p.push("Please begin with Step 1.");

    return p.join("\n");
  }

  var api = {
    SECTIONS: SECTIONS,
    allFields: allFields,
    isVisible: isVisible,
    hasAnswer: hasAnswer,
    describeAnswers: describeAnswers,
    fitNotes: fitNotes,
    buildPrompt: buildPrompt
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.OCPrompt = api;
})(typeof window !== "undefined" ? window : globalThis);
