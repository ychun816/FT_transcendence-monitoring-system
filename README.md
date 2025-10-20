# 🔍 FT_transcendence - Infrastructure Monitoring System

- **Team:** [ft_transcendence](https://github.com/HADMARINE/ft_transcendence)
- **Monitoring Learning notes:** [FT_transcendence-monitoring-system/tree/main/monitor](https://github.com/ychun816/FT_transcendence-monitoring-system/tree/main/monitor)

---

<p align="center">
  <img src="https://img.shields.io/badge/Elasticsearch-Learned-FFD4B2?style=flat&logo=elasticsearch&logoColor=white" alt="Elasticsearch"/> <!-- pastel orange -->
  <img src="https://img.shields.io/badge/Logstash-Learned-BFEFFF?style=flat&logo=logstash&logoColor=white" alt="Logstash"/> <!-- pastel blue -->
  <img src="https://img.shields.io/badge/Kibana-Learned-FFC4D6?style=flat&logo=kibana&logoColor=white" alt="Kibana"/> <!-- pastel pink -->  
  <img src="https://img.shields.io/badge/Prometheus-Implemented-BFEFFF?style=flat&logo=prometheus&logoColor=white" alt="Prometheus"/> <!-- pastel blue -->
  <img src="https://img.shields.io/badge/Grafana-Implemented-FFC4D6?style=flat&logo=grafana&logoColor=white" alt="Grafana"/> <!-- pastel pink -->
  <img src="https://img.shields.io/badge/Docker-Implemented-C5A3E8?style=flat&logo=docker&logoColor=white" alt="Docker"/> <!-- pastel purple -->
  <img src="https://img.shields.io/badge/Docker_Compose-Learned-D4F4DD?style=flat&logo=docker&logoColor=white" alt="Docker Compose"/> <!-- pastel green -->
  <img src="https://img.shields.io/badge/Monitoring-Advanced-FFF1A8?style=flat&logoColor=white" alt="Monitoring"/> <!-- pastel yellow -->

</p>


---

## 📑 Table of Contents

- [About / Project Overview](#about--project-overview)
- [Resources & References](#resources--references)
- [Monitoring System Brief](#monitoring-system-brief)
  - [ELK Stack (Elasticsearch, Logstash, Kibana)](#elk-stack-elasticsearch-logstash-kibana)
  - [Prometheus & Grafana](#prometheus--grafana)
- [System Architecture & Workflow](#system-architecture--workflow)
  - [1. ELK Stack Workflow](#1-elk-stack-workflow)
  - [2. Prometheus/Grafana Workflow](#2-prometheusgrafana-workflow)
- [Test Commands](#test-commands)
  - [ELK Stack Testing](#elk-stack-testing)
  - [Prometheus & Grafana Testing](#prometheus--grafana-testing)
- [Key Concepts Learned](#key-concepts-learned)
- [Skills Developed](#skills-developed)

---

## About / Project Overview

This project implements a comprehensive monitoring infrastructure for the **ft_transcendence** application, providing real-time observability through two complementary monitoring stacks:

- **ELK Stack**: Centralized log aggregation, processing, and visualization
- **Prometheus + Grafana**: Metrics collection, time-series monitoring, and advanced dashboards

The monitoring system enables:
- 📊 Real-time application performance tracking
- 📝 Centralized log management and analysis
- 🚨 Proactive alerting for system anomalies
- 📈 Historical data analysis and trend visualization
- 🔍 Enhanced debugging capabilities

This implementation demonstrates production-grade monitoring practices using industry-standard tools in a containerized environment.

---

## Resources & References

### Official Documentation
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Logstash Documentation](https://www.elastic.co/guide/en/logstash/current/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Docker Documentation](https://docs.docker.com/)

### Learning Resources
- [Elastic Stack Getting Started](https://www.elastic.co/guide/en/elastic-stack-get-started/current/get-started-stack.html)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/best-practices-for-creating-dashboards/)

### Community & Tools
- [Prometheus Exporters](https://prometheus.io/docs/instrumenting/exporters/)
- [Grafana Dashboard Library](https://grafana.com/grafana/dashboards/)
- [Filebeat Modules](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-modules.html)

---

## Monitoring System Brief

### ELK Stack (Elasticsearch, Logstash, Kibana)

**Purpose**: Centralized logging solution for collecting, processing, and visualizing application logs.

**Components**:
- **Elasticsearch**: Distributed search and analytics engine that stores and indexes log data
- **Logstash**: Data processing pipeline that ingests, transforms, and sends logs to Elasticsearch
- **Kibana**: Visualization platform for exploring and analyzing log data through interactive dashboards

**Use Cases**:
- Application error tracking and debugging
- User activity analysis
- Security event monitoring
- System audit trails

**Key Resources**:
- [ELK Stack Architecture Guide](https://www.elastic.co/guide/en/elastic-stack/current/installing-elastic-stack.html)
- [Log Parsing with Logstash](https://www.elastic.co/guide/en/logstash/current/configuration.html)
- [Kibana Query Language (KQL)](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)

---

### Prometheus & Grafana

**Purpose**: Metrics-based monitoring system for time-series data collection and visualization.

**Components**:
- **Prometheus**: Time-series database that scrapes and stores metrics from configured targets
- **Grafana**: Multi-platform analytics and visualization tool for creating comprehensive dashboards

**Use Cases**:
- System resource monitoring (CPU, memory, disk, network)
- Application performance metrics
- Custom business metrics
- Real-time alerting based on metric thresholds

**Key Resources**:
- [Prometheus Query Language (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Node Exporter for System Metrics](https://github.com/prometheus/node_exporter)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)

---

## System Architecture & Workflow

### 1. ELK Stack Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Backend    │  │   Frontend   │  │   Database   │          │
│  │  (Logs)      │  │  (Logs)      │  │  (Logs)      │          │
│  └───────┬──────┘  └───────┬──────┘  └───────┬──────┘          │
└──────────┼─────────────────┼─────────────────┼─────────────────┘
           │                 │                 │
           └─────────────────┴─────────────────┘
                             │
                             ▼
           ┌─────────────────────────────────┐
           │         FILEBEAT / LOGS         │
           │   (Log Collection & Shipping)   │
           └────────────────┬────────────────┘
                            │
                            ▼
           ┌─────────────────────────────────┐
           │          LOGSTASH               │
           │  • Parse & Filter Logs          │
           │  • Transform Data               │
           │  • Enrich with Metadata         │
           └────────────────┬────────────────┘
                            │
                            ▼
           ┌─────────────────────────────────┐
           │        ELASTICSEARCH            │
           │  • Index & Store Logs           │
           │  • Full-text Search             │
           │  • Data Aggregation             │
           └────────────────┬────────────────┘
                            │
                            ▼
           ┌─────────────────────────────────┐
           │           KIBANA                │
           │  • Visualize Logs               │
           │  • Create Dashboards            │
           │  • Search & Analyze             │
           └─────────────────────────────────┘
```

**Workflow Steps**:
1. **Log Generation**: Applications generate logs in various formats
2. **Log Collection**: Filebeat collects logs from application containers
3. **Log Processing**: Logstash parses, filters, and transforms raw logs
4. **Log Storage**: Elasticsearch indexes and stores processed logs
5. **Log Visualization**: Kibana provides search and visualization interface

---

### 2. Prometheus/Grafana Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      MONITORED SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Backend    │  │   Database   │  │  System (OS) │          │
│  │   :9090      │  │   :9100      │  │   :9100      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │  /metrics        │  /metrics        │  /metrics
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
           ┌─────────────────────────────────┐
           │         PROMETHEUS              │
           │  • Scrape Metrics (15s/30s)     │
           │  • Store Time-Series Data       │
           │  • Evaluate Alert Rules         │
           │  • PromQL Query Engine          │
           └────────────────┬────────────────┘
                            │
                            │ Query Metrics
                            ▼
           ┌─────────────────────────────────┐
           │           GRAFANA               │
           │  • Fetch Data from Prometheus   │
           │  • Render Dashboards            │
           │  • Trigger Alerts               │
           │  • Send Notifications           │
           └─────────────────────────────────┘
```

**Workflow Steps**:
1. **Metrics Exposure**: Services expose metrics via HTTP endpoints (e.g., `/metrics`)
2. **Metrics Scraping**: Prometheus periodically scrapes metrics from configured targets
3. **Metrics Storage**: Time-series data stored in Prometheus' efficient TSDB
4. **Metrics Querying**: Grafana queries Prometheus using PromQL
5. **Metrics Visualization**: Grafana renders real-time dashboards and alerts

---

## Test Commands

### ELK Stack Testing

#### Check Service Status
```bash
# Verify all ELK containers are running
docker-compose -f docker-compose.elk.yml ps

# Check Elasticsearch health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Verify Kibana is accessible
curl -X GET "localhost:5601/api/status"
```

#### Test Log Ingestion
```bash
# Send test log to Logstash
echo '{"message": "Test log entry", "level": "INFO"}' | \
  nc localhost 5000

# Query Elasticsearch for recent logs
curl -X GET "localhost:9200/_search?pretty" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match_all": {}
  },
  "size": 10,
  "sort": [{"@timestamp": "desc"}]
}'
```

#### Access Kibana Dashboard
```bash
# Open Kibana in browser
open http://localhost:5601

# Create index pattern: Management → Index Patterns → Create
# Pattern: logstash-* or filebeat-*
```

---

### Prometheus & Grafana Testing

#### Check Service Status
```bash
# Verify Prometheus and Grafana containers
docker-compose -f docker-compose.monitoring.yml ps

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify Grafana health
curl http://localhost:3000/api/health
```

#### Test Metrics Collection
```bash
# Query Prometheus metrics
curl 'http://localhost:9090/api/v1/query?query=up'

# Check specific metric (e.g., CPU usage)
curl 'http://localhost:9090/api/v1/query?query=node_cpu_seconds_total'

# Test PromQL query (5-minute rate of HTTP requests)
curl 'http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])'
```

#### Access Grafana Dashboard
```bash
# Open Grafana in browser
open http://localhost:3000

# Default credentials: admin / admin
# Add Prometheus data source: Configuration → Data Sources → Add → Prometheus
# URL: http://prometheus:9090
```

#### Useful PromQL Queries
```promql
# CPU usage percentage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage percentage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk usage percentage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100

# Network traffic (bytes received)
rate(node_network_receive_bytes_total[5m])
```

---

## Key Concepts Learned

### Monitoring Architecture
- **Centralized Logging**: Aggregating logs from distributed services into a single searchable repository
- **Metrics vs. Logs**: Understanding when to use metrics (quantitative data) vs. logs (qualitative events)
- **Time-Series Databases**: Efficient storage and querying of timestamped data points
- **Data Retention Policies**: Balancing storage costs with data availability requirements

### ELK Stack Concepts
- **Log Parsing & Grok Patterns**: Extracting structured data from unstructured log messages
- **Index Management**: Creating and managing time-based indices for efficient log storage
- **Kibana Query Language (KQL)**: Writing complex queries to filter and analyze logs
- **Aggregations**: Performing statistical analysis on log data (counts, averages, percentiles)

### Prometheus Concepts
- **Pull-Based Monitoring**: Prometheus scraping model vs. push-based systems
- **PromQL (Prometheus Query Language)**: Writing powerful queries for metrics analysis
- **Labels & Cardinality**: Using labels effectively without overwhelming the time-series database
- **Service Discovery**: Automatically discovering and monitoring new services
- **Recording Rules**: Pre-computing expensive queries for faster dashboard loading

### Grafana Concepts
- **Dashboard Design**: Creating intuitive, actionable visualizations
- **Templating & Variables**: Building dynamic dashboards that work across environments
- **Alert Rules**: Setting up threshold-based alerts with proper notification channels
- **Data Source Integration**: Connecting multiple data sources in a single dashboard

### DevOps Best Practices
- **Observability Triangle**: Implementing logs, metrics, and traces (focus on logs and metrics)
- **SRE Principles**: Measuring SLIs (Service Level Indicators) and SLOs (Service Level Objectives)
- **Alert Fatigue Management**: Designing meaningful alerts that require action
- **Infrastructure as Code**: Defining monitoring configuration in version-controlled files

---

## Skills Developed

### Technical Skills

#### Monitoring & Observability
- ✅ Implementing ELK Stack (Elasticsearch, Logstash, Kibana) for centralized logging
- ✅ Configuring Prometheus for metrics collection and alerting
- ✅ Building custom Grafana dashboards with advanced visualizations
- ✅ Writing complex PromQL queries for metrics analysis
- ✅ Creating Logstash pipelines for log parsing and transformation
- ✅ Designing Kibana dashboards and visualizations
- ✅ Setting up service discovery and auto-scaling monitoring

#### Infrastructure & DevOps
- ✅ Docker containerization and multi-container orchestration
- ✅ Docker Compose for defining multi-service monitoring stacks
- ✅ Configuring persistent volumes for data retention
- ✅ Network configuration for inter-container communication
- ✅ Environment variable management and secrets handling

#### Data Management
- ✅ Time-series data storage and optimization
- ✅ Index lifecycle management in Elasticsearch
- ✅ Data retention and archival strategies
- ✅ Query optimization for large datasets
- ✅ Understanding data cardinality and its impact on performance

#### System Administration
- ✅ Linux system monitoring and troubleshooting
- ✅ Performance tuning and resource optimization
- ✅ Security best practices for monitoring systems
- ✅ Backup and disaster recovery planning
- ✅ Log rotation and management

### Soft Skills

#### Problem-Solving
- 🎯 Debugging complex distributed system issues
- 🎯 Root cause analysis using logs and metrics
- 🎯 Performance bottleneck identification
- 🎯 Capacity planning based on historical data

#### Documentation & Communication
- 📝 Creating comprehensive technical documentation
- 📝 Designing intuitive dashboard layouts
- 📝 Writing clear alert messages and runbooks
- 📝 Documenting troubleshooting procedures

#### System Design
- 🏗️ Architecting scalable monitoring solutions
- 🏗️ Designing effective alerting strategies
- 🏗️ Planning for high availability and fault tolerance
- 🏗️ Balancing observability depth with system overhead

---

## 📊 Project Highlights

- 🚀 **Production-Ready**: Configured for high availability and data persistence
- 🔒 **Security**: Implemented with security best practices and access controls
- 📈 **Scalable**: Designed to handle growing data volumes and services
- 🔄 **Maintainable**: Well-documented with clear configuration management
- 💡 **Industry-Standard**: Uses widely-adopted tools in modern DevOps practices

---


<p align="center">
  <i>Built with ❤️ for robust infrastructure monitoring</i>
</p>
