/**
 * Adobe Analytics 보고서 API 모듈
 * 
 * Adobe Analytics API를 사용하여 일반 보고서와 실시간 보고서를 조회하는 기능을 제공합니다.
 */

import axios from 'axios';
import { adobeAuth } from '../adobe-auth.js';

// 일반 보고서 요청 인터페이스
interface ReportRequest {
  rsid: string;                 // Report Suite ID
  globalFilters?: {            // 전역 필터
    dateRange: {              // 날짜 범위
      startDate: string;     // 시작일
      endDate: string;      // 종료일
    };
  };
  metricContainer: {          // 지표 컨테이너
    metrics: Array<{        // 지표 목록
      id: string;         // 지표 ID
    }>;
  };
  dimension?: string;         // 차원
  settings?: {               // 설정
    limit?: number;        // 최대 행 수
  };
}

// 실시간 보고서 요청 인터페이스
interface RealtimeRequest {
  rsid: string;           // Report Suite ID
  dimension?: string;     // 차원
  metrics: string[];      // 지표 목록
  limit?: number;         // 최대 행 수
}

/**
 * Adobe Analytics API를 사용하여 일반 보고서를 조회합니다.
 */
export async function runReport(request: ReportRequest) {
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.post(
      `https://analytics.adobe.io/api/${companyId}/reports`,
      request,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          'x-proxy-global-company-id': companyId
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Adobe Analytics 보고서 조회에 실패했습니다');
  }
}

/**
 * Adobe Analytics API를 사용하여 실시간 보고서를 조회합니다.
 */
export async function runRealtimeReport(request: RealtimeRequest) {
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.get(
      `https://analytics.adobe.io/api/${companyId}/reports/realtime`,
      {
        params: request,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          'x-proxy-global-company-id': companyId
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Adobe Analytics 실시간 보고서 조회에 실패했습니다');
  }
}
