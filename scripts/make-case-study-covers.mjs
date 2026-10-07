/**
 * Generates the case-study cover images in public/images/case-studies/.
 *
 * - Website case studies: a composite of a live desktop + mobile screenshot
 *   of the client site, framed in a browser window and a phone.
 * - AI/ML case studies: branded illustrations (poker capture HUD, AI-image
 *   detection score panel, email-classification flow).
 *
 * Usage:  npm i --no-save playwright
 *         node scripts/make-case-study-covers.mjs [name ...]
 * No browser download is needed: it uses the installed Chrome or Edge.
 * Set COVERS_BROWSER=chromium to use a Playwright-managed Chromium instead.
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "case-studies");
const TMP = path.join(os.tmpdir(), "sira-covers");

const SITES = {
  eatpmp: "https://www.eatpmp.com/",
  "jorge-siesta-key": "https://jorge-siesta-key.vercel.app/",
  "horseman-wellness-club": "https://horsemanwellnessclub.com/",
  "rowhome-magazine": "https://rowhomemag.com/",
};

const FONTS =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap";

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1600px;height:1000px;overflow:hidden}
body{background:#FAFAF7;color:#0A0A0A;font-family:'Inter',system-ui,sans-serif;position:relative}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(10,10,10,.14) 1.2px,transparent 1.2px);background-size:28px 28px;opacity:.9}
.pool{position:absolute;border-radius:50%;filter:blur(90px);background:rgba(10,10,10,.07)}
.corner{position:absolute;width:38px;height:38px;border:2px solid rgba(10,10,10,.5)}
.corner.tl{top:40px;left:40px;border-right:0;border-bottom:0}
.corner.tr{top:40px;right:40px;border-left:0;border-bottom:0}
.corner.bl{bottom:40px;left:40px;border-right:0;border-top:0}
.corner.br{bottom:40px;right:40px;border-left:0;border-top:0}
.tag{position:absolute;top:52px;left:96px;font-family:'Manrope';font-weight:700;font-size:15px;letter-spacing:.22em;text-transform:uppercase;color:#6B6B6B}
.tag b{color:#0A0A0A}
.mark{position:absolute;bottom:52px;right:96px;font-family:'Manrope';font-weight:800;font-size:18px;letter-spacing:.3em;color:#0A0A0A}
`;

const frame = (inner) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}"><style>${BASE_CSS}</style></head><body>
<div class="dots"></div>
<div class="pool" style="width:700px;height:700px;left:-200px;top:-250px"></div>
<div class="pool" style="width:600px;height:600px;right:-150px;bottom:-250px"></div>
<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
${inner}
<div class="mark">SIRA</div>
</body></html>`;

async function b64(file) {
  return "data:image/png;base64," + (await readFile(file)).toString("base64");
}

async function website(name, label, urlLabel) {
  const desk = await b64(path.join(TMP, `${name}-desktop.png`));
  const mob = await b64(path.join(TMP, `${name}-mobile.png`));
  return frame(`
<style>
.browser{position:absolute;left:96px;top:130px;width:1180px;border-radius:18px;background:#fff;
  box-shadow:0 30px 80px -30px rgba(10,10,10,.35),0 0 0 1px rgba(10,10,10,.08);overflow:hidden}
.bar{height:46px;background:#F0F0EC;display:flex;align-items:center;padding:0 18px;gap:8px;border-bottom:1px solid rgba(10,10,10,.08)}
.bar i{width:12px;height:12px;border-radius:50%;background:rgba(10,10,10,.18);display:block}
.bar .url{margin-left:16px;flex:1;height:26px;border-radius:8px;background:#fff;border:1px solid rgba(10,10,10,.1);
  font:500 13px 'Inter';color:#6B6B6B;display:flex;align-items:center;padding:0 12px}
.browser img{display:block;width:1180px;height:737px;object-fit:cover;object-position:top}
.phone{position:absolute;right:112px;top:290px;width:300px;height:620px;border-radius:40px;background:#0A0A0A;padding:12px;
  box-shadow:0 40px 90px -30px rgba(10,10,10,.55)}
.phone .screen{width:100%;height:100%;border-radius:30px;overflow:hidden;background:#fff}
.phone img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
.notch{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:92px;height:26px;border-radius:14px;background:#0A0A0A}
</style>
<div class="tag">Website · <b>${label}</b></div>
<div class="browser"><div class="bar"><i></i><i></i><i></i><div class="url">${urlLabel}</div></div><img src="${desk}"></div>
<div class="phone"><div class="screen"><img src="${mob}"></div><div class="notch"></div></div>
`);
}

function poker() {
  const seats = [[290, 330], [470, 195], [930, 195], [1110, 330], [1010, 585], [390, 585]];
  const seatHtml = seats
    .map(([x, y], i) => `<div class="roi" style="left:${x - 70}px;top:${y - 40}px;width:140px;height:80px"><span>SEAT ${i + 1}</span></div>`)
    .join("");
  return frame(`
<style>
.stage{position:absolute;left:96px;top:120px;width:1408px;height:760px;border-radius:20px;background:#0A0A0A;overflow:hidden;box-shadow:0 30px 80px -30px rgba(10,10,10,.5)}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)}
.table{position:absolute;left:200px;top:170px;width:1000px;height:430px;border-radius:230px;border:2px solid rgba(250,250,247,.45);background:radial-gradient(ellipse at center,rgba(250,250,247,.08),rgba(250,250,247,.02) 70%,transparent)}
.table:after{content:"";position:absolute;inset:70px;border-radius:200px;border:1px dashed rgba(250,250,247,.25)}
.roi{position:absolute;border:1.5px solid rgba(250,250,247,.85);border-radius:4px}
.roi:before,.roi:after{content:"";position:absolute;width:10px;height:10px;border:2px solid #FAFAF7}
.roi:before{left:-2px;top:-2px;border-right:0;border-bottom:0}
.roi:after{right:-2px;bottom:-2px;border-left:0;border-top:0}
.roi span{position:absolute;left:0;top:-22px;font:600 11px/1 'Manrope';letter-spacing:.18em;color:#FAFAF7;background:#0A0A0A;padding:4px 6px}
.board{left:505px;top:380px;width:390px;height:120px}
.pot{left:620px;top:270px;width:160px;height:60px}
.card{position:absolute;top:22px;width:62px;height:84px;border-radius:6px;background:#FAFAF7;color:#0A0A0A;font:700 18px 'Manrope';display:flex;align-items:center;justify-content:center}
.hud{position:absolute;left:34px;bottom:34px;display:flex;gap:18px}
.stat{min-width:210px;padding:18px 22px;border-radius:12px;background:rgba(250,250,247,.08);border:1px solid rgba(250,250,247,.18);color:#FAFAF7}
.stat .v{font:800 40px/1 'Manrope';letter-spacing:-.02em}
.stat .l{margin-top:10px;font:500 12px 'Inter';letter-spacing:.2em;text-transform:uppercase;color:rgba(250,250,247,.65)}
.top{position:absolute;left:34px;top:30px;display:flex;align-items:center;gap:14px;color:#FAFAF7;font:600 13px 'Manrope';letter-spacing:.22em;text-transform:uppercase}
.rec{width:12px;height:12px;border-radius:50%;background:#FAFAF7;box-shadow:0 0 0 4px rgba(250,250,247,.2)}
.right{position:absolute;right:34px;top:30px;color:rgba(250,250,247,.75);font:500 13px ui-monospace,monospace;letter-spacing:.08em;text-align:right;line-height:1.7}
.pipe{position:absolute;right:34px;bottom:34px;display:flex;gap:10px;align-items:center;color:#FAFAF7;font:600 12px 'Manrope';letter-spacing:.14em;text-transform:uppercase}
.pipe span{padding:10px 14px;border:1px solid rgba(250,250,247,.35);border-radius:999px}
.pipe i{width:22px;height:1px;background:rgba(250,250,247,.5)}
</style>
<div class="tag">Computer vision · <b>Real-time capture pipeline</b></div>
<div class="stage">
  <div class="scan"></div>
  <div class="top"><span class="rec"></span> Live capture · Elgato Cam Link 4K</div>
  <div class="right">frame 184,212<br>1920×1080 @ 60 Hz<br>backend: capture-card</div>
  <div class="table"></div>
  ${seatHtml}
  <div class="roi board"><span>BOARD</span>
    <div class="card" style="left:16px">A</div><div class="card" style="left:90px">K</div><div class="card" style="left:164px">7</div><div class="card" style="left:238px">7</div><div class="card" style="left:312px;opacity:.25"></div>
  </div>
  <div class="roi pot"><span>POT</span></div>
  <div class="hud">
    <div class="stat"><div class="v">66.95</div><div class="l">FPS sustained</div></div>
    <div class="stat"><div class="v">14.4 ms</div><div class="l">mean latency</div></div>
    <div class="stat"><div class="v">0</div><div class="l">dropped frames</div></div>
  </div>
  <div class="pipe"><span>Capture</span><i></i><span>ROI extract</span><i></i><span>Game state</span></div>
</div>
`);
}

function detection() {
  return frame(`
<style>
.panel{position:absolute;left:96px;top:130px;width:1408px;height:740px;border-radius:20px;background:#fff;border:1px solid rgba(10,10,10,.08);box-shadow:0 30px 80px -30px rgba(10,10,10,.3);display:grid;grid-template-columns:600px 1fr}
.photo{margin:40px;border-radius:14px;background:#0A0A0A;position:relative;overflow:hidden}
.photo .img{position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.18),transparent 45%),radial-gradient(circle at 70% 30%,rgba(255,255,255,.22),transparent 35%),linear-gradient(0deg,#2A2A2A,#0A0A0A)}
.photo .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(250,250,247,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(250,250,247,.08) 1px,transparent 1px);background-size:40px 40px}
.photo .lbl{position:absolute;left:18px;top:18px;font:600 11px 'Manrope';letter-spacing:.2em;text-transform:uppercase;color:#FAFAF7;background:rgba(10,10,10,.6);padding:7px 10px;border-radius:6px}
.photo .heat{position:absolute;border:1.5px solid #FAFAF7;border-radius:6px}
.photo .heat b{position:absolute;right:0;bottom:-24px;font:600 11px ui-monospace,monospace;color:#FAFAF7}
.res{padding:56px 60px 40px 20px;display:flex;flex-direction:column}
.res h3{font:700 14px 'Manrope';letter-spacing:.22em;text-transform:uppercase;color:#6B6B6B}
.score{margin-top:14px;display:flex;align-items:baseline;gap:14px}
.score .n{font:800 128px/1 'Manrope';letter-spacing:-.04em}
.score .t{font:600 22px 'Manrope';color:#2A2A2A}
.bands{margin-top:34px}
.bar{height:16px;border-radius:999px;background:linear-gradient(90deg,#E6E6E1 0 40%,#9A9A9A 40% 70%,#0A0A0A 70%);position:relative}
.bar .pin{position:absolute;top:-9px;width:34px;height:34px;border-radius:50%;background:#FAFAF7;border:4px solid #0A0A0A;transform:translateX(-50%)}
.legend{display:flex;justify-content:space-between;margin-top:14px;font:500 13px 'Inter';color:#6B6B6B;letter-spacing:.04em}
.legend b{color:#0A0A0A}
.feat{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.feat div{border:1px solid rgba(10,10,10,.1);border-radius:12px;padding:16px 18px}
.feat .k{font:600 11px 'Manrope';letter-spacing:.2em;text-transform:uppercase;color:#6B6B6B}
.feat .v{margin-top:8px;font:700 22px 'Manrope'}
.pipe{margin-top:auto;display:flex;align-items:center;gap:10px;font:600 12px 'Manrope';letter-spacing:.14em;text-transform:uppercase}
.pipe span{padding:10px 14px;border:1px solid rgba(10,10,10,.25);border-radius:999px;white-space:nowrap}
.pipe i{flex:1;height:1px;background:rgba(10,10,10,.3);min-width:14px}
</style>
<div class="tag">AI image detection · <b>Insurance claim photos</b></div>
<div class="panel">
  <div class="photo"><div class="img"></div><div class="grid"></div>
    <div class="lbl">claim_photo_0412.jpg</div>
    <div class="heat" style="left:120px;top:180px;width:260px;height:170px"><b>artifact density 0.82</b></div>
    <div class="heat" style="left:330px;top:410px;width:150px;height:110px;opacity:.7"><b>0.61</b></div>
  </div>
  <div class="res">
    <h3>AI-likelihood score</h3>
    <div class="score"><div class="n">87<span style="font-size:56px">%</span></div><div class="t">Very likely AI-generated</div></div>
    <div class="bands"><div class="bar"><div class="pin" style="left:87%"></div></div>
      <div class="legend"><span>Not AI-generated</span><span>Likely AI-generated</span><b>Very likely AI-generated</b></div></div>
    <div class="feat">
      <div><div class="k">Semantic features</div><div class="v">CLIP embedding</div></div>
      <div><div class="k">Pixel-level artifacts</div><div class="v">Frequency residuals</div></div>
    </div>
    <div class="pipe"><span>Upload</span><i></i><span>CO-SPY model</span><i></i><span>Score + bands</span><i></i><span>FastAPI on AWS</span></div>
  </div>
</div>
`);
}

function classifier() {
  const cats = [["Quote request", 94], ["Order status", 91], ["Return / RMA", 88], ["Delivery inquiry", 90], ["Technical support", 86],
    ["Invoice / billing", 92], ["Product info", 83], ["Warranty claim", 87], ["Distributor", 80], ["Other", 71]];
  const catHtml = cats.map(([n, c]) => `<div class="cat"><span>${n}</span><div class="conf"><i style="width:${c}%"></i></div><b>${c}%</b></div>`).join("");
  const mails = [["Re: quote for 3/4&quot; tube expanders", "sales@…"], ["Order #48213 shipping?", "ops@…"], ["Need RMA for damaged rolls", "maint@…"], ["Torque spec for model 2410", "eng@…"]];
  const mailHtml = mails.map(([s, f]) => `<div class="mail"><div class="from">${f}</div><div class="subj">${s}</div><div class="line"></div><div class="line short"></div></div>`).join("");
  return frame(`
<style>
.wrap{position:absolute;left:96px;top:130px;width:1408px;height:740px;display:grid;grid-template-columns:470px 300px 1fr;align-items:center;gap:0}
.col h3{font:700 14px 'Manrope';letter-spacing:.22em;text-transform:uppercase;color:#6B6B6B;margin-bottom:20px}
.mail{background:#fff;border:1px solid rgba(10,10,10,.1);border-radius:14px;padding:22px 24px;margin-bottom:16px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.mail .from{font:500 13px 'Inter';color:#9A9A9A;letter-spacing:.06em}
.mail .subj{margin-top:8px;font:600 19px 'Manrope'}
.mail .line{margin-top:10px;height:6px;border-radius:3px;background:rgba(10,10,10,.08)}
.mail .line.short{width:60%}
.mid{position:relative;height:100%;display:flex;align-items:center;justify-content:center}
.node{width:220px;height:220px;border-radius:50%;background:#0A0A0A;color:#FAFAF7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 0 0 14px rgba(10,10,10,.06),0 0 0 28px rgba(10,10,10,.03)}
.node .n{font:800 26px 'Manrope';letter-spacing:-.01em}
.node .s{margin-top:6px;font:500 11px 'Inter';letter-spacing:.18em;text-transform:uppercase;color:rgba(250,250,247,.65)}
.wire{position:absolute;top:50%;height:1px;background:rgba(10,10,10,.35)}
.wire.l{left:-10px;width:50px} .wire.r{right:-10px;width:50px}
.wire:after{content:"";position:absolute;right:-1px;top:-4px;width:9px;height:9px;border-top:1px solid rgba(10,10,10,.5);border-right:1px solid rgba(10,10,10,.5);transform:rotate(45deg)}
.cats{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
.cat{display:grid;grid-template-columns:138px 1fr 44px;align-items:center;gap:10px;background:#fff;border:1px solid rgba(10,10,10,.1);border-radius:12px;padding:18px 18px}
.cat span{font:600 15px 'Manrope'}
.conf{height:6px;border-radius:3px;background:rgba(10,10,10,.08);overflow:hidden}
.conf i{display:block;height:100%;background:#0A0A0A}
.cat b{font:600 12px ui-monospace,monospace;color:#6B6B6B;text-align:right}
.foot{margin-top:28px;display:flex;gap:10px;font:600 12px 'Manrope';letter-spacing:.16em;text-transform:uppercase}
.foot span{padding:8px 12px;border:1px solid rgba(10,10,10,.25);border-radius:999px;white-space:nowrap}
</style>
<div class="tag">LLM automation · <b>Email classification</b></div>
<div class="wrap">
  <div class="col"><h3>Inbound customer email</h3>${mailHtml}</div>
  <div class="mid"><div class="wire l"></div><div class="node"><div class="n">Claude</div><div class="s">classify + confidence</div></div><div class="wire r"></div></div>
  <div class="col"><h3>10 business categories</h3><div class="cats">${catHtml}</div>
    <div class="foot"><span>FastAPI</span><span>Docker</span><span>REST API</span><span>Low confidence → human review</span></div></div>
</div>
`);
}

function agents() {
  const lanes = [
    ["Quote agent", "Pulls specs, drafts the quote, flags margin", "CRM"],
    ["Support agent", "Answers from the docs, escalates the rest", "Helpdesk"],
    ["Data agent", "Extracts order details, updates the record", "ERP"],
  ];
  const laneHtml = lanes
    .map(
      ([n, d, out]) => `<div class="lane"><div class="agent"><div class="dot"></div><div><div class="n">${n}</div><div class="d">${d}</div></div></div>
      <div class="arrow"></div><div class="sys">${out}</div></div>`,
    )
    .join("");
  return frame(`
<style>
.wrap{position:absolute;left:96px;top:130px;width:1408px;height:740px;display:grid;grid-template-columns:300px 260px 1fr;align-items:center}
.col h3{font:700 14px 'Manrope';letter-spacing:.22em;text-transform:uppercase;color:#6B6B6B;margin-bottom:20px}
.inbox{background:#fff;border:1px solid rgba(10,10,10,.1);border-radius:16px;padding:22px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.inbox .row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(10,10,10,.08)}
.inbox .row:last-child{border-bottom:0}
.inbox .ic{width:34px;height:34px;border-radius:10px;background:rgba(10,10,10,.06);flex:none}
.inbox .t{font:600 15px 'Manrope'} .inbox .s{font:500 12px 'Inter';color:#9A9A9A;margin-top:3px}
.mid{position:relative;height:100%;display:flex;align-items:center;justify-content:center}
.node{width:200px;height:200px;border-radius:50%;background:#0A0A0A;color:#FAFAF7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 0 0 14px rgba(10,10,10,.06),0 0 0 28px rgba(10,10,10,.03)}
.node .n{font:800 22px 'Manrope'} .node .s{margin-top:6px;font:500 11px 'Inter';letter-spacing:.18em;text-transform:uppercase;color:rgba(250,250,247,.65)}
.wire{position:absolute;top:50%;height:1px;background:rgba(10,10,10,.35)} .wire.l{left:-10px;width:40px} .wire.r{right:-10px;width:40px}
.lanes{display:flex;flex-direction:column;gap:18px}
.lane{display:grid;grid-template-columns:1fr 60px 140px;align-items:center;gap:0}
.agent{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid rgba(10,10,10,.1);border-radius:14px;padding:18px 20px}
.agent .dot{width:12px;height:12px;border-radius:50%;background:#0A0A0A;flex:none;box-shadow:0 0 0 5px rgba(10,10,10,.08)}
.agent .n{font:700 17px 'Manrope'} .agent .d{font:400 13px 'Inter';color:#6B6B6B;margin-top:4px}
.arrow{height:1px;background:rgba(10,10,10,.35);position:relative;margin:0 10px}
.arrow:after{content:"";position:absolute;right:0;top:-4px;width:9px;height:9px;border-top:1px solid rgba(10,10,10,.5);border-right:1px solid rgba(10,10,10,.5);transform:rotate(45deg)}
.sys{font:600 13px 'Manrope';letter-spacing:.14em;text-transform:uppercase;padding:14px 16px;border:1px dashed rgba(10,10,10,.35);border-radius:12px;text-align:center}
.human{margin-top:18px;display:flex;align-items:center;gap:12px;font:600 12px 'Manrope';letter-spacing:.16em;text-transform:uppercase;color:#6B6B6B}
.human span{padding:8px 12px;border:1px solid rgba(10,10,10,.25);border-radius:999px;color:#0A0A0A}
</style>
<div class="tag">AI agents · <b>Orchestrated workflows</b></div>
<div class="wrap">
  <div class="col"><h3>Work arriving</h3>
    <div class="inbox">
      <div class="row"><div class="ic"></div><div><div class="t">Quote request</div><div class="s">email · 2 attachments</div></div></div>
      <div class="row"><div class="ic"></div><div><div class="t">Order status</div><div class="s">web form</div></div></div>
      <div class="row"><div class="ic"></div><div><div class="t">Spec question</div><div class="s">email</div></div></div>
      <div class="row"><div class="ic"></div><div><div class="t">New purchase order</div><div class="s">PDF · scanned</div></div></div>
    </div>
  </div>
  <div class="mid"><div class="wire l"></div><div class="node"><div class="n">Orchestrator</div><div class="s">route · retry · log</div></div><div class="wire r"></div></div>
  <div class="col"><h3>Agents and systems</h3><div class="lanes">${laneHtml}</div>
    <div class="human">Low confidence or high value <span>→ human review</span></div></div>
</div>
`);
}

const COVERS = {
  "performance-meal-prep": () => website("eatpmp", "Performance Meal Prep", "eatpmp.com"),
  "jorge-siesta-key": () => website("jorge-siesta-key", "Jorge · Siesta Key", "jorge-siesta-key.vercel.app"),
  "horseman-wellness-club": () => website("horseman-wellness-club", "Horseman Wellness Club", "horsemanwellnessclub.com"),
  "rowhome-magazine": () => website("rowhome-magazine", "Philadelphia RowHome Magazine", "rowhomemag.com"),
  "real-time-poker-computer-vision": async () => poker(),
  "ai-generated-image-detection-insurance-claims": async () => detection(),
  "ai-email-classification-industrial-manufacturer": async () => classifier(),
  "ai-agent-orchestration": async () => agents(),
};

const SITE_FOR_COVER = {
  "performance-meal-prep": "eatpmp",
  "jorge-siesta-key": "jorge-siesta-key",
  "horseman-wellness-club": "horseman-wellness-club",
  "rowhome-magazine": "rowhome-magazine",
};

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function launch() {
  const pref = process.env.COVERS_BROWSER;
  const channels = pref ? [pref] : ["chrome", "msedge", "chromium"];
  let lastErr;
  for (const channel of channels) {
    try {
      return await chromium.launch(channel === "chromium" ? {} : { channel });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// Third-party popup/notification widgets that would sit on top of the screenshot.
const POPUP_VENDORS =
  /pushowl|firepush|aimtell|onesignal|smile\.io|sweettooth|loyaltylion|rivo|klaviyo|privy|justuno|omnisend|optinmonster|wisepops|poptin|mailchimp|hubspot|tidio|gorgias|intercom|crisp\.chat|zendesk|sumo\.com|yotpo|judge\.me|booster/i;

const POPUP_TEXT =
  /10% OFF|FIRST ORDER|SUBSCRIBE AND SAVE|notify you|Just one more step|earn points|Performance Points|Cookie|cookies/i;

async function dismissPopups(page) {
  for (const sel of ["button[aria-label*='Close' i]", "button:has-text('×')", "button:has-text('No thanks')", "button:has-text('Later')"]) {
    try {
      const loc = page.locator(sel);
      const n = await loc.count();
      for (let i = 0; i < Math.min(n, 5); i++) {
        const el = loc.nth(i);
        if (await el.isVisible({ timeout: 300 })) {
          await el.click({ timeout: 1000 });
          await page.waitForTimeout(400);
        }
      }
    } catch {}
  }
  await page.keyboard.press("Escape").catch(() => {});
  await page.evaluate((pattern) => {
    const re = new RegExp(pattern, "i");
    for (const el of document.querySelectorAll("body *")) {
      const s = getComputedStyle(el);
      if ((s.position === "fixed" || s.position === "sticky") && re.test(el.innerText || "") && el.getBoundingClientRect().height < 700) {
        el.remove();
      }
    }
  }, POPUP_TEXT.source);
}

// Wait until every image on the page has loaded; reload once if some are broken.
async function settleImages(page, url) {
  const ok = () => page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  if (await ok()) return;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await ok();
}

async function shootSite(browser, name, url) {
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await desk.route("**/*", (route) => (POPUP_VENDORS.test(route.request().url()) ? route.abort() : route.continue()));
  const p = await desk.newPage();
  await p.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await settleImages(p, url);
  await p.waitForTimeout(2500);
  await dismissPopups(p);
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(TMP, `${name}-desktop.png`) });
  await desk.close();

  const mob = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: MOBILE_UA,
  });
  await mob.route("**/*", (route) => (POPUP_VENDORS.test(route.request().url()) ? route.abort() : route.continue()));
  const m = await mob.newPage();
  await m.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await settleImages(m, url);
  await m.waitForTimeout(4000);
  await dismissPopups(m);
  await m.waitForTimeout(600);
  await m.screenshot({ path: path.join(TMP, `${name}-mobile.png`) });
  await mob.close();
  console.log("screenshot", name);
}

async function main() {
  const only = process.argv.slice(2);
  const names = only.length ? only : Object.keys(COVERS);
  await mkdir(OUT, { recursive: true });
  await mkdir(TMP, { recursive: true });
  const browser = await launch();
  try {
    const sites = new Set(names.map((n) => SITE_FOR_COVER[n]).filter(Boolean));
    for (const s of sites) {
      if (!existsSync(path.join(TMP, `${s}-mobile.png`))) await shootSite(browser, s, SITES[s]);
    }
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
    for (const name of names) {
      const html = await COVERS[name]();
      const file = path.join(TMP, `${name}.html`);
      await writeFile(file, html);
      const page = await ctx.newPage();
      await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: "jpeg", quality: 82 });
      await page.close();
      console.log("cover", `${name}.jpg`);
    }
    await ctx.close();
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
