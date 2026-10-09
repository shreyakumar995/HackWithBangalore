// Local phrase scan only. This script never calls the ShieldIntern API.
const MAX_HITS = 80;

const RULES = [
  {
    kind: "fee",
    tip: "Payment request. A real employer does not charge you to start.",
    re: /\b(?:registration|training|security|onboarding|processing|joining|confirmation|seat)\s+fees?\b|\bpay\s+(?:₹|rs\.?|inr|rupees?)\s*[\d,]+|\b(?:₹|rs\.?)\s*[\d,]+\s*(?:registration|training|security|onboarding|joining|seat)?\s*fees?\b|\brefundable\s+deposit\b/gi,
  },
  {
    kind: "urgency",
    tip: "Urgency language. Scam offers push you to act before you can check.",
    re: /\bwithin\s+\d+\s+hours?\b|\b(?:only|just)\s+\d+\s+(?:spots?|seats?|openings?)\s+left\b|\blimited\s+(?:seats?|spots?|time(?:\s+offer)?)\b|\boffer\s+expires\b|\bact\s+now\b|\blast\s+chance\b|\btoday\s+only\b|\bimmediate(?:ly)?\s+join(?:ing)?\b/gi,
  },
  {
    kind: "guarantee",
    tip: "Guaranteed outcome. Legitimate internships do not promise placement for a fee.",
    re: /\b100\s*%\s*(?:guaranteed\s+)?(?:placement|job\s+guarantee)\b|\bguaranteed\s+(?:placement|job|internship|certificate)\b|\bplacement\s+guaranteed\b|\bjob\s+guarantee\b|\bcertificate\s+guaranteed\b/gi,
  },
];

const SKIP = "script, style, textarea, input, select, option, noscript, code, pre, [contenteditable='true'], .si-hl, #si-tip";

let hits = 0;

function acceptText(node) {
  if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP)) return NodeFilter.FILTER_REJECT;
  return NodeFilter.FILTER_ACCEPT;
}

function collectMatches(text) {
  const found = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let match;
    while ((match = rule.re.exec(text))) {
      if (!match[0]) {
        rule.re.lastIndex += 1;
        continue;
      }
      found.push({
        start: match.index,
        end: match.index + match[0].length,
        kind: rule.kind,
        tip: rule.tip,
      });
    }
  }
  found.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept = [];
  let cursor = 0;
  for (const item of found) {
    if (item.start < cursor) continue;
    kept.push(item);
    cursor = item.end;
  }
  return kept;
}

function highlightNode(textNode) {
  if (hits >= MAX_HITS) return;
  const text = textNode.nodeValue;
  const matches = collectMatches(text);
  if (!matches.length || !textNode.parentNode) return;

  const fragment = document.createDocumentFragment();
  let index = 0;
  for (const match of matches) {
    if (hits >= MAX_HITS) break;
    if (match.start > index) {
      fragment.appendChild(document.createTextNode(text.slice(index, match.start)));
    }
    const mark = document.createElement("span");
    mark.className = `si-hl si-${match.kind}`;
    mark.dataset.siTip = match.tip;
    mark.textContent = text.slice(match.start, match.end);
    fragment.appendChild(mark);
    hits += 1;
    index = match.end;
  }
  if (index < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(index)));
  }
  textNode.parentNode.replaceChild(fragment, textNode);
}

function scan(root) {
  if (!root || hits >= MAX_HITS) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: acceptText });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(highlightNode);
}

function ensureTooltip() {
  let tip = document.getElementById("si-tip");
  if (tip) return tip;
  tip = document.createElement("div");
  tip.id = "si-tip";
  tip.setAttribute("data-si-skip", "true");
  tip.hidden = true;
  document.documentElement.appendChild(tip);
  return tip;
}

function bindTooltip() {
  const tip = ensureTooltip();
  document.addEventListener("mouseover", (event) => {
    const mark = event.target.closest?.(".si-hl");
    if (!mark) return;
    tip.textContent = mark.dataset.siTip || "";
    tip.hidden = false;
    const rect = mark.getBoundingClientRect();
    const top = Math.max(8, rect.top - tip.offsetHeight - 8);
    tip.style.left = `${Math.min(rect.left, window.innerWidth - tip.offsetWidth - 8)}px`;
    tip.style.top = `${top}px`;
  });
  document.addEventListener("mouseout", (event) => {
    if (event.target.closest?.(".si-hl")) tip.hidden = true;
  });
}

function watchNewText() {
  let timer;
  const pending = new Set();
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const target = mutation.target;
      if (target instanceof Element && target.closest(".si-hl, #si-tip")) continue;
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.id !== "si-tip" && !node.closest(".si-hl")) {
          pending.add(node);
        } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
          pending.add(node.parentElement);
        }
      }
    }
    if (!pending.size) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const roots = [...pending];
      pending.clear();
      roots.forEach(scan);
    }, 400);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function start() {
  if (!document.body) return;
  scan(document.body);
  bindTooltip();
  watchNewText();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
