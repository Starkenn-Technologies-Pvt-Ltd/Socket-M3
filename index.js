const { client } = require("./Utils/mqtt");
const { jsonNormalization } = require("./Utils/normalized");
const { normalizedJSON2 } = require("./Utils/normalizedJSON2");
const {
  setRedisData,
  getRedisData,
  deleteRedisData,
} = require("./Utils/redisCrud");
const { sendNormalizedJsonToAwsIotCore } = require("./Utils/sendiotcore");
const express = require("express");
const { createServer } = require("https");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const { normalizedJSON3 } = require("./Utils/normalizeJSON3");
const { socketDataToSend } = require("./Utils/socketDataToSend");
const { saveInvalidToQuest, getFromQuest } = require("./Utils/saveToQuest");
const { sendToTele } = require("./Utils/sendToTelegram");
const { eventName } = require("./Utils/eventName");

// Initialize Express app
const app = express();
const port = 5001;
app.use(cors());
app.use(express.json());

const httpServer = createServer(
  {
    key: fs.readFileSync("./privkey.pem", "utf8"),
    cert: fs.readFileSync("./cert.pem", "utf8"),
    ca: fs.readFileSync("./chain.pem", "utf8"),
    requestCert: false,
    rejectUnauthorized: false,
  },
  app
);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

///////////////////// Mqttt-- Connection//////////////////////////////////
const mqttTrigger = () => {
  client.on("connect", () => {
    console.log("Connected to MQTT!");
    client.subscribe(`#`, (err) => {
      if (err) {
        console.error("Error in subscribing to topic:", err);
      } else {
        console.log("Subscribed to the topic");
      }
    });
  }); //////////////////////  Mqtt message sent to iotcore ///////////////////////////// // Event listener for incoming MQTT messages

  client.on("message", async (topic, message) => {
    try {
      if (message) {
        let mqttmsg = JSON.parse(message);
        let normalizedJSON;
        if (mqttmsg?.ver === "JSON_2.0") {
          // Normalize using protocol 2.0
          normalizedJSON = await normalizedJSON2(mqttmsg);
          await sendNormalizedJsonToAwsIotCore(normalizedJSON);
        } else {
          // Protocol document 1 message normalization
          normalizedJSON = await jsonNormalization(mqttmsg);
          await sendNormalizedJsonToAwsIotCore(normalizedJSON);
        }
      } else {
        saveInvalidToQuest(message, topic);
      }
    } catch (err) {
      saveInvalidToQuest(message, topic);
      console.error("Error processing MQTT message:", err);
    }
  });
};

mqttTrigger(); // Initialize MQTT connection and listeners

//////////////////////// Api to setData in redis server /////////////////////////////////
app.post("/set-redis-data", async (req, res) => {
  const { key, data } = req.body;

  try {
    const result = await setRedisData(key, data);
    res.status(200).json({
      message: `JSON data for key "${key}" set successfully.`,
      redisResponse: result,
    });
  } catch (err) {
    console.log("Failed to set data in redis server!!");
    res
      .status(500)
      .json({ message: "Failed to set data in redis!!", error: err });
  }
});

// Api to get data by key from Redis
app.get("/get-redis-data/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const result = await getRedisData(key);
    res.status(200).json({ message: "Successfully got data::", data: result });
  } catch (err) {
    console.log("Failed to get data from redis server!!");
    res
      .status(500)
      .json({ message: "Failed to get data in redis!!", error: err });
  }
});

// Api to delete data from Redis by key
app.delete("/delete-redis-data/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const result = await deleteRedisData(key);
    res
      .status(200)
      .json({ message: "Successfully delete data::", data: result });
  } catch (err) {
    console.log("Failed to delete data from redis server!!");
    res
      .status(500)
      .json({ message: "Failed to delete data in redis!!", error: err });
  }
});

