# End-to-End Automated Blue–Green Deployment with AWS ALB

This document contains **everything required** to build, deploy, verify, and operate a **production-grade blue–green deployment** using AWS EC2, ALB, GitHub Actions, ECR, CloudWatch, and Lambda.

It is written as a **step-by-step runbook + documentation** and can be used for:

* learning
* interviews
* real production setups
* handover to another engineer

---

# TABLE OF CONTENTS

1. Architecture Overview
2. Tools & Services Used
3. Application Requirements
4. Infrastructure Setup (EC2, ALB, Target Groups)
5. Security Groups
6. ECR Setup
7. CI/CD Automation (GitHub Actions)
8. Blue–Green Deployment Logic
9. Automatic Rollback (CloudWatch + Lambda)
10. Verification & Testing
11. Manual Rollback (Emergency)
12. Logging & Monitoring
13. GitHub Secrets Reference
14. How to Run Locally
15. Common Issues & Fixes
16. Final Checklist

---

# 1. Architecture Overview

```
User
  |
  v
Application Load Balancer (ALB)
  |
  |-- Listener :80 (forwards to ONE target group)
  |
  |--> blue-tg  --> Blue EC2 (Docker app)
  |--> green-tg --> Green EC2 (Docker app)

GitHub Actions
  |
  |--> Build Docker image
  |--> Push to ECR
  |--> Deploy to idle EC2
  |--> Health check
  |--> Switch ALB listener

CloudWatch Alarm
  |
  |--> Triggers Lambda rollback

Lambda
  |
  |--> Switches ALB back to BLUE
```

---

# 2. Tools & Services Used

| Category      | Tool           |
| ------------- | -------------- |
| SCM           | GitHub         |
| CI/CD         | GitHub Actions |
| Container     | Docker         |
| Registry      | Amazon ECR     |
| Compute       | EC2            |
| Load Balancer | ALB            |
| Monitoring    | CloudWatch     |
| Rollback      | Lambda         |
| Automation    | AWS CLI        |

---

# 3. Application Requirements

The application must:

* Run on **port 3000**
* Expose `/health` returning **200 OK**
* Show version in UI (for verification)
* Be Dockerized

Example health endpoint:

```bash
curl http://localhost:3000/health
```

---

# 4. Infrastructure Setup (One-Time)

## 4.1 Create EC2 Instances

Create two EC2 instances:

* blue-ec2
* green-ec2

Install Docker on both:

```bash
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

Logout and login again.

---

## 4.2 Create Target Groups

Create **two target groups**:

### blue-tg

* Type: Instance
* Port: 3000
* Health path: /health
* Register: blue EC2

### green-tg

* Type: Instance
* Port: 3000
* Health path: /health
* Register: green EC2

---

## 4.3 Create ALB and Listener

Create Application Load Balancer:

* Internet-facing
* 2 public subnets

Create listener:

```
Port: 80
Default action: forward to blue-tg
```

IMPORTANT: Only **one target group is attached at a time**.

---

# 5. Security Groups

## ALB Security Group

```
Allow HTTP 80 from 0.0.0.0/0
```

## EC2 Security Group

```
Allow TCP 3000 from ALB SG only
```

---

# 6. ECR Setup

Create ECR repository:

```
coffee001
```

Attach IAM role to EC2:

```
AmazonEC2ContainerRegistryReadOnly
```

---

# 7. CI/CD Automation (GitHub Actions)

## 7.1 GitHub Secrets

Add these secrets:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
ECR_REPO
ALB_LISTENER_ARN
BLUE_TG_ARN
GREEN_TG_ARN
BLUE_EC2_IP
GREEN_EC2_IP
EC2_SSH_KEY
```

---

## 7.2 CI/CD Flow

```
Push to main
  ↓
Build Docker image
  ↓
Push to ECR
  ↓
Detect active target group
  ↓
Deploy to idle EC2
  ↓
Health check
  ↓
Switch ALB listener
```

---

# 8. Blue–Green Deployment Logic

* Two environments: blue & green
* Only one is live at a time
* New version deploys to idle environment
* Health check gate protects users
* ALB listener is switched

---

# 9. Automatic Rollback (CloudWatch + Lambda)

## 9.1 Lambda IAM Role

Permissions:

```
elasticloadbalancing:ModifyListener
elasticloadbalancing:DescribeListeners
```

---

## 9.2 Lambda Function

```python
import boto3
import os

elbv2 = boto3.client('elbv2')

def lambda_handler(event, context):
    elbv2.modify_listener(
        ListenerArn=os.environ['LISTENER_ARN'],
        DefaultActions=[{
            'Type': 'forward',
            'TargetGroupArn': os.environ['BLUE_TG_ARN']
        }]
    )
```

Environment variables:

```
LISTENER_ARN
BLUE_TG_ARN
```

---

## 9.3 CloudWatch Alarm

Metric:

```
UnHealthyHostCount >= 1
TargetGroup = green-tg
```

Action:

```
Invoke Lambda alb-auto-rollback
```

---

# 10. Verification & Testing

## Verify deployment

```bash
curl http://<ALB_DNS>
```

## Verify health

```bash
curl http://localhost:3000/health
```

## Verify rollback

```bash
docker stop app
```

Expected:

* Alarm fires
* Lambda runs
* ALB switches to blue

---

# 11. Manual Rollback (Emergency)

```bash
aws elbv2 modify-listener \
  --listener-arn <LISTENER_ARN> \
  --default-actions Type=forward,TargetGroupArn=<BLUE_TG_ARN>
```

---

# 12. Logging & Monitoring

* Docker logs:

```bash
docker logs app
```

* Lambda logs:

```
CloudWatch → /aws/lambda/alb-auto-rollback
```

* ALB target health monitoring

---

# 13. How to Run Locally

```bash
docker build -t app .
docker run -p 3000:3000 app
```

---

# 14. Common Issues & Fixes

| Issue              | Fix                              |
| ------------------ | -------------------------------- |
| 502 error          | Check SG, port 3000, health path |
| Target unhealthy   | Ensure app binds 0.0.0.0         |
| Lambda not running | Check IAM + env vars             |
| No rollback        | Check alarm action               |

---

# 15. Final Checklist

✔ Zero downtime deploy
✔ Auto rollback works
✔ CI/CD fully automated
✔ ALB listener switches
✔ Monitoring enabled
✔ Logs available

---

# 16. Final Result

This project demonstrates:

* Real DevOps architecture
* Production deployment strategy
* High availability
* Automated recovery
* AWS best practices


