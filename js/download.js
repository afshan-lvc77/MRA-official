// ==========================================
// Vidnux Web Download Service
// Android's DownloadService.kt equivalent
// ==========================================

class DownloadService {
    constructor(statusElementId) {
        this.statusElement = document.getElementById(statusElementId);
        this.isDownloading = false; // Naya logic: Download chal raha hai ya nahi check karne ke liye

        // Refresh ya Back karne par Pop-up Warning dikhane ka logic
        window.addEventListener('beforeunload', (e) => {
            if (this.isDownloading) {
                // Modern browsers mein custom message dikhane ke liye e.returnValue set karna padta hai
                e.preventDefault();
                e.returnValue = "Download chal raha hai! Page band karne par download fail ho jayega.";
                return e.returnValue;
            }
        });
    }

    showToast(message, isError = false) {
        if (!this.statusElement) return;
        const color = isError ? "#f43f5e" : "#10B981"; 
        this.statusElement.innerHTML = `<p style="color: ${color}; font-weight: bold; margin-top: 10px;">${message}</p>`;
    }

    async startDownload(userUrl) {
        if (!userUrl) {
            this.showToast("Bhai, pehle video link paste karo!", true);
            return;
        }

        this.showToast("⏳ Fetching video link... Please wait...");
        this.isDownloading = true; // Process shuru, back button warning ON

        const apiUrl = `https://fvd-gateway.mra-official-contact.workers.dev/?url=${encodeURIComponent(userUrl)}`;

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            if (data && data.download_link) {
                // Link milne ke baad seedha force download trigger karenge
                this.forceDownloadBlob(data.download_link);
            } else {
                this.showToast("❌ Error: Video link nahi mil paya.", true);
                this.isDownloading = false; // Process fail, warning OFF
            }

        } catch (error) {
            console.error("Download Error:", error);
            this.showToast("❌ Network Error: Server se connect nahi ho paya!", true);
            this.isDownloading = false; // Process fail, warning OFF
        }
    }

    // Yeh function video ko background mein load karke direct file save karega
    async forceDownloadBlob(videoUrl) {
        const fileName = `Vidnux_Video_${Date.now()}.mp4`;

        try {
            this.showToast("📥 Video download ho rahi hai... Page band mat karna!");

            // Video ko data (Blob) ke roop mein background mein download karna
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error("Failed to fetch video data");

            const blob = await response.blob();
            
            // Blob se ek local internal link banana
            const blobUrl = window.URL.createObjectURL(blob);

            // Hidden link create karke native download trigger karna
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Memory clear karna
            window.URL.revokeObjectURL(blobUrl);

            this.isDownloading = false; // Download Pura, warning OFF

            // SUCCESS NOTIFICATION BHEJNE KA LOGIC
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Download successful", {
                    body: "video saved to gellary"
                });
            }

            this.statusElement.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; border: 1px solid #10B981; border-radius: 8px; background: #f9f9f9;">
                    <p style="color: #10B981; font-weight: bold; margin-bottom: 5px;">✓ Download Successful!</p>
                    <p style="font-size: 14px; color: #555;">Video aapke phone/browser ke downloads mein save ho chuki hai.</p>
                </div>
            `;
            
        } catch (error) {
            console.error("Blob Download Error:", error);
            
            this.isDownloading = false; // Fallback pe aaya, warning OFF

            // Agar kisi Facebook/Insta server ki high security (CORS) ki wajah se background download block hota hai, 
            // toh ye Fallback UI dikhayega jisse user guarantee se video download kar sakega.
            this.statusElement.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; border: 1px solid #f59e0b; border-radius: 8px; background: #fffbeb;">
                    <p style="color: #d97706; font-weight: bold; margin-bottom: 10px;">⚠️ Direct Save Blocked by Server</p>
                    <p style="font-size: 14px; color: #555;">Niche wale button par <b>Daba ke rakhein (Long Press)</b> aur menu se <b>"Download link"</b> chunein:</p>
                    <a href="${videoUrl}" download="${fileName}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Manual Download</a>
                </div>
            `;
        }
    }
        }
        
