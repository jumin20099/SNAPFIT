-- KEYS[1]  : 조회수 Key
-- ARGV[1] : TTL(초)
local count = redis.call('incr', KEYS[1])
if count == 1 then
  redis.call('expire', KEYS[1], ARGV[1])
end
return count