/* eslint-disable */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const queryErrorRate = new Rate('query_errors');
const queryDuration = new Trend('query_duration', true);
const authFailures = new Counter('auth_failures');
const queryCounter = new Counter('total_queries');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 VUs
    { duration: '30s', target: 25 }, // Ramp up to 25 VUs
    { duration: '30s', target: 50 }, // Ramp up to 50 VUs
    { duration: '30s', target: 75 }, // Ramp up to 75 VUs (stress test)
    { duration: '30s', target: 100 }, // Maximum load
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete below 1.5s
    http_req_failed: ['rate<0.05'], // Error rate must be below 5%
    query_errors: ['rate<0.03'], // Query error rate must be below 3%
    auth_failures: ['count<10'], // Less than 10 auth failures total
  },
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL;
const GRAPHQL_ENDPOINT = `${BASE_URL}/gql`;

// Test credentials
const TEST_CREDENTIALS = {
  email: __ENV.TEST_EMAIL || 'test@example.com',
  password: __ENV.TEST_PASSWORD || 'TestPassword123!',
  accountType: __ENV.ACCOUNT_TYPE || 'TENANT',
};

// GraphQL queries for data navigation
const QUERIES = {
  getAllProducts: `
    query GetAllProducts($page: Float, $limit: Float, $sortBy: SortBy, $sortOrder: SortOrder) {
      getAllProducts(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
        products {
          id
          name
          shortDescription
          cover
          brand
          productType
          isArchived
          variants {
            id
            sku
            price
            condition
            attributes {
              key
              value
            }
          }
        }
        total
      }
    }
  `,

  getAllCategories: `
    query GetAllCategories($page: Int, $limit: Int, $sortBy: SortBy, $sortOrder: SortOrder) {
      getAllCategories(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
        categories {
          id
          name
          createdAt
          updatedAt
        }
        total
        hasMore
      }
    }
  `,

  getAllCountries: `
  query GetAllCountries {
    getAllCountries {
      id
      name
      code
    }
  }
`,

  getStatesByCountryId: `
  query GetStatesByCountryId($countryId: ID!) {
    getStatesByCountryId(countryId: $countryId) {
      id
      name
      code
    }
  }
`,
};

// Login mutation
const LOGIN_MUTATION = `
  mutation Login($input: AuthenticationInput!) {
    login(input: $input) {
      success
      message
    }
  }
`;

// Global cookie jar for session management
let cookieJar;
let globalCountryStateData = null; // Store fetched country/state data globally

export default function (data) {
  // Extract country/state data from setup
  const countryStateData = data?.countryStateData;
  globalCountryStateData = countryStateData;
  // Initialize cookie jar if not exists
  if (!cookieJar) {
    cookieJar = http.cookieJar();

    // Perform login to get session cookie
    const loginPayload = JSON.stringify({
      query: LOGIN_MUTATION,
      variables: {
        input: {
          email: TEST_CREDENTIALS.email,
          password: TEST_CREDENTIALS.password,
          accountType: TEST_CREDENTIALS.accountType,
        },
      },
    });

    const loginParams = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'apollo-require-preflight': 'true',
      },
      jar: cookieJar,
    };

    const loginResponse = http.post(
      GRAPHQL_ENDPOINT,
      loginPayload,
      loginParams,
    );

    // Check both status code and login success
    let loginSuccessful = false;
    if (loginResponse.status === 200) {
      try {
        const body = JSON.parse(loginResponse.body);
        loginSuccessful = body.data?.login?.success === true;
      } catch (e) {
        console.error(
          `Login response parsing failed for VU ${__VU}: ${e.message}`,
        );
      }
    }

    if (!loginSuccessful) {
      authFailures.add(1);
      console.error(
        `Login failed for VU ${__VU}: ${loginResponse.status} - ${loginResponse.body?.substring(0, 200)}`,
      );
      return;
    }

    console.log(`✅ Login successful for VU ${__VU}`);
  }

  // Randomly select a query to execute (simulating user navigation)
  const queryNames = Object.keys(QUERIES);
  const selectedQuery =
    queryNames[Math.floor(Math.random() * queryNames.length)];

  let variables = {};

  // Set appropriate variables based on query type
  switch (selectedQuery) {
    case 'getAllProducts':
      variables = {
        page: Math.floor(Math.random() * 5) + 1, // Pages 1-5
        limit: 25,
        sortBy: Math.random() > 0.5 ? 'NAME' : 'CREATED_AT',
        sortOrder: Math.random() > 0.5 ? 'ASC' : 'DESC',
      };
      break;
    case 'getAllCategories':
      variables = {
        page: Math.floor(Math.random() * 3) + 1, // Pages 1-3
        limit: 10,
        sortBy: 'NAME',
        sortOrder: 'ASC',
      };
      break;
    case 'getAllAddresses':
      variables = {
        page: Math.floor(Math.random() * 3) + 1, // Pages 1-3
        limit: 15,
        addressType: Math.random() > 0.5 ? 'WAREHOUSE' : 'SHIPPING',
      };
      break;
    case 'getStatesByCountryId':
      variables = {
        countryId: globalCountryStateData?.country?.id, // Use actual country ID from setup data
      };
      break;
    case 'getAllCountries':
      break;
  }

  const startTime = Date.now();

  // Prepare GraphQL request
  const payload = JSON.stringify({
    query: QUERIES[selectedQuery],
    variables: variables,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'apollo-require-preflight': 'true',
    },
    jar: cookieJar, // Use the session cookie
  };

  // Execute query
  const response = http.post(GRAPHQL_ENDPOINT, payload, params);

  const duration = Date.now() - startTime;
  queryDuration.add(duration);
  queryCounter.add(1);

  // Validate response
  const isSuccess = check(response, {
    'query status is 200': (r) => r.status === 200,
    'query response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && !body.errors;
      } catch (e) {
        return false;
      }
    },
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'no GraphQL errors': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !body.errors || body.errors.length === 0;
      } catch (e) {
        return false;
      }
    },
    'authenticated request': (r) => {
      try {
        const body = JSON.parse(r.body);
        // Check if we got an authentication error
        return (
          !body.errors ||
          !body.errors.some(
            (error) =>
              error.message &&
              error.message.toLowerCase().includes('unauthorized'),
          )
        );
      } catch (e) {
        return true; // If we can't parse, assume it's not an auth error
      }
    },
  });

  // Track query errors
  queryErrorRate.add(!isSuccess);

  // Check for authentication failures
  if (
    response.status === 401 ||
    (response.body && response.body.includes('Unauthorized'))
  ) {
    authFailures.add(1);
  }

  // Log errors for debugging
  if (!isSuccess) {
    console.error(
      `Query ${selectedQuery} failed for VU ${__VU}: ${response.status} - ${response.body.substring(0, 200)}`,
    );
  }

  // Simulate user reading time
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
}

