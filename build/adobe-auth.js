import axios from 'axios';
export class AdobeAuth {
    config;
    accessToken = null;
    tokenExpiry = null;
    constructor() {
        this.config = {
            clientId: process.env.ADOBE_CLIENT_ID || '',
            clientSecret: process.env.ADOBE_CLIENT_SECRET || '',
            jwt: process.env.ADOBE_JWT || '',
            companyId: process.env.ADOBE_COMPANY_ID || ''
        };
        if (!this.config.clientId || !this.config.clientSecret || !this.config.jwt || !this.config.companyId) {
            throw new Error('Missing required Adobe authentication environment variables');
        }
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
            return this.accessToken;
        }
        try {
            const response = await axios.post('https://ims-na1.adobelogin.com/ims/exchange/jwt', {
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                jwt_token: this.config.jwt
            });
            if (!response.data.access_token) {
                throw new Error('No access token received from Adobe');
            }
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in || 3600) * 1000);
            if (!this.accessToken) {
                throw new Error('Failed to obtain Adobe access token');
            }
            return this.accessToken;
        }
        catch (error) {
            throw new Error('Failed to obtain Adobe access token');
        }
    }
    getCompanyId() {
        return this.config.companyId;
    }
}
export const adobeAuth = new AdobeAuth();
