pipeline {
    agent any
        
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    npm test --workspaces --if-present
                    npm run build --workspace client
                '''
            }
        }

        stage('Build & Deploy') {
            steps {
                sh '''
                    docker-compose down || true
                    docker-compose build
                    docker-compose up -d
                '''
            }
        }
    }
}