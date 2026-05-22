const axios = require("axios");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

/**
 * Telegram alert sender for Socket Server.
 *
 * Sends rich alert messages to Starkenn All Alerts channel
 * + per-org channel (if configured). Media links use presigned
 * S3 URLs so videos play inline in browser — no downloads.
 *
 * NOTE: After updating this file, run in Socket-M3-main/:
 *   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */

/* ─── Config ────────────────────────────────────────── */

// TODO: Move bot token to env var for production
const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8234917910:AAE1zGbrSSFc9OvurNK9d37P4CV3W_Pu4l8";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

const DEFAULT_CHAT_ID = "-1003107230358"; // Starkenn All Alerts

const S3_BUCKET = process.env.S3_MEDIA_BUCKET || "svc-dms";
const S3_REGION = "ap-south-1";
const PRESIGNED_TTL = 604800; // 7 days — max for SigV4

const s3Client = new S3Client({ region: S3_REGION });

/* ─── MIME type map for inline display ──────────────── */

const MIME_MAP = {
  mp4: "video/mp4",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

/* ─── S3 Presigned URL Generator ────────────────────── */

/**
 * Generate a presigned S3 URL that forces inline display.
 * ResponseContentDisposition=inline ensures browser plays/shows
 * the content instead of triggering a download.
 *
 * @param {string} s3Key  - S3 object key (from payload.media.*)
 * @returns {Promise<string|null>} Presigned URL or null
 */
async function presignUrl(s3Key) {
  if (!s3Key || s3Key === "" || s3Key.startsWith("/var")) return null;

  try {
    const ext = s3Key.split(".").pop()?.toLowerCase();
    const params = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      ResponseContentDisposition: "inline",
    };

    if (MIME_MAP[ext]) {
      params.ResponseContentType = MIME_MAP[ext];
    }

    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn: PRESIGNED_TTL });
  } catch (err) {
    console.error(`presignUrl failed for key="${s3Key}":`, err.message);
    return null;
  }
}

/* ─── Build Rich Message ────────────────────────────── */

/**
 * Build the Telegram message payload (text + inline keyboard).
 *
 * @param {Object} opts
 * @param {string} opts.vehicleId    - Registration number / vehicle name
 * @param {string} opts.alertName    - Human-readable alert name (from eventName())
 * @param {string} opts.subevent     - Raw subevent code (DIS, DROW, ACC, etc.)
 * @param {string|null} opts.cabinUrl    - Presigned cabin video URL
 * @param {string|null} opts.dashCamUrl  - Presigned dashcam video URL
 * @param {string|null} opts.imageUrl    - Presigned evidence image URL
 * @param {string} opts.reason       - Alert reason text
 * @param {string} opts.timestamp    - Formatted IST timestamp string
 * @param {string} opts.org          - Organization name
 * @param {number} opts.speed        - Speed in km/hr
 * @param {string|number} opts.lat   - Latitude
 * @param {string|number} opts.lng   - Longitude
 * @returns {Object} { text, reply_markup }
 */
