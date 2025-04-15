import axios from 'axios';
import { adobeAuth } from '../adobe-auth.js';
export async function runReport(request) {
    const accessToken = await adobeAuth.getAccessToken();
    const companyId = adobeAuth.getCompanyId();
    try {
        const response = await axios.post(`https://analytics.adobe.io/api/${companyId}/reports`, request, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-api-key': process.env.ADOBE_CLIENT_ID,
                'x-proxy-global-company-id': companyId
            }
        });
        return response.data;
    }
    catch (error) {
        throw new Error('Failed to fetch Adobe Analytics report');
    }
}
export async function runRealtimeReport(request) {
    const accessToken = await adobeAuth.getAccessToken();
    const companyId = adobeAuth.getCompanyId();
    try {
        const response = await axios.get(`https://analytics.adobe.io/api/${companyId}/reports/realtime`, {
            params: request,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-api-key': process.env.ADOBE_CLIENT_ID,
                'x-proxy-global-company-id': companyId
            }
        });
        return response.data;
    }
    catch (error) {
        throw new Error('Failed to fetch Adobe Analytics realtime report');
    }
}
