/* eslint-disable */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const readOperationRate = new Rate('read_operations');
const writeOperationRate = new Rate('write_operations');
const loginOperationRate = new Rate('login_operations');
const operationErrors = new Rate('operation_errors');
const operationDuration = new Trend('operation_duration', true);
const authFailures = new Counter('auth_failures');
const totalOperations = new Counter('total_operations');

// Test configuration - Mixed realistic scenario
export const options = {
  stages: [
    { duration: '30s', target: 15 }, // Ramp up to 15 VUs
    { duration: '30s', target: 30 }, // Ramp up to 30 VUs
    { duration: '30s', target: 50 }, // Ramp up to 50 VUs
    { duration: '30s', target: 75 }, // Ramp up to 75 VUs
    { duration: '30s', target: 100 }, // Maximum realistic load
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.08'], // Error rate must be below 8%
    operation_errors: ['rate<0.05'], // Operation error rate must be below 5%
    auth_failures: ['count<20'], // Less than 20 auth failures total
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

// GraphQL operations
const OPERATIONS = {
  // WRITE OPERATIONS (30-40% of traffic)
  writes: {
    registerUser: {
      query: `
        mutation Register($input: AuthenticationInput!) {
          register(input: $input) {
            success
            message
          }
        }
      `,
      variables: () => ({
        input: {
          email: `testuser${Math.floor(Math.random() * 100000)}@example.com`,
          password: 'TestPassword123!',
          accountType: 'TENANT',
        },
      }),
    },

    createAddress: {
      query: `
        mutation CreateAddress($input: CreateAddressInput!) {
          createAddress(input: $input) {
            id
            name
            addressLine1
            city
            postalCode
          }
        }
      `,
      variables: (itemIndex, countryStateData) => {
        // Use passed country/state data or fallback to global
        const data = countryStateData || globalCountryStateData;

        const input = {
          name: `Test Address ${Math.floor(Math.random() * 9999 + 2)}`,
          addressLine1: `${Math.floor(Math.random() * 9999) + 1} Test Street`,
          city: 'Guatemala City',
          postalCode: '01001',
          deliveryNum: `502 2332 3432`,
          addressType: 'WAREHOUSE',
          countryId: data?.country?.id,
          stateId: data?.defaultState?.id,
        };

        return { input };
      },
    },

    createProduct: {
      query: `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            id
            name
            shortDescription
            productType
            variants {
              id
              sku
              price
              condition
            }
          }
        }
      `,
      variables: () => ({
        input: {
          name: `Test Product ${Math.floor(Math.random() * 100000)}`,
          shortDescription: `A load test product for performance testing`,
          productType: 'DIGITAL',
          cover:
            'https://ik.imagekit.io/7ympptvapt/Oatmeal-Raisin-Cookies_3_optimized_4-3_1759040527160_ZF1pHXZS8',
          variants: [
            {
              price: 19.99,
              variantCover: 'http://example.com/images/blue-variant-cover.jpg',
              condition: 'NEW',
              attributes: [{ key: 'color', value: 'blue' }],
              sku: `PROD-${1000 + Math.floor(Math.random() * 100000)}-TEST`,
            },
          ],
        },
      }),
    },

    createCategory: {
      query: `
        mutation CreateCategory($input: CreateCategoryInput!) {
          createCategory(input: $input) {
            id
            name
          }
        }
      `,
      variables: () => ({
        input: {
          name: `Test Category ${Math.floor(Math.random() * 100000)}`,
          cover:
            'https://ik.imagekit.io/7ympptvapt/Oatmeal-Raisin-Cookies_3_optimized_4-3_1759040527160_ZF1pHXZS8',
        },
      }),
    },
  },

  // READ OPERATIONS (70-80% of traffic)
  reads: {
    getAllProducts: {
      query: `
        query GetAllProducts($page: Float, $limit: Float) {
          getAllProducts(page: $page, limit: $limit) {
            products {
              id
              name
              shortDescription
              cover
              brand
              variants {
                id
                sku
                price
                condition
              }
            }
            total
          }
        }
      `,
      variables: () => ({
        page: Math.floor(Math.random() * 5) + 1,
        limit: 20,
      }),
    },

    getAllCategories: {
      query: `
        query GetAllCategories($page: Int, $limit: Int) {
          getAllCategories(page: $page, limit: $limit) {
            categories {
              id
              name
            }
            total
            hasMore
          }
        }
      `,
      variables: () => ({
        page: Math.floor(Math.random() * 3) + 1,
        limit: 15,
      }),
    },

    getAllCountries: {
      query: `
        query GetAllCountries {
          getAllCountries {
            id
            name
            code
          }
        }
      `,
      variables: () => ({}),
    },

    getStatesByCountryId: {
      query: `
        query GetStatesByCountryId($countryId: ID!) {
          getStatesByCountryId(countryId: $countryId) {
            id
            name
            code
          }
        }
      `,
      variables: () => ({
        countryId: globalCountryStateData?.country?.id,
      }),
    },
  },

  // LOGIN OPERATIONS (10-20% of traffic)
  login: {
    query: `
      mutation Login($input: AuthenticationInput!) {
        login(input: $input) {
          success
          message
        }
      }
    `,
    variables: () => ({
      input: {
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
        accountType: TEST_CREDENTIALS.accountType,
      },
    }),
  },
};

// Session management
let cookieJar;
let isAuthenticated = false;
let globalCountryStateData = null; // Store fetched country/state data globally
let vuIterationCount = {}; // Track iterations per VU
let createdData = {
  addresses: [],
  products: [],
  categories: [],
}; // Store created fake data IDs

function authenticate() {
  if (isAuthenticated) return true;

  cookieJar = http.cookieJar();

  const loginPayload = JSON.stringify({
    query: OPERATIONS.login.query,
    variables: OPERATIONS.login.variables(),
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'apollo-require-preflight': 'true',
    },
    jar: cookieJar,
  };

  const loginResponse = http.post(GRAPHQL_ENDPOINT, loginPayload, loginParams);

  if (loginResponse.status === 200) {
    try {
      const body = JSON.parse(loginResponse.body);
      if (body.data?.login?.success) {
        isAuthenticated = true;
        return true;
      }
    } catch (e) {
      // Login failed
    }
  }

  authFailures.add(1);
  return false;
}

// Global iteration counter to track VU progress
let globalIterationPhase = 'setup'; // 'setup', 'mutations', 'queries'
const MUTATIONS_PER_VU = 10; // Number of mutations each VU should create
const SETUP_ITERATIONS = 3; // Number of iterations for setup phase

export default function (data) {
  // Extract country/state data from setup
  const countryStateData = data?.countryStateData;
  globalCountryStateData = countryStateData;

  // Initialize VU-specific iteration counter
  const vuId = __VU;
  if (!vuIterationCount[vuId]) {
    vuIterationCount[vuId] = 0;
  }

  // Ensure authentication for protected operations
  if (!authenticate()) {
    console.error(`Authentication failed for VU ${__VU}`);
    return;
  }

  // Increment iteration counter for this VU
  vuIterationCount[vuId]++;

  let operationType, operation, operationName;

  // Phase 1: Setup phase - Create fake data sequentially (first few iterations)
  if (vuIterationCount[vuId] <= MUTATIONS_PER_VU) {
    // Create mutations sequentially to build fake data
    const mutationIndex = vuIterationCount[vuId] - 1;
    const mutationTypes = ['createCategory', 'createProduct', 'createAddress'];
    const currentMutationType =
      mutationTypes[mutationIndex % mutationTypes.length];
    const itemIndex =
      Math.floor(mutationIndex / mutationTypes.length) + vuId * 10;

    operationType = 'write';
    operationName = currentMutationType;
    operation = OPERATIONS.writes[currentMutationType];
    writeOperationRate.add(1);

    // Execute mutation with consistent index
    const startTime = Date.now();

    const payload = JSON.stringify({
      query: operation.query,
      variables:
        currentMutationType === 'createAddress'
          ? operation.variables(itemIndex, countryStateData)
          : operation.variables(itemIndex),
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'apollo-require-preflight': 'true',
      },
      jar: cookieJar,
    };

    const response = http.post(GRAPHQL_ENDPOINT, payload, params);

    const duration = Date.now() - startTime;
    operationDuration.add(duration);
    totalOperations.add(1);

    // Store created data IDs for later use
    if (response.status === 200) {
      try {
        const body = JSON.parse(response.body);
        if (body.data && !body.errors) {
          const createdItem = body.data[currentMutationType];
          if (createdItem && createdItem.id) {
            if (currentMutationType === 'createAddress') {
              createdData.addresses.push(createdItem.id);
            } else if (currentMutationType === 'createProduct') {
              createdData.products.push(createdItem.id);
            } else if (currentMutationType === 'createCategory') {
              createdData.categories.push(createdItem.id);
            }
          }
        }
      } catch (e) {
        // Error parsing response
      }
    }

    // Validate response
    const isSuccess = check(response, {
      [`${operationType} status is 200`]: (r) => r.status === 200,
      [`${operationType} response has data`]: (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && !body.errors;
        } catch (e) {
          return false;
        }
      },
      [`${operationType} response time < 3000ms`]: (r) =>
        r.timings.duration < 3000,
      [`${operationType} no GraphQL errors`]: (r) => {
        try {
          const body = JSON.parse(r.body);
          return !body.errors || body.errors.length === 0;
        } catch (e) {
          return false;
        }
      },
    });

    operationErrors.add(!isSuccess);

    if (!isSuccess) {
      console.error(
        `${operationType} operation ${operationName} failed for VU ${__VU}: ${response.status} - ${response.body.substring(0, 200)}`,
      );
    }

    sleep(Math.random() * 1 + 0.5); // 0.5-1.5s for write operations
    return;
  }

  // Phase 2: Query and Login phase - Normal traffic distribution
  const rand = Math.random();
  if (rand < 0.8) {
    // 80% READ operations
    operationType = 'read';
    const readOps = Object.keys(OPERATIONS.reads);
    operationName = readOps[Math.floor(Math.random() * readOps.length)];
    operation = OPERATIONS.reads[operationName];
    readOperationRate.add(1);
  } else {
    // 20% LOGIN operations
    operationType = 'login';
    operationName = 'login';
    operation = OPERATIONS.login;
    loginOperationRate.add(1);
    // Reset authentication for login test
    isAuthenticated = false;
  }

  const startTime = Date.now();

  // Prepare GraphQL request
  const payload = JSON.stringify({
    query: operation.query,
    variables: operation.variables ? operation.variables() : {},
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'apollo-require-preflight': 'true',
    },
    jar: operationType === 'login' ? http.cookieJar() : cookieJar,
  };

  // Execute operation
  const response = http.post(GRAPHQL_ENDPOINT, payload, params);

  const duration = Date.now() - startTime;
  operationDuration.add(duration);
  totalOperations.add(1);

  // Validate response
  const isSuccess = check(response, {
    [`${operationType} status is 200`]: (r) => r.status === 200,
    [`${operationType} response has data`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && !body.errors;
      } catch (e) {
        return false;
      }
    },
    [`${operationType} response time < 3000ms`]: (r) =>
      r.timings.duration < 3000,
    [`${operationType} no GraphQL errors`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        return !body.errors || body.errors.length === 0;
      } catch (e) {
        return false;
      }
    },
  });

  // Track operation errors
  operationErrors.add(!isSuccess);

  // Log errors for debugging
  if (!isSuccess) {
    console.error(
      `${operationType} operation ${operationName} failed for VU ${__VU}: ${response.status} - ${response.body.substring(0, 200)}`,
    );
  }

  // Simulate realistic user behavior patterns
  if (operationType === 'read') {
    sleep(Math.random() * 2 + 0.5); // 0.5-2.5s reading time
  } else {
    sleep(Math.random() * 0.5 + 0.2); // 0.2-0.7s for login
  }
}

