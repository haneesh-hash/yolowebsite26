// This file configures the base URL for backend API calls
// When running locally, this should be an empty string '' (which defaults to relative paths on the same server)
// When deploying the frontend to Hostinger and the backend to Render, 
// this should be set to your Render app URL (e.g., 'https://your-app-name.onrender.com')

const config = {
    // Current environment: 'local' | 'production'
    env: 'local',

    // API Endpoints
    apiUrls: {
        local: '',
        production: 'https://yolo-backend-example.onrender.com' // TODO: Replace with your actual Render URL later
    },

    get apiBaseUrl() {
        return this.apiUrls[this.env];
    }
};
