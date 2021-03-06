#/usr/bin/env node

MONGO_OUT=/dev/null # could be &1
TIMESTAMP=`date +%s`

PORT=3014
MONGO="benchmarkTest${TIMESTAMP}"
TEST_MARKET_URL="http://localhost:$PORT"

# echo "Seeding database complete"

PORT=$PORT DB_MONGO_NAME=$MONGO NODE_ENV="benchmark" npm start &
sleep 10

ADDR_REACHED_LIMIT="0xB7d3F81E857692d13e9D63b232A90F4A1793189E"
ADDR_UNREACHED_LIMIT="0x65B74360431964f587bDcc5fE18C187DC37De286"
ADDR_CREATOR="0xB7d3F81E857692d13e9D63b232A90F4A1793189E"
CAMPAIGN_ID="0x0452e6409dfe99f14ced8b28faf12fca73e8b2c0b019d12601ed814f600ce60d"
# -c concurrency; loadtest will create a certain number of clients; this parameter controls how many. Requests from them will arrive concurrently to the server.
# --rps is request per second
# -t is ax number of seconds to wait until requests no longer go out.
# -k open connections using keep-alive: use header 'Connection: Keep-alive' instead of 'Connection: Close'.

echo "Testing /campaigns?all"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?all"
echo "Testing /campaigns  (will get only Active/~Ready)"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns"
echo "Testing getting a specific campaign"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns/$CAMPAIGN_ID"
echo "Testing /campaigns?limitForPublisher reached limit"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?all&limitForPublisher=$ADDR_REACHED_LIMIT"
echo "Testing /campaigns?limitForPublisher unreached limit"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?all&limitForPublisher=$ADDR_UNREACHED_LIMIT"
echo "Testing /campaigns?byCreator"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?all&byCreator=$ADDR_CREATOR"
echo "Testing /campaigns?byEarner"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?byEarner=$ADDR_REACHED_LIMIT"
echo "Testing getting active/ready campaigns with byEarner, limitForPublisher - reached limit"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?status=Active,Ready&byEarner=$ADDR_REACHED_LIMIT&limitForPublisher=$ADDR_REACHED_LIMIT"
echo "Testing getting active/ready campaigns with byEarner, limitForPublisher - unreached limit"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?status=Active,Ready&byEarner=$ADDR_UNREACHED_LIMIT&limitForPublisher=$ADDR_UNREACHED_LIMIT"
echo "Testing limiting 10 campaigns"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?all&limit=10"
echo "Get unhealthy campaigns - 1 total in test data"
wrk2 -t1 -c100 -d30s -R2000 --latency "$TEST_MARKET_URL/campaigns?status=Waiting"


exitCode=$?

# end all processes
pkill -P $$

if [ $exitCode -eq 0 ]; then
    echo "cleaning up DB"
    mongo $MONGO --eval 'db.dropDatabase()' >$MONGO_OUT
else
    echo -e "\033[0;31mTests failed: waiting 20s before cleaning the database (press ctrl-C to avoid cleanup)\033[0m"
    (
        sleep 20 &&
        mongo $MONGO --eval 'db.dropDatabase()' >$MONGO_OUT
    )
fi

exit $exitCode
