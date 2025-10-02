# EasyStore Load Testing Setup Guide

## Prerequisites

### 1. Manual User Registration Required ⚠️

**IMPORTANT**: You must manually start the server in test environment before running load tests.

**Steps**:

1. Go to your EasyStore application: `https://easystoredev.vercel.app`
2. Register a new user account (or use an existing one)
3. **Remember the email and password** - you'll need these for testing
4. Ensure the user has appropriate permissions for your tenant

**Why Manual Registration?**

- Load tests use **existing user accounts** for authentication
- This ensures realistic authentication flows and proper tenant scoping

### 2. Install k6

```bash
# Windows
winget install k6 --source winget

# Or download from: https://k6.io/docs/get-started/installation/
```

## Environment Configuration

You have **3 options** to set environment variables:

### Option 1: Environment File (Recommended)

1. **Copy the template**:

   ```bash
   cp test/load/.env.load-test.example test/load/.env.load-test
   ```

2. **Edit the file** with your actual values.

3. **Load and run tests**:

   ```powershell
   # The script will automatically load .env.load-test if no parameters provided
   .\test\load\run-tests.ps1

   # Or explicitly load the env file
   .\test\load\run-tests.ps1 -LoadEnvFile
   ```

### Option 2: PowerShell Environment Variables

```powershell
# Set for current session
$env:BASE_URL = "https://test.easystore.com"
$env:TEST_EMAIL = "your-actual-email@example.com"
$env:TEST_PASSWORD = "YourActualPassword123!"

# Run tests
.\test\load\run-tests.ps1
```

### Option 3: Script Parameters

```powershell
.\test\load\run-tests.ps1 -BaseUrl "https://test.easystore.com" -TestEmail "your-email@example.com" -TestPassword "YourPassword123!"
```

## Running Tests

### Quick Start (All Tests)

```powershell
# Using environment file (recommended)
.\test\load\run-tests.ps1

# Using parameters
.\test\load\run-tests.ps1 -BaseUrl "https://your-api.com" -TestEmail "user@example.com" -TestPassword "password"
```

### Selective Test Execution

```powershell
# Skip specific tests
.\test\load\run-tests.ps1 -SkipAuth          # Skip authentication test
.\test\load\run-tests.ps1 -SkipData          # Skip data navigation test
.\test\load\run-tests.ps1 -SkipMixed         # Skip mixed scenario test
```

## Troubleshooting

### Common Issues

#### 1. k6 Installation Problems

```powershell
# Verify k6 installation
k6 version

# If not found, reinstall
winget uninstall k6
winget install k6 --source winget
```

#### 2. Authentication Failures

**Error**: Login mutations return errors

**Solutions**:

- Verify the test user exists and credentials are correct
- Check if the user belongs to the correct tenant
- Ensure the user account is active (not disabled)

#### 3. Empty Query Results

**Error**: Queries return empty arrays

**Solutions**:

- Add test data to your database
- Verify the test user has access to the tenant's data
- Check tenant scoping in your GraphQL resolvers

#### 4. Environment Variable Issues

**Error**: "BASE_URL is required" or credential errors

**Solutions**:

- Use the `.env.load-test` file approach (most reliable)
- Verify environment variables are set: `echo $env:BASE_URL`
- Check for typos in variable names

### Getting Help

1. **Check logs**: k6 provides detailed output about failures
2. **Test manually**: Use GraphQL Playground to verify queries work
3. **Verify credentials**: Test login through your web application first
4. **Check network**: Ensure the API endpoint is accessible

### Performance Optimization Tips

1. **Before Testing**: Restart containers, clear caches, ensure clean baseline
2. **During Testing**: Monitor Oracle dashboard, take screenshots at key stages
3. **After Testing**: Allow system to stabilize, collect final metrics

## Security Notes

- **Never commit** real credentials to version control
- Use **test-specific accounts** with limited permissions
- The `.env.load-test` file is gitignored for security
