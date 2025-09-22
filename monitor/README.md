# Super Basic Preview to Transcendence
- [Starter Pack: Transcendence Structure & Languages used](https://hackmd.io/@QBrv51OvRPqs9dJjL2YIig/SybZ5n39ge)
- [npm & yarn Explained](https://hackmd.io/@QBrv51OvRPqs9dJjL2YIig/SJpr-nnqgl)
-> install ```yarn``` / ```node```
- [Essential Files for building non-static website](https://hackmd.io/@QBrv51OvRPqs9dJjL2YIig/ryHNZ3Hseg)
- [Understanding ELK](https://hackmd.io/@QBrv51OvRPqs9dJjL2YIig/r1u4KIiogl)


```
┌───────────────────────┐
│ Developer Pushes Code │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   Source Control      │
│  (GitHub / GitLab)    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────────────────────────────┐
│           CI / Build Stage (Containers)       │
├───────────────┬───────────────┬───────────────┤
│ Backend       │ Frontend      │ Game Engine   │
│ Node.js + TS  │ React / Vue   │ Pong Logic    │
│ Build & Test  │ Build & Test  │ Multiplayer   │
└───────────────┴───────────────┴───────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────┐   ┌────────────────────┐
│ Package Docker Images       │   │ Test Results       │
└─────────────┬───────────────┘   └────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────┐
│           CD / Deployment Stage               │
├───────────────┬───────────────┬───────────────┤
│ Backend       │ Frontend      │ Game Engine   │
│ Node.js + TS  │ React / Vue   │ Pong Logic    │
├───────────────┴───────────────┴───────────────┤
│ Database (PostgreSQL)                         │
└───────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────┐
│       Staging / Production Server             │
├───────────────┬───────────────┬───────────────┤
│ Frontend      │ Backend       │ Game Engine   │
│ React / Vue   │ Node.js + TS  │ Pong Logic    │
├───────────────┴───────────────┴───────────────┤
│ Database (PostgreSQL)                         │
└───────────────────────────────────────────────┘
              │
              ▼
=================================================
│          USER FLOW                            │
=================================================
┌───────────────────────────────────────────────┐
│ Browser       │ Frontend      │ Backend       │
│ Opens site    │ Sends API /   │ Checks DB &   │
│ / Start game  │ WebSocket     │ Game state    │
└───────────────┴───────────────┴───────────────┘
               │
               ▼
┌───────────────────────────────────────────────┐
│ Game Engine / Database / Other Services       │
│ Pong Logic          PostgreSQL / Chat         │
└───────────────────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────┐
│ Backend Sends Updates to Frontend             │
│ Frontend Displays UI / Game                   │
└───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────-───-──────────────┐
│ Monitoring / Metrics & Logs                     │
├───────────────────────────┬───--────────────────┤
│ Prometheus (Collector)    │ Grafana (Dashboard) │
│ - Scrapes Backend/API     │ - Visualizes metrics│
│ - Scrapes Game Engine     │ - Player stats      │
│ - Scrapes Database        │ - System health     │
├─────────────-─────────────┼────────────--─----──┤
│ ELK Stack (Logs)          │ Kibana (Log Viewer) │
│ - Logstash (Processor)    │ - Search & analyze  │
│ - Elasticsearch (Storage) │ - Error tracking    │
│ - Collects app logs       │ - Debug & audit     │
├─────────────-─────────────┴────────────--─----──┤
│ Node Exporter / cAdvisor (System Metrics)       │
│ - CPU / Memory / Disk / Network                 │
└─────────────────────────────────────────-─----──┘
```

✅ **Key Points:**

1. **CI/CD + Docker** ensures every stage is automated and reproducible.
2. **Frontend, Backend, Game, Database** are clearly separated but connected.
3. **User workflow** is integrated with system architecture.
4. **Monitoring** provides live feedback on system health.

---

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
  - Password: `admin123` / `admin`
- **Prometheus**: http://localhost:9090
- **Node Exporter**: http://localhost:9100
- **cAdvisor**: http://localhost:8080

## Architecture

### Whole Project Overview
```
monitor/                # Monitoring Infrastructure
├── prometheus          # Collects metrics FROM apps!
├── grafana             # Visualizes collected metrics  
├── alertmanager        # Sends notifications
├── elasticsearch       # Stores & indexes logs (ELK)
├── kibana              # Visualizes logs (ELK)  
└── logstash/           # Processes & transforms logs (ELK)
    ├── config/         # Logstash service configuration
    └── pipeline/       # Log processing pipeline (Input→Filter→Output)

back/                   # NestJS Application  
├── prom-client         # ← Install prometheus client (bridge) HERE -> generates metrics)
├── /metrics endpoint   # Exposes metrics TO prometheus
└── logging integration # ← Send logs TO logstash (HTTP/TCP)

front/                  # Next.js Application
├── (optional metrics)  # Client-side metrics (less important)
└── (optional logging)  # Client-side error logs (less important)
```

### Cross-Application Monitoring

```
# One Monitoring Stack monitors multiple applications:

  Monitor Stack (independent)
         ↓ monitors ↓
┌──────────────────────────────┐
│ Backend (3001)  | Pong Game  │ ← monitors
│ Frontend (3000) | Web UI     │ ← monitors 
│ Database (5432)              │ ← monitors
│ Redis Cache (6379)           │ ← monitors
└──────────────────────────────┘

```

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

## Structure Enables:
1. Monitor multiple services from one place
2. Keep monitoring running during app deployments
3. Team separation -> DevOps handles monitoring, developers handle apps
4. Resource isolation -> monitoring doesn't compete with app resources


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

### Workflow/Steps Diagram:
- Complete Monitoring Architecture (Metrics + Logs):
```
                              YOUR APPLICATIONS
                    ┌─────────────────────────────────────┐
                    │  Backend (NestJS) + Frontend + Game │
                    │  - HTTP APIs      - WebSockets      │
                    │  - Authentication - Game Logic      │
                    │  - Database ops   - User sessions   │
                    └─────────────┬───────────┬───────────┘
                                  │           │
                    METRICS       │           │        LOGS
                   (numbers)      │           │    (events/text)
                                  │           │
                                  ▼           ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                    MONITORING STACK                         │
        │                                                             │
        │  ┌──────────────────┐              ┌──────────────────────┐ │
        │  │   METRICS SIDE   │              │      LOGS SIDE       │ │
        │  │                  │              │                      │ │
        │  │ ┌──────────────┐ │              │ ┌──────────────────┐ │ │
        │  │ │ Prometheus   │ │   alerts     │ │    Logstash      │ │ │
        │  │ │ :9090        │ │◄─────────────┤ │ :5000 :5044      │ │ │
        │  │ │ - Scrape     │ │              │ │ - Process logs   │ │ │
        │  │ │ - Store TSDB │ │              │ │ - Transform data │ │ │
        │  │ │ - Rules/Alert│ │              │ │ - Filter events  │ │ │
        │  │ └──────┬───────┘ │              │ └─────────┬────────┘ │ │
        │  │        │         │              │           │          │ │
        │  │        │ PromQL  │              │           │ indexed  │ │
        │  │        ▼         │              │           ▼          │ │
        │  │ ┌──────────────┐ │              │ ┌──────────────────┐ │ │
        │  │ │  Grafana     │ │              │ │  Elasticsearch   │ │ │
        │  │ │  :3000       │ │              │ │  :9200           │ │ │
        │  │ │ - Dashboards │ │              │ │ - Index logs     │ │ │
        │  │ │ - Metrics viz│ │◄─────────────┤►│ - Full-text      │ │ │
        │  │ │ - Alerts UI  │ │   combined   │ │ - Aggregations   │ │ │
        │  │ └──────────────┘ │   alerts     │ └─────────┬────────┘ │ │
        │  │                  │              │           │          │ │
        │  └──────────────────┘              │           │ queries  │ │
        │                                    │           ▼          │ │
        │  ┌──────────────────┐              │ ┌──────────────────┐ │ │
        │  │  AlertManager    │              │ │     Kibana       │ │ │
        │  │  :9093           │              │ │     :5601        │ │ │
        │  │ - Route alerts   │              │ │ - Log search     │ │ │
        │  │ - Notifications  │              │ │ - Log dashboards │ │ │
        │  │ - Email/Slack    │              │ │ - Error analysis │ │ │
        │  │ └──────────────────┘              │ └──────────────────┘ │ │
        │                                    │                      │ │
        │                                    └──────────────────────┘ │
        └─────────────────────────────────────────────────────────────┘

        UNIFIED OBSERVABILITY:
        • Metrics (Prometheus → Grafana): "WHAT happened? How much? How fast?"
        • Logs (Logstash → Elasticsearch → Kibana): "WHY did it happen? What exactly?"
        • Alerts (Both systems): Proactive notifications via AlertManager
        • Cross-correlation: Link metrics spikes to specific log events
``` 
- Metrics (prometheus + grafana): 
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

- Log (ELK):
```
 +-------------------+    HTTP POST/TCP    +---------------------------+
 | Your Applications | ------------------->|        Logstash           |
 | - Backend APIs    |   logs (JSON/text)  |  - Input (HTTP:5000)     |
 | - Frontend errors |                     |  - Input (TCP:5044)      |
 | - Game events     |                     |  - Filter & Transform     |
 | - Auth logs       |                     |  - Output to ES           |
 +-------------------+                     +------------+--------------+
          |                                             |
          | structured logs                             | parsed logs
          v                                             v
 +-------------------+                        +--------------------------+
 | File/Syslog       |                        |      Elasticsearch       |
 | - Docker logs     | ---------------------->|  - Index & store logs    |
 | - System logs     |   file beats/inputs    |  - Full-text search      |
 | - App log files   |                        |  - Aggregations          |
 +-------------------+                        |  - REST API (:9200)      |
                                              +------------+-------------+
                                                           |
                                              search & aggregate queries  
                                                           v
                                              +-------------------------+
                                              |         Kibana          |
                                              | - Discover (logs)       |
                                              | - Visualize (charts)    |
                                              | - Dashboard (overview)  |
                                              | - Alerts (watcher)      |
                                              | - Web UI (:5601)        |
                                              +-------------------------+

 Log Processing Flow:
   Application Logs -> Logstash -> Elasticsearch -> Kibana
   
 Search & Analysis:
   Kibana -> Elasticsearch -> Query Results -> Visualizations
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
├── docker-compose.yml                # Container orchestration (6 services: Prometheus+Grafana+AlertManager+ELK)
├── prometheus_config.yml             # Prometheus configuration ← Configures Prometheus server behavior
├── prometheus.yml                    # Prometheus config  
├── alert_manager.yml                 # Alert manager config
├── alert_rules.yml                   # Alert definitions/rules  
├── grafana/                          # Grafana provisioning
│   └── provisioning/
│       └── datasources/
│           ├── prometheus_data.yml   # Auto-configure Prometheus datasource ← Configures Grafana's 
│           └── prometheus.yml
└── logstash/                         # ELK Stack configuration
    ├── config/
    │   └── logstash.yml              # Logstash service configuration
    └── pipeline/
        └── logstash.conf             # Log processing pipeline (Input→Filter→Output)
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

### Setting Up Application Metrics

#### **Backend Metrics (NestJS) -> MUST**

1. **Install Prometheus Client:**
   ```bash
   cd back/
   npm install prom-client
   ```

2. **Create Metrics Module:**
   - Create `src/metrics/metrics.service.ts`    -> Handles metric collection
   - Create `src/metrics/metrics.controller.ts` -> Exposes `/metrics` endpoint
   - Create `src/metrics/metrics.module.ts`     -> NestJS module
   - Add to `app.module.ts`

3. **Key Metrics to Implement:**
   - HTTP requests (count, duration, errors)
   - Game metrics (active games, completed games, players online)
   - Authentication attempts (success/failure rates)
   - System metrics (CPU, memory - automatic)

4. **Integration Points:**
   - HTTP interceptor for automatic request tracking
   - Game service integration for game metrics
   - Auth service integration for login metrics

#### **Frontend Metrics (Next.js) - OPTIONAL**

1. **Install Dependencies:**
   ```bash
   cd front/
   npm install prom-client
   ```

2. **Create API Route:**
   - Create `/api/metrics` endpoint
   - Track page views and client-side errors

#### **Testing**
```bash
# Test backend metrics
curl http://localhost:3001/metrics

# Test in Prometheus
# Go to http://localhost:9090 and query: http_requests_total, pong_active_games
```


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

### Network Config

Ensure application can communicate with the monitoring stack:

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

## Prometheus Client & Dependencies

**Prometheus Client (`prom-client`)** is a Node.js library that enables your NestJS application to:
- **Collect metrics** (HTTP requests, response times, custom game metrics)
- **Expose metrics** via `/metrics` endpoint
- **Format data** in Prometheus-compatible format

It acts as a **bridge** between application and the Prometheus monitoring system, 
When install a Package: (```npm install prom-client```)
- package.json : Package name added to dependencies   -> ✅ Committed to Git
- package-lock.json : Exact version information saved -> ✅ Committed to Git
- node_modules/ : Actual package files downloaded     -> ❌ Ignored by Git

### Cross-Computer Development:
- ✅ Package names travel with Git repository
- ✅ Anyone can recreate the exact environment with ```npm install```
- ✅ Version-locked via ```package-lock.json``` for consistency
- ❌ Actual package files don't bloat your repository
- 🔄 Always run ```npm install``` after pulling changes that modify ```package.json```

*On computer A:*
```bash
# Install the package
npm install prom-client

# Commit the dependency info (not the files)
git add package.json package-lock.json
git commit -m
git push origin [branch-name]
```

*To another computer B:*
```bash
# Get your code changes
git pull origin [branch-name]

# Download ALL dependencies (including new ones)
npm install
```


The Flow:
```
1. Backend generates metrics    (prom-client does this)
2. Prometheus scrapes /metrics  (monitor/ does this)  
3. Grafana visualizes data      (monitor/ does this)
```


Analogy: 
```
Kitchen (Backend):
- Has sensors (prom-client) 
- Measures temperature, cooking times, orders
- Reports data: "50 orders/hour, 2min avg cook time"

Monitor Room (monitor/):  
- Collects data from kitchen sensors
- Shows graphs and alerts
- Doesn't cook food, just monitors

Dining Room (Frontend):
- Could track customer satisfaction
- Less critical than kitchen metrics
```










## test commands 

```bash
### GENERAL COMMANDS ###
# Running containers only
docker ps

# All containers (running + stopped)  
docker ps -a

# Specific project containers
docker-compose ps

# See container resource usage
docker stats

### STOP 
# Stop specific container
docker stop <container-name>

# Stop all running containers
docker stop $(docker ps -q)

# Stop docker-compose project
docker-compose down

### REMOVE ###
# Remove stopped containers
docker container prune

# Remove specific container
docker rm <container-name>

# Remove ALL stopped containers
docker rm $(docker ps -aq)


### OTHERS COMMANDS ###
# View logs
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
docker-compose -f docker-compose.monitoring.yml logs -f grafana

# Restart specific service
docker-compose -f docker-compose.monitoring.yml restart prometheus

# Stop all monitoring services
docker-compose -f docker-compose.monitoring.yml down

# Stop and remove volumes (reset data)
docker-compose -f docker-compose.monitoring.yml down -v


### CHECK PACKAGES ###
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Check what's installed
npm list

# Check for outdated packages
npm outdated

```
