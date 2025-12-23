pipeline {
  agent any

  stages {
    stage('Clone Repo') {
      steps {
        git 'https://github.com/Raees-2002/koppee001.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t jenkins-k8s-demo:latest .'
      }
    }
  }
}
