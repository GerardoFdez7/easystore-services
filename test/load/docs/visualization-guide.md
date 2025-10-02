# Load Testing Visualization Guide for Reports

This guide provides step-by-step instructions for creating professional, publication-quality graphs from your k6 load testing results for presentations.

## Overview

You'll create visualizations that clearly demonstrate:

- **Performance characteristics** under different loads
- **Resource utilization patterns** and bottlenecks
- **System degradation points** and failure modes
- **Correlation between load and system behavior**

## Required Tools

### Primary Options (Choose One)

1. **Excel/Google Sheets** - Easiest, good for basic graphs
2. **Python (matplotlib/seaborn)** - Most flexible, professional quality
3. **R (ggplot2)** - Excellent for statistical analysis
4. **Tableau/Power BI** - Professional dashboards (if available)

### Recommended: Python + Matplotlib

```bash
pip install matplotlib seaborn pandas numpy
```

## Data Preparation

### 1. Export k6 Results

Your `run-tests.ps1` script already exports data in multiple formats:

- `results-summary.json` - Overall test summary
- `results-detailed.csv` - Time-series data
- `results-metrics.json` - Detailed metrics

### 2. Oracle Data Collection

Manually record resource metrics at each load stage:

```csv
timestamp,test_scenario,virtual_users,app_cpu_percent,app_memory_gb,app_memory_percent,db_cpu_percent,db_memory_gb,db_memory_percent,server_cpu_percent,server_memory_percent
2024-01-15 10:00:00,auth-load,5,15,1.2,20,8,2.1,21,12,25
2024-01-15 10:01:00,auth-load,10,28,1.4,23,12,2.3,23,18,27
2024-01-15 10:02:00,auth-load,20,45,1.8,30,18,2.8,28,28,32
```

## Graph Templates

### Graph 1: Response Time vs Virtual Users

**Purpose**: Show how response time degrades with increasing load

```python
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Load data
df = pd.read_csv('results-detailed.csv')

# Create the plot
plt.figure(figsize=(12, 8))
plt.plot(df['virtual_users'], df['response_time_p50'], 'o-', label='p50 (Median)', linewidth=2)
plt.plot(df['virtual_users'], df['response_time_p90'], 's-', label='p90', linewidth=2)
plt.plot(df['virtual_users'], df['response_time_p95'], '^-', label='p95', linewidth=2)
plt.plot(df['virtual_users'], df['response_time_p99'], 'd-', label='p99', linewidth=2)

# Formatting
plt.xlabel('Virtual Users (VUs)', fontsize=14)
plt.ylabel('Response Time (ms)', fontsize=14)
plt.title('Response Time vs Load - EasyStore GraphQL API', fontsize=16, fontweight='bold')
plt.legend(fontsize=12)
plt.grid(True, alpha=0.3)

# Add performance zones
plt.axhspan(0, 500, alpha=0.1, color='green', label='Excellent (<500ms)')
plt.axhspan(500, 1000, alpha=0.1, color='yellow', label='Good (500-1000ms)')
plt.axhspan(1000, 2000, alpha=0.1, color='orange', label='Acceptable (1-2s)')
plt.axhspan(2000, plt.ylim()[1], alpha=0.1, color='red', label='Poor (>2s)')

plt.tight_layout()
plt.savefig('response_time_vs_load.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Graph 2: Throughput and Error Rate vs Load

**Purpose**: Show system capacity and reliability under load

```python
fig, ax1 = plt.subplots(figsize=(12, 8))

# Throughput (left y-axis)
color = 'tab:blue'
ax1.set_xlabel('Virtual Users (VUs)', fontsize=14)
ax1.set_ylabel('Throughput (requests/sec)', color=color, fontsize=14)
ax1.plot(df['virtual_users'], df['request_rate'], 'o-', color=color, linewidth=3, markersize=8)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)

# Error rate (right y-axis)
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Error Rate (%)', color=color, fontsize=14)
ax2.plot(df['virtual_users'], df['error_rate'], 's-', color=color, linewidth=3, markersize=8)
ax2.tick_params(axis='y', labelcolor=color)

