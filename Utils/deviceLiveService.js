const { setRedisData, getRedisData } = require("./redisCrud");
const redis = require("./redisConnection");

function getISTDateFromTimestamp(timestamp) {
  if (!timestamp) {
    throw new Error("device_timestamp missing");
  }

  let ts = Number(timestamp);

  // Convert seconds to milliseconds
  if (ts.toString().length === 10) {
    ts = ts * 1000;
  }

  const date = new Date(ts);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid device_timestamp");
  }

  return date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  }); // YYYY-MM-DD
}

async function updateDeviceLiveData({
  device_id,
  lat,
  lng,
  spd,
  device_timestamp,
  org_id,
}) {
  const speed = spd || 0;
  const istDate = getISTDateFromTimestamp(device_timestamp);

  const key = `org:${org_id}:device:${device_id}`;
  const orgSetKey = `org:${org_id}:devices`;

  await redis.sadd(orgSetKey, device_id);

  let existing = await getRedisData(key);

  if (!existing) {
    const newData = {
      currentDate: istDate,
      start: { lat, lng, speed, timestamp: device_timestamp },
      end: { lat, lng, speed, timestamp: device_timestamp },
    };

    await setRedisData(key, JSON.stringify(newData));
    return;
  }

  existing = JSON.parse(existing);

  if (existing.currentDate !== istDate) {
    existing = {
      currentDate: istDate,
      start: { lat, lng, speed, timestamp: device_timestamp },
      end: { lat, lng, speed, timestamp: device_timestamp },
    };
  } else {
    existing.end = { lat, lng, speed, timestamp: device_timestamp };
  }

  await setRedisData(key, JSON.stringify(existing));
}

async function getLiveByDevice(org_id, device_id) {
  const key = `org:${org_id}:device:${device_id}`;
  const data = await getRedisData(key);
  return data
    ? {
        device_id,
        ...JSON.parse(data),
      }
    : null;
}

async function getLiveByOrg(org_id) {
  const orgSetKey = `org:${org_id}:devices`;
  const deviceIds = await redis.smembers(orgSetKey);

  const results = [];

  for (const id of deviceIds) {
    const data = await getRedisData(`org:${org_id}:device:${id}`);
    if (data) {
      results.push({
        device_id: id,
        ...JSON.parse(data),
      });
    }
  }

  return results;
}

module.exports = {
  updateDeviceLiveData,
  getLiveByDevice,
  getLiveByOrg,
};
