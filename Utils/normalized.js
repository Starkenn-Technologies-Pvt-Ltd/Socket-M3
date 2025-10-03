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

    //////////////////////////////////   ALM   /////////////////////////////////////////////////////
    if (msg.event === "ALM") {
      //Alarm Alert
      if (msg.data.alarm === 3) {
        //ALARM 3
        normalizedJSON.subevent = "ALM3";
        normalizedJSON.severity = "MEDIUM";
        normalizedJSON.reason = "ALARM 3";
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.event_status = msg.data.alarm;
        normalizedJSON.device_type = "CAS";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alarm === 2) {
        //ALARM 2
        normalizedJSON.subevent = "ALM2";
        normalizedJSON.severity = "LOW";
        normalizedJSON.reason = "ALARM 2";
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.event_status = msg.data.alarm;
        normalizedJSON.device_type = "CAS";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alarm === 1) {
        //ALARM 1
        normalizedJSON.subevent = "ALM1";
        normalizedJSON.severity = "LOW";
        normalizedJSON.reason = "ALARM 1";
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.event_status = msg.data.alarm;
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
        normalizedJSON.reason = msg.data.reason;
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
        normalizedJSON.reason = msg.data.reason;
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
      normalizedJSON.reason = msg.data.reason;
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.spd_wire = msg.data.speed;
      normalizedJSON.device_type = "CAS";

      return JSON.stringify(normalizedJSON);
    }
    //////////////////////////////////////////   LMP  ///////////////////////////////////////////
    else if (msg.event == "LMP") {
      //LIMP Mode event
      normalizedJSON.subevent = "LMP";
      normalizedJSON.severity = "HIGH";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.reason = msg.data.reason;
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.device_type = "CAS";

      return JSON.stringify(normalizedJSON);
    }
    /////////////////////////////////////      ACD    /////////////////////////////////////////////
    else if (msg.event == "ACD") {
      //accident alert
      normalizedJSON.subevent = "ACD";
      normalizedJSON.severity = "HIGH";
      normalizedJSON.event_status = msg.data.status;
      normalizedJSON.device_data = msg.data || {};
      normalizedJSON.device_type = "CAS";
      normalizedJSON.reason = "Accident Alert!";

      return JSON.stringify(normalizedJSON);
    }
    ///////////////////////////////////   NTF   ///////////////////////////////////////////////////////
    else if (msg.event == "NTF") {
      //NOTIFICATION DATA

      if (msg.notification == 1) {
        //Safe Zone
        normalizedJSON.subevent = "SAF";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Safe Zone!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 2) {
        //Harsh Acceleration
        normalizedJSON.subevent = "HRA";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Harsha Acceleration!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 3) {
        //Sudden Braking
        normalizedJSON.subevent = "SUB";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Sudden Braking!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 4) {
        //Speed Bump
        normalizedJSON.subevent = "SPB";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Speed Bump!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 5) {
        //Lane Change
        normalizedJSON.subevent = "LCH";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Lane Change!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 6) {
        //Tailgating
        normalizedJSON.subevent = "TAL";
        normalizedJSON.severity = "MEDIUM";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Tailgating!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 7) {
        //CAS Overspeed
        normalizedJSON.subevent = "CAO";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due CAS Overspeed!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 15) {
        //Sleep Alert Missed
        normalizedJSON.subevent = "SLPM";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Sleep Alert Missed!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 16) {
        //Tipper Accelerator Cut
        normalizedJSON.subevent = "TACC";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Tipper Accelerator Cut!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 17) {
        //CVN Wrong Start
        normalizedJSON.subevent = "WCVN";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Tipper CVN Wrong Start!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 18) {
        //LOAD Overload
        normalizedJSON.subevent = "LOVE";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Load Overload!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.notification == 19) {
        //Fuel Theft
        normalizedJSON.subevent = "FTH";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.event_status = msg.notification;
        normalizedJSON.spd_wire = msg.speed;
        normalizedJSON.device_type = "CAS";
        normalizedJSON.reason = "Alert due to Fuel Theft!";

        return JSON.stringify(normalizedJSON);
      } else {
        return JSON.stringify(normalizedJSON);
      }
    }
    /////////////////////////////////////  DMS  ///////////////////////////////////////////////
    else if (msg.event == "DMS") {
      //DMS Alert distribution
      if (msg.data.alert_type == "OVERSPEEDING") {
        normalizedJSON.subevent = "DMSO";
        normalizedJSON.severity = "MEDIUM";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Driver is Overspeeding!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "DISTRACTION") {
        normalizedJSON.subevent = "DIS";
        normalizedJSON.severity = "MEDIUM";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Driver is Distracted!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "DROWSINESS") {
        normalizedJSON.subevent = "DROW";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Driver is Drowsy!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "NO_DRIVER") {
        normalizedJSON.subevent = "NODR";
        normalizedJSON.severity = "LOW";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "No Driver Present!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "TRIP_START") {
        normalizedJSON.subevent = "TS";
        normalizedJSON.severity = "LOW";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Trip Start!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "SMOKING") {
        normalizedJSON.subevent = "SMO";
        normalizedJSON.severity = "LOW";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Driver is Smoking!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "YAWNING") {
        normalizedJSON.subevent = "YWN";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Driver is Yawning!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "USING_PHONE") {
        normalizedJSON.subevent = "PHO";
        normalizedJSON.severity = "LOW";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Driver is Using Phone!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.alert_type === "CALIBRATION") {
        normalizedJSON.subevent = "CAL";
        normalizedJSON.severity = "LOW";
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.media.dashCam = msg.data.dashcam;
        normalizedJSON.media.inCabin = msg.data.media;
        normalizedJSON.device_type = "DMS";
        normalizedJSON.reason = "Calibration!";

        return JSON.stringify(normalizedJSON);
      } else {
        return JSON.stringify(normalizedJSON);
      }
    }
    //////////////////////////////////////    ALC  /////////////////////////////////////////////////
    else if (msg.event == "ALC") {
      //Alcohol based alerts
      if (msg.data.result == 0) {
        //Alcohol Fail
        normalizedJSON.subevent = "ALCF";
        normalizedJSON.severity = "HIGH";
        normalizedJSON.event_status = msg.data.result;
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.media.inCabin = msg.data.vid_url;
        normalizedJSON.media.dashCam = msg.data.img_url;
        normalizedJSON.media.image = msg.data.img_url;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.device_type = "Alcohol";
        normalizedJSON.reason = "Driver alcohol test Failed!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.data.result == 1) {
        //alcohol Pass
        normalizedJSON.subevent = "ALCP";
        normalizedJSON.severity = "LOW";
        normalizedJSON.event_status = msg.data.result;
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.media.inCabin = msg.data.vid_url;
        normalizedJSON.media.dashCam = msg.data.img_url;
        normalizedJSON.media.image = msg.data.img_url;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.device_type = "Alcohol";
        normalizedJSON.reason = "Driver alcohol test Passed!";

        return JSON.stringify(normalizedJSON);
      } else if (msg.dataresult == 3) {
        //alcohol Timeout
        normalizedJSON.subevent = "ALCT";
        normalizedJSON.severity = "MEDIUM";
        normalizedJSON.event_status = msg.data.result;
        normalizedJSON.spd_wire = msg.data.speed;
        normalizedJSON.media.inCabin = msg.data.vid_url;
        normalizedJSON.media.dashCam = msg.data.img_url;
        normalizedJSON.media.image = msg.data.img_url;
        normalizedJSON.device_data = msg.data || {};
        normalizedJSON.device_type = "Alcohol";
        normalizedJSON.reason = "Driver alcohol test Timeout!";

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
      normalizedJSON.reason = "Indicator based Brake Bypass";

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
      normalizedJSON.reason = "CVN DATA";

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
      normalizedJSON.reason = "Featureset Acknowledge!";

      return JSON.stringify(normalizedJSON);
    } else if (msg.event == "LOC") {
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
      normalizedJSON.subevent = "SET";
      normalizedJSON.severity = "LOW";
      normalizedJSON.device_data = msg.data;
      normalizedJSON.event_status = msg.data.msg_status;
      normalizedJSON.reason = "Featureset Acknowledge!";

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
