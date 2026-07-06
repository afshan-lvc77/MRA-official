// UI Elements ko connect karna (Jaise Kotlin mein findViewById karte hain)
const urlInput = document.getElementById('urlInput');
const actionBtn = document.getElementById('actionBtn');
const actionIcon = document.getElementById('actionIcon');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const menuBtn = document.getElementById('menuBtn');

// SVG Icons
const svgPaste = '<path d="M19,2h-4.18C14.4,0.84,13.3,0,12,0C10.7,0,9.6,0.84,9.18,2H5C3.9,2,3,2.9,3,4v16c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V4 C21,2.9,20.1,2,19,2z M12,2c0.55,0,1,0.45,1,1s-0.45,1-1,1s-1-0.45-1-1S11.45,2,12,2z M19,20H5V4h2v3h10V4h2V20z"/>';
const svgClear = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>';

// Menu Button Logic
menuBtn.addEventListener('click', () => {
    alert("Settings page coming soon!");
});

// Dynamic Paste & Clear Logic (TextWatcher ki tarah)
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

// Download API Logic
downloadBtn.addEventListener('click', async () => {
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
        alert("Please paste a link first!");
        return;
    }

    statusDiv.innerHTML = '<span style="color: #666;">Processing link... Please wait...</span>';
    downloadBtn.disabled = true;

    // Cloudflare Worker API call
    const gatewayUrl = `https://fvd-gateway.mra-official-contact.workers.dev/?url=${encodeURIComponent(rawUrl)}`;

    try {
        const response = await fetch(gatewayUrl);
        const data = await response.json();

        if (data && data.download_link) {
            urlInput.value = ''; 
            actionIcon.innerHTML = svgPaste; 
            
            statusDiv.innerHTML = `
                <p style="color: #10B981; margin-bottom: 10px; font-weight: bold;">Video Extracted!</p>
                <a href="${data.download_link}" target="_blank" class="download-link">Click here to Download MP4</a>
            `;
        } else {
            statusDiv.innerHTML = `<span style="color: red;">Error: Invalid link or server error.</span>`;
        }
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: red;">Network error. Please try again.</span>`;
    }
    
    downloadBtn.disabled = false;
});
