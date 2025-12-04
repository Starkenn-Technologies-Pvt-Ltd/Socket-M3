const axios = require("axios");

let messageSelector = (
  vehicle_id,
  reason,
  timestamp,
  alert,
  cabin,
  dashCam,
  image,
  org = null,
  spd,
  deviceId,
  lat,
  lng
) => {
  let msgToSend = { parse_mode: "HTML", disable_web_page_preview: true };
  if (alert == "FLOC") {
    reason = "No Speed Moment";
  }

  msgToSend.text = `<b>🚨 ${alert} Alert 🚨</b>
🚛 Vehicle : <b>${vehicle_id}</b>
📝 Reason : <b>${reason}</b>
🚀 Speed : <b>${
    spd && spd != undefined && spd != null && spd != 0 ? spd.toFixed(2) : 0
  } km/hr</b>
🕒 On : <i>${timestamp}</i>
${org ? "🏢 : " + org : ""}`;

  let media = [];

  media.push({
    text: "📍 Map",
    url: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  });

  if (cabin && cabin != "" && !cabin.startsWith("/var")) {
    media.push({
      text: "🎬 In Cabin",
      url: deviceId
        ? `https://eye.starkenn.com/event-details/${deviceId}`
        : cabin,
    });
  }

  if (dashCam && dashCam != "" && !dashCam.startsWith("/var")) {
    media.push({
      text: "🎬 DashCam",
      url: deviceId
        ? `https://eye.starkenn.com/event-details/${deviceId}`
        : dashCam,
    });
  }

  if (image && image != "" && !image.startsWith("/var")) {
    media.push({
      text: "📷 Evidence",
      url: deviceId
        ? `https://eye.starkenn.com/event-details/${deviceId}`
        : image,
    });
  }

  if (media.length > 0) {
    msgToSend.reply_markup = {
      inline_keyboard: [[...media]],
    };
  }

  return msgToSend;
};

const sendToTele = async (
  chatId = null,
  vehicle_id,
  alert,
  cabin,
  dashCam,
  image,
  reason,
  timestamp,
  org,
  spd,
  deviceId,
  lat,
  lng
) => {
  let toSend = ["-1003107230358"];

  org = org.orgName ? org.orgName : org;
  if (chatId) {
    toSend.push(chatId.toString());
  }

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.telegram.org/bot8234917910:AAE1zGbrSSFc9OvurNK9d37P4CV3W_Pu4l8/sendMessage",
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log("Chats To Send ::::", toSend, toSend.length);

  toSend.map((chatId) => {
    if (chatId == "-1003107230358") {
      axios
        .request({
          ...config,
          data: JSON.stringify({
            ...messageSelector(
              vehicle_id,
              reason,
              timestamp,
              alert,
              cabin,
              dashCam,
              image,
              org,
              spd,
              deviceId,
              lat,
              lng
            ),
            chat_id: "-1003107230358",
          }),
        })
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      axios
        .request({
          ...config,
          data: JSON.stringify({
            ...messageSelector(
              vehicle_id,
              reason,
              timestamp,
              alert,
              cabin,
              dashCam,
              image,
              null,
              spd,
              deviceId,
              lat,
              lng
            ),
            chat_id: chatId,
          }),
        })
        .then((response) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
};

module.exports = { sendToTele };
