async function closeRedditTabs() {
    try {
        const tabs = await chrome.tabs.query({});

        tabs.forEach(async (tab) => {
            if (tab.url && new URL(tab.url).host.endsWith('reddit.com')) {
                const details = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => document.referrer
                });

                const referrer = details[0]?.result;
                let duration = 60;
                if (!referrer) {
                    duration = Math.random() * 30;
                }
                setTimeout(() => {
                    // re-check
                    if (new URL(tab.url).host.endsWith('reddit.com')) {
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


