const socketDataToSend = (mqttPayload, redisPayload) => {
  if (mqttPayload && redisPayload) {
    let baseObject = { ...mqttPayload };
    // delete baseObject.media;
    delete baseObject.JSON_DUMP;
    delete baseObject.device_data;
    baseObject.vehicle_status = redisPayload.vehicle_Data.vehicle_status;
    baseObject.vehicle_data = redisPayload.vehicle_Data;
    return { baseObject, org_id: redisPayload.vehicle_Data.org_id };
  }
};

module.exports = { socketDataToSend };