function buildMessage({
  vehicleId,
  alertName,
  subevent,
  cabinUrl,
  dashCamUrl,
  imageUrl,
  reason,
  timestamp,
  org,
  speed,
  lat,
  lng,
}) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const hasLocation =
    lat && lng && lat !== "0" && lng !== "0" && lat !== 0 && lng !== 0;
  const spd = parseFloat(speed) || 0;

  // ── Resolve org name ──
  const orgName =
    typeof org === "object" && org !== null
      ? org.orgName || JSON.stringify(org)
      : org || "";

  // ── Message text ──
  const lines = [
    `🔴 <b>${alertName} ALERT</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `<b>🚛 Vehicle:</b>  ${vehicleId}`,
  ];

  if (orgName) {
    lines.push(`<b>🏢 Org:</b>  ${orgName}`);
  }

  lines.push(
    ``,
    `<b>⚡ Event:</b>  ${alertName}  <code>${subevent}</code>`,
    `<b>📝 Reason:</b>  ${reason || "Event Alert"}`,
    `<b>🚀 Speed:</b>  ${spd > 0 ? spd.toFixed(1) + " km/hr" : "—"}`
  );

  if (hasLocation) {
    lines.push(`<b>📍 Location:</b>  <a href="${mapUrl}">${lat}, ${lng}</a>`);
  }

  lines.push(`<b>🕒 Time:</b>  ${timestamp}`);

  // ── Inline keyboard (media buttons) ──
  const keyboard = [];
  const row1 = [];
  const row2 = [];

  if (hasLocation) {
    row1.push({ text: "📍 Map Location", url: mapUrl });
  }
  if (cabinUrl) {
    row1.push({ text: "🎬 Cabin Video", url: cabinUrl });
  }

  if (dashCamUrl) {
    row2.push({ text: "🎬 DashCam", url: dashCamUrl });
  }
  if (imageUrl) {
    row2.push({ text: "📷 Evidence", url: imageUrl });
  }

  if (row1.length > 0) keyboard.push(row1);
  if (row2.length > 0) keyboard.push(row2);

  return {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    text: lines.join("\n"),
    reply_markup:
      keyboard.length > 0 ? { inline_keyboard: keyboard } : undefined,
  };
}

/* ─── Send to Telegram ──────────────────────────────── */

/**
 * Send alert to Starkenn All Alerts + per-org channel.
 *
 * @param {string|null} chatId     - Org-specific Telegram chat ID
 * @param {string} vehicle_id      - Vehicle registration / name
 * @param {string} alert           - Human-readable alert name
 * @param {string} subevent        - Raw subevent code (e.g. "DROW", "ACC")
 * @param {string|null} cabinKey   - S3 key for cabin video
 * @param {string|null} dashCamKey - S3 key for dashcam video
 * @param {string|null} imageKey   - S3 key for evidence image
 * @param {string} reason          - Alert reason text
 * @param {string} timestamp       - Formatted IST timestamp
 * @param {string|Object} org      - Org name (string or {orgName})
 * @param {number} spd             - Speed in km/hr
 * @param {string|number} lat      - Latitude
 * @param {string|number} lng      - Longitude
 */
const sendToTele = async (
  chatId = null,
  vehicle_id,
  alert,
  subevent,
  cabinKey,
  dashCamKey,
  imageKey,
  reason,
  timestamp,
  org,
  spd,
  lat,
  lng
) => {
  // Generate presigned URLs for all available media (parallel)
  const [cabinUrl, dashCamUrl, imageUrl] = await Promise.all([
    presignUrl(cabinKey),
    presignUrl(dashCamKey),
    presignUrl(imageKey),
  ]);

  // Build the rich message
  const msgPayload = buildMessage({
    vehicleId: vehicle_id,
    alertName: alert,
    subevent: subevent || "—",
    cabinUrl,
    dashCamUrl,
    imageUrl,
    reason,
    timestamp,
    org,
    speed: spd,
    lat,
    lng,
  });

  // Send to all target chats (default + org-specific)
  const targets = [DEFAULT_CHAT_ID];
  if (chatId) {
    targets.push(chatId.toString());
  }

  console.log("Telegram targets:", targets, "| Alert:", alert, subevent);

  for (const targetId of targets) {
    try {
      const response = await axios.request({
        method: "post",
        maxBodyLength: Infinity,
        url: TELEGRAM_API,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ ...msgPayload, chat_id: targetId }),
      });
      console.log(`Telegram sent to ${targetId}:`, response.data?.ok);
    } catch (error) {
      console.error(
        `Telegram send failed for chat ${targetId}:`,
        error.response?.data?.description || error.message
      );
    }
  }
};

module.exports = { sendToTele, presignUrl, buildMessage };