# Add acceptable error rate threshold
ax2.axhline(y=5, color='red', linestyle='--', alpha=0.7, label='5% Error Threshold')

plt.title('System Throughput and Reliability vs Load', fontsize=16, fontweight='bold')
fig.tight_layout()
plt.savefig('throughput_error_vs_load.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Graph 3: Resource Utilization vs Load

**Purpose**: Identify resource bottlenecks

```python
plt.figure(figsize=(14, 10))

# Create subplots
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))

# App CPU Usage
ax1.plot(df['virtual_users'], df['app_cpu_percent'], 'o-', color='blue', linewidth=2)
ax1.axhline(y=80, color='orange', linestyle='--', alpha=0.7, label='Warning (80%)')
ax1.axhline(y=95, color='red', linestyle='--', alpha=0.7, label='Critical (95%)')
ax1.set_title('Application CPU Usage', fontweight='bold')
ax1.set_ylabel('CPU Usage (%)')
ax1.grid(True, alpha=0.3)
ax1.legend()

# App Memory Usage
ax2.plot(df['virtual_users'], df['app_memory_percent'], 's-', color='green', linewidth=2)
ax2.axhline(y=67, color='orange', linestyle='--', alpha=0.7, label='Soft Limit (4GB)')
ax2.axhline(y=100, color='red', linestyle='--', alpha=0.7, label='Hard Limit (6GB)')
ax2.set_title('Application Memory Usage', fontweight='bold')
ax2.set_ylabel('Memory Usage (%)')
ax2.grid(True, alpha=0.3)
ax2.legend()

# DB CPU Usage
ax3.plot(df['virtual_users'], df['db_cpu_percent'], '^-', color='purple', linewidth=2)
ax3.axhline(y=80, color='orange', linestyle='--', alpha=0.7, label='Warning (80%)')
ax3.axhline(y=95, color='red', linestyle='--', alpha=0.7, label='Critical (95%)')
ax3.set_title('Database CPU Usage', fontweight='bold')
ax3.set_xlabel('Virtual Users (VUs)')
ax3.set_ylabel('CPU Usage (%)')
ax3.grid(True, alpha=0.3)
ax3.legend()

# DB Memory Usage
ax4.plot(df['virtual_users'], df['db_memory_percent'], 'd-', color='brown', linewidth=2)
ax4.axhline(y=80, color='orange', linestyle='--', alpha=0.7, label='Soft Limit (8GB)')
ax4.axhline(y=100, color='red', linestyle='--', alpha=0.7, label='Hard Limit (10GB)')
ax4.set_title('Database Memory Usage', fontweight='bold')
ax4.set_xlabel('Virtual Users (VUs)')
ax4.set_ylabel('Memory Usage (%)')
ax4.grid(True, alpha=0.3)
ax4.legend()

plt.suptitle('Resource Utilization vs Load - EasyStore Backend', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig('resource_utilization_vs_load.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Graph 4: Performance Timeline

**Purpose**: Show system behavior over time during test execution

```python
plt.figure(figsize=(16, 10))

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Create subplots
fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(16, 12), sharex=True)

# Response time over time
ax1.plot(df['timestamp'], df['response_time_p95'], 'b-', linewidth=2, label='p95 Response Time')
ax1.fill_between(df['timestamp'], df['response_time_p50'], df['response_time_p95'], alpha=0.3)
ax1.set_ylabel('Response Time (ms)', fontsize=12)
ax1.set_title('Performance Timeline - Mixed Scenario Test', fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3)
ax1.legend()

# Virtual users over time
ax2.plot(df['timestamp'], df['virtual_users'], 'g-', linewidth=3, label='Active Virtual Users')
ax2.fill_between(df['timestamp'], 0, df['virtual_users'], alpha=0.3, color='green')
ax2.set_ylabel('Virtual Users', fontsize=12)
ax2.grid(True, alpha=0.3)
ax2.legend()

