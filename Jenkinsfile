pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Raees-2002/koppee001.git'
            }
        }

        stage('Build') {
            steps {
                sh 'echo "Building application..."'
                sh 'npm install'   // or mvn package / gradle build
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                echo "Deploying to EC2..."
                pm2 restart app || pm2 start app.js
                '''
            }
        }
    }
}
