# EasyStore Load Testing Automation Script
# This script runs comprehensive load tests against the EasyStore GraphQL API

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$TestEmail,
    
    [Parameter(Mandatory=$false)]
    [string]$TestPassword,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "test/load/results",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipAuth,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipData,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMixed,
    
    [Parameter(Mandatory=$false)]
    [switch]$LoadEnvFile
)

# Function to load environment variables from .env.load-test file
function Load-EnvFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "Loading environment variables from $FilePath..."
        Get-Content $FilePath | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove quotes if present
                $value = $value -replace '^["'']|["'']$', ''
                [Environment]::SetEnvironmentVariable($name, $value, 'Process')
                Write-Host "  Set $name" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "Environment file not found: $FilePath" -ForegroundColor Yellow
        Write-Host "You can create one using the template at test/load/.env.load-test" -ForegroundColor Yellow
    }
}

# Load environment file if requested or if no parameters provided
if ($LoadEnvFile -or (-not $BaseUrl -and -not $TestEmail -and -not $TestPassword)) {
    $envFile = Join-Path $PSScriptRoot ".env.load-test"
    Load-EnvFile -FilePath $envFile
}

# Set defaults from environment variables if not provided as parameters
if (-not $BaseUrl) { $BaseUrl = $env:BASE_URL }
if (-not $TestEmail) { $TestEmail = $env:TEST_EMAIL }
if (-not $TestPassword) { $TestPassword = $env:TEST_PASSWORD }

# Validate required parameters
if (-not $BaseUrl) {
    Write-Host "ERROR: BASE_URL is required. Set it via:" -ForegroundColor Red
    Write-Host "  1. Parameter: -BaseUrl 'https://your-api.com'" -ForegroundColor Yellow
    Write-Host "  2. Environment: `$env:BASE_URL = 'https://your-api.com'" -ForegroundColor Yellow
    Write-Host "  3. .env file: Create test/load/.env.load-test with BASE_URL=https://your-api.com" -ForegroundColor Yellow
    exit 1
}

if (-not $TestEmail -or -not $TestPassword) {
    Write-Host "ERROR: Test credentials are required. You need an EXISTING user account." -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "IMPORTANT: You must register a test user manually first!" -ForegroundColor Red
    Write-Host "1. Go to your EasyStore application" -ForegroundColor Yellow
    Write-Host "2. Register a new user account (or use an existing one)" -ForegroundColor Yellow
    Write-Host "3. Note the email and password" -ForegroundColor Yellow
    Write-Host "4. Set credentials via:" -ForegroundColor Yellow
    Write-Host "   - Parameters: -TestEmail 'user@example.com' -TestPassword 'password'" -ForegroundColor Gray
    Write-Host "   - Environment: `$env:TEST_EMAIL = 'user@example.com'; `$env:TEST_PASSWORD = 'password'" -ForegroundColor Gray
    Write-Host "   - .env file: Add TEST_EMAIL and TEST_PASSWORD to test/load/.env.load-test" -ForegroundColor Gray
    exit 1
}

# Create output directory and test-specific subdirectories
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
}

