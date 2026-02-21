// This file configures the base URL for backend API calls
// When running locally, this should be an empty string '' (which defaults to relative paths on the same server)
// When deploying the frontend to Hostinger and the backend to Render, 
// this should be set to your Render app URL (e.g., 'https://your-app-name.onrender.com')

const config = {
    // Current environment: 'local' | 'production'
    env: 'production',

    // API Endpoints
    apiUrls: {
        local: '',
        production: 'https://yolocollective-api.onrender.com'
    },

    get apiBaseUrl() {
        return this.apiUrls[this.env];
    }
};
