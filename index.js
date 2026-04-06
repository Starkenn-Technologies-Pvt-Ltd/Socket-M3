const { client } = require("./Utils/mqtt");
const { jsonNormalization } = require("./Utils/normalized");
const { normalizedJSON2 } = require("./Utils/normalizedJSON2");
const { getRedisData } = require("./Utils/redisCrud");
const { setRedisData, deleteRedisData } = require("./Utils/redisCrud");
const { sendNormalizedJsonToAwsIotCore } = require("./Utils/sendiotcore");
const { pool1 } = require("./Utils/MySql");
const express = require("express");
const { createServer } = require("https");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { saveInvalidToQuest, getFromQuest } = require("./Utils/saveToQuest");
const { sendToTele } = require("./Utils/sendToTelegram");
const { eventName } = require("./Utils/eventName");
const {
  getLiveByDevice,
  getLiveByOrg,
  updateDeviceLiveData,
} = require("./Utils/deviceLiveService");

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
  // Cap per-client write buffer to 5MB — disconnects slow clients instead of leaking memory
  maxHttpBufferSize: 5e6,
  perMessageDeflate: false,
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Client joins org room(s) — e.g. socket.emit("join", "1751350687650528")
  socket.on("join", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Client leaves a room
  socket.on("leave", (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/////////////////// Local JSON Cache Paths ///////////////////
const CACHE_DIR = path.join(__dirname, "cache");
const DEVICE_CACHE_FILE = path.join(CACHE_DIR, "devices.json");
const ORG_CACHE_FILE = path.join(CACHE_DIR, "orgs.json");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/////////////////// In-Memory Caches ///////////////////

// Device cache: Map<device_id, { org_id, driver_id, vehicle_name, vehicle_reg_numb, org_name, telegram_chat_id }>
const deviceCache = new Map();

// Org cache: Map<org_id, { org_name, telegram_chat_id }>
const orgCache = new Map();

// Socket (share-trip) cache — still from Redis, indexed by device_id for O(1) lookup
let socketKeysByDevice = new Map(); // Map<device_id, Array<{uid, valid_time, link_type}>>

/**
 * Sync device + org data from MySQL, save to local JSON, populate in-memory Maps.
 * Returns { deviceCount, orgCount, newDevices, newOrgs } for the stats endpoint.
 */
const syncFromMySQL = async () => {
  const startTime = Date.now();
  const prevDeviceCount = deviceCache.size;
  const prevOrgCount = orgCache.size;

  try {
    const [rows] = await pool1.query(
      `SELECT V.vehicle_id, V.org_id, V.driver_id, V.vehicle_name, V.vehicle_reg_numb,
              O.org_name, O.telegram_chat_id,
              H.HMIID
       FROM datacollect.Vehicles V
       LEFT JOIN datacollect.Org O ON O.org_id = V.org_id
       LEFT JOIN datacollect.HMI H ON H.VID = V.vehicle_id`
    );

    const newDeviceMap = {};
    const newOrgMap = {};

    for (const row of rows) {
      // Device cache keyed by HMIID (= device_id from MQTT)
      if (row.HMIID) {
        newDeviceMap[row.HMIID] = {
          vehicle_id: row.vehicle_id,
          org_id: row.org_id,
          driver_id: row.driver_id,
          vehicle_name: row.vehicle_name,
          vehicle_reg_numb: row.vehicle_reg_numb,
          org_name: row.org_name,
          telegram_chat_id: row.telegram_chat_id,
        };
      }

      // Org cache keyed by org_id (deduped naturally by object key)
      if (row.org_id) {
        newOrgMap[row.org_id] = {
          org_name: row.org_name,
          telegram_chat_id: row.telegram_chat_id,
        };
      }
    }

    // Write to local JSON files (async — doesn't block event loop)
    const { writeFile } = require("fs/promises");
    writeFile(DEVICE_CACHE_FILE, JSON.stringify(newDeviceMap)).catch((e) =>
      console.error("Failed to write device cache:", e.message)
    );
    writeFile(ORG_CACHE_FILE, JSON.stringify(newOrgMap)).catch((e) =>
      console.error("Failed to write org cache:", e.message)
    );

    // Populate in-memory Maps
    deviceCache.clear();
    for (const [k, v] of Object.entries(newDeviceMap)) {
      deviceCache.set(k, v);
    }

    orgCache.clear();
    for (const [k, v] of Object.entries(newOrgMap)) {
      orgCache.set(k, v);
    }

    const elapsed = Date.now() - startTime;
    const newDevices = deviceCache.size - prevDeviceCount;
    const newOrgs = orgCache.size - prevOrgCount;

    console.log(
      `MySQL sync complete: ${deviceCache.size} devices, ${
        orgCache.size
      } orgs in ${elapsed}ms (${
        newDevices >= 0 ? "+" : ""
      }${newDevices} devices, ${newOrgs >= 0 ? "+" : ""}${newOrgs} orgs)`
    );

    return {
      deviceCount: deviceCache.size,
      orgCount: orgCache.size,
      newDevices,
      newOrgs,
      elapsed,
    };
  } catch (err) {
    console.error("MySQL sync failed:", err.message);
    throw err;
  }
};

/**
 * Load caches from local JSON files (fast startup fallback if MySQL is slow/down).
 */
const loadFromLocalJSON = () => {
  try {
    if (fs.existsSync(DEVICE_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(DEVICE_CACHE_FILE, "utf8"));
      deviceCache.clear();
      for (const [k, v] of Object.entries(data)) {
        deviceCache.set(k, v);
      }
      console.log(`Loaded ${deviceCache.size} devices from local JSON cache`);
    }

    if (fs.existsSync(ORG_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORG_CACHE_FILE, "utf8"));
      orgCache.clear();
      for (const [k, v] of Object.entries(data)) {
        orgCache.set(k, v);
      }
      console.log(`Loaded ${orgCache.size} orgs from local JSON cache`);
    }
  } catch (err) {
    console.error("Failed to load local JSON cache:", err.message);
  }
};

/**
 * Refresh socket/share-trip keys from Redis (only cache still using Redis).
 */
const refreshSocketCache = async () => {
  try {
    const socketData = await getRedisData("socket");
    const newMap = new Map();
    if (socketData) {
      const keys = JSON.parse(socketData);
      for (const entry of keys) {
        if (!entry.device_id) continue;
        if (!newMap.has(entry.device_id)) {
          newMap.set(entry.device_id, []);
        }
        newMap.get(entry.device_id).push(entry);
      }
    }
    socketKeysByDevice = newMap;
  } catch (err) {
    console.error("Failed to refresh socket cache:", err);
  }
};

// Startup: load local JSON first (instant), then sync from MySQL in background
loadFromLocalJSON();
syncFromMySQL().catch((err) =>
  console.error("Initial MySQL sync failed, using local cache:", err.message)
);
refreshSocketCache();

// Auto refresh timers
setInterval(() => {
  syncFromMySQL().catch((err) =>
    console.error("Scheduled MySQL sync failed:", err.message)
  );
}, 6 * 60 * 60 * 1000); // Every 6 hours

setInterval(refreshSocketCache, 5 * 60 * 1000); // Every 5 minutes

///////////////////// MQTT Connection //////////////////////////////////

/**
 * Process a normalized JSON string: enrich, emit to socket, send to IoT Core.
 */
const processNormalized = (normalizedJSON, mqttmsg, topic, message) => {
  // Guard: skip invalid/error results from normalizers
  if (
    !normalizedJSON ||
    typeof normalizedJSON !== "string" ||
    normalizedJSON === "INVALID_JSON" ||
    normalizedJSON.startsWith("Failed") ||
    normalizedJSON.startsWith("failed")
  ) {
    console.log(
      "Skipping invalid normalization result:",
      normalizedJSON?.substring?.(0, 50)
    );
    return;
  }

  // Single JSON.parse — reuse this object everywhere
  let parsed;
  try {
    parsed = JSON.parse(normalizedJSON);
  } catch (e) {
    console.error("JSON.parse failed in processNormalized:", e.message);
    return;
  }

  // In-memory device lookup (ZERO latency — no Redis, no async)
  const hmiId =
    mqttmsg?.device_id || mqttmsg?.dev_id || mqttmsg?.HMI_ID || null;
  const device = hmiId ? deviceCache.get(hmiId) : null;

  if (!device && hmiId) {
    console.log(
      `[CACHE MISS] Device not in cache: ${hmiId} (raw keys: device_id=${mqttmsg?.device_id}, dev_id=${mqttmsg?.dev_id}, HMI_ID=${mqttmsg?.HMI_ID})`
    );
  } else if (!device && !hmiId) {
    // No device id at all in message — skip silently
  } else if (device && !device.org_id) {
    console.log(`[NO ORG] Device ${hmiId} has no org_id`);
  }

  if (device && device.org_id) {
    const orgId = String(device.org_id);

    // Build socket payload (strip heavy fields, add enrichment)
    const data = { ...parsed };
    delete data.JSON_DUMP;
    delete data.device_data;
    data.org_id = orgId;
    data.vehicle_name = device.vehicle_name || "";
    data.vehicle_reg_numb = device.vehicle_reg_numb || "";
    data.vehicle_data = { Registration_No: device.vehicle_reg_numb || "" };

    console.log(
      `[SOCKET] device=${hmiId} event=${data.event} subevent=${data.subevent} org=${orgId} clients=${io.engine.clientsCount}`
    );

    // Broadcast all normalized data (LOC + alerts) to the global firehose topic
    io.emit("9223372036854775807", data);

    // Socket emission based on event type
    if (data.event !== "LOC" && data.event !== "LDS" && data.event !== "FLS") {
      // Alert events → broadcast on orgIdAlert channel
      io.emit(`${orgId}Alert`, data);
    } else {
      // LOC, FLS, LDS → broadcast on orgId channel
      io.emit(orgId, data);

      if (data.event === "LOC") {
        // Update device live data (fire-and-forget)
        updateDeviceLiveData({
          device_id: data.device_id,
          lat: data.lat,
          lng: data.lng,
          spd: data.spd_wire ? data.spd_wire : data.spd_gps,
          device_timestamp: data.device_timestamp,
          org_id: orgId,
        }).catch((err) => console.error("updateDeviceLiveData error:", err));

        // FLOC: stationary vehicle (speed = 0)
        if (parseInt(data.spd_gps) === 0 || parseInt(data.spd_wire) === 0) {
          io.emit(orgId, { ...data, subevent: "FLOC" });
        }
      }
    }

    // Share-trip link handling — O(1) lookup by device_id instead of full array scan
    const deviceSocketKeys = hmiId ? socketKeysByDevice.get(hmiId) : null;
    if (deviceSocketKeys) {
      const now = Date.now();
      for (const socketVals of deviceSocketKeys) {
        if (socketVals.valid_time >= now) {
          if (
            socketVals.link_type === "alert" ||
            socketVals.link_type === "alerts"
          ) {
            io.emit(socketVals.uid, data);
          } else if (data.event === "LOC") {
            io.emit(socketVals.uid, data);
          }
        } else {
          io.emit(socketVals.uid, {
            error: true,
            message: "Link Expired",
          });
        }
      }
    }
  }

  // Enrich parsed object with vehicle_id + driver_id before sending to IoT Core
  // V2 SQS consumers need these fields — avoids MySQL lookup in Lambda
  if (device) {
    parsed.vehicle_id = device.vehicle_id
      ? String(device.vehicle_id)
      : "unknown";
    parsed.driver_id = device.driver_id ? String(device.driver_id) : "0";
    parsed.org_id = device.org_id ? String(device.org_id) : "";
  }

  // Send to IoT Core (fire-and-forget)
  sendNormalizedJsonToAwsIotCore(JSON.stringify(parsed)).catch((err) =>
    console.error("IoT Core publish error:", err.message)
  );
};

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
  });

  client.on("message", (topic, message) => {
    try {
      if (!message) {
        saveInvalidToQuest(message, topic);
        return;
      }

      const mqttmsg = JSON.parse(message);

      // Normalize then process
      // normalizedJSON2 is declared async — resolve via .then(), no await needed
      if (mqttmsg?.ver === "JSON_2.0") {
        normalizedJSON2(mqttmsg)
          .then((result) => processNormalized(result, mqttmsg, topic, message))
          .catch((err) => {
            console.error("normalizedJSON2 error:", err);
            saveInvalidToQuest(message, topic);
          });
        return;
      }

      const normalizedJSON = jsonNormalization(mqttmsg);
      processNormalized(normalizedJSON, mqttmsg, topic, message);
    } catch (err) {
      saveInvalidToQuest(message, topic);
      console.error("Error processing MQTT message:", err);
    }
  });
};

