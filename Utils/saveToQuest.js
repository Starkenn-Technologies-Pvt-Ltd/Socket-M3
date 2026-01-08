const { questDBPool } = require("./questDB");

let saveInvalidToQuest = async (message = "", topic = "") => {
  let questClient;
  try {
    questClient = await questDBPool.connect();

    // Get the max ID using a safe query
    const result = await questClient.query(
      "SELECT max(id) as max_id FROM invalid_json"
    );
    const newId = Number(result.rows?.[0]?.max_id || 0) + 1 || 1;

    // Use parameterized query to prevent SQL injection
    const questInsert = `INSERT INTO invalid_json (id, json_msg, topic, created_at) VALUES ($1, $2, $3, $4)`;
    const invalidJson = await questClient.query(questInsert, [
      newId,
      message,
      topic,
      new Date().toISOString()
    ]);

    console.log("Invalid JSON saved successfully :::", invalidJson.rowCount);
    return true;
  } catch (error) {
    console.error("Error saving invalid JSON to QuestDB:", error.message);
    return false;
  } finally {
    // Always release the connection, even if an error occurs
    if (questClient) {
      questClient.release();
    }
  }
};

let getFromQuest = async (deviceId, deviceTimestamp) => {
  console.log("Get from Quest ::::", deviceId, deviceTimestamp);
  let questClient;
  try {
    questClient = await questDBPool.connect();

    // Use parameterized query to prevent SQL injection
    const query = `SELECT id from tripdata WHERE device_id = $1 AND device_timestamp = $2`;
    const result = await questClient.query(query, [deviceId, deviceTimestamp]);

    console.log(
      "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );
    console.log("Event ID ::::: ", result.rows?.[0]);
    console.log(
      "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
    );

    return result.rows?.[0];
  } catch (e) {
    console.error("Error from QUEST ::", e.message);
    return false;
  } finally {
    // Always release the connection, even if an error occurs
    if (questClient) {
      questClient.release();
    }
  }
};
module.exports = { saveInvalidToQuest, getFromQuest };
