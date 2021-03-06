kubectl=$1
prefix=$2

if [ -z $kubectl ]
then
	echo 'Please provide kubectl path'
	exit 0
fi

if [ -z $prefix ]
then
	echo 'Please specify yaml folder!'
	exit 0
fi

# apply rabbitmq service
$kubectl apply -f $prefix/rabbitmq-config.yaml &&
$kubectl apply -f $prefix/rabbitmq.yaml &&
sleep 5 # make sure it set up properly

# apply redis service
$kubectl apply -f $prefix/redis-config.yaml &&
$kubectl apply -f $prefix/redis.yaml &&
sleep 3

# apply mongo service for each microservice
$kubectl apply -f $prefix/mongo-config.yaml &&
for microservice in "customer" "movie" "order" "payment"
do
	$kubectl apply -f $prefix/${microservice}-mongo.yaml
done
sleep 3

# apply all microservices
for microservice in "customer" "movie" "cart" "order" "payment"
do
	$kubectl apply -f $prefix/${microservice}.yaml
done
sleep 3

# apply ingress controller
$kubectl apply -f $prefix/ingress.yaml &&

# apply client UI
$kubectl apply -f $prefix/webapp.yaml

