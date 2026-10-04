const ANALYZE_MENU_ID = "analyze-with-shieldintern";
const API_URL = "http://localhost:5000/api/evaluate";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: ANALYZE_MENU_ID,
    title: "Analyze with ShieldIntern",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== ANALYZE_MENU_ID || !info.selectionText) {
    return;
  }

  // Store a "loading" state immediately so the popup can show progress
  // if the user opens it before the analysis finishes.
  await chrome.storage.local.set({
    status: "loading",
    selectedText: info.selectionText,
  });

  // Open the popup automatically so the user doesn't have to click the icon.
  // Note: Chrome doesn't allow programmatically opening the popup from a
  // background script, so instead we set a badge on the extension icon
  // to signal "result ready" — the user clicks the icon to see it.
  chrome.action.setBadgeText({ text: "..." });
  chrome.action.setBadgeBackgroundColor({ color: "#3b82f6" });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textContent: info.selectionText }),
    });

    const json = await response.json();

    if (json.success) {
      await chrome.storage.local.set({ status: "done", result: json.data });
      const score = json.data.score;
      chrome.action.setBadgeText({ text: String(score) });
      chrome.action.setBadgeBackgroundColor({
        color: score <= 40 ? "#ef4444" : score <= 70 ? "#f59e0b" : "#10b981",
      });
    } else {
      await chrome.storage.local.set({ status: "error", error: json.error || "Analysis failed." });
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    }
  } catch (err) {
    await chrome.storage.local.set({
      status: "error",
      error: "Could not connect to ShieldIntern backend. Make sure it's running on localhost:5000.",
    });
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  }
});