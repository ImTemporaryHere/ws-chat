docker-compose -f docker-compose.dev.yml --env-file=envs/docker/docker.env.dev up redis db -d

nx run users-service:serve:local
nx run chat-service:serve:local


vus=1000 nx create-users load-test
then use
vus=10 nx ws load-test