// Setup function
export function setup() {
  console.log('🚀 Starting Mixed Realistic Scenario Load Test');
  console.log(`📍 Target URL: ${GRAPHQL_ENDPOINT}`);
  console.log(`👤 Test Email: ${TEST_CREDENTIALS.email}`);
  console.log('📊 Traffic Distribution:');
  console.log(
    '   Phase 1: Sequential mutations to create fake data, 15% writes',
  );
  console.log('   Phase 2: 75% Read Operations, 10% Login Operations');

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
    query: OPERATIONS.login.query,
    variables: OPERATIONS.login.variables(),
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
    return { baseUrl: BASE_URL, countryStateData: globalCountryStateData };
  }

  // Fetch all countries
  const countriesPayload = JSON.stringify({
    query: OPERATIONS.reads.getAllCountries.query,
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
    return { baseUrl: BASE_URL, countryStateData: globalCountryStateData };
  }

  try {
    const countriesData = JSON.parse(countriesResponse.body);
    const countries = countriesData.data?.getAllCountries || [];

    // Find Guatemala (or use the first country if Guatemala not found)
    const guatemala = countries.find((c) => c.code === 'GT') || countries[0];

    if (!guatemala) {
      console.log('⚠️  No countries found, will use fallback values');
      return { baseUrl: BASE_URL, countryStateData: globalCountryStateData };
    }

    // Fetch states for the selected country
    const statesPayload = JSON.stringify({
      query: OPERATIONS.reads.getStatesByCountryId.query,
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
      return { baseUrl: BASE_URL, countryStateData: globalCountryStateData };
    }

    const statesData = JSON.parse(statesResponse.body);
    const states = statesData.data?.getStatesByCountryId || [];

    globalCountryStateData = {
      country: guatemala,
      states: states,
      defaultState: states[0] || null,
    };

    console.log(
      `✅ Successfully fetched data for ${guatemala.name} with ${states.length} states`,
    );
    console.log(
      `Running mutations to create fake data and then queries to test data navigation...`,
    );
  } catch (error) {
    console.log(
      '⚠️  Error parsing country/state data, will use fallback values',
    );
  }

  return { baseUrl: BASE_URL, countryStateData: globalCountryStateData };
}

// Teardown function
export function teardown(data) {
  console.log('🏁 Mixed Realistic Scenario Load Test completed');
  console.log('📊 Check the results for comprehensive performance metrics');
}