# Resource usage over time
ax3.plot(df['timestamp'], df['app_cpu_percent'], 'r-', linewidth=2, label='App CPU %')
ax3.plot(df['timestamp'], df['db_cpu_percent'], 'b-', linewidth=2, label='DB CPU %')
ax3.plot(df['timestamp'], df['app_memory_percent'], 'orange', linewidth=2, label='App Memory %')
ax3.set_ylabel('Resource Usage (%)', fontsize=12)
ax3.set_xlabel('Time', fontsize=12)
ax3.grid(True, alpha=0.3)
ax3.legend()

plt.tight_layout()
plt.savefig('performance_timeline.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Graph 5: Scenario Comparison

**Purpose**: Compare performance across different test scenarios

```python
# Assuming you have data from all three scenarios
scenarios = ['Authentication Load', 'Data Navigation', 'Mixed Scenario']
p95_times = [auth_p95, data_p95, mixed_p95]  # Replace with actual values
throughput = [auth_throughput, data_throughput, mixed_throughput]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))

# Response time comparison
bars1 = ax1.bar(scenarios, p95_times, color=['#FF6B6B', '#4ECDC4', '#45B7D1'])
ax1.set_ylabel('p95 Response Time (ms)', fontsize=12)
ax1.set_title('Response Time Comparison by Scenario', fontweight='bold')
ax1.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for bar, value in zip(bars1, p95_times):
    ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 10,
             f'{value:.0f}ms', ha='center', va='bottom', fontweight='bold')

# Throughput comparison
bars2 = ax2.bar(scenarios, throughput, color=['#FF6B6B', '#4ECDC4', '#45B7D1'])
ax2.set_ylabel('Throughput (req/s)', fontsize=12)
ax2.set_title('Throughput Comparison by Scenario', fontweight='bold')
ax2.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for bar, value in zip(bars2, throughput):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
             f'{value:.1f}', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig('scenario_comparison.png', dpi=300, bbox_inches='tight')
plt.show()
```

## Excel Alternative

If you prefer Excel/Google Sheets:

### 1. Data Import

1. Import your CSV files into separate sheets
2. Create a "Summary" sheet for key metrics
3. Use VLOOKUP to correlate k6 data with Oracle metrics

### 2. Chart Creation

1. **Line Charts**: For response time vs load
2. **Combo Charts**: For throughput + error rate
3. **Area Charts**: For resource utilization over time
4. **Bar Charts**: For scenario comparisons

### 3. Professional Formatting

- Use consistent color scheme (blue for performance, red for errors, green for resources)
- Add data labels for key points
- Include trend lines where appropriate
- Use clear, descriptive titles

### Presentation Tips

1. **Start with Context**: Explain your system architecture
2. **Show Progression**: Begin with simple metrics, build complexity
3. **Highlight Key Points**: Use annotations and callouts
4. **Explain Correlations**: Connect performance to resource usage
5. **Draw Conclusions**: What do the results mean for your system?

## Advanced Visualizations

### Heat Maps (Python)

```python
import seaborn as sns

# Create correlation matrix
correlation_data = df[['virtual_users', 'response_time_p95', 'app_cpu_percent', 'db_cpu_percent', 'error_rate']]
correlation_matrix = correlation_data.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
plt.title('Performance Metrics Correlation Matrix')
plt.tight_layout()
plt.savefig('correlation_heatmap.png', dpi=300)
```

## Quality Checklist

Before submitting your visualizations:

- [ ] **Clear titles and labels** on all axes
- [ ] **Consistent color scheme** across all graphs
- [ ] **Appropriate scale** (don't start y-axis at 0 if it obscures data)
- [ ] **Legend placement** doesn't obscure data
- [ ] **High resolution** (300 DPI minimum for print)
- [ ] **Data source** attribution
- [ ] **Key insights** highlighted with annotations
- [ ] **Professional appearance** suitable for academic submission

This comprehensive visualization strategy will help you create compelling, professional graphs that clearly communicate your load testing results and system performance characteristics.
