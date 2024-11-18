const handledTabs = new Set();

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
    const tabs = await chrome.tabs.query({ url: "*://*.reddit.com/*" });
    console.log("iterating tabs");
    tabs.forEach(async (tab) => {
      console.log(`${tab.id} has? ${handledTabs.has(tab.id)}`);
      if (!handledTabs.has(tab.id) && is_reddit(tab.url)) {
        handledTabs.add(tab.id);
        const details = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.referrer,
        });

        const referrer = details[0]?.result;
        let duration = 60;
        if (!referrer) {
          duration = Math.random() * 30 + 6;
        }
        console.log(
          `New duration for tab ${tab.id}: ${duration}.`,
          Object.fromEntries(handledTabs.entries())
        );

        // Inject animation into the tab
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (remainingTime) => {
            let timerOverlay = document.getElementById("reddit-timer-overlay");
            if (!timerOverlay) {
              timerOverlay = document.createElement("div");
              timerOverlay.id = "reddit-timer-overlay";
              timerOverlay.style.position = "fixed";
              timerOverlay.style.top = "0px";
              timerOverlay.style.right = "0px";
              timerOverlay.style.width = "100vw";
              timerOverlay.style.height = "10px";
              timerOverlay.style.backgroundColor = "#ff5a3d";
              timerOverlay.style.zIndex = "9999";
              timerOverlay.style.overflow = "hidden";
              timerOverlay.style.color = "#fff";
              timerOverlay.style.textAlign = "center";
              timerOverlay.style.fontFamily = "Arial, sans-serif";
              timerOverlay.style.fontSize = "14px";
              timerOverlay.style.lineHeight = "20px";
              document.body.appendChild(timerOverlay);

              const progressBar = document.createElement("div");
              progressBar.id = "reddit-progress-bar";
              progressBar.style.width = "100%";
              progressBar.style.height = "100%";
              progressBar.style.backgroundColor = "#3db1ff";
              progressBar.style.transition = `width ${remainingTime}s linear`;
              timerOverlay.appendChild(progressBar);
            }

            const startTime = Date.now();
            const endTime = startTime + remainingTime * 1000;

            function updateTimer() {
              const now = Date.now();
              const remaining = Math.max(0, (endTime - now) / 1000).toFixed(1);

              const progressBar = document.getElementById(
                "reddit-progress-bar"
              );
              setTimeout(() => {
                progressBar.style.width = "0%"; // Shrink to 0% over the duration
              }, 0);

              if (remaining > 0) {
                requestAnimationFrame(updateTimer);
              } else {
                timerOverlay.remove();
              }
            }

            updateTimer();
          },
          args: [duration],
        });

        setTimeout(() => {
          // re-check
          if (handledTabs.has(tab.id) && is_reddit(tab.url)) {
            chrome.tabs.remove(tab.id);
          }
        }, duration * 1000);
      }
    });
  } catch (error) {
    console.error("Error closing Reddit tabs:", error);
  }
}

chrome.tabs.onRemoved.addListener((tabId) => {
  handledTabs.delete(tabId);
});
chrome.tabs.onUpdated.addListener(closeRedditTabs);
chrome.tabs.onCreated.addListener(closeRedditTabs);
closeRedditTabs();
