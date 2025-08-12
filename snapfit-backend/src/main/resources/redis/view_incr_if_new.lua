-- KEYS[1] : seen set key (e.g., view:seen:{productId}:{yyyyMMdd})
-- ARGV[1] : userKey (e.g., u:{uuid} or a:{anonId})
-- ARGV[2] : ttlSeconds for the set
local added = redis.call('SADD', KEYS[1], ARGV[1])
if added == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[2])
  return 1
else
  return 0
end

