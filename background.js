function is_reddit(url) {
  console.log(url);
  if (!url) {
    return false;
  }
  url = new URL(url);
  return url.host === "reddit.com" || url.host.endsWith(".reddit.com");
}

async function closeRedditTabs() {
  try {
    const tabs = await chrome.tabs.query({url: "*://*.reddit.com/*"});

    tabs.forEach(async (tab) => {
      if (is_reddit(tab.url)) {
        const details = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.referrer,
        });

        const referrer = details[0]?.result;
        let duration = 60;
        if (!referrer) {
          duration = Math.random() * 30;
        }
        setTimeout(() => {
          // re-check
          if (is_reddit(tab.url)) {
            chrome.tabs.remove(tab.id);
          }
        }, duration * 1000);
      }
    });
  } catch (error) {
    console.error("Error closing Reddit tabs:", error);
  }
}

chrome.tabs.onUpdated.addListener(closeRedditTabs);
chrome.tabs.onCreated.addListener(closeRedditTabs);
closeRedditTabs();
