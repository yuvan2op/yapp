pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        NODE_VERSION = '20'
        DOCKER_COMPOSE_CMD = 'docker-compose'
    }
    
    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }
    
    stages {
        stage('Setup') {
            steps {
                script {
                    echo "🔧 Setting up build environment..."
                    
                    // Detect docker-compose command
                    sh '''
                        if command -v docker-compose &> /dev/null; then
                            echo "docker-compose" > docker_cmd.txt
                        elif docker compose version &> /dev/null; then
                            echo "docker compose" > docker_cmd.txt
                        else
                            echo "❌ Neither docker-compose nor docker compose found"
                            exit 1
                        fi
                    '''
                    env.DOCKER_COMPOSE_CMD = readFile('docker_cmd.txt').trim()
                    echo "✅ Using Docker Compose command: ${DOCKER_COMPOSE_CMD}"
                    
                    // Check for Node.js and npm
                    sh '''
                        set +e
                        NODE_PATH=$(command -v node 2>/dev/null)
                        set -e
                        
                        if [ -z "$NODE_PATH" ]; then
                            echo "❌ Node.js is not installed on this Jenkins agent."
                            echo "📋 Please install Node.js ${NODE_VERSION} using one of these methods:"
                            echo "   1. Install via Jenkins Global Tool Configuration (Manage Jenkins > Tools)"
                            echo "   2. Install manually on the agent: curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo bash - && sudo apt-get install -y nodejs"
                            echo "   3. Use a Docker agent with Node.js pre-installed"
                            exit 1
                        fi
                        
                        node_version=$(node --version 2>/dev/null || echo "unknown")
                        npm_version=$(npm --version 2>/dev/null || echo "unknown")
                        echo "✅ Node.js found at: $NODE_PATH"
                        echo "✅ Node.js ${node_version} and npm ${npm_version} are available"
                    '''
                }
            }
        }
        
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Checking out source code from repository..."
                    checkout scm
                    sh 'git rev-parse HEAD > .git/commit-id'
                    def commitId = readFile('.git/commit-id').trim()
                    echo "✅ Checkout complete. Commit: ${commitId}"
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Install Dependencies') {
                    steps {
                        script {
                            echo "📦 Installing root dependencies..."
                            sh 'npm ci --prefer-offline --no-audit'
                            
                            echo "📦 Installing API dependencies..."
                            sh 'cd api && npm ci --prefer-offline --no-audit'
                            
                            echo "📦 Installing Client dependencies..."
                            sh 'cd client && npm ci --prefer-offline --no-audit'
                            
                            echo "✅ All dependencies installed successfully"
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "🏗️  Building React frontend..."
                            sh 'cd client && npm run build'
                            
                            script {
                                def buildDir = 'client/dist'
                                if (fileExists(buildDir)) {
                                    def files = sh(script: "find ${buildDir} -type f | wc -l", returnStdout: true).trim()
                                    echo "✅ Frontend build complete. Generated ${files} files"
                                } else {
                                    error("❌ Frontend build failed: dist directory not found")
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    echo "🐳 Building Docker images..."
                    sh "${DOCKER_COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} build --no-cache"
                    echo "✅ Docker images built successfully"
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('API Health Check') {
                    steps {
                        script {
                            echo "🧪 Starting containers for testing..."
                            sh "${DOCKER_COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} up -d"
                            
                            echo "⏳ Waiting for services to be ready..."
                            sh 'sleep 10'
                            
                            echo "🔍 Testing API health endpoint..."
                            retry(5) {
                                sh '''
                                    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")
                                    if [ "$response" != "200" ]; then
                                        echo "❌ API health check failed. Response code: $response"
                                        exit 1
                                    fi
                                    echo "✅ API health check passed"
                                '''
                            }
                            
                            echo "🔍 Testing API root endpoint..."
                            retry(3) {
                                sh '''
                                    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ || echo "000")
                                    if [ "$response" != "200" ]; then
                                        echo "❌ API root endpoint check failed. Response code: $response"
                                        exit 1
                                    fi
                                    echo "✅ API root endpoint check passed"
                                '''
                            }
                            
                            echo "🔍 Testing Frontend..."
                            retry(3) {
                                sh '''
                                    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
                                    if [ "$response" != "200" ]; then
                                        echo "❌ Frontend check failed. Response code: $response"
                                        exit 1
                                    fi
                                    echo "✅ Frontend check passed"
                                '''
                            }
                        }
                    }
                }
                
                stage('Docker Image Validation') {
                    steps {
                        script {
                            echo "🔍 Validating Docker images..."
                            sh '''
                                if ! docker images | grep -q "yapp-api"; then
                                    echo "❌ API Docker image not found"
                                    exit 1
                                fi
                                if ! docker images | grep -q "yapp-client"; then
                                    echo "❌ Client Docker image not found"
                                    exit 1
                                fi
                                echo "✅ All Docker images validated"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    echo "🚀 Starting deployment to production..."
                    
                    echo "🛑 Stopping existing containers..."
                    sh "${DOCKER_COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} down || true"
                    
                    echo "🚀 Starting new containers..."
                    sh "${DOCKER_COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} up -d"
                    
                    echo "⏳ Waiting for services to be ready..."
                    sh 'sleep 15'
                    
                    echo "🔍 Verifying deployment..."
                    retry(5) {
                        sh '''
                            api_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")
                            frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
                            
                            if [ "$api_status" != "200" ]; then
                                echo "❌ API deployment verification failed. Status: $api_status"
                                exit 1
                            fi
                            
                            if [ "$frontend_status" != "200" ]; then
                                echo "❌ Frontend deployment verification failed. Status: $frontend_status"
                                exit 1
                            fi
                            
                            echo "✅ Deployment verified successfully"
                            echo "   - API: http://localhost:5000 (Status: $api_status)"
                            echo "   - Frontend: http://localhost:3000 (Status: $frontend_status)"
                        '''
                    }
                    
                    echo "✅ Deployment completed successfully"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up test containers..."
                sh "${DOCKER_COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} down || true"
            }
        }
        success {
            echo "✅ Pipeline completed successfully!"
            script {
                def commitId = readFile('.git/commit-id').trim()
                echo "📝 Build successful for commit: ${commitId}"
            }
        }
        failure {
            echo "❌ Pipeline failed!"
            script {
                echo "📋 Collecting logs for debugging..."
                sh "${DOCKER_COMPOSE_CMD} -f ${DOCKER_COMPOSE_FILE} logs --tail=50 || true"
            }
        }
        cleanup {
            cleanWs()
        }
    }
}

