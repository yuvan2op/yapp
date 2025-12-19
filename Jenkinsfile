pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE = sh(
            script: 'command -v docker-compose > /dev/null && echo "docker-compose" || echo "docker compose"',
            returnStdout: true
        ).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh "${DOCKER_COMPOSE} build"
            }
        }
        
        stage('Test') {
            steps {
                sh "${DOCKER_COMPOSE} up -d"
                sh 'sleep 10'
                sh 'curl -f http://localhost:5000/api/health || exit 1'
                sh 'curl -f http://localhost:3000/ || exit 1'
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
                sh "${DOCKER_COMPOSE} down || true"
                sh "${DOCKER_COMPOSE} up -d"
            }
        }
    }
    
    post {
        always {
            sh "${DOCKER_COMPOSE} down || true"
        }
    }
}