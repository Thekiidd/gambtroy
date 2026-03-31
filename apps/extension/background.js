const API_URL = 'https://gambtroy.onrender.com/api/v1/blocklist';

// Alarm to sync every 15 minutes
chrome.alarms.create('sync_blocks', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync_blocks') {
    syncBlocklist();
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'sync_blocklist') {
    syncBlocklist().then(() => sendResponse({ status: 'ok' }));
    return true; // Keep message channel open for async
  }
  if (msg.action === 'clear_rules') {
    clearAllRules();
    sendResponse({ status: 'cleared' });
  }
});

async function syncBlocklist() {
  const { apiToken } = await chrome.storage.local.get(['apiToken']);
  if (!apiToken) return;

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${apiToken}` }
    });
    
    if (!res.ok) throw new Error('API Reject');
    const { items } = await res.json();
    
    await applyRules(items);
    
    // Save the count for UI
    await chrome.storage.local.set({ blockCount: items.length });
  } catch(e) {
    console.warn("GambTroy Extension: Ocurrió un error sincronizando lista", e);
  }
}

async function clearAllRules() {
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map(r => r.id);
  
  if (oldRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds
    });
  }
}

async function applyRules(sites) {
  // Clear old rules first
  await clearAllRules();
  
  // Format rules for declarativeNetRequest
  const newRules = sites.map((site, index) => {
    return {
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        // Redirect to a block page Hosted on our app, or google. For MVP, redirect to GambTroy blocked page.
        // Needs a valid URL
        redirect: { url: `https://Thekiidd.github.io/gambtroy/es/blocklist?blocked=${encodeURIComponent(site.domain)}&extension=true` }
      },
      condition: {
        // We match any host containing the domain string 
        // Example: caliente.mx -> *caliente.mx*
        urlFilter: `*${site.domain}*`,
        resourceTypes: ["main_frame", "sub_frame"]
      }
    };
  });
  
  if (newRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules
    });
    console.log("GambTroy Core: The Enforcer synced " + newRules.length + " rules.");
  }
}

// Initial Sync attempt on load
syncBlocklist();