# Create test-specific subdirectories as described in README.md
$testFolders = @("auth-load", "data-navigation", "mixed-scenario")
foreach ($folder in $testFolders) {
    $folderPath = Join-Path $OutputDir $folder
    if (!(Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force
    }
}

# Get current timestamp for file naming
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Environment variables for k6
$env:BASE_URL = $BaseUrl
$env:TEST_EMAIL = $TestEmail
$env:TEST_PASSWORD = $TestPassword

Write-Host "EasyStore Load Testing Suite" -ForegroundColor Green
Write-Host "Target URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Test Email: $TestEmail" -ForegroundColor Cyan
Write-Host "Output Directory: $OutputDir" -ForegroundColor Cyan
Write-Host ""


# Validate k6 installation
$global:k6Path = "C:\Program Files\k6\k6.exe"
if (Test-Path $global:k6Path) {
    try {
        $k6Version = & $global:k6Path version 2>$null
        Write-Host "k6 detected: $k6Version" -ForegroundColor Green
    } catch {
        Write-Host "k6 found but version check failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "k6 not found at expected location: $global:k6Path" -ForegroundColor Red
    Write-Host "Please install k6 or update the path in the script" -ForegroundColor Yellow
    exit 1
}

function Run-LoadTest {
    param(
        [string]$TestName,
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Host "Running $TestName..." -ForegroundColor Yellow
    Write-Host "   $Description" -ForegroundColor Gray
    
    # Map test names to their corresponding result folders
    $folderMapping = @{
        "auth-load-test" = "auth-load"
        "data-navigation-test" = "data-navigation"
        "mixed-scenario-test" = "mixed-scenario"
    }
    
    $testFolder = $folderMapping[$TestName]
    if (-not $testFolder) {
        Write-Host "Warning: No folder mapping found for test '$TestName', using default output directory" -ForegroundColor Yellow
        $testOutputDir = $OutputDir
    } else {
        $testOutputDir = Join-Path $OutputDir $testFolder
    }
    
    $outputFile = "$testOutputDir\${TestName}_${timestamp}"
    
    # Run k6 with comprehensive output options
    $k6Args = @(
        "run",
        "--out", "json=$outputFile.json",
        "--out", "csv=$outputFile.csv",
        "--summary-export", "$outputFile-summary.json",
        $ScriptPath
    )
    
    $startTime = Get-Date
    
    try {
        & $global:k6Path @k6Args | Tee-Object -FilePath "$outputFile.log"
        $exitCode = $LASTEXITCODE
        
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        if ($exitCode -eq 0) {
            Write-Host "   Duration: $($duration.ToString('mm\:ss'))" -ForegroundColor Gray
            Write-Host "   Results: $outputFile.*" -ForegroundColor Gray
        } else {
            Write-Host "$TestName failed with exit code $exitCode" -ForegroundColor Red
        }
        
        Write-Host ""
        return $exitCode -eq 0
    }
    catch {
        Write-Host "Error running $TestName : $_" -ForegroundColor Red
        return $false
    }
}

# Test execution logic
$testsToRun = @()

if ($RunAll -or (!$AuthOnly -and !$DataOnly -and !$MixedOnly)) {
    $testsToRun = @(       
        @{
            Name = "mixed-scenario-test"
            Script = "mixed-scenario-test.js"
            Description = "Mixed realistic scenario (75% reads, 15% writes, 10% logins)"
        },
        @{
            Name = "auth-load-test"
            Script = "auth-load-test.js"
            Description = "Authentication load testing (login mutations with password hashing)"
        }, 
        @{
            Name = "data-navigation-test"
            Script = "data-navigation-test.js"
            Description = "Data navigation testing (GraphQL queries)"
        }
    )
} else {
    if ($AuthOnly) {
        $testsToRun += @{
            Name = "auth-load-test"
            Script = "auth-load-test.js"
            Description = "Authentication load testing (login mutations with password hashing)"
        }
    }    
    if ($MixedOnly) {
        $testsToRun += @{
            Name = "mixed-scenario-test"
            Script = "mixed-scenario-test.js"
            Description = "Mixed realistic scenario (75% reads, 15% writes, 10% logins)"
        }
    }
    if ($DataOnly) {
        $testsToRun += @{
            Name = "data-navigation-test"
            Script = "data-navigation-test.js"
            Description = "Data navigation testing (GraphQL queries with session cookies)"
        }
    }
}


# Check if test scripts exist
foreach ($test in $testsToRun) {
    $scriptPath = Join-Path $PSScriptRoot $test.Script
    if (!(Test-Path $scriptPath)) {
        Write-Host "Test script not found: $scriptPath" -ForegroundColor Red
        exit 1
    }
    # Update the script path to use the full path
    $test.Script = $scriptPath
}

Write-Host "Running $($testsToRun.Count) test(s)..." -ForegroundColor Magenta
Write-Host ""

# Run tests
$results = @()
foreach ($test in $testsToRun) {
    $success = Run-LoadTest -TestName $test.Name -ScriptPath $test.Script -Description $test.Description
    $results += @{
        Name = $test.Name
        Success = $success
        Timestamp = $timestamp
    }
}

# Summary
Write-Host "Test Execution Summary" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count

foreach ($result in $results) {
    $status = if ($result.Success) { "PASSED" } else { "FAILED" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "   $($result.Name): $status" -ForegroundColor $color
}

Write-Host ""
Write-Host "Results Location: $OutputDir" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "Success Rate: $successCount/$totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

# Generate analysis instructions
$analysisFile = "$OutputDir\analysis-instructions-$timestamp.md"
$analysisContent = @"
# Load Test Results Analysis - $timestamp

## Files Generated

For each test, the following files were created:

- **JSON Output**: `{test-name}_${timestamp}.json` - Raw k6 metrics data
- **CSV Output**: `{test-name}_${timestamp}.csv` - Tabular metrics data  
- **Summary**: `{test-name}_${timestamp}-summary.json` - Test summary statistics
- **Log**: `{test-name}_${timestamp}.log` - Console output and errors

## Key Metrics to Analyze

### 1. Latency Percentiles
- **p50 (median)**: 50% of requests completed below this time
- **p90**: 90% of requests completed below this time  
- **p95**: 95% of requests completed below this time
- **p99**: 99% of requests completed below this time

### 2. Throughput Metrics
- **http_reqs**: Total number of HTTP requests
- **http_req_rate**: Requests per second
- **data_received**: Total data received
- **data_sent**: Total data sent

### 3. Error Rates
- **http_req_failed**: Percentage of failed HTTP requests
- **Custom error rates**: Check test-specific error metrics

### 4. Response Times
- **http_req_duration**: Request duration statistics
- **http_req_waiting**: Time waiting for response
- **http_req_connecting**: Connection establishment time

## Analysis Steps

1. **Load Summary JSON files** into your analysis tool
2. **Plot latency vs VUs** to identify performance degradation points
3. **Plot throughput vs VUs** to find maximum sustainable load
4. **Correlate with Coolify metrics** (CPU, memory, swap usage)
5. **Identify bottlenecks** where performance starts degrading

## Expected Patterns

- **Authentication Test**: Higher latency due to password hashing
- **Data Navigation**: Lower latency, higher throughput potential
- **Mixed Scenario**: Balanced performance, most realistic

## Next Steps

1. Import results into Excel/Python/R for visualization
2. Create graphs showing performance vs load
3. Correlate with server resource utilization
4. Document findings and recommendations
"@

$analysisContent | Out-File -FilePath $analysisFile -Encoding UTF8
Write-Host "Analysis instructions saved to: $analysisFile" -ForegroundColor Cyan

if ($successCount -eq $totalCount) {
    Write-Host ""
    Write-Host "All tests completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "Some tests failed. Check the logs for details." -ForegroundColor Yellow
    exit 1
}