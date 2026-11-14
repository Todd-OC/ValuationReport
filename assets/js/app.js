/*
 * Organic Capital — Seller Valuation Prompt Tool
 * Page behaviour: draws the form, builds the prompt, and handles the
 * copy, download, email and contact actions.
 *
 * The seller's answers are never sent anywhere by this script. The only network
 * request it can make is the contact form, and only when the seller presses Send.
 */
(function () {
  "use strict";

  var P = window.OCPrompt;
  var CONFIG = window.OC_CONFIG || {};

  var ASSISTANTS = {
    "ChatGPT": "https://chatgpt.com/",
    "Claude": "https://claude.ai/new",
    "Gemini": "https://gemini.google.com/app",
    "Copilot": "https://copilot.microsoft.com/"
  };

  var answers = {};
  var promptText = "";
  var embedded = false;

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else if (key === "className") node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  /* ---------- Drawing the form ---------- */

  function buildSelect(field) {
    var select = el("select", { id: "f-" + field.id, name: field.id });
    if (field.required) select.setAttribute("aria-required", "true");
    if (!field.noEmpty) {
      select.appendChild(el("option", { value: "", text: field.emptyLabel || "Choose one" }));
    }
    if (field.groups) {
      field.groups.forEach(function (group) {
        var og = el("optgroup", { label: group.group });
        group.items.forEach(function (item) {
          og.appendChild(el("option", { value: item, text: item }));
        });
        select.appendChild(og);
      });
    } else {
      field.options.forEach(function (opt) {
        select.appendChild(el("option", { value: opt, text: opt }));
      });
    }
    return select;
  }

  function buildField(field) {
    var wrap = el("div", {
      className: "field" + (field.wide ? " field--wide" : ""),
      "data-field": field.id
    });
    var hintId = field.hint ? "h-" + field.id : null;

    if (field.type === "checks") {
      var group = el("div", { className: "checks", role: "group", "aria-labelledby": "l-" + field.id });
      field.options.forEach(function (opt) {
        var input = el("input", { type: "checkbox", name: field.id, value: opt });
        group.appendChild(el("label", { className: "check" }, [input, el("span", { text: opt })]));
      });
      wrap.appendChild(el("span", { className: "field__label", id: "l-" + field.id, text: field.label }));
      wrap.appendChild(group);
    } else {
      var label = el("label", { "for": "f-" + field.id, text: field.label });
      if (field.required) label.appendChild(el("span", { className: "required-mark", text: "required" }));
      wrap.appendChild(label);
      var control;
      if (field.type === "text") {
        control = el("input", { type: "text", id: "f-" + field.id, name: field.id, autocomplete: "off" });
        if (field.maxLength) control.setAttribute("maxlength", String(field.maxLength));
      } else {
        control = buildSelect(field);
      }
      if (hintId) control.setAttribute("aria-describedby", hintId);
      wrap.appendChild(control);
    }
    if (field.hint) wrap.appendChild(el("p", { className: "hint", id: hintId, text: field.hint }));
    return wrap;
  }

  function renderForm() {
    var host = $("form-sections");
    P.SECTIONS.forEach(function (section, index) {
      var legend = el("legend", {}, [
        el("span", { className: "form-section__num", text: "Part " + (index + 1) + " of " + P.SECTIONS.length }),
        el("span", { text: section.title })
      ]);
      var grid = el("div", { className: "grid" });
      section.fields.forEach(function (field) { grid.appendChild(buildField(field)); });
      var fieldset = el("fieldset", { className: "form-section" }, [
        legend,
        section.intro ? el("p", { className: "form-section__intro", text: section.intro }) : null,
        grid
      ]);
      host.appendChild(fieldset);
    });
    updateVisibility();
  }

  function readAnswers() {
    var out = {};
    P.allFields().forEach(function (field) {
      if (field.type === "checks") {
        var boxes = document.querySelectorAll('input[name="' + field.id + '"]:checked');
        out[field.id] = Array.prototype.map.call(boxes, function (b) { return b.value; });
      } else {
        var control = $("f-" + field.id);
        out[field.id] = control ? control.value.trim() : "";
      }
    });
    return out;
  }

  function updateVisibility() {
    var current = readAnswers();
    P.allFields().forEach(function (field) {
      if (!field.showIf) return;
      var wrap = document.querySelector('[data-field="' + field.id + '"]');
      var show = P.isVisible(field, current);
      wrap.hidden = !show;
      if (!show) $("f-" + field.id).value = "";
    });
  }

  function clearErrors() {
    Array.prototype.forEach.call(document.querySelectorAll("#oc-form .has-error"), function (wrap) {
      wrap.classList.remove("has-error");
      var msg = wrap.querySelector(".field__error");
      if (msg) msg.remove();
      var control = wrap.querySelector("select, input");
      if (control) control.removeAttribute("aria-invalid");
    });
    $("form-error").hidden = true;
  }

  function validate(current) {
    clearErrors();
    var firstBad = null;
    P.allFields().forEach(function (field) {
      if (!field.required || P.hasAnswer(current[field.id])) return;
      var wrap = document.querySelector('[data-field="' + field.id + '"]');
      var control = $("f-" + field.id);
      wrap.classList.add("has-error");
      control.setAttribute("aria-invalid", "true");
      wrap.appendChild(el("p", { className: "field__error", text: "Please choose an answer." }));
      if (!firstBad) firstBad = control;
    });
    if (firstBad) {
      var box = $("form-error");
      box.textContent = "Three answers are needed before we can build your prompt: the kind of business, how long it has operated, and the province or territory.";
      box.hidden = false;
      firstBad.focus();
      return false;
    }
    return true;
  }

  /* ---------- Showing the result ---------- */

  function showView(name) {
    $("view-form").hidden = name !== "form";
    $("view-result").hidden = name !== "result";
    var target = name === "result" ? $("result-title") : $("form-title");
    if (embedded) {
      notifyParent({ type: "oc-valuation-scroll" });
    } else {
      window.scrollTo(0, 0);
    }
    if (name === "result") target.focus({ preventScroll: true });
    postHeight();
  }

  function renderFit(current) {
    var notes = P.fitNotes(current);
    var list = $("fit-list");
    list.textContent = "";
    notes.forEach(function (note) {
      var li = el("li", { className: note.tone === "plus" ? "is-plus" : "is-note" }, [
        el("span", { className: "fit-tag", text: note.tone === "plus" ? "Lines up. " : "Worth knowing. " }),
        document.createTextNode(note.text)
      ]);
      list.appendChild(li);
    });
    $("fit-panel").hidden = notes.length === 0;
  }

  function answersAsText(current) {
    return P.describeAnswers(current).provided.map(function (item) {
      return "- " + item.label + ": " + item.value;
    }).join("\n");
  }

  function firstName() {
    return String(CONFIG.contactName || "").split(" ")[0] || "Organic Capital";
  }

  function mailto(subject, body) {
    return "mailto:" + encodeURIComponent(CONFIG.contactEmail || "") +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function renderResult(current) {
    promptText = P.buildPrompt(current, CONFIG);
    $("prompt-text").textContent = promptText;
    var words = promptText.split(/\s+/).length;
    $("prompt-meta").textContent = "About " + (Math.round(words / 100) * 100).toLocaleString("en-CA") + " words";

    var open = $("open-assistant");
    var url = ASSISTANTS[current.assistant];
    if (url) {
      open.href = url;
      open.textContent = "Copy and open " + current.assistant;
      open.hidden = false;
    } else {
      open.hidden = true;
    }

    renderFit(current);

    $("email-link").href = mailto(
      "My business and the Organic Capital valuation framework",
      "Hello " + firstName() + ",\n\n" +
      "I used the valuation tool on your website and would like to talk about my business.\n\n" +
      "General information from the form:\n" + answersAsText(current) + "\n\n" +
      "The best way to reach me is:\n\n"
    );

    $("copy-status").textContent = "";
  }

  /* ---------- Copy, open and download ---------- */

  function legacyCopy(text) {
    var area = el("textarea", { readonly: "", "aria-hidden": "true" });
    area.value = text;
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  function copyPrompt() {
    if (legacyCopy(promptText)) return Promise.resolve(true);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(promptText).then(
        function () { return true; },
        function () { return false; }
      );
    }
    return Promise.resolve(false);
  }

  function reportCopy(ok, opened) {
    var status = $("copy-status");
    if (ok) {
      status.textContent = opened
        ? "Copied. Paste it into the new tab."
        : "Copied. Now paste it into your AI assistant.";
    } else {
      status.textContent = "Could not copy automatically. Select the text above and copy it, or download the file.";
      selectPrompt();
    }
  }

  function selectPrompt() {
    var range = document.createRange();
    range.selectNodeContents($("prompt-text"));
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function downloadPrompt() {
    var blob = new Blob([promptText], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = el("a", { href: url, download: "organic-capital-valuation-prompt.txt" });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- Contact form ---------- */

  function contactPayload() {
    var payload = {
      name: $("c-name").value.trim(),
      email: $("c-email").value.trim(),
      phone: $("c-phone").value.trim(),
      message: $("c-message").value.trim()
    };
    if ($("c-include").checked) payload.general_answers = answersAsText(answers);
    return payload;
  }

  function contactError(message) {
    var box = $("contact-error");
    box.textContent = message;
    box.hidden = !message;
  }

  function submitContact(event) {
    event.preventDefault();
    contactError("");
    if ($("c-company").value) return; // spam trap: real visitors never see this field

    var payload = contactPayload();
    if (!payload.name) { contactError("Please add your name."); $("c-name").focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      contactError("Please add an email address we can reply to.");
      $("c-email").focus();
      return;
    }

    var done = $("contact-done");

    if (!CONFIG.contactFormEndpoint) {
      var body = (payload.message ? payload.message + "\n\n" : "") +
        "Name: " + payload.name + "\n" +
        "Email: " + payload.email + "\n" +
        (payload.phone ? "Phone: " + payload.phone + "\n" : "") +
        (payload.general_answers ? "\nGeneral information from the form:\n" + payload.general_answers + "\n" : "");
      window.location.href = mailto("My business and the Organic Capital valuation framework", body);
      done.textContent = "Your email app should now be open with the message ready to send. Nothing has been sent until you press send there.";
      done.hidden = false;
      postHeight();
      return;
    }

    var button = $("contact-submit");
    button.disabled = true;
    button.textContent = "Sending";

    var data = { _subject: "Valuation tool enquiry from " + payload.name, source: "Valuation prompt tool" };
    Object.keys(CONFIG.contactFormExtraFields || {}).forEach(function (key) {
      data[key] = CONFIG.contactFormExtraFields[key];
    });
    Object.keys(payload).forEach(function (key) { if (payload[key]) data[key] = payload[key]; });

    fetch(CONFIG.contactFormEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) throw new Error("Request failed");
      $("contact-form").reset();
      done.textContent = "Thank you. Your note has been sent and " + firstName() + " will be in touch.";
      done.hidden = false;
    }).catch(function () {
      contactError("That did not go through. Please try again, or email " + (CONFIG.contactEmail || "us") + " directly.");
    }).then(function () {
      button.disabled = false;
      button.textContent = "Send";
      postHeight();
    });
  }

  /* ---------- Sitting inside another page ---------- */

  function notifyParent(message) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, "*");
    }
  }

  function postHeight() {
    if (!embedded) return;
    notifyParent({ type: "oc-valuation-height", height: Math.ceil(document.documentElement.getBoundingClientRect().height) });
  }

  function detectEmbed() {
    var forced = /[?&]embed=1\b/.test(window.location.search);
    var framed = false;
    try { framed = window.self !== window.top; } catch (e) { framed = true; }
    embedded = forced || framed;
    if (embedded) document.documentElement.classList.add("is-embedded");
    if (embedded && "ResizeObserver" in window) {
      new ResizeObserver(postHeight).observe(document.body);
    }
    window.addEventListener("load", postHeight);
  }

  /* ---------- Start ---------- */

  function init() {
    detectEmbed();
    renderForm();

    if (CONFIG.website) $("logo-link").href = CONFIG.website;
    Array.prototype.forEach.call(document.querySelectorAll("[data-contact-first]"), function (node) {
      node.textContent = firstName();
    });
    if (CONFIG.bookingUrl) {
      $("booking-link").href = CONFIG.bookingUrl;
      $("booking-card").hidden = false;
    }
    $("contact-note").textContent = CONFIG.contactFormEndpoint
      ? "This goes to " + firstName() + " at Organic Capital. Nothing is sent until you press Send."
      : "This opens your own email app with the message ready. Nothing is sent until you send it from there.";
    if (!CONFIG.contactFormEndpoint) $("contact-submit").textContent = "Open my email app";

    $("oc-form").addEventListener("change", function (event) {
      updateVisibility();
      var wrap = event.target.closest ? event.target.closest(".field.has-error") : null;
      if (wrap && event.target.value) {
        wrap.classList.remove("has-error");
        event.target.removeAttribute("aria-invalid");
        var msg = wrap.querySelector(".field__error");
        if (msg) msg.remove();
        if (!document.querySelector("#oc-form .has-error")) $("form-error").hidden = true;
        postHeight();
      }
    });
    $("oc-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var current = readAnswers();
      if (!validate(current)) { postHeight(); return; }
      answers = current;
      renderResult(current);
      showView("result");
    });

    $("edit-answers").addEventListener("click", function () { showView("form"); });
    $("copy-prompt").addEventListener("click", function () {
      copyPrompt().then(function (ok) { reportCopy(ok, false); });
    });
    $("open-assistant").addEventListener("click", function () {
      copyPrompt().then(function (ok) { reportCopy(ok, true); });
    });
    $("download-prompt").addEventListener("click", downloadPrompt);
    $("contact-form").addEventListener("submit", submitContact);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
