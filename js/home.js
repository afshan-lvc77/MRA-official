// ==========================================
// ON PAGE LOAD: Ask for Permissions
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Notification Permission Request
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission mil gayi!");
                    // Optional: Swagat notification bhejne ke liye niche wali line uncomment karein
                    // new Notification("Vidnux", { body: "Vidnux mein aapka swagat hai!" });
                }
            });
        }
    }
});

// ==========================================
// UI Elements ko connect karna
// ==========================================
const urlInput = document.getElementById('urlInput');
const actionBtn = document.getElementById('actionBtn');
const actionIcon = document.getElementById('actionIcon');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');

// SVG Icons
const svgPaste = '<path d="M19,2h-4.18C14.4,0.84,13.3,0,12,0C10.7,0,9.6,0.84,9.18,2H5C3.9,2,3,2.9,3,4v16c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V4 C21,2.9,20.1,2,19,2z M12,2c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S11.45,2,12,2z M19,20H5V4h2v3h10V4h2V20z"/>';
const svgClear = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';

// Dynamic Paste & Clear Logic
urlInput.addEventListener('input', () => {
    if (urlInput.value.length > 0) {
        actionIcon.innerHTML = svgClear;
        actionBtn.title = "Clear";
    } else {
        actionIcon.innerHTML = svgPaste;
        actionBtn.title = "Paste";
    }
});

// Action Button Clicks
actionBtn.addEventListener('click', async () => {
    if (urlInput.value.length > 0) {
        // Clear text
        urlInput.value = '';
        actionIcon.innerHTML = svgPaste;
        actionBtn.title = "Paste";
    } else {
        // Paste from clipboard
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            actionIcon.innerHTML = svgClear;
            actionBtn.title = "Clear";
        } catch (err) {
            alert('Clipboard access denied. Please paste manually.');
        }
    }
});

// ==========================================
// NEW DOWNLOAD LOGIC INTEGRATION
// ==========================================

// download.js wale DownloadService ka object banana 
const downloader = new DownloadService('status');

// Download Button Click Logic
downloadBtn.addEventListener('click', async () => {
    const rawUrl = urlInput.value.trim();
    
    if (!rawUrl) {
        alert("Please paste a link first!");
        return;
    }

    // Button ko disable kar do taaki user baar-baar click na kare
    downloadBtn.disabled = true;

    // Pura API aur download ka kaam ab download.js handle karega
    await downloader.startDownload(rawUrl);

    // Processing khatam hone ke baad button wapas enable kar do
    downloadBtn.disabled = false;
});
