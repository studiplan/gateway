# GQL-Gateway

all data for the app comes from here

this server builds query results from all other services

it only aggregates and formats results

## setup
> write .env file before doin this

```
git clone ... <directory>

cd <directory>

npm i

npm run dev
```

## setup db
> check your voulme path before doing this

```
docker pull neo4j

docker run \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/neo4j/data:/data \
    neo4j
```

## .env config
```
# DB config
DB_HOST=<host> (127.0.0.1)
DB_PORT=<port> (usually 7687)
DB_USER=<user> (your db user)
DB_PASS=<password> (your db password)
DB_MOCK=false (true if working without db)

# Server config
PORT=80 (server port)
PLAYGROUND=/ (gql playground path)
DEBUG=true (show debug output)
```