// API to receive Socket Data via Lambda after Rule set and broadcast over socketio
app.post("/send-socket-data", async (req, res) => {
  const { data } = req.body;
  try {
    if (data.HMI_ID) {
      let key = data.HMI_ID;
      if (key == "undefined") {
        console.log(
          "|||||||||||||||||||||||||||||||||||||||||| ",
          data,
          " |||||||||||||||||||||||||||||||||||||||||||||"
        );
      }
      console.log(
        "-----------------------------------------------------------------------"
      );
      const redisData = await getRedisData(key);
      if (redisData) {
        const orgDetails = await getRedisData("telegramOrg");
        let orgName = JSON.parse(orgDetails).filter(
          (d) => d.orgId == JSON.parse(redisData).vehicle_Data.org_id
        );
        if (orgName && orgName.length) {
          orgName = orgName[0];
        }
        const finalDataToSend = socketDataToSend(data, JSON.parse(redisData));
        console.log(
          "Final data to send ::::::::::::",
          finalDataToSend.org_id,
          " | key : ",
          key
        );
        console.log(
          "------------------------------------------------------------------------"
        );
        if (finalDataToSend.org_id) {
          if (
            data.event != "LOC" &&
            data.event != "LDS" &&
            data.event != "FLS"
          ) {
            io.timeout(5000).emit(
              `${finalDataToSend.org_id}Alert`,
              finalDataToSend.baseObject,
              (err, responses) => {
                if (err) {
                  console.error(
                    `Emit to event '${finalDataToSend.org_id}-Alert' timed out or failed.`
                  );
                } else {
                  console.log(
                    `Successfully emitted data on event '${finalDataToSend.org_id}-Alert'.`
                  );
                }
              }
            );

            if (
              [
                "LMP",
                "ALCF",
                "ACD",
                "AUB",
                "BYP",
                "ACC",
                "DROW",
                "DIS",
                "NODR",
                "DMSO",
                "CAO",
                "ALM3",
              ].includes(data.subevent)
            ) {
              let logId = null;
              let videoLink = data.media.inCabin
                ? data.media.inCabin
                : data.media.dashCam
                ? data.media.dashCam
                : data.media.image
                ? data.media.image
                : null;
              if (videoLink) {
                logId = await getFromQuest(
                  data.device_id,
                  data.device_timestamp
                );
                logId = logId.id;
              }
              console.log(
                "TELEGRAM :::",
                orgName,
                " | ",
                eventName(data.subevent).eventNameToSend
              );
              sendToTele(
                orgName.chatId ? orgName.chatId : null,
                `${JSON.parse(redisData).vehicle_Data.Registration_No}`,
                eventName(data.subevent).eventNameToSend,
                data.media.inCabin && !data.media.inCabin.startsWith("/var")
                  ? `https://svc-dms.s3.ap-south-1.amazonaws.com/${data.media.inCabin}`
                  : null,
                data.media.dashCam && !data.media.dashCam.startsWith("/var")
                  ? `https://svc-dms.s3.ap-south-1.amazonaws.com/${data.media.dashCam}`
                  : null,
                data.media.image && data.media.image.startsWith("/var")
                  ? `https://svc-dms.s3.ap-south-1.amazonaws.com/${data.media.image}`
                  : null,
                data.reason,
                // parseInt(`${data.device_timestamp}000`),
                new Date(
                  parseInt(`${data.device_timestamp}000`)
                ).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }),
                orgName ? orgName.orgName : finalDataToSend.org_id,
                data.spd_wire ? data.spd_wire : data.spd_gps ? data.spd_gps : 0,
                logId,
                data.lat,
                data.lng
              );
            }
          } else {
            if (data.event == "LOC") {
              io.timeout(5000).emit(
                `${finalDataToSend.org_id}`,
                finalDataToSend.baseObject,
                (err, responses) => {
                  if (err) {
                    console.error(
                      `Emit to event '${finalDataToSend.org_id}' timed out or failed.`
                    );
                  } else {
                    console.log(
                      `Successfully emitted data on event '${finalDataToSend.org_id}'.`
                    );
                  }
                }
              );
            }
          }
        }

        let socketkeys = await getRedisData("socket");
        socketkeys = JSON.parse(socketkeys);

        if (socketkeys.length) {
          socketkeys.map((socketVals) => {
            if (
              socketVals.device_id == JSON.parse(redisData).HMI_Id &&
              socketVals.valid_time >= new Date().getTime()
            ) {
              console.log(
                "------------------------------------|||||||||||||--------------------------------------"
              );
              console.log(
                "Share Trip Data ::::::::: ",
                socketVals.link_type,
                " :::::::::::: ",
                socketVals.valid_time >= new Date().getTime(),
                " | Topic ::::",
                socketVals.uid,
                " | "
              );
              console.log(
                "------------------------------------|||||||||||||--------------------------------------"
              );
              if (
                socketVals.link_type == "alert" ||
                socketVals.link_type == "alerts"
              ) {
                io.timeout(5000).emit(
                  socketVals.uid,
                  finalDataToSend.baseObject,
                  (err) => {
                    if (err) {
                      console.error(
                        `Emit to event '${socketVals.uid}' timed out or failed.`
                      );
                    }
                  }
                );
              } else {
                if (finalDataToSend.baseObject.event == "LOC") {
                  io.timeout(5000).emit(
                    socketVals.uid,
                    finalDataToSend.baseObject,
                    (err) => {
                      if (err) {
                        console.error(
                          `Emit to event '${socketVals.uid}' timed out or failed.`
                        );
                      }
                    }
                  );
                }
              }
            } else {
              if (
                (data.event == "LOC" && parseInt(data.spd_gps) == 0) ||
                parseInt(data.spd_wire == "0")
              ) {
                finalDataToSend.baseObject.subevent = "FLOC";
                io.timeout(5000).emit(
                  `${finalDataToSend.org_id}`,
                  finalDataToSend.baseObject,
                  (err, responses) => {
                    if (err) {
                      console.error(
                        `Emit to event '${finalDataToSend.org_id}' timed out or failed.`
                      );
                    } else {
                      console.log(
                        `Successfully emitted data on event '${finalDataToSend.org_id}'.`
                      );
                    }
                  }
                );
              }

              if (socketVals.validTime <= new Date().getTime()) {
                io.timeout(5000).emit(
                  socketVals.uid,
                  { error: true, message: "Link Expired" },
                  (err) => {
                    if (err) {
                      console.error(
                        `Emit to event '${eventName}' timed out or failed.`
                      );
                    }
                  }
                );
              }
            }
          });
        }
      }

      res.status(200).json({
        message: `Success`,
      });
    }
  } catch (err) {
    console.log("Failed to send data on socket !!", err);
    res
      .status(500)
      .json({ message: "Failed to send data on socket!!", error: err });
  }
});
// Start the server and listen for incoming requests
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
