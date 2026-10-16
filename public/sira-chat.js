/* SIRA site assistant. Embed: <script src="/widget.js" defer></script>
   Optional attributes: data-endpoint="/api/chat" data-accent="#C2410C" data-name="SIRA Assistant" */
(function () {
  if (window.__siraChat) return; window.__siraChat = true;
  var s = document.currentScript || {};
  var ds = (s.dataset || {});
  var ENDPOINT = ds.endpoint || "/api/chat";
  var ACCENT = ds.accent || "#C2410C";
  var NAME = ds.name || "Julio Aira";
  var ROLE = ds.role || "Founder, SIRA · AI assistant";
  var PHOTO = ds.photo || "/images/julio-headshot.jpg";
  var BOOK = "https://calendly.com/airadev/work", EMAIL = "hello@sira.services";
  var GREETING = "Hi! I'm Julio's AI assistant. Tell me what you're trying to build or automate and I'll point you to the right service, or help you book a call with Julio.";
  var CHIPS = ["Add AI chat to my site", "Automate a workflow", "Computer vision project", "I need a website"];

  var css = `
  .sc-btn{position:fixed;right:22px;bottom:22px;width:58px;height:58px;border-radius:50%;background:#0F1419;color:#fff;border:2px solid ${ACCENT};display:grid;place-items:center;cursor:pointer;z-index:2147483000;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .2s}
  .sc-btn:hover{transform:scale(1.06)}
  .sc-btn svg{width:26px;height:26px}
  .sc-badge{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:${ACCENT};border:2px solid #fff}
  .sc-teaser{position:fixed;right:90px;bottom:32px;max-width:230px;background:#fff;color:#0F1419;font:600 14px/1.4 Inter,system-ui,sans-serif;padding:10px 14px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:2147483000;cursor:pointer}
  .sc-panel{position:fixed;right:22px;bottom:92px;width:370px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 190px);background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden;z-index:2147483001;font-family:Inter,system-ui,sans-serif}
  .sc-panel.open{display:flex}
  .sc-head{background:#0F1419;color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px;border-bottom:3px solid ${ACCENT}}
  .sc-dot{width:10px;height:10px;border-radius:50%;background:#3ddc84;border:2px solid #0F1419;position:absolute;right:-1px;bottom:-1px}
  .sc-av{position:relative;width:40px;height:40px;flex:none}
  .sc-av img,.sc-av .sc-ini{width:40px;height:40px;border-radius:50%;object-fit:cover;display:block}
  .sc-ini{background:#0B4A2F;color:#fff;font:700 15px/40px Inter,system-ui,sans-serif;text-align:center}
  .sc-btn img{width:100%;height:100%;border-radius:50%;object-fit:cover}
  .sc-head b{font-size:15px;display:block}.sc-head small{font-size:12px;color:#B9C4D0}
  .sc-x{margin-left:auto;background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}
  .sc-log{flex:1;overflow-y:auto;padding:16px;background:#F6F4EF;display:flex;flex-direction:column;gap:10px}
  .sc-m{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14.5px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
  .sc-bot{background:#fff;color:#1B2633;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 2px rgba(0,0,0,.06)}
  .sc-me{background:#0B4A2F;color:#fff;border-bottom-right-radius:4px;align-self:flex-end;font-weight:500}
  .sc-chips{display:flex;flex-wrap:wrap;gap:6px}
  .sc-chip{background:#fff;border:1px solid ${ACCENT};color:#0F1419;border-radius:999px;padding:6px 11px;font-size:13px;cursor:pointer}
  .sc-chip:hover{background:${ACCENT};color:#fff}
  .sc-typing span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#9aa5b1;animation:scb 1s infinite}
  .sc-typing span:nth-child(2){animation-delay:.15s}.sc-typing span:nth-child(3){animation-delay:.3s}
  @keyframes scb{0%,80%,100%{opacity:.3}40%{opacity:1}}
  .sc-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e6e2da;background:#fff}
  .sc-in{flex:1;border:1px solid #D5D1C8;border-radius:10px;padding:11px 12px;font:15px Inter,system-ui,sans-serif;outline:none}
  .sc-in:focus{border-color:${ACCENT};box-shadow:0 0 0 3px rgba(194,65,12,.2)}
  .sc-send{background:${ACCENT};border:0;border-radius:10px;padding:0 14px;cursor:pointer;color:#fff;font-weight:700}
  .sc-foot{font-size:11px;color:#8a94a0;text-align:center;padding:0 0 8px;background:#fff}
  .sc-foot a{color:#8a94a0}
  @media (max-width:480px){.sc-panel{right:16px;left:16px;width:auto;bottom:92px}.sc-teaser{display:none}}
  `;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function initials() { return NAME.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); }
  function avatar() { return '<img src="' + PHOTO + '" alt="' + NAME + '" onerror="this.outerHTML=\'<span class=sc-ini>' + initials() + '</span>\'">'; }
  var chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var btn = el("button", "sc-btn", chatIcon + '<span class="sc-badge"></span>');
  btn.setAttribute("aria-label", "Chat with " + NAME + "'s assistant");
  (function () { var im = new Image(); im.onload = function () { btn.innerHTML = '<img src="' + PHOTO + '" alt=""><span class="sc-badge"></span>'; btn.style.padding = "0"; }; im.src = PHOTO; })();
  var teaser = el("div", "sc-teaser", "Hi, I'm Julio. Questions about AI for your business? 👋");
  var panel = el("div", "sc-panel");
  panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", NAME);
  panel.innerHTML =
    '<div class="sc-head"><span class="sc-av">' + avatar() + '<span class="sc-dot"></span></span><div><b>' + NAME + '</b><small>' + ROLE + '</small></div><button class="sc-x" aria-label="Close chat">×</button></div>' +
    '<div class="sc-log" aria-live="polite"></div>' +
    '<form class="sc-form"><input class="sc-in" placeholder="Type your message..." maxlength="800" aria-label="Message"><button class="sc-send" type="submit">Send</button></form>' +
    '<div class="sc-foot">AI assistant · <a href="/privacy">Privacy</a></div>';
  document.body.appendChild(btn); document.body.appendChild(panel);
  setTimeout(function () { if (!panel.classList.contains("open")) document.body.appendChild(teaser); }, 4000);

  var log = panel.querySelector(".sc-log"), form = panel.querySelector(".sc-form"), input = panel.querySelector(".sc-in");
  var history = [], started = false, busy = false, aiOn = true;

  function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; }
  function add(role, text) {
    var m = el("div", "sc-m " + (role === "user" ? "sc-me" : "sc-bot"));
    if (role === "user") m.textContent = text; else linkify(m, text);
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }
  function linkify(node, text) {
    var re = /(https?:\/\/[^\s)]+|\/(?:services|case-studies|contact|privacy|blog)[\w\/-]*)/g, last = 0, mm;
    while ((mm = re.exec(text))) {
      node.appendChild(document.createTextNode(text.slice(last, mm.index)));
      var url = mm[0].replace(/[.,]$/, ""), a = document.createElement("a");
      a.href = url; a.textContent = url; a.style.color = "#0B4A2F"; a.style.fontWeight = "600";
      if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
      node.appendChild(a); last = mm.index + url.length;
    }
    node.appendChild(document.createTextNode(text.slice(last)));
  }
  function chips() {
    var c = el("div", "sc-chips");
    CHIPS.forEach(function (t) { var b = el("button", "sc-chip"); b.type = "button"; b.textContent = t; b.onclick = function () { c.remove(); send(t); }; c.appendChild(b); });
    log.appendChild(c);
  }
  function open() {
    panel.classList.add("open"); teaser.remove(); var bd = btn.querySelector(".sc-badge"); if (bd) bd.remove();
    if (!started) { started = true; add("assistant", GREETING); history.push({ role: "assistant", content: GREETING }); chips(); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { panel.classList.remove("open"); }
  btn.onclick = function () { panel.classList.contains("open") ? close() : open(); };
  teaser.onclick = open;
  panel.querySelector(".sc-x").onclick = close;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  // Built-in FAQ so the widget works even without an API key.
  function faq(q) {
    q = q.toLowerCase();
    if (/@|\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/.test(q)) return "Thanks! Julio will follow up shortly. If you'd like to pick a time now, book here: " + BOOK;
    if (/chat|widget|assistant|bot|receptionist|voice|call/.test(q)) return "We build custom AI chat and voice assistants trained on your business, like the one you're talking to. See /services/ai-agent-orchestration or book a quick call: " + BOOK;
    if (/automat|workflow|email|document|invoice|crm|zap|n8n/.test(q)) return "AI process automation is a core service: document processing, email triage, data extraction and integrations. Details at /services/ai-process-automation. Want to walk through your workflow on a call? " + BOOK;
    if (/vision|camera|image|video|detect|inspect|cv/.test(q)) return "Computer vision is our specialty: detection, inspection, video analytics and edge deployment. See /services/computer-vision-solutions and our case studies at /case-studies.";
    if (/website|site|shopify|wordpress|next|seo|maintenance/.test(q)) return "We build and maintain small-business sites on Shopify, WordPress or Next.js. See /services/websites-and-maintenance. What kind of business is it for?";
    if (/model|machine learning|ml|predict|forecast|nlp/.test(q)) return "We build custom ML models from data to production. See /services/machine-learning-development, or tell me a bit about your data and goal.";
    if (/price|cost|how much|quote|budget/.test(q)) return "Pricing is scoped per project after a short intro call, so you get a real number, not a guess. Book here: " + BOOK;
    if (/book|meet|talk|schedule|contact/.test(q)) return "Happy to set that up. Book a free intro call here: " + BOOK + " or email " + EMAIL + ".";
    if (/case|example|portfolio|work|client/.test(q)) return "You can see recent AI and website projects at /case-studies.";
    return "Got it. The fastest way to get a real answer is a quick call with Julio: " + BOOK + ". Or leave your email here and he'll follow up.";
  }

  function send(text) {
    text = (text || "").trim(); if (!text || busy) return;
    add("user", text); history.push({ role: "user", content: text });
    busy = true;
    var t = el("div", "sc-m sc-bot sc-typing", "<span></span><span></span><span></span>"); log.appendChild(t); log.scrollTop = log.scrollHeight;
    var done = function (reply) { t.remove(); add("assistant", reply); history.push({ role: "assistant", content: reply }); busy = false; };
    if (!aiOn) return setTimeout(function () { done(faq(text)); }, 500);
    fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.slice(-12) }) })
      .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function (d) { done(d.reply || faq(text)); })
      .catch(function () { aiOn = false; setTimeout(function () { done(faq(text)); }, 300); });
  }
  form.onsubmit = function (e) { e.preventDefault(); var v = input.value; input.value = ""; send(v); };
})();
