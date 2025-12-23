pipeline {
    agent any

    stages {


        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Raees-2002/koppee001.git'
            }
        }

        stage('Deploy HTML Website') {
            steps {
                sh '''
                echo "Deploying Koppee HTML website..."
                mkdir -p /var/jenkins_home/deploy
                rm -rf /var/jenkins_home/deploy/*
                cp -r * /var/jenkins_home/deploy/
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Koppee website deployed successfully'
        }
        failure {
            echo '❌ Deployment failed'
        }
    }
}