const keys = require('./keys')
const redis = require('redis');

//connect to redis client w host and port from keys.js
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 //tells client if it loses connection it should retry connecting to server every 1 sec
});

//"subscription" 
const sub = redisClient.duplicate();

//function used to calculate fibanacchi values given an index
//recursive solution, its slow but gives us a better example for utilizing redis (sep worker process)
function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
};

//function that watches for anytime a new value is added to redis, runs fib function anytime there is a new value
//anytime 'on' new messgae, run callback fn w/ channel and message
sub.on('message', (channel, message) => {
    //calc fib values, insert into a hash called values w a key of 'index'
    redisClient.hset('values', message, fib(parseInt(message)));
});
//anytime someone inserts a new value into redis we take it, calc fib, then put value back into redis instance
sub.subscribe('insert');