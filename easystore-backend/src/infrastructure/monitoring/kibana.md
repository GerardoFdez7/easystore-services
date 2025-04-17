# Kibana Integration

Kibana is an open-source visualization tool that works alongside Elasticsearch to help you explore and analyze logs, metrics, and other structured data.

> [!NOTE]
> This guide outlines how to set up Kibana and connect it to Elasticsearch, preparing the ground for future log monitoring and data analysis.

---

## 🧪 What is Kibana?

Kibana is part of the **ELK Stack** (Elasticsearch, Logstash, Kibana), providing:

- Real-time log exploration
- Visual dashboards
- API monitoring
- Alerting and observability tools

---

## 🚀 How to Add Kibana and Elasticsearch to Docker

You can extend your existing `docker-compose.dev.yml` with the following services:

### ✨ Add Elasticsearch and Kibana

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.14.1
  container_name: elasticsearch
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  ports:
    - '9200:9200'
  volumes:
    - esdata:/usr/share/elasticsearch/data

kibana:
  image: docker.elastic.co/kibana/kibana:8.14.1
  container_name: kibana
  ports:
    - '5601:5601'
  depends_on:
    - elasticsearch
```

---

## 🔍 Accessing Kibana Interface

1. After starting containers, access Kibana at `http://localhost:5601`
2. First-time setup:
   - Navigate to "Discover" to explore Elasticsearch indices
   - Create index patterns matching your financial data structure
   - Use KQL (Kibana Query Language) to filter transactions

---

## 📊 Creating Financial Dashboards

1. In Visualize Library:
   - Create bar charts for monthly expenses
   - Pie charts for income sources
   - Time series for cash flow trends
2. Example dashboard components:
   ```json
   {
     "title": "Monthly Expenses Breakdown",
     "visState": {
       "type": "pie",
       "params": {
         "addTooltip": true,
         "addLegend": true,
         "dimensions": {
           "category": "expense_category",
           "metric": { "type": "sum", "field": "amount" }
         }
       }
     }
   }
   ```

## 📡 Sending Data to Frontend

Create API endpoints in your backend:

```ts
// Example NestJS Controller
@Get('financial-overview')
async getFinancialOverview(@Query() params: DateRangeDto) {
  const query = {
    index: 'financial_transactions',
    body: {
      query: {
        range: {
          date: { gte: params.start, lte: params.end }
        }
      },
      aggs: {
        total_income: { sum: { field: "amount" } },
        by_category: { terms: { field: "category.keyword" } }
      }
    }
  };
  return await this.elasticService.search(query);
}
```
