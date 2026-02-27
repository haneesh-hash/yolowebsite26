// This file configures the base URL for backend API calls
// When running locally, this should be an empty string '' (which defaults to relative paths on the same server)
// When deploying the frontend to Hostinger and the backend to Render,
// this should be set to your Render app URL (e.g., 'https://your-app-name.onrender.com')

const config = {
    // API Endpoints
    apiUrls: {
        local: '',
        production: 'https://yolocollective-api.onrender.com'
    },

    get apiBaseUrl() {
        // Auto-detect: use local server when running on localhost
        const isLocal = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        return isLocal ? this.apiUrls.local : this.apiUrls.production;
    }
};