mqttTrigger();

//////////////////////// Sync Endpoint /////////////////////////////////

// GET /sync — manually trigger MySQL sync, returns stats
app.get("/sync", async (req, res) => {
  try {
    const stats = await syncFromMySQL();
    res.status(200).json({
      message: "Sync complete",
      previousDeviceCount: stats.deviceCount - stats.newDevices,
      currentDeviceCount: stats.deviceCount,
      newDevicesAdded: stats.newDevices,
      previousOrgCount: stats.orgCount - stats.newOrgs,
      currentOrgCount: stats.orgCount,
      newOrgsAdded: stats.newOrgs,
      syncTimeMs: stats.elapsed,
    });
  } catch (err) {
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
});

//////////////////////// Redis CRUD Endpoints (unchanged) /////////////////////////////////
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

//////////////////////// getDash Endpoint (unchanged) /////////////////////////////////
app.get("/getDash", async (req, res) => {
  try {
    const { orgId, deviceId } = req.query;

    if (!orgId) {
      return res.status(400).json({ message: "orgId is required" });
    }

    if (deviceId) {
      const deviceIds = deviceId.split(",");
      const results = [];

      for (const id of deviceIds) {
        const data = await getLiveByDevice(orgId, id);
        if (data) results.push(data);
      }

      return res.status(200).json({
        message: "Successfully got device data",
        data: results,
      });
    }

    const data = await getLiveByOrg(orgId);

    return res.status(200).json({
      message: "Successfully got org live data",
      data,
    });
  } catch (err) {
    console.error("Failed to get live data:", err);
    res.status(500).json({
      message: "Failed to get live data",
      error: err.message,
    });
  }
});

//////////////////////// /send-socket-data (Telegram only, no Redis) /////////////////////////////////
app.post("/send-socket-data", async (req, res) => {
  const { data } = req.body;
  try {
    if (data) {
      const TELEGRAM_SUBEVENTS = [
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
      ];

      if (TELEGRAM_SUBEVENTS.includes(data.subevent)) {
        // Get org + device info from in-memory cache (no Redis)
        const device = data.device_id ? deviceCache.get(data.device_id) : null;
        const orgId = device ? device.org_id : data.org_id;
        const registrationNo = device
          ? device.vehicle_reg_numb
          : data.device_id;
        const orgName =
          device && device.org_name ? device.org_name : orgId || "Unknown";
        const chatId =
          device && device.telegram_chat_id ? device.telegram_chat_id : null;

        // Get logId from QuestDB for media links
        let logId = null;
        const videoLink =
          data.media?.inCabin ||
          data.media?.dashCam ||
          data.media?.image ||
          null;

        if (videoLink) {
          const questResult = await getFromQuest(
            data.device_id,
            data.device_timestamp
          );
          if (questResult) {
            logId = questResult.id;
          }
        }

        console.log(
          "TELEGRAM :::",
          orgName,
          " | ",
          eventName(data.subevent).eventNameToSend
        );

        sendToTele(
          chatId,
          `${registrationNo}`,
          eventName(data.subevent).eventNameToSend,
          data.subevent,
          data.media?.inCabin || null,
          data.media?.dashCam || null,
          data.media?.image || null,
          data.reason,
          new Date(parseInt(`${data.device_timestamp}000`)).toLocaleString(
            "en-IN",
            { timeZone: "Asia/Kolkata" }
          ),
          orgName,
          data.spd_wire ? data.spd_wire : data.spd_gps ? data.spd_gps : 0,
          data.lat,
          data.lng
        );
      }

      res.status(200).json({ message: `Success` });
    } else {
      res.status(400).json({ message: "No data provided" });
    }
  } catch (err) {
    console.log("Failed to process send-socket-data:", err);
    res
      .status(500)
      .json({ message: "Failed to process send-socket-data", error: err });
  }
});

// Start the server
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
