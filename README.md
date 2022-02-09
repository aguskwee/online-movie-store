# Online Movie Store

This module is to demonstrate an application built based on the microservices architecture. 

## Introduction
This module built using five different microservices with their own local storage.
The inter communication among microservices will use rabbitMQ as a message broker.
As an API gateway, this module uses nginx.
The application can be deployed using Kubernetes framework.

## Solution architecture

![Microservices image](https://github.com/aguskwee/online-movie-store/blob/master/client/src/images/solution-arch.png)

## How to deploy
1. Using kubernetes 

Assuming you already have all the containers / images of microservices in dockerhub or local docker repository.
Then run the following command to deploy application into kubernetes
```
./app_deploy.sh <kubectl command line> <folder for kubernetes yaml>
```

2. Manually
- You need to install and to setup redis, rabbitmq, and mongodb (4 mongo instances with different ports)
- Do npm start on each microservies, customer, movie, cart, order and payment
- Change config.json for respective URL
- Do npm start to activate client UI


## Changelogs

### version 1.0.0
* Initial commit
