# Prometheus & Grafana Monitoring Setup

**ft_transcendence DevOps Module - Monitoring System**

This repository contains a complete monitoring solution using Prometheus and Grafana for the ft_transcendence project, implementing modern DevOps observability practices.

## Overview

This monitoring stack provides:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization dashboards and notifications
- **Node Exporter**: System-level metrics
- **cAdvisor**: Container performance metrics
- **Application Metrics**: Custom Pong game metrics

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Your application running on port 3000 (or adjust configuration)

### Launch Monitoring Stack
```bash
# Clone and navigate to monitoring directory
git clone <your-repo>
cd monitoring/

# Start all services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### Access Points
- **Grafana Dashboard**: http://localhost:3001
  - Username: `admin`
  - Password: `admin123`
- **Prometheus**: http://localhost:9090
- **Node Exporter**: http://localhost:9100
- **cAdvisor**: http://localhost:8080

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Pong     │    │   Prometheus    │    │    Grafana      │
│   Application   │───▶│   (Collector)   │───▶│ (Visualization) │
│   :3000/metrics │    │     :9090       │    │     :3001       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Node Exporter │
                    │ + cAdvisor      │
                    │ (System Metrics)│
                    └─────────────────┘
```
### Prometheus Architecture 

- This diagram illustrates the architecture of Prometheus and some of its ecosystem components:
  https://prometheus.io/docs/introduction/overview/
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/d6e61ec4-f6a0-471a-9032-745a8546e7fe" />

- Notes
  https://www.youtube.com/watch?v=h4Sl21AKiDg
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/e79fd143-7474-41d5-9936-6ccad7c5f307" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/3b3f0130-cb2d-4015-b26c-1f924f088ecc" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/da1f08d8-41cf-4743-bbb5-d27705292181" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/64828294-61b5-4b74-8efe-1ccf6255d7d8" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/2e77f0f1-b7ad-4871-b952-30f0e89f3d2b" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/8f458510-d16b-48bd-babd-b764ed107a4d" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/6037fd40-88e9-4aca-a7da-b0a2028d3896" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/c19fb175-98be-4346-9d84-819b7a454d7e" />
<img width="914" height="506" alt="image" src="https://github.com/user-attachments/assets/22d7b91b-4e71-40ba-bbbe-24f6208ff7a5" />

- Steps Diagram:
```
+------------------+         pull/scrape          +--------------------------+
|  Node Exporter   | <----------------------------|      Prometheus Server   |
| (per host:9100)  |  /metrics (text exposition)  |  - TSDB storage          |
|  CPU, mem, disk  |                              |  - Rules & scraping      |
+------------------+                              |  - Alerting (-> Alertmgr)|
          ^                                       +------------+-------------+
          |                                                      |
          |  host metrics                                        | PromQL queries
          |                                                      v
 +-------------------+                                  +---------------------+
 | Your Applications | -------------------------------->|       Grafana       |
 | (optional: app    |  custom exporters / /metrics     | Dashboards & alerts |
 | exporters)        |                                  +---------------------+
 +-------------------+

 Alerting path:
   Prometheus -> Alertmanager -> Email / Slack / PagerDuty / Webhooks
```
- [COMPARE] *Amazon CloudWatch* Steps Diagram:
```
+--------------------+     push (agent/SDK)     +---------------------------+
|  EC2 / ECS / EKS   | ------------------------>|  CloudWatch Metrics       |
|  Lambda / RDS ...  | (AWS services auto-push) |  (Namespaces, Dimensions) |
+--------------------+                          +------------+--------------+
         |                                                       |
         | logs (agent/Fluent Bit)                               | alarms
         v                                                       v
+--------------------+                                   +--------------------+
|  CloudWatch Logs   |<----- ingestion & retention ----->|  CloudWatch Alarms |
|  (Groups/Streams)  |                                   |  -> SNS/Actions    |
+---------+----------+                                   +---------+----------+
          |                                                        |
          | queries (Logs Insights)                                |
          v                                                        v
+--------------------+                                    +-------------------+
|  CloudWatch        |<----------- read metrics ----------|  Dashboards       |
|  Logs Insights     |                                    |  (multi-account)  |
+--------------------+                                    +-------------------+

```


## File Structure

```
monitor/
├── .env                       
├── docker-compose.yml                # Container orchestration
├── prometheus_config.yml             # Prometheus configuration ← Configures Prometheus server behavior
├── prometheus.yml                    # Prometheus config  
├── alert_manager.yml                 # Alert manager config
├── alert_rules.yml                   # Alert definitions/rules          
└── grafana/
    └── provisioning/
        └── datasources/
            ├── prometheus_data.yml   # Auto-configure Prometheus datasource ← Configures Grafana's 
            └── prometheus.yml
```

