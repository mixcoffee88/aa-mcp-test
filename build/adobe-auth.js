/**
 * Adobe 인증 모듈
 *
 * JWT를 사용하여 Adobe API 인증을 처리하는 모듈입니다.
 * 액세스 토큰을 관리하고 필요할 때 새로운 토큰을 발급받습니다.
 */
import axios from 'axios';
export class AdobeAuth {
    config;
    accessToken = null;
    tokenExpiry = null;
    constructor() {
        // 환경 변수에서 인증 정보 로드
        this.config = {
            clientId: process.env.ADOBE_CLIENT_ID || '',
            clientSecret: process.env.ADOBE_CLIENT_SECRET || '',
            scope: process.env.ADOBE_SCOPE || '',
            companyId: process.env.ADOBE_COMPANY_ID || ''
        };
        // 필수 환경 변수 확인
        if (!this.config.clientId || !this.config.clientSecret || !this.config.scope || !this.config.companyId) {
            throw new Error('필수 Adobe 인증 환경 변수가 설정되지 않았습니다');
        }
    }
    /**
     * Adobe API 액세스 토큰을 가져옵니다.
     * 토큰이 만료되었거나 없는 경우 새로운 토큰을 발급받습니다.
     */
    async getAccessToken() {
        // 유효한 토큰이 있으면 재사용
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
            return this.accessToken;
        }
        try {
            // OAuth Server-to-Server 방식으로 새로운 액세스 토큰 발급
            const params = new URLSearchParams();
            params.append('client_id', this.config.clientId);
            params.append('client_secret', this.config.clientSecret);
            params.append('grant_type', 'client_credentials');
            params.append('scope', this.config.scope);
            const response = await axios.post('https://ims-na1.adobelogin.com/ims/token/v3', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            if (!response.data.access_token) {
                throw new Error('Adobe로부터 액세스 토큰을 받지 못했습니다');
            }
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in || 3600) * 1000);
            if (!this.accessToken) {
                throw new Error('Adobe 액세스 토큰 발급에 실패했습니다');
            }
            return this.accessToken;
        }
        catch (error) {
            throw new Error('Adobe 액세스 토큰 발급에 실패했습니다');
        }
    }
    /**
     * Adobe 회사 ID를 반환합니다.
     */
    getCompanyId() {
        return this.config.companyId;
    }
}
// 싱글톤 인스턴스 생성
export const adobeAuth = new AdobeAuth();
