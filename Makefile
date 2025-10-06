
# Default target
all: start

# **************************************************************************** #
#                                     START & CHECK                            #
# **************************************************************************** #

start:
	@echo "🚀 Starting Transcendence..."
	@mkdir -p monitor/logs/transcendence/backend monitor/logs/transcendence/frontend
	@cd monitor && docker-compose up -d
	@echo "[$(shell date '+%Y-%m-%d %H:%M:%S')] [SYSTEM] [INFO] Starting backend service" >> monitor/logs/transcendence/backend/backend.log
	@cd back && yarn install && yarn start:dev >> ../monitor/logs/transcendence/backend/backend.log 2>../monitor/logs/transcendence/backend/backend-error.log &
	@echo "[$(shell date '+%Y-%m-%d %H:%M:%S')] [SYSTEM] [INFO] Starting frontend service" >> monitor/logs/transcendence/frontend/frontend.log
	@cd front && yarn install && yarn dev >> ../monitor/logs/transcendence/frontend/frontend.log 2>../monitor/logs/transcendence/frontend/frontend-error.log &
# 	@echo "✅ Game started!"
### LIST INFOS AFTER ALL SERVICES ARE STARTED ###
	@echo "🎮 Game: http://localhost:3000"
	@echo "🚀 API:  http://localhost:4000"
	@echo "📝 Modern logging structure:"
	@echo "   Backend logs:       monitor/logs/transcendence/backend/"
	@echo "   Frontend logs:      monitor/logs/transcendence/frontend/"
	@echo "   Error logs separate: *-error.log files"
	@echo "   View in Kibana:     http://localhost:5601"


status:
	@echo "📊 Status:"
	@echo "Backend:" && pgrep -f "nest start" >/dev/null && echo "  ✅ Running" || echo "  ❌ Stopped"
	@echo "Frontend:" && pgrep -f "next dev" >/dev/null && echo "  ✅ Running" || echo "  ❌ Stopped"
	@echo "Monitoring:"
	@cd monitor && docker-compose ps --services --filter "status=running" | wc -l | xargs echo "  Running containers:"
	@cd monitor && docker-compose ps | grep Up | awk '{print "    " $$1}'

# **************************************************************************** #
#                                     STOP & CLEAN                             #
# **************************************************************************** #

stop:
	@echo "🛑 Stopping everything..."
	@pkill -9 -f "nest start" 2>/dev/null || true
	@pkill -9 -f "next dev" 2>/dev/null || true
	@cd monitor && docker-compose down
	@echo "✅ Everything stopped!"

clean:
	@echo "🧹 Cleaning everything..."
	@make stop
	@./cleanup.sh
	@echo "✅ Clean complete!"

# **************************************************************************** #
#                                       LOGS                                   #
# **************************************************************************** #

logs:
	@echo "📝 Modern logging view - choose a service:"
	@echo "  make logs-backend     # Backend application logs"
	@echo "  make logs-frontend    # Frontend application logs"
	@echo "  make logs-errors      # All error logs"
	@echo "  make logs-live        # Live tail of all services"

logs-backend:
	@echo "📝 Backend logs:"
	@tail -f monitor/logs/transcendence/backend/backend.log 2>/dev/null || echo "No backend logs yet"

logs-frontend:
	@echo "📝 Frontend logs:"
	@tail -f monitor/logs/transcendence/frontend/frontend.log 2>/dev/null || echo "No frontend logs yet"

logs-errors:
	@echo "📝 All error logs:"
	@echo "=== Backend Errors ==="
	@tail -n 20 monitor/logs/transcendence/backend/backend-error.log 2>/dev/null || echo "No backend errors"
	@echo "=== Frontend Errors ==="
	@tail -n 20 monitor/logs/transcendence/frontend/frontend-error.log 2>/dev/null || echo "No frontend errors"

kibana: ## Open Kibana to view logs in ELK stack
	@echo "🔍 Opening Kibana for log analysis..."
	@echo "URL: http://localhost:5601"

# logs-live: ## Live tail all services (modern monitoring)
# 	@echo "📝 Live monitoring (Ctrl+C to exit):"
# 	@tail -f monitor/logs/transcendence/backend/backend.log monitor/logs/transcendence/frontend/frontend.log 2>/dev/null


.PHONY: all start stop clean status logs logs-backend logs-frontend logs-errors logs-live kibana #help


help: ## Show available commands
# 	@echo "🏆 TRANSCENDENCE GAME WITH MONITORING"
# 	@echo "===================================="
# 	@echo ""
# 	@echo "  start           Start everything"
# 	@echo "  stop            Stop everything"
# 	@echo "  clean           Clean everything"
# 	@echo "  status          Check status"
# 	@echo "  logs            View all logs menu"
# 	@echo "  logs-backend    View backend logs"
# 	@echo "  logs-frontend   View frontend logs"
# 	@echo "  logs-errors     View all error logs"
# 	@echo "  logs-live       Live tail all services"
# 	@echo "  kibana          Open Kibana URL"
# 	@echo "  help            Show this help"
# 	@echo ""
# 	@echo "🌐 URLs:"
# 	@echo "  Game:       http://localhost:3000"
# 	@echo "  API:        http://localhost:4000"
# 	@echo "  Grafana:    http://localhost:3001"
# 	@echo "  Prometheus: http://localhost:9090"
# 	@echo "  Kibana:     http://localhost:5601"


# **************************************************************************** #
#                              COLOR SETTING                                   #
# **************************************************************************** #

COLOR_RESET = \033[0m
PINKB = \033[1;95m
REDB = \033[1;91m
ROSEB = \033[1;38;5;225m
BLUEB = \033[1;34m
BABEBLUEB = \033[1;38;5;153m
GREENB = \033[1;38;5;85m
PURPLEB = \033[1;38;5;55m
PSTL_YELLOWB = \033[1;38;2;255;253;208m
PSTL_ORGB = \033[1;38;2;255;179;102m
PSTL_PURPLEB =\033[1;38;2;204;153;255m

GREEN_BBG = \033[1;42m
BLUE_BBG = \033[1;44m
YELLOW_BBG = \033[1;43m
ORANGE_BBG = \033[1;48;5;214m