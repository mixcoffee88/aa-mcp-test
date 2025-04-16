/**
 * Adobe Analytics 보고서 API 모듈
 *
 * Adobe Analytics API를 사용하여 일반 보고서와 실시간 보고서를 조회하는 기능을 제공합니다.
 */
import axios from 'axios';
import { adobeAuth } from '../adobe-auth.js';
/**
 * Adobe Analytics API를 사용하여 일반 보고서를 조회합니다.
 */
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
        throw new Error('Adobe Analytics 보고서 조회에 실패했습니다');
    }
}
/**
 * Adobe Analytics API를 사용하여 실시간 보고서를 조회합니다.
 */
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
        throw new Error('Adobe Analytics 실시간 보고서 조회에 실패했습니다');
    }
}
