// ==========================================
// Vidnux Web Download Service
// Android's DownloadService.kt equivalent
// ==========================================

class DownloadService {
    constructor(statusElementId) {
        // UI mein status update karne ke liye (Android ke Toast/Notification ka alternative)
        this.statusElement = document.getElementById(statusElementId);
    }

    // Android ka showToast equivalent
    showToast(message, isError = false) {
        if (!this.statusElement) return;
        
        const color = isError ? "#f43f5e" : "#10B981"; // Red for error, Green for success
        this.statusElement.innerHTML = `<p style="color: ${color}; font-weight: bold; margin-top: 10px;">${message}</p>`;
    }

    // Android ka onStartCommand aur fetchAndDownload equivalent
    async startDownload(userUrl) {
        if (!userUrl) {
            this.showToast("Bhai, pehle video link paste karo!", true);
            return;
        }

        this.showToast("⏳ Fetching video link... Please wait...");

        const apiUrl = `https://fvd-gateway.mra-official-contact.workers.dev/?url=${encodeURIComponent(userUrl)}`;

        try {
            // Android ke OkHttpClient ka equivalent Web mein fetch() hai
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            // JSON parse logic (download_link check)
            if (data && data.download_link) {
                this.showToast("🚀 Video found! Starting download...");
                this.startRealDownload(data.download_link);
            } else {
                this.showToast("❌ Error: Video link nahi mil paya. Gateway ne galat response diya.", true);
            }

        } catch (error) {
            console.error("Download Error:", error);
            this.showToast("❌ Network Error: Server se connect nahi ho paya!", true);
        }
    }

    // Android ka startRealDownload equivalent
    startRealDownload(finalLink) {
        try {
            const fileName = `Vidnux_${Date.now()}.mp4`; // File name generate karna

            // Ek hidden <a> tag create kar rahe hain
            const a = document.createElement('a');
            a.href = finalLink;
            a.download = fileName; // Browser ko batana ki file save karni hai
            
            // POP-UP FIX: 
            // a.target = '_blank'; <-- Isko HATA DIYA gaya hai. 
            // Asynchronous API call ke baad naya tab kholne par browser popup block kar deta tha.
            // Ab ye smoothly usi tab me silent download trigger karega.
            
            // Document mein daal kar click karwana aur fir hata dena
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Success Message (Android ka showFinalNotification)
            this.statusElement.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; border: 1px solid #10B981; border-radius: 8px; background: #f9f9f9;">
                    <p style="color: #10B981; font-weight: bold; margin-bottom: 10px;">✓ Download Command Sent!</p>
                    <p style="font-size: 14px; color: #555;">Agar download automatically start nahi hua, toh niche click karein:</p>
                    <a href="${finalLink}" download="${fileName}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Manual Download</a>
                </div>
            `;
            
        } catch (error) {
            this.showToast("❌ Download shuru karne mein dikkat aayi!", true);
        }
    }
}
