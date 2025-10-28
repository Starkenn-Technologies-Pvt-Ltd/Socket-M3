const { questDBPool } = require("./questDB");

let saveInvalidToQuest = async (message = "", topic = "") => {
  let questClient = await questDBPool.connect();
  const result = await questClient.query(
    "SELECT max(id) as max_id FROM invalid_json"
  );
  const newId = Number(result.rows?.[0]?.max_id || 0) + 1;

  let questInsert = `INSERT INTO invalid_json (id, json_msg, topic, created_at) VALUES ('${newId}', '${message}','${topic}' ,'${new Date().toISOString()}')`;
  let invalidJson = await questClient.query(questInsert);
  console.log("Invalid JSON :::", invalidJson);
  questClient.release();
};

let getFromQuest = async (deviceId, deviceTimestamp) => {
  console.log(
    "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
  );
  console.log("Get from Quest ::::", deviceId, deviceTimestamp);

  try {
    let query = `SELECT id from tripdata WHERE device_id = '${deviceId}' AND device_timestamp = '${deviceTimestamp}';`;
    console.log(query);
    let questClient = await questDBPool.connect();
    const result = await questClient.query(query);
    console.log(result);
    questClient.release();
    console.log("Event ID ::::: ", result, " | ", result.rows?.[0]);
    console.log(
      "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );
    return result.rows?.[0].id;
  } catch (e) {
    console.log("Error from QUEST ::", e, " | ");
    console.log(
      "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );
    return false;
  }
};

module.exports = { saveInvalidToQuest, getFromQuest };
