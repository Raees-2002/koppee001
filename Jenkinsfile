pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Raees-2002/koppee001.git'
            }
        }

        stage('Deploy HTML') {
            steps {
                sh '''
                echo "Deploying HTML files..."
                cp -r * /var/www/html/
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful'
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}
