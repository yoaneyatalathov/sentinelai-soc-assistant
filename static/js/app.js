
(function () {
    "use strict";

    function initApp() {
        // Dashboard menginisialisasi dirinya sendiri melalui dashboard.js.
        // File ini disiapkan untuk interaksi global aplikasi berikutnya.
        console.log("SentinelAI SOC Assistant initialized.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }
})();
