# Online Movie Store

This module is to demonstrate an application built based on the microservices architecture. 

## Introduction
This module built using five different microservices with their own local storage.
The inter communication among microservices will use rabbitMQ as a message broker.
As an API gateway, this module use nginx.
The application can be deployed using Kubernetes franework.


## How to deploy
1. Using kubernetes 
```
./app_deploy.sh <kubectl command line> <folder for kubernetes yaml>
```

2. Manually
- You need to install and setup redis, rabbitmq, and mongodb (4 instances with different ports)
- Do npm start on each microservies, customer, movie, cart, order and payment
- Change config.json for respective URL
- Do npm start to activate client UI
