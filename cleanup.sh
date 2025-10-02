#!/bin/bash

echo "🧹 Disk Cleanup Script for Development Environment"
echo "=================================================="

# Function to show disk usage before and after
show_disk_usage() {
    echo "💾 Current disk usage:"
    df -h /home/yilin | tail -1
    echo ""
}

# Function to clean a directory and show space freed
clean_directory() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        local size_before=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "🗑️  Removing $description ($size_before)..."
        rm -rf "$dir"
        echo "   ✅ Removed $description"
    else
        echo "   ⏭️  $description not found, skipping"
    fi
}

echo "Starting cleanup..."
show_disk_usage

echo "1️⃣ Cleaning Node.js caches and dependencies..."

# Clean npm cache
clean_directory "/home/yilin/.npm" "npm cache"

# Clean yarn cache
clean_directory "/home/yilin/.yarn/cache" "yarn cache"

# Clean old TRANSCENDENCE project node_modules
clean_directory "/home/yilin/GITHUB/TRANSCENDENCE/node_modules" "TRANSCENDENCE root node_modules"
clean_directory "/home/yilin/GITHUB/TRANSCENDENCE/backend/node_modules" "TRANSCENDENCE backend node_modules"
clean_directory "/home/yilin/GITHUB/TRANSCENDENCE/frontend/node_modules" "TRANSCENDENCE frontend node_modules"

echo ""
echo "2️⃣ Cleaning other development caches..."

# Clean VS Code extensions cache if large
if [ -d "/home/yilin/.vscode/extensions" ]; then
    echo "📝 VS Code extensions cache size:"
    du -sh /home/yilin/.vscode/extensions
fi

# Clean Docker cache (optional - will affect containers)
echo "🐳 Docker cleanup options:"
echo "   Current Docker usage:"
if command -v docker &> /dev/null; then
    docker system df 2>/dev/null || echo "   Docker not accessible"
    
    # Show reclaimable space
    reclaimable=$(docker system df --format "table {{.Type}}\t{{.Reclaimable}}" 2>/dev/null | grep -v "TYPE" | awk '{print $2}' | grep -v "0B" | head -1 || echo "0B")
    if [ "$reclaimable" != "0B" ] && [ ! -z "$reclaimable" ]; then
        echo "   💾 Reclaimable space: $reclaimable"
    fi
    echo ""
    
    # Ask user for Docker cleanup preference
    read -p "   Do you want to clean Docker? (y/N): " docker_cleanup
    if [[ $docker_cleanup =~ ^[Yy]$ ]]; then
        echo ""
        
        # Check for monitoring containers
        echo "   � Checking for monitoring containers..."
        monitoring_containers=$(docker ps --filter "name=monitor" --format "{{.Names}}" 2>/dev/null || true)
        if [ ! -z "$monitoring_containers" ]; then
            echo "   ⚠️  Found monitoring containers running:"
            echo "$monitoring_containers" | sed 's/^/      - /'
            echo ""
            read -p "   Keep monitoring containers running? (Y/n): " keep_monitoring
            if [[ ! $keep_monitoring =~ ^[Nn]$ ]]; then
                echo "   🛡️  Will preserve monitoring containers"
                # More selective cleanup
                echo "   🛑 Cleaning only non-monitoring containers..."
                docker container prune -f 2>/dev/null || true
                # Remove only images not used by monitoring
                docker image prune -f 2>/dev/null || true
            else
                echo "   �🛑 Full Docker cleanup (will stop monitoring)..."
                docker container prune -f 2>/dev/null || true
                docker image prune -f 2>/dev/null || true
            fi
        else
            echo "   🛑 Stopping and removing old containers..."
            # Stop and remove all stopped containers
            docker container prune -f 2>/dev/null || true
            
            echo "   🗑️  Removing unused images..."
            # Remove unused images (not attached to containers)
            docker image prune -f 2>/dev/null || true
        fi
        
        echo "   🌐 Removing unused networks..."
        # Remove unused networks
        docker network prune -f 2>/dev/null || true
        
        echo "   📦 Removing unused volumes..."
        # Remove unused volumes (be careful with this!)
        docker volume prune -f 2>/dev/null || true
        
        echo "   ✅ Docker cleanup complete!"
        echo "   📊 Docker usage after cleanup:"
        docker system df 2>/dev/null || echo "   Docker not accessible"
    else
        echo "   ⏭️  Skipping Docker cleanup"
    fi
else
    echo "   ⏭️  Docker not found, skipping Docker cleanup"
fi

echo ""
echo "3️⃣ Cleanup complete!"
show_disk_usage

echo ""
echo "🎯 Next steps:"
echo "   cd /home/yilin/GITHUB/_testCHUN_transcendence2/back"
echo "   yarn install"
echo ""
echo "✨ Your monitoring stack is still running and ready to test!"
