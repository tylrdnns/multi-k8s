docker build -t tylrdnns/multi-client:latest -t tylrdnns/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t tylrdnns/multi-server:latest -t tylrdnns/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t tylrdnns/multi-worker:latest -t tylrdnns/multi-worker:$SHA -f ./worker/Dockerfile ./worker
docker push tylrdnns/multi-client:latest
docker push tylrdnns/multi-server:latest
docker push tylrdnns/multi-worker:latest

docker push tylrdnns/multi-client:$SHA
docker push tylrdnns/multi-server:$SHA
docker push tylrdnns/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployment/server-deployment server=tylrdnns/multi-server:$SHA
kubectl set image deployment/client-deployment client=tylrdnns/multi-client:$SHA
kubectl set image deployment/worker-deployment worker=tylrdnns/multi-worker:$SHA