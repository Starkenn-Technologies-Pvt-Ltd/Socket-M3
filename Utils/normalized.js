const jsonNormalization = (msg) => {
  try {
    if (
      msg.td &&
      msg.td.lat &&
      msg.td.lng &&
      (msg.td.lat == 0 ||
        msg.td.lng == 0 ||
        msg.td.lat == 999 ||
        msg.td.lng == 999 ||
        msg.td.lat == null ||
        msg.td.lng == null ||
        msg.device_id === "EC0000A")
    ) {
      return "INVALID_JSON";
    }

    //Normalized JSON Format
    let normalizedJSON = {
      HMI_ID: msg.device_id || "HMI_0001A",
      HMI_Timestamp: msg.timestamp || "1672511400",
      lat: msg.td?.lat || "18.55390",
      lng: msg.td?.lng || "73.80675",
      rssi: msg.td?.rssi || 0,
      spd_gps: msg.td?.spd || "0",
      HMI_tripId: msg.trip_id || "0001",
      HMI_trip_status: msg.trip_id ? "1" : "0" || "0",
      spd_wire: msg.data?.speed || "0",
      device_id: msg.device_id || "DMS_0001A",
      device_type: "SINGLE_IoT",
      device_trip_status: msg.trip_id || "0",
      device_trip_id: msg.trip_id || "0",
      device_timestamp: msg.timestamp || "1672511400",
      igs: msg.ignition || "0",
      msg_no: msg.message || "0",
      event: msg.event || "INVALIDJSON",
      subevent: msg.event || "ALERT",
      severity: "HIGH",
      reason: "Event Alert",
      event_status: "0",
      driver_id: "0",
      driver_status: "1",
      device_data: msg.data || {},
      media: {
        dashCam: msg.data?.dashcam || "",
        inCabin: msg.data?.media || "",
        image: msg.data?.img_url || "",
      },
      JSON_DUMP: JSON.stringify(msg),
    };

    //ACC REASON CODES

    const ACCReasonCodes = {
      0: "Collision Avoidance System",
      1: "Sleep Alert",
      2: "Over Speed",
      3: "No Alarm",
      4: "Speed Pulses Absent",
      5: "Accelerator Bypassed",
      6: "Sensor Absent",
      7: "Gyroscope Absent",
      8: "HMI Absent",
      9: "RTC Error",
      10: "Brake Cylinder Error",
      11: "TPMS Absent",
      12: "OBD Absent",
      13: "RFID Absent",
      14: "Leddar Absent",
      15: "IOT Absent",
      16: "Fuel Board Absent",
      17: "DD Module Absent",
      18: "Alcohol Sensor Absent",
      19: "Temp Sensor Absent",
      20: "DMS Board Absent",
      21: "Load Board Absent",
      22: "Overload",
      23: "Fuel Theft",
      24: "Acc Cut due to drowsiness",
      25: "SdCard",
      26: "Terra Lock T",
      27: "Alcohol test",
      28: "Alcohol Speed Governer",
    };

    const LIMPReasonCodes = {
      0: "Collision Avoidance System",
      1: "Sleep Alert",
      2: "Over Speed",
      3: "No Alarm",
      4: "Speed Pulses Absent",
      5: "Accelerator Bypassed",
      6: "Sensor Absent",
      7: "Gyroscope Absent",
      8: "HMI Absent",
      9: "RTC Error",
      10: "Brake Cylinder Error",
      11: "TPMS Absent",
      12: "OBD Absent",
      13: "RFID Absent",
      14: "Leddar Absent",
      15: "IOT Absent",
      16: "Fuel Board Absent",
      17: "DD Module Absent",
      18: "Alcohol Sensor Absent",
      19: "Temp Sensor Absent",
      20: "DMS Board Absent",
      21: "Load Board Absent",
    };

    const ACD_STATUS_MAP = {
      0: "Accident Not happened",
      1: "Accident happened",
    };

    const ACD_SEVERITY_MAP = {
      0: "Light",
      1: "Strict",
    };

    const ALM_MAP = {
      3: { subevent: "ALM3", severity: "MEDIUM", reason: "ALARM 3" },
      2: { subevent: "ALM2", severity: "LOW", reason: "ALARM 2" },
      1: { subevent: "ALM1", severity: "LOW", reason: "ALARM 1" },
    };

    const NTF_MAP = {
      0: { subevent: "NTF", severity: "LOW", reason: "No notification!" },
      1: {
        subevent: "SAF",
        severity: "LOW",
        reason: "Alert due to Safe Zone!",
      },
      2: {
        subevent: "HRA",
        severity: "LOW",
        reason: "Alert due to Harsh Acceleration!",
      },
      3: {
        subevent: "SUB",
        severity: "LOW",
        reason: "Alert due to Sudden Braking!",
      },
      4: {
        subevent: "SPB",
        severity: "LOW",
        reason: "Alert due to Speed Bump!",
      },
      5: {
        subevent: "LCH",
        severity: "LOW",
        reason: "Alert due to Lane Change!",
      },
      6: {
        subevent: "TAL",
        severity: "MEDIUM",
        reason: "Alert due to Tailgating!",
      },
      7: {
        subevent: "CAO",
        severity: "LOW",
        reason: "Alert due CAS Overspeed!",
      },
      15: {
        subevent: "SLPM",
        severity: "HIGH",
        reason: "Alert due to Sleep Alert Missed!",
      },
      16: {
        subevent: "TACC",
        severity: "HIGH",
        reason: "Alert due to Tipper Accelerator Cut!",
      },
      17: {
        subevent: "WCVN",
        severity: "HIGH",
        reason: "Alert due to Tipper CVN Wrong Start!",
      },
      18: {
        subevent: "LOVE",
        severity: "HIGH",
        reason: "Alert due to Load Overload!",
      },
      19: {
        subevent: "FTH",
        severity: "HIGH",
        reason: "Alert due to Fuel Theft!",
      },
    };

    const DMS_MAP = {
      OVERSPEEDING: {
        subevent: "DMSO",
        severity: "MEDIUM",
        reason: "Driver is Overspeeding!",
      },
      DISTRACTION: {
        subevent: "DIS",
        severity: "MEDIUM",
        reason: "Driver is Distracted!",
      },
      DROWSINESS: {
        subevent: "DROW",
        severity: "HIGH",
        reason: "Driver is Drowsy!",
      },
      NO_DRIVER: {
        subevent: "NODR",
        severity: "LOW",
        reason: "No Driver Present!",
      },
      TRIP_START: {
        subevent: "TS",
        severity: "LOW",
        reason: "Trip Start!",
      },
      SMOKING: {
        subevent: "SMO",
        severity: "LOW",
        reason: "Driver is Smoking!",
      },
      YAWNING: {
        subevent: "YWN",
        severity: "HIGH",
        reason: "Driver is Yawning!",
      },
      USING_PHONE: {
        subevent: "PHO",
        severity: "LOW",
        reason: "Driver is Using Phone!",
      },
      CALIBERATION: {
        subevent: "CAL",
        severity: "LOW",
        reason: "Camera Calibration!",
      },
    };

    const ALC_MAP = {
      0: {
        subevent: "ALCF",
        severity: "HIGH",
        reason: "Driver alcohol test Failed!",
      },
      1: {
        subevent: "ALCP",
        severity: "LOW",
        reason: "Driver alcohol test Passed!",
      },
    };

    //////////////////////////////////   ALM   /////////////////////////////////////////////////////
    if (msg.event === "ALM") {
      const alarmCode = msg.data?.alarm;
      const alarmDetails = ALM_MAP[alarmCode];
      if (alarmDetails) {
        normalizedJSON.subevent = alarmDetails.subevent;
        normalizedJSON.severity = alarmDetails.severity;
        normalizedJSON.reason = alarmDetails.reason;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.spd_wire = msg.data?.speed;
        normalizedJSON.event_status = alarmCode;
        normalizedJSON.device_type = "CAS";

        return JSON.stringify(normalizedJSON);
      }
    }
    /////////////////////////////////////////  BRK //////////////////////////////////////////
    else if (msg.event === "BRK") {
      //Brake Alert Calculations
      let ttcdiff = msg.data.on_ttc - msg.data.off_ttc;
      let acd = ttcdiff / msg.data.off_ttc;
      let accSvd = acd * 100;

      if (accSvd > 50 && accSvd < 100) {
        //Accident saved alert
        normalizedJSON.subevent = "ASV";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.reason =
          msg.data.reason == 0
            ? "Accident saved due to Collision avoidance system"
            : "Accident saved due to Sleep alert missed";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.event_status = msg.data.status;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.CAS_Dashcam;
        normalizedJSON.device_type = "CAS";

        return JSON.stringify(normalizedJSON);
      } else {
        //automatic braking alert
        normalizedJSON.subevent = "AUB";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.reason =
          msg.data.reason == 0
            ? "Automatic braking due to Collision avoidance system"
            : "Automatic braking due to Sleep alert missed";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.event_status = msg.data.status;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.CAS_Dashcam;
        normalizedJSON.device_type = "CAS";

        return JSON.stringify(normalizedJSON);
      }
    }
    /////////////////////////////////////////  ACC  //////////////////////////////////////////
    else if (msg.event === "ACC") {
      //Accelerator cut
      normalizedJSON.subevent = "ACC";
      normalizedJSON.severity = "HIGH";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.spd_wire = msg.data.speed;
      normalizedJSON.device_type = "CAS";

      const reasonDetail =
        ACCReasonCodes[msg.data.reason] ||
        "Accelerator cut event code: " + msg.data.reason;

      let finalReasonText;

      if (msg.data.status == 0) {
        finalReasonText =
          "Accelerator is Turned ON due to reason: " + reasonDetail;
      } else if (msg.data.status == 1) {
        finalReasonText =
          "Accelerator is Cut OFF due to reason: " + reasonDetail;
      } else {
        finalReasonText = "Accelerator cut!!";
      }

      normalizedJSON.reason = finalReasonText;

      return JSON.stringify(normalizedJSON);
    }
    //////////////////////////////////////////   LMP  ///////////////////////////////////////////
    else if (msg.event == "LMP") {
      normalizedJSON.subevent = "LMP";
      normalizedJSON.severity = "HIGH";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.device_type = "CAS";

      const reasonDetail =
        LIMPReasonCodes[msg.data.reason] ||
        "LIMP mode event code: " + msg.data.reason;

      let finalReasonText;

      if (msg.data.status == 0) {
        finalReasonText =
          "LIMP Mode has been **Deactivated**; reason for initial entry: " +
          reasonDetail;
      } else if (msg.data.status == 1) {
        finalReasonText =
          "LIMP Mode is **Active** due to reason: " + reasonDetail;
      } else {
        finalReasonText = "LIMP Mode Event!";
      }

      normalizedJSON.reason = finalReasonText;
      return JSON.stringify(normalizedJSON);
    }
    /////////////////////////////////////      ACD    /////////////////////////////////////////////
    else if (msg.event == "ACD") {
      normalizedJSON.subevent = "ACD";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.severity = ACD_SEVERITY_MAP[msg.data.severity] || "HIGH";
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.device_type = "CAS";

      const statusText = ACD_STATUS_MAP[msg.data.status];
      const severityText = ACD_SEVERITY_MAP[msg.data.severity];

      let finalReasonText;

      if (statusText && severityText) {
        finalReasonText = `${statusText} with a severity rating of ${severityText}.`;
      } else if (statusText) {
        finalReasonText = `${statusText}. Severity code is unknown: ${msg.data.severity}`;
      } else {
        finalReasonText = `Accident Alert!: ${msg.data.status}`;
      }

      normalizedJSON.reason = finalReasonText;

      return JSON.stringify(normalizedJSON);
    }
    ///////////////////////////////////   NTF   ///////////////////////////////////////////////////////
    else if (msg.event == "NTF") {
      const notificationCode = msg.notification;
      const notificationDetails = NTF_MAP[notificationCode];

      if (notificationDetails) {
        normalizedJSON.subevent = notificationDetails.subevent;
        normalizedJSON.severity = notificationDetails.severity;
        normalizedJSON.reason = notificationDetails.reason;
        normalizedJSON.event_status = notificationCode;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";

        return JSON.stringify(normalizedJSON);
      } else {
        normalizedJSON.subevent = "NTF";
        normalizedJSON.severity = "LOW";
        normalizedJSON.reason = ` NTF notification code: ${notificationCode}`;

        return JSON.stringify(normalizedJSON);
      }
    }
    /////////////////////////////////////  DMS  ///////////////////////////////////////////////
    else if (msg.event == "DMS") {
      //DMS Alert distribution
      const alertType = msg.data?.alert_type;
      const alertDetails = DMS_MAP[alertType];

      normalizedJSON.spd_wire = msg.data?.speed;
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.device_type = "DMS";
      normalizedJSON.media.dashCam =
        msg.data?.dashcam || normalizedJSON.media.dashCam;
      normalizedJSON.media.inCabin =
        msg.data?.media || normalizedJSON.media.inCabin;

      if (alertDetails) {
        normalizedJSON.subevent = alertDetails.subevent;
        normalizedJSON.severity = alertDetails.severity;
        normalizedJSON.reason = alertDetails.reason;

        return JSON.stringify(normalizedJSON);
      } else {
        normalizedJSON.subevent = "DMS";
        normalizedJSON.severity = "LOW";
        normalizedJSON.reason = `DMS alert type: ${alertType}`;

        return JSON.stringify(normalizedJSON);
      }
    }
    //////////////////////////////////////    ALC  /////////////////////////////////////////////////
    else if (msg.event == "ALC") {
      //Alcohol based alerts
      const result = msg.data.result;
      const details = ALC_MAP[result];

      if (details) {
        normalizedJSON.subevent = details.subevent;
        normalizedJSON.severity = details.severity;
        normalizedJSON.reason = details.reason;

        normalizedJSON.event_status = result;
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.media.inCabin = msg.data.vid_url;
        normalizedJSON.media.dashCam = msg.data.img_url;
        normalizedJSON.media.image = msg.data.img_url;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.device_type = "Alcohol";

        return JSON.stringify(normalizedJSON);
      }
    }
    /////////////////////////////////////    BYP  /////////////////////////////////////////////////////
    else if (msg.event == "BYP") {
      //Indicator based Brake Bypass
      normalizedJSON.subevent = "BYP";
      normalizedJSON.severity = "LOW";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.device_data = msg.data;
      normalizedJSON.spd_wire = msg.speed;
      normalizedJSON.device_type = "CAS";
      normalizedJSON.reason = msg.data.status
        ? "Brake bypass started!!"
        : "Brake Bypass End!!" || "Brake Bypass";

      return JSON.stringify(normalizedJSON);
    }
    ///////////////////////////////////    CVN  /////////////////////////////////////////////////////
    else if (msg.event == "CVN") {
      //CVN DATA
      normalizedJSON.subevent = "CVN";
      normalizedJSON.severity = "LOW";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.device_data = msg.data;
      normalizedJSON.spd_wire = msg.speed;
      normalizedJSON.device_type = "CAS";
      normalizedJSON.reason =
        msg.data.status == 1
          ? "CVN Neutral Detected!!"
          : "CVN No Neutral!!" || "CVN DATA";

      return JSON.stringify(normalizedJSON);
    }
    ////////////////////////////////////   FLS  //////////////////////////////////////////////////
    else if (msg.event == "FLS") {
      //Fuel DATA
      normalizedJSON.subevent = "FLS";
      normalizedJSON.severity = "LOW";
      normalizedJSON.device_data = msg.data;
      normalizedJSON.spd_wire = msg.speed;
      normalizedJSON.device_type = "FUEL";
      normalizedJSON.reason = "Fuel DATA";

      return JSON.stringify(normalizedJSON);
    }
    ////////////////////////////////////    LDS   /////////////////////////////////////////////////////
    else if (msg.event == "LDS") {
      //Load DATA
      normalizedJSON.subevent = "LDS";
      normalizedJSON.severity = "LOW";
      normalizedJSON.device_data = msg.data;
      normalizedJSON.spd_wire = msg.speed;
      normalizedJSON.device_type = "LOAD";
      normalizedJSON.reason = "Load DATA";

      return JSON.stringify(normalizedJSON);
    }
    ////////////////////////////////////////  FST   //////////////////////////////////////////////////////
    else if (msg.event == "FST") {
      //featureset acknowledgement
      normalizedJSON.subevent = "FST";
      normalizedJSON.severity = "HIGH";
      normalizedJSON.status = msg.data.msg_status;
      normalizedJSON.device_data = msg.data;
      normalizedJSON.event_status = msg.data.msg_status;
      normalizedJSON.reason =
        msg.data.msg_status == 1
          ? "Featureset Acknowledged Successfully!!"
          : "Featureset Acknowledgement Failed!!" || "Featureset Acknowledge!!";

      return JSON.stringify(normalizedJSON);
    }
    //////////////////////////////////    LOC  ////////////////////////////////////////////////////
    else if (msg.event == "LOC") {
      normalizedJSON.subevent = "LOC";
      normalizedJSON.severity = "LOW";

      return JSON.stringify(normalizedJSON);
    }
    ////////////////////////////////////////    Invalid JSON      ///////////////////////////////////////////
    else if (msg.event == "JSON_Invalid") {
      normalizedJSON.subevent = "JSON_Invalid";
      normalizedJSON.severity = "LOW";
      return JSON.stringify(normalizedJSON);
    }
    ////////////////////////////////////  Alcohol Feature set acknowledgemen SET   /////////////////////////////
    else if (msg.event == "SET") {
      const FEATURE_STATUS_MAP = {
        0: "not updated",
        1: "updated",
      };

      let reasonParts = [];

      let dmsStatusText = "";
      if (msg.data && msg.data.DMS != undefined) {
        dmsStatusText = FEATURE_STATUS_MAP[msg.data.DMS];
        if (dmsStatusText) {
          reasonParts.push(`DMS Feature set ${dmsStatusText}`);
        } else {
          reasonParts.push(`DMS Feature set status code: ${msg.data.DMS}`);
        }
      }

      let alcoStatusText = "";
      if (msg.data && msg.data.Alco != undefined) {
        alcoStatusText = FEATURE_STATUS_MAP[msg.data.Alco];
        if (alcoStatusText) {
          reasonParts.push(`Alcohol Feature set ${alcoStatusText}`);
        } else {
          reasonParts.push(`Alcohol Feature set status code: ${msg.data.Alco}`);
        }
      }

      let finalReasonText;
      if (reasonParts.length > 0) {
        finalReasonText = reasonParts.join(" and ") + ".";
      } else {
        finalReasonText = "Featureset Acknowledge!";
      }

      normalizedJSON.subevent = "SET";
      normalizedJSON.severity = "LOW";
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.event_status =
        msg.data.DMS == 1 || msg.data.Alco == 1 ? 1 : 0;
      normalizedJSON.reason = finalReasonText;

      return JSON.stringify(normalizedJSON);
    }
    ///////////////////////////////////////////  IGS IGNITION  /////////////////////////////////////////////////////
    else if (msg.event == "IGS") {
      normalizedJSON.subevent = "IGS";
      normalizedJSON.severity = "LOW";

      return JSON.stringify(normalizedJSON);
    }
    //Start Trip
    else if (msg.event == "STR") {
      normalizedJSON.subevent = "STR";
      normalizedJSON.severity = "LOW";
      normalizedJSON.reason = "HMI Trip Start!";

      return JSON.stringify(normalizedJSON);
    }
    //stop trip
    else if (msg.event == "STP") {
      normalizedJSON.subevent = "STP";
      normalizedJSON.severity = "LOW";
      normalizedJSON.reason = "HMI Trip Stop!";

      return JSON.stringify(normalizedJSON);
    } else {
      return JSON.stringify(normalizedJSON);
    }
  } catch (err) {
    console.log("Error in normalizingJSON1:::", err);

    return "Failed to NormalizeJSON1:::";
  }
};

module.exports = { jsonNormalization };
