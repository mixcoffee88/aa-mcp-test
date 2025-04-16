/**
 * Adobe Analytics API 모듈
 * 
 * Adobe Analytics API를 사용하여 보고서 조회, 차원, 지표, 세그먼트, 날짜 범위 등을 조회하는 기능을 제공합니다.
 */

import axios from 'axios';
import { adobeAuth } from '../adobe-auth.js';

// 기본 요청 인터페이스
interface BaseRequest {
  locale?: string;        // 응답 언어 설정
}


// 일반 보고서 요청 인터페이스
interface ReportRequest {
  globalFilters?: Array<{
    type: string;
    dateRange: string;
    dateRangeId?: string;
  }>;
  metricContainer?: {
    metrics: Array<{
      columnId: string;
      id: string;
      sort?: "asc" | "desc";
    }>;
  };
  dimension: string;
  settings: {
    countRepeatInstances: boolean;
    includeAnnotations?: boolean;
    limit?: number;
    page?: number;
    nonesBehavior?: string;
  };
  statistics?: {
    functions: string[];
  };
}

// 실시간 보고서 요청 인터페이스
interface RealtimeRequest {
  globalFilters?: Array<{
    type: string;
    dateRange: string;
    dateRangeId?: string;
  }>;
  metricContainer?: {
    metrics: Array<{
      columnId: string;
      id: string;
      sort?: "asc" | "desc";
    }>;
  };
  dimensions: Array<{
    dimensionColumnId: string;
    id: string;
  }>;
  settings: {
    realTimeMinuteGranularity?: number;
    limit?: number;
  };
}

// 차원 요청 인터페이스
interface DimensionsRequest extends BaseRequest {
  segmentable?: boolean;  // 세그먼트에서 사용 가능한 차원만 포함
  reportable?: boolean;   // 리포트에서 사용 가능한 차원만 포함
  expansion?: string[];   // 추가 메타데이터 항목
}

// 지표 요청 인터페이스
interface MetricsRequest extends BaseRequest {
  segmentable?: boolean;  // 세그먼트에서 사용 가능한 지표만 포함
  reportable?: boolean;   // 리포트에서 사용 가능한 지표만 포함
  expansion?: string[];   // 추가 메타데이터 항목
}

// 세그먼트 요청 인터페이스
interface SegmentsRequest extends BaseRequest {
  filterByPublishedSegments?: boolean;  // 게시된 세그먼트만 포함
  limit?: number;                       // 반환할 최대 세그먼트 수
  page?: number;                        // 페이지 번호
}

// 날짜 범위 요청 인터페이스
interface DateRangesRequest extends BaseRequest {
  // filterByPublishedSegments?: boolean;  // 게시된 날짜 범위만 포함
}

/**
 * Adobe Analytics API를 사용하여 일반 보고서를 조회합니다.
 */
export async function runReport(request: ReportRequest) {
  const params = {
    ...request,
    rsid: process.env.ADOBE_REPORT_SUITE_ID
  };
  console.debug('Adobe Analytics 보고서 요청:', JSON.stringify(params, null, 2));
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.post(
      `https://analytics.adobe.io/api/${companyId}/reports`,
      params,
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
  const params = {
    ...request,
    rsid: process.env.ADOBE_REPORT_SUITE_ID
  };
  console.debug('Adobe Analytics 실시간 보고서 요청:', JSON.stringify(params, null, 2));
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.get(
      `https://analytics.adobe.io/api/${companyId}/reports/realtime`,
      {
        params,
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

/**
 * Adobe Analytics API를 사용하여 차원 목록을 조회합니다.
 */
export async function runDimensions(request: DimensionsRequest) {
  const params = {
    ...request,
    rsid: process.env.ADOBE_REPORT_SUITE_ID,
    locale: request.locale || 'en_US'
  };
  console.debug('Adobe Analytics 차원 목록 요청:', JSON.stringify(params, null, 2));
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.get(
      `https://analytics.adobe.io/api/${companyId}/dimensions`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          'x-proxy-global-company-id': companyId
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Adobe Analytics 차원 목록 조회에 실패했습니다');
  }
}

/**
 * Adobe Analytics API를 사용하여 지표 목록을 조회합니다.
 */
export async function runMetrics(request: MetricsRequest) {
  const params = {
    ...request,
    rsid: process.env.ADOBE_REPORT_SUITE_ID,
    locale: request.locale || 'en_US'
  };
  console.debug('Adobe Analytics 지표 목록 요청:', JSON.stringify(params, null, 2));
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.get(
      `https://analytics.adobe.io/api/${companyId}/metrics`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          'x-proxy-global-company-id': companyId
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Adobe Analytics 지표 목록 조회에 실패했습니다');
  }
}

/**
 * Adobe Analytics API를 사용하여 세그먼트 목록을 조회합니다.
 */
export async function runSegments(request: SegmentsRequest) {
  const params = {
    ...request,
    rsid: process.env.ADOBE_REPORT_SUITE_ID,
    locale: request.locale || 'en_US'
  };
  console.debug('Adobe Analytics 세그먼트 목록 요청:', JSON.stringify(params, null, 2));
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.get(
      `https://analytics.adobe.io/api/${companyId}/segments`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          'x-proxy-global-company-id': companyId
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Adobe Analytics 세그먼트 목록 조회에 실패했습니다');
  }
}

/**
 * Adobe Analytics API를 사용하여 날짜 범위 목록을 조회합니다.
 */
export async function runDateRanges(request: DateRangesRequest) {
  const params = {
    ...request,
    rsid: process.env.ADOBE_REPORT_SUITE_ID,
    locale: request.locale || 'en_US'
  };
  console.debug('Adobe Analytics 날짜 범위 목록 요청:', JSON.stringify(params, null, 2));
  const accessToken = await adobeAuth.getAccessToken();
  const companyId = adobeAuth.getCompanyId();

  try {
    const response = await axios.get(
      `https://analytics.adobe.io/api/${companyId}/dateranges`,
      {
        params,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID,
          'x-proxy-global-company-id': companyId
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Adobe Analytics 날짜 범위 목록 조회에 실패했습니다');
  }
}
