import Redis from 'ioredis';

const redis=new Redis({
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT?parseInt(process.env.REDIS_PORT):12095,
    password:process.env.REDIS_PASSWORD,
})

export default redis;