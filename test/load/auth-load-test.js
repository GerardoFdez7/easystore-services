/* eslint-disable */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginErrorRate = new Rate('login_errors');
const loginDuration = new Trend('login_duration', true);

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Ramp up to 5 VUs
    { duration: '30s', target: 10 }, // Ramp up to 10 VUs
    { duration: '30s', target: 20 }, // Ramp up to 20 VUs
    { duration: '30s', target: 30 }, // Ramp up to 30 VUs
    { duration: '30s', target: 40 }, // Ramp up to 40 VUs (stress test)
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
    login_errors: ['rate<0.05'], // Login error rate must be below 5%
  },
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL;
const GRAPHQL_ENDPOINT = `${BASE_URL}/gql`;

// Test credentials - in real scenario, use different users
const TEST_CREDENTIALS = {
  email: __ENV.TEST_EMAIL || 'test@example.com',
  password: __ENV.TEST_PASSWORD || 'TestPassword123!',
  accountType: __ENV.ACCOUNT_TYPE || 'TENANT',
};

// GraphQL mutation for login
const LOGIN_MUTATION = `
  mutation Login($input: AuthenticationInput!) {
    login(input: $input) {
      success
      message
    }
  }
`;

export default function () {
  const startTime = Date.now();

  // Prepare GraphQL request
  const payload = JSON.stringify({
    query: LOGIN_MUTATION,
    variables: {
      input: {
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
        accountType: TEST_CREDENTIALS.accountType,
      },
    },
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Add Apollo-specific header to bypass CSRF protection
      'apollo-require-preflight': 'true',
    },
    // Enable cookie jar to handle session cookies
    jar: http.cookieJar(),
  };

  // Execute login mutation
  const response = http.post(GRAPHQL_ENDPOINT, payload, params);

  const duration = Date.now() - startTime;
  loginDuration.add(duration);

  // Validate response
  const responseChecks = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.login;
      } catch (e) {
        return false;
      }
    },
    'login mutation successful': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data?.login?.success === true;
      } catch (e) {
        return false;
      }
    },
    'response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  // Track login errors based on core functionality, not cookies
  const isLoginSuccessful =
    response.status === 200 &&
    (() => {
      try {
        const body = JSON.parse(response.body);
        return body.data?.login?.success === true;
      } catch (e) {
        return false;
      }
    })();

  loginErrorRate.add(!isLoginSuccessful);

  // Log errors for debugging - only log actual failures
  if (!isLoginSuccessful) {
    console.error(
      `Login failed for VU ${__VU}: ${response.status} - ${response.body}`,
    );
  } else {
    // Log successful logins for debugging (optional)
    console.log(`Login successful for VU ${__VU}: ${response.status}`);
  }

  // Brief pause between requests to simulate realistic user behavior
  sleep(1);
}

// Setup function to validate environment
export function setup() {
  console.log('🚀 Starting Authentication Load Test');
  console.log(`📍 Target URL: ${GRAPHQL_ENDPOINT}`);
  console.log(`👤 Test Email: ${TEST_CREDENTIALS.email}`);
  console.log('⚠️  Note: This test focuses on login mutation performance');

  // Validate that the GraphQL endpoint is accessible
  const healthCheck = http.get(`${BASE_URL}/gql`, {
    headers: { Accept: 'text/html' },
  });

  if (healthCheck.status !== 200 && healthCheck.status !== 400) {
    throw new Error(`GraphQL endpoint not accessible: ${healthCheck.status}`);
  }

  return { baseUrl: BASE_URL };
}

// Teardown function for cleanup
export function teardown(data) {
  console.log('🏁 Authentication Load Test completed');
  console.log('📊 Check the results for login performance metrics');
}
