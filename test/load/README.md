# EasyStore Backend Load Testing Plan

A comprehensive load and stress testing plan for the EasyStore GraphQL API backend, designed for performance analysis and system optimization.

## 📋 Overview

This testing plan evaluates the performance characteristics of the EasyStore backend under various load conditions, focusing on:

- **Authentication Load**: Testing login mutations with password hashing
- **Data Navigation**: Testing read-heavy GraphQL queries
- **Mixed Scenarios**: Realistic traffic patterns (70-80% reads, 10-20% logins, 10-20% writes)

## 🏗️ System Architecture

### Environment

- **Backend**: TypeScript + NestJS + GraphQL + PostgreSQL
- **Deployment**: Oracle Cloud
- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Testing Tool**: k6 for load generation

### Resource Constraints

- **Application Container**: 3 CPUs, 6GB RAM (soft: 4GB), 8GB swap
- **PostgreSQL Container**: 1 CPU, 10GB RAM (soft: 8GB), 12GB swap
- **Server Total**: 4 CPUs, 24GB RAM

## 📁 Project Structure

```
test/load/
├── README.md                          # This file - main documentation
├── auth-load-test.js                  # Authentication load testing script
├── data-navigation-test.js             # Data navigation testing script
├── mixed-scenario-test.js              # Mixed realistic scenario script
├── run-tests.ps1                       # PowerShell automation script
├── docs/                               # Documentation directory
    ├── SETUP-GUIDE.md                  # Setup instructions
    ├── visualization-guide.md          # Graph generation instructions
    ├── expected-outcomes-guide.md      # Performance expectations & bottlenecks
└── results/                            # Generated test results (created during execution)
    ├── auth-load/
    ├── data-navigation/
    ├── mixed-scenario/
    └── analysis-instructions.md
```

## 📊 Test Scenarios

### 1. Authentication Load Testing

**File**: `auth-load-test.js`

- **Purpose**: Stress test login mutations with password hashing
- **Load Pattern**: 5 → 10 → 20 → 30 → 40 VUs over 5 minutes
- **Key Metrics**: Login success rate, response times, CPU utilization
- **Expected Bottleneck**: Application CPU (bcrypt operations)

### 2. Data Navigation Testing

**File**: `data-navigation-test.js`

- **Purpose**: Test read-heavy GraphQL queries (products, categories, warehouses)
- **Load Pattern**: 5 → 10 → 20 → 30 → 50 VUs over 5 minutes
- **Key Metrics**: Query response times, throughput, database performance
- **Expected Bottleneck**: Database CPU (complex queries)

### 3. Mixed Scenario Testing

**File**: `mixed-scenario-test.js`

- **Purpose**: Realistic traffic simulation
- **Traffic Mix**: 75% reads, 15% logins, 10% writes
- **Load Pattern**: 5 → 10 → 20 → 30 → 40 VUs over 5 minutes
- **Key Metrics**: Overall system performance under realistic load
- **Expected Bottleneck**: Application CPU (authentication dominance)

## 📈 Metrics Collection

### Automated Data Export

The `run-tests.ps1` script automatically generates:

- **JSON Results**: Detailed time-series data for analysis
- **CSV Export**: Spreadsheet-compatible format
- **Summary Reports**: Key performance indicators
- **Log Files**: Detailed execution logs

### Key Performance Indicators

- **Latency Percentiles**: p50, p90, p95, p99 response times
- **Throughput**: Requests per second at each load level
- **Error Rates**: 4xx, 5xx, and timeout error percentages
- **Resource Utilization**: CPU, memory, and swap usage correlation

## 📄 Guides (docs/)

### 1. Setup Guide

**Guide**: `SETUP-GUIDE.md`

- Instructions on how to set up the load testing environment
- Prerequisites: k6, PowerShell, EasyStore backend cloud server
- Steps:
  1. Set up the EasyStore backend cloud server in test environment
  2. Register a test user account
  3. Install k6 on your testing machine
  4. Configure environment variables (use the example template)

### 2. Graph Generation

**Guide**: `visualization-guide.md`

- Professional visualization templates for reports
- Python/matplotlib examples for publication-quality graphs
- Excel/Google Sheets alternatives
- Report integration guidelines

### 3. Expected Outcomes

**Guide**: `expected-outcomes-guide.md`

- Detailed performance expectations for each scenario
- Systematic bottleneck identification procedures
- Performance degradation pattern recognition
- Actionable insights framework

**System**: EasyStore Services Backend  
**Author**: @GerardoFdez7
**Date**: October 2, 2025

For questions or issues, refer to the individual guide files or create an issue in the project repository.
