/*
 * DataSec Chronicles — Labs
 * Case File engine (shared across all cases)
 * ------------------------------------------------------------------
 * Reads window.DATASEC_CASE (set by a per-case board.js) and renders:
 *   - the word-fit answer grid
 *   - the daily hint schedule (unlocks by date)
 *   - a global countdown to reveal.at
 *   - the verdict, kept OUT of the DOM until reveal.at passes
 *
 * Design decisions baked in:
 *   1. TIME-GATE IS ENFORCED, NOT COSMETIC. The decoded verdict text is
 *      never written to the DOM before reveal.at. Pre-reveal there is
 *      nothing in the page source to spoil beyond the (base64) headline.
 *      This is light obfuscation, not real security — see board.js notes.
 *   2. GLOBAL COUNTDOWN. reveal.at is a fixed UTC instant, so every
 *      visitor converges on the same moment regardless of load time.
 *   3. WORD-FIT, NOT INTERLOCK. Clues render as independent slots. No
 *      crossing coordinates required.
 *
 * Expects a container: <div id="case-root"></div>
 * Pairs with bingo.css tokens (v3 palette) — see :root fallbacks below.
 * ------------------------------------------------------------------
 */

(function () {
  "use strict";

  var CASE = window.DATASEC_CASE;
  var root = document.getElementById("case-root");
  if (!CASE || !root) {
    if (root) root.textContent = "Case config not found.";
    return;
  }

  // Palette. Reads the site's CSS custom properties (style.css :root) when
  // present, so the event page follows any future retheme. Falls back to the
  // v3 hex if a variable is missing. Variable names match style.css.
  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  var C = {
    bg:       cssVar("--background",    "#FAF8F5"),
    card:     cssVar("--card",          "#F1F2F4"),
    surface:  cssVar("--surface",       "#FFFFFF"),
    heading:  cssVar("--heading",       "#2E3138"),
    body:     cssVar("--body",          "#4A4F58"),
    border:   cssVar("--border",        "#E4E6EA"),
    lav:      cssVar("--lavender",      "#8C74D9"),
    lavSoft:  cssVar("--lavender-soft", "#CDBEF6"),
    teal:     cssVar("--teal",          "#2E8C8A"),
    tealBg:   cssVar("--teal-soft",     "#D7F0EE"),
    // Derived tones with no site variable — kept as constants.
    lavBg:   "#EEEDFE", lavDark: "#534AB7",
    tealDark: "#0F6E56", coral: "#993C1D", muted: "#888780"
  };

  var revealAt = new Date(CASE.reveal.at).getTime();
  function isRevealed() { return Date.now() >= revealAt; }
  function b64decode(s) {
    try { return decodeURIComponent(escape(window.atob(s))); }
    catch (e) { return ""; }
  }

  // ---- DOM helpers ------------------------------------------------
  function el(tag, style, html) {
    var n = document.createElement(tag);
    if (style) n.style.cssText = style;
    if (html != null) n.innerHTML = html;
    return n;
  }
  // Match the live site (style.css): DM Sans body, Cormorant display.
  // MONO is used for eyebrows/labels/countdown — the site has no mono face,
  // so we use a system monospace stack, which reads as "data/label" without
  // pulling in a font the rest of the site doesn't load.
  var MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  var SANS = "'DM Sans', system-ui, sans-serif";
  var DISPLAY = "'Cormorant Garamond', Georgia, serif";

  // ---- Header -----------------------------------------------------
  function renderHeader() {
    var h = el("div", "border-radius:16px;border:1px solid " + C.lavSoft +
      ";background:linear-gradient(145deg, " + C.lavSoft + ", #eee9ff);" +
      "padding:20px 24px;box-shadow:0 14px 34px rgba(140,116,217,0.14);");
    h.appendChild(el("div",
      "display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px;",
      "<span style='font-family:" + MONO + ";font-size:11px;letter-spacing:.12em;" +
      "text-transform:uppercase;color:#fff;background:" + C.lav +
      ";padding:4px 10px;border-radius:999px;font-weight:700;'>Case File " + CASE.meta.number + "</span>" +
      "<span style='font-family:" + MONO + ";font-size:11px;letter-spacing:.12em;" +
      "text-transform:uppercase;color:" + C.teal + ";font-weight:700;'>" + CASE.meta.volume +
      " \u00b7 " + CASE.meta.title + "</span>"));
    h.appendChild(el("div", "font-size:13.5px;color:" + C.heading + ";line-height:1.6;",
      CASE.meta.tagline + " One hint drops on X each day. " +
      CASE.reveal.label + "."));
    return h;
  }

  // ---- Grid (word-fit) --------------------------------------------
  function renderGrid() {
    var wrap = el("div", "flex:1;min-width:250px;");
    wrap.appendChild(el("div", "font-family:" + MONO + ";font-size:11px;" +
      "letter-spacing:.1em;text-transform:uppercase;color:" + C.heading +
      ";margin-bottom:8px;", "The grid \u2014 " + CASE.clues.length + " answers"));

    CASE.clues.forEach(function (c, idx) {
      // Alternate lavender / teal accents down the list so the board carries color.
      var accent = idx % 2 === 0 ? C.lav : C.teal;
      var accentBg = idx % 2 === 0 ? C.lavBg : C.tealBg;
      var row = el("div", "border:1px solid " + C.border + ";border-left:4px solid " +
        accent + ";background:" + accentBg + ";border-radius:10px;padding:10px 13px;" +
        "margin-bottom:8px;");
      var boxes = "";
      for (var i = 0; i < c.len; i++) {
        boxes += "<span style='display:inline-block;width:15px;height:18px;" +
          "border:1px solid " + accent + ";border-radius:3px;margin:1px;" +
          "background:" + C.surface + ";'></span>";
      }
      row.appendChild(el("div",
        "display:flex;align-items:center;gap:8px;margin-bottom:4px;",
        "<span style='font-family:" + MONO + ";font-size:11px;color:#fff;" +
        "background:" + accent + ";font-weight:700;border-radius:999px;" +
        "padding:2px 8px;min-width:24px;text-align:center;'>" + c.id + "</span>" +
        "<span style='line-height:0;'>" + boxes + "</span>"));
      row.appendChild(el("div", "font-size:12.5px;color:" + C.heading + ";line-height:1.45;",
        c.def + " (" + c.len + ")"));
      wrap.appendChild(row);
    });
    return wrap;
  }

  // ---- Hint schedule ----------------------------------------------
  function hintUnlocked(dateStr) {
    // A hint is unlocked once its calendar day has begun in ET.
    // We approximate "start of that day ET" as 04:00Z (EDT midnight).
    var t = new Date(dateStr + "T04:00:00Z").getTime();
    return Date.now() >= t;
  }

  function renderSchedule() {
    var wrap = el("div", "flex:1;min-width:250px;");
    wrap.appendChild(el("div", "font-family:" + MONO + ";font-size:11px;" +
      "letter-spacing:.1em;text-transform:uppercase;color:" + C.heading +
      ";margin-bottom:8px;", "Daily hint schedule"));

    CASE.clues.forEach(function (c) {
      var on = hintUnlocked(c.hintDay);
      var day = new Date(c.hintDay + "T12:00:00Z");
      var label = day.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      var r = el("div", "display:flex;align-items:center;gap:8px;padding:6px 9px;" +
        "margin-bottom:5px;border-radius:7px;border:1px solid " + C.border +
        ";background:" + (on ? C.surface : C.card) + ";");
      r.innerHTML =
        "<span style='font-family:" + MONO + ";font-size:10px;letter-spacing:.06em;" +
        "text-transform:uppercase;color:" + (on ? C.teal : "#B4B2A9") +
        ";min-width:46px;'>" + label + "</span>" +
        "<span style='font-size:12px;color:" + (on ? C.body : "#B4B2A9") + ";'>hint \u2192 " +
        "<strong style='color:" + (on ? C.heading : "#B4B2A9") + ";'>" + c.id +
        "</strong>" + (on ? "" : " \u00b7 locked") + "</span>";
      wrap.appendChild(r);
    });
    return wrap;
  }

  // ---- Countdown / reveal panel -----------------------------------
  // The verdict is only built into the DOM once revealed. Before that,
  // renderVerdict() is never called, so the text isn't in page source.
  function renderVerdict() {
    var v = CASE.verdict;
    var panel = el("div", "margin-top:14px;border-radius:12px;border:1px solid " +
      C.teal + ";background:" + C.bg + ";padding:20px 22px;");

    panel.appendChild(el("div",
      "display:flex;align-items:center;gap:8px;font-family:" + MONO + ";font-size:11px;" +
      "letter-spacing:.12em;text-transform:uppercase;color:" + C.tealDark +
      ";margin-bottom:10px;",
      "<span aria-hidden='true'>\u25B8</span><span>Verdict unlocked</span>"));
    panel.appendChild(el("div", "font-family:" + DISPLAY + ";font-size:30px;" +
      "font-weight:500;line-height:1.05;letter-spacing:-0.02em;color:" + C.heading +
      ";margin-bottom:12px;", b64decode(CASE.reveal.sealedHeadline)));
    panel.appendChild(el("div", "font-size:15px;color:" + C.body + ";line-height:1.7;", v.intro));

    v.chain.forEach(function (s) {
      panel.appendChild(el("div", "font-size:15px;color:" + C.body +
        ";line-height:1.7;margin-top:12px;",
        "<strong style='color:" + C.lav + ";'>" + s.stage + " \u2014 " +
        s.answer + ".</strong> " + s.text));
    });

    var read = el("div", "margin-top:18px;padding:16px 18px;border-radius:10px;" +
      "background:" + C.lavBg + ";border:1px solid " + C.lavSoft + ";");
    read.appendChild(el("div", "font-family:" + MONO + ";font-size:10px;" +
      "letter-spacing:.1em;text-transform:uppercase;color:" + C.lavDark +
      ";margin-bottom:6px;", "The analyst's read"));
    read.appendChild(el("div", "font-size:15px;color:" + C.heading + ";line-height:1.65;",
      v.read + "<br><br><span style='color:" + C.lav + ";font-weight:500;'>" +
      v.close + "</span>"));
    panel.appendChild(read);

    if (CASE.next && CASE.next.teaser) {
      panel.appendChild(el("div", "margin-top:14px;font-size:12px;color:" + C.muted +
        ";text-align:center;", CASE.next.teaser));
    }
    return panel;
  }

  function renderLocked(container) {
    var panel = el("div", "margin-top:14px;border-radius:12px;border:1px dashed " +
      C.lav + ";background:" + C.lavBg + ";padding:16px 18px;");
    panel.appendChild(el("div",
      "display:flex;align-items:center;gap:6px;font-family:" + MONO + ";font-size:11px;" +
      "letter-spacing:.1em;text-transform:uppercase;color:" + C.lavDark + ";",
      "<span aria-hidden='true'>\uD83D\uDD12</span><span>Verdict locked</span>"));
    var cd = el("div", "font-family:" + MONO + ";font-size:22px;color:" + C.heading +
      ";margin-top:6px;", "--:--:--:--");
    panel.appendChild(cd);
    panel.appendChild(el("div", "font-size:11px;color:" + C.muted + ";margin-top:4px;",
      CASE.reveal.label));
    container.appendChild(panel);

    function tick() {
      if (isRevealed()) { rebuild(); return; }
      var ms = revealAt - Date.now();
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor((s % 86400) / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      function p(n) { return String(n).padStart(2, "0"); }
      cd.textContent = (d > 0 ? d + "d " : "") + p(h) + ":" + p(m) + ":" + p(sec);
      setTimeout(tick, 1000);
    }
    tick();
  }

  // ---- Assemble ---------------------------------------------------
  function rebuild() {
    root.innerHTML = "";
    var stage = el("div", "font-family:" + SANS + ";max-width:680px;margin:0 auto;");
    stage.appendChild(renderHeader());

    var cols = el("div", "display:flex;gap:16px;margin-top:14px;flex-wrap:wrap;");
    cols.appendChild(renderGrid());
    cols.appendChild(renderSchedule());
    stage.appendChild(cols);

    if (isRevealed()) {
      stage.appendChild(renderVerdict());
    } else {
      renderLocked(stage);
    }

    stage.appendChild(el("div", "margin-top:12px;font-size:11px;color:" + C.muted +
      ";font-family:" + MONO + ";", CASE.meta.emoji + " " + CASE.meta.signature));
    root.appendChild(stage);
  }

  rebuild();
})();