// Setup function
export function setup() {
  console.log('🚀 Starting Data Navigation Load Test');
  console.log(`📍 Target URL: ${GRAPHQL_ENDPOINT}`);
  console.log(`👤 Test Email: ${TEST_CREDENTIALS.email}`);
  console.log(
    '📊 Testing queries: Products, Categories, Countries, Addresses, States',
  );

  // Validate GraphQL endpoint
  const healthCheck = http.get(`${BASE_URL}/gql`, {
    headers: { Accept: 'text/html' },
  });

  if (healthCheck.status !== 200 && healthCheck.status !== 400) {
    throw new Error(`GraphQL endpoint not accessible: ${healthCheck.status}`);
  }

  // Fetch country/state data once for all VUs to use
  console.log('🌍 Fetching country and state data...');

  // First, authenticate to get session
  const setupCookieJar = http.cookieJar();

  const loginPayload = JSON.stringify({
    query: LOGIN_MUTATION,
    variables: {
      input: {
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
        accountType: TEST_CREDENTIALS.accountType,
      },
    },
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'apollo-require-preflight': 'true',
    },
    jar: setupCookieJar,
  };

  const loginResponse = http.post(GRAPHQL_ENDPOINT, loginPayload, loginParams);

  if (loginResponse.status !== 200) {
    console.log(
      '⚠️  Failed to authenticate during setup, will use fallback values',
    );
    return { baseUrl: BASE_URL, countryStateData: null };
  }

  // Fetch all countries
  const countriesPayload = JSON.stringify({
    query: QUERIES.getAllCountries,
    variables: {},
  });

  const countriesResponse = http.post(GRAPHQL_ENDPOINT, countriesPayload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'apollo-require-preflight': 'true',
    },
    jar: setupCookieJar,
  });

  if (countriesResponse.status !== 200) {
    console.log('⚠️  Failed to fetch countries, will use fallback values');
    return { baseUrl: BASE_URL, countryStateData: null };
  }

  try {
    const countriesData = JSON.parse(countriesResponse.body);
    const countries = countriesData.data?.getAllCountries || [];

    // Find Guatemala (or use the first country if Guatemala not found)
    const guatemala = countries.find((c) => c.code === 'GT') || countries[0];

    if (!guatemala) {
      console.log('⚠️  No countries found, will use fallback values');
      return { baseUrl: BASE_URL, countryStateData: null };
    }

    // Fetch states for the selected country
    const statesPayload = JSON.stringify({
      query: QUERIES.getStatesByCountryId,
      variables: { countryId: guatemala.id },
    });

    const statesResponse = http.post(GRAPHQL_ENDPOINT, statesPayload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'apollo-require-preflight': 'true',
      },
      jar: setupCookieJar,
    });

    if (statesResponse.status !== 200) {
      console.log('⚠️  Failed to fetch states, will use fallback values');
      return { baseUrl: BASE_URL, countryStateData: null };
    }

    const statesData = JSON.parse(statesResponse.body);
    const states = statesData.data?.getStatesByCountryId || [];

    const countryStateData = {
      country: guatemala,
      states: states,
      defaultState: states[0] || null,
      allCountries: countries,
    };

    console.log(
      `✅ Successfully fetched data for ${guatemala.name} with ${states.length} states`,
    );

    return { baseUrl: BASE_URL, countryStateData };
  } catch (error) {
    console.log(
      '⚠️  Error parsing country/state data, will use fallback values',
    );
    return { baseUrl: BASE_URL, countryStateData: null };
  }
}

// Teardown function
export function teardown(data) {
  console.log('🏁 Data Navigation Load Test completed');
  console.log('📊 Check the results for query performance metrics');
}