## Configuration Files

### Docker Compose Services

The `docker-compose.monitoring.yml` includes:

| Service | Port | Purpose |
|---------|------|---------|
| prometheus | 9090 | Metrics collection & alerting |
| grafana | 3001 | Dashboard visualization |
| node-exporter | 9100 | System metrics (CPU, memory, disk) |
| cadvisor | 8080 | Container metrics |

### Prometheus Targets

Configured to scrape metrics from:
- Prometheus itself (health monitoring)
- Node Exporter (system metrics)
- cAdvisor (container metrics)
- Your application (`/metrics` endpoint)

## Application Integration

### Adding Metrics to Your App

For Node.js applications, add the metrics endpoint:

```javascript
// Install: npm install prom-client
const promClient = require('prom-client');
const register = new promClient.Registry();

// Collect default metrics
promClient.collectDefaultMetrics({ register });

// Custom Pong game metrics
const gameCounter = new promClient.Counter({
  name: 'pong_games_total',
  help: 'Total number of Pong games played',
  labelNames: ['player_count']
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Network Configuration

Ensure your application can communicate with the monitoring stack:

```yaml
# In your main docker-compose.yml
networks:
  - monitoring
  - default

# Connect to external monitoring network
networks:
  monitoring:
    external: true
```

## Alerts Configuration

Pre-configured alerts include:

| Alert | Trigger | Severity |
|-------|---------|----------|
| HighCPUUsage | CPU > 80% for 2min | Warning |
| HighMemoryUsage | Memory > 85% for 5min | Warning |
| ApplicationDown | App unreachable for 1min | Critical |
| ContainerDown | Container down for 2min | Warning |

## Grafana Dashboards

### Default Dashboards to Import
1. **Node Exporter Full** (ID: 1860)
2. **Docker Container Metrics** (ID: 193)
3. **Prometheus Stats** (ID: 2)

### Creating Custom Dashboards
1. Login to Grafana (admin/admin123)
2. Navigate to "+" → "Dashboard"
3. Add panels with PromQL queries:

```promql
# Example queries for your dashboards:

# Application uptime
up{job="pong-app"}

# Games played rate
rate(pong_games_total[5m])

# Active players
pong_active_players

# System CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

## Troubleshooting

### Common Issues

**Prometheus can't reach your application:**
```bash
# Check network connectivity
docker network ls
docker network inspect monitoring_monitoring
```

**Permission denied errors:**
```bash
# Fix Grafana permissions
mkdir -p ./grafana/provisioning/dashboards
chmod 777 ./grafana/provisioning/dashboards
```

**Metrics not appearing:**
1. Verify your app exposes `/metrics` endpoint
2. Check Prometheus targets: http://localhost:9090/targets
3. Ensure network connectivity between containers

### Useful Commands

```bash
# View logs
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
docker-compose -f docker-compose.monitoring.yml logs -f grafana

# Restart specific service
docker-compose -f docker-compose.monitoring.yml restart prometheus

# Stop all monitoring services
docker-compose -f docker-compose.monitoring.yml down

# Stop and remove volumes (reset data)
docker-compose -f docker-compose.monitoring.yml down -v
```

## Development Workflow

### Day-to-Day Usage

1. **Monitor Application Health**
   - Check Grafana dashboards for anomalies
   - Review alerts in Prometheus

2. **Performance Analysis**
   - Track response times and error rates
   - Monitor resource usage trends

3. **Debugging Issues**
   - Use metrics to identify bottlenecks
   - Correlate system metrics with application events

## Production Considerations

### Security
- Change default Grafana admin password
- Configure HTTPS/TLS for production
- Implement proper authentication

### Scaling
- Add external storage for metrics retention
- Configure alert manager for team notifications
- Set up proper backup strategies

### Performance
- Adjust scrape intervals based on needs
- Configure appropriate retention policies
- Monitor monitoring stack resource usage

## Learning Resources

- [How Prometheus Monitoring works | Prometheus Architecture explained](https://www.youtube.com/watch?v=h4Sl21AKiDg)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Prometheus Glossary](https://prometheus.io/docs/introduction/glossary/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Node Exporter Metrics](https://github.com/prometheus/node_exporter)
- [Grafana Tutorials](https://grafana.com/tutorials/)


## This monitoring setup demonstrates:
- Modern observability practices
- Docker containerization
- Infrastructure as Code
- Production-ready monitoring

## .env
```
# Grafana config
GF_SECURITY_ADMIN_PASSWORD=admin

# Alertmanager config (if needed)
SMTP_SMARTHOST=localhost:587
SMTP_FROM=alertmanager@yourdomain.com

# Optional: Database passwords, API keys, etc.
# POSTGRES_PASSWORD=your_secure_password
# API_KEY=your_api_key
```