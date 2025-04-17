# Kibana Integration

Kibana is an open-source visualization tool that works alongside Elasticsearch to help you explore and analyze logs, metrics, and other structured data.

> ⚠️ **Note:** Elasticsearch and Logstash are **not yet configured** in this project. This guide outlines how to set up Kibana and connect it to Elasticsearch, preparing the ground for future log monitoring and data analysis.

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

### ✨ Step 1: Add Elasticsearch and Kibana

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.12.2
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  ports:
    - '9200:9200'
  volumes:
    - elastic_data:/usr/share/elasticsearch/data

kibana:
  image: docker.elastic.co/kibana/kibana:8.12.2
  ports:
    - '5601:5601'
  environment:
    - ELASTICSEARCH_HOSTS=${ELASTICSEARCH_HOSTS}
    - ELASTICSEARCH_USERNAME=${ELASTICSEARCH_USERNAME}
    - ELASTICSEARCH_PASSWORD=${ELASTICSEARCH_PASSWORD}
  depends_on:
    - elasticsearch
```
