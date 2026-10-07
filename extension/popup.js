function getVerdictColors(score) {
  if (score <= 40) return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
  if (score <= 70) return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
  return { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" };
}

function render(data) {
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("loading").style.display = "none";
  document.getElementById("error").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("clearBtn").style.display = "block";

  const colors = getVerdictColors(data.score);

  const circle = document.getElementById("scoreCircle");
  circle.textContent = data.score;
  circle.style.color = colors.color;
  circle.style.borderColor = colors.border;
  circle.style.background = colors.bg;

  const badge = document.getElementById("verdictBadge");
  badge.textContent = data.verdict;
  badge.style.color = colors.color;
  badge.style.background = colors.bg;
  badge.style.border = `1px solid ${colors.border}`;

  document.getElementById("scoreText").textContent = `${data.score}/100`;

  const flagsDiv = document.getElementById("flags");
  flagsDiv.innerHTML = "";

  (data.red_flags || []).slice(0, 3).forEach((flag) => {
    const el = document.createElement("div");
    el.className = "flag-item red";
    el.textContent = flag;
    flagsDiv.appendChild(el);
  });

  (data.green_flags || []).slice(0, 2).forEach((flag) => {
    const el = document.createElement("div");
    el.className = "flag-item green";
    el.textContent = flag;
    flagsDiv.appendChild(el);
  });
}

function renderLoading() {
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("loading").style.display = "block";
  document.getElementById("error").style.display = "none";
  document.getElementById("result").style.display = "none";
}

function renderError(message) {
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("loading").style.display = "none";
  document.getElementById("error").style.display = "block";
  document.getElementById("error").textContent = message;
  document.getElementById("result").style.display = "none";
}

// When popup opens, check stored state and render accordingly
chrome.storage.local.get(["status", "result", "error"], (data) => {
  if (data.status === "loading") {
    renderLoading();
  } else if (data.status === "done" && data.result) {
    render(data.result);
  } else if (data.status === "error") {
    renderError(data.error);
  }
  // else: leave the default placeholder showing
});

// Clear the badge once the user has actually viewed the result
chrome.action.setBadgeText({ text: "" });
document.getElementById("clearBtn").addEventListener("click", () => {
  chrome.storage.local.clear();
  location.reload();
});
