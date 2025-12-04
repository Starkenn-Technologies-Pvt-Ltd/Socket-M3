const eventName = (subEvent) => {
  let eventNameToSend = "";
  let color = "";
  let deviceType = "";
  if (subEvent == "NTF") {
    eventNameToSend = "Notifications";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ALM") {
    eventNameToSend = "Alarm";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ALM1") {
    eventNameToSend = "Alarm 1";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ALM2") {
    eventNameToSend = "Alarm 2";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ALM3") {
    eventNameToSend = "Alarm 3";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "BRK") {
    eventNameToSend = "Brake";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ASV") {
    eventNameToSend = "Accident Saved";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "AUB") {
    eventNameToSend = "Auto Braking";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ACC") {
    eventNameToSend = "Acceleration Cut Off";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "LMP") {
    eventNameToSend = "Limp Mode";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "ACD") {
    eventNameToSend = "Accident";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "SAF") {
    eventNameToSend = "Safe Zone";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "HRA") {
    eventNameToSend = "Harsh Acceleration";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "SUB") {
    eventNameToSend = "Sudden Braking";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "SPB") {
    eventNameToSend = "Speed Bump";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "LCH") {
    eventNameToSend = "Lane Change";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "TAL") {
    eventNameToSend = "Tailgating";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "CAO") {
    eventNameToSend = "CAS Overspeed";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "SLPM") {
    eventNameToSend = "Slip Alert Missed";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "TACC") {
    eventNameToSend = "Tipper Acelerator Cut";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "WCVN") {
    eventNameToSend = "CVN Wrong Start";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "LOVE") {
    eventNameToSend = "Load Overload";
    color = "#009D9A";
    deviceType = "LDS";
  }
  if (subEvent == "FTH") {
    eventNameToSend = "Fuel Theft";
    color = "#C89C00";
    deviceType = "FLS";
  }
  if (subEvent == "OVERSPEEDING") {
    eventNameToSend = "Overspeeding";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "DIS") {
    eventNameToSend = "Distraction";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "DROW") {
    eventNameToSend = "Drowsiness";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "NO_DRIVER") {
    eventNameToSend = "No Driver";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "TRIP_START") {
    eventNameToSend = "Trip Start";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "ALC") {
    eventNameToSend = "Alcohol";
    color = "#7E2600";
    deviceType = "ALC";
  }
  if (subEvent == "ALCF") {
    eventNameToSend = "Alcohol Fail";
    color = "#7E2600";
    deviceType = "ALC";
  }
  if (subEvent == "ALCP") {
    eventNameToSend = "Alcohol Pass";
    color = "#7E2600";
    deviceType = "ALC";
  }
  if (subEvent == "ALCT") {
    eventNameToSend = "Alcohol Test Timeout";
    color = "#7E2600";
    deviceType = "ALC";
  }
  if (subEvent == "BYP") {
    eventNameToSend = "Break Bypass";
    color = "#9050E9";
    deviceType = "CAS";
  }
  if (subEvent == "FLS") {
    eventNameToSend = "Fuel Data";
    color = "#C89C00";
    deviceType = "FLS";
  }
  if (subEvent == "LDS") {
    eventNameToSend = "Load Data";
    color = "#009D9A";
    deviceType = "LDS";
  }
  if (subEvent == "FST") {
    eventNameToSend = "Feature Set";
    color = "#9050E9";
    deviceType = "CAS";
  }

  if (subEvent == "TS") {
    eventNameToSend = "Trip Start";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "DMSO") {
    eventNameToSend = "Overspeeding";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "DMS") {
    eventNameToSend = "Calibration";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "SMO") {
    eventNameToSend = "Smoking";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "YWN") {
    eventNameToSend = "Yawning";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "PHO") {
    eventNameToSend = "Phone";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "NODR") {
    eventNameToSend = "No Driver";
    color = "#2F2CB7";
    deviceType = "DMS";
  }
  if (subEvent == "ALERT") {
    eventNameToSend = "Alert";
    color = "#2F2CB7";
    deviceType = "CAS";
  }
  if (subEvent == "CAS") {
    eventNameToSend = "Collision Avoidance System";
    color = "#F59E0B";
    deviceType = "CAS";
  }
  if (subEvent == "IGS") {
    eventNameToSend = "Ignition";
    color = "#F59E0B";
    deviceType = "CAS";
  }
  return { eventNameToSend, color, deviceType };
};

module.exports = { eventName };
// SMOKING,USING_PHONE,YAWNING  ::  Subevent :SMO,YWN,PHO
