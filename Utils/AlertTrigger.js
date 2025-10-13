const ChecknNotify = (allData) => {
  // Get message
  // Check any Alert trigger
  // If yes, check conditions and update Redis + add record in QuestDB + Call Email/Whatsapp
  // If no - Do Nothing
  if (allData.Alert_Triggers.length) {
    if (allData.Alert_Triggers.length > 1) {
      if (allData.Alert_Triggers[0].triggerId) {
      }
    }
  }
};

module.exports = { ChecknNotify };

// allData =
// {
//     "data": {
//         "HMI_ID": "HMI_0001A",
//         "HMI_Timestamp": 1757476904,
//         "lat": "22.140535",
//         "lng": "85.501762",
//         "rssi": "9",
//         "spd_gps": "11.056440",
//         "HMI_tripId": "0001",
//         "HMI_trip_status": "0",
//         "spd_wire": "0",
//         "device_id": "HMI_0001A",
//         "device_type": "SINGLE_IoT",
//         "device_trip_status": "0",
//         "device_trip_id": "0",
//         "device_timestamp": 1757476904,
//         "igs": "1",
//         "msg_no": "13",
//         "event": "LOC",
//         "subevent": "LOC",
//         "severity": "LOW",
//         "reason": "Event Alert",
//         "event_status": "0",
//         "driver_id": "0",
//         "driver_status": "1",
//         "device_data": {},
//         "media": {
//             "dashCam": "",
//             "inCabin": "",
//             "image": ""
//         },
//         "JSON_DUMP": "{\"device_id\":\"EC0208A\",\"event\":\"LOC\",\"message\":\"13\",\"timestamp\":1757476904,\"ignition\":\"1\",\"td\":{\"utc\":\"040144.000\",\"dv\":\"A\",\"lat\":\"22.140535\",\"lng\":\"85.501762\",\"spd\":\"11.056440\",\"date\":\"100925\",\"nsv\":\"-548512504\",\"alogn\":\"999.000000\",\"alat\":\"22.140535\",\"alng\":\"85.501762\",\"rssi\":\"9\"},\"chksm\":\"0\"}"
//     },
//     data2 :{
//     HMI_Id: "DMS_0110A",
//     vehicle_Data: {
//       Registration_No: "MH 33 T 5168",
//       vehicle_id: "10",
//       Devices_assigned: { DMS: "DMS_0110A" },
//       vehicle_status: "Idle",
//       org_id: "1751350687650528",
//     },
//     Location_data: {
//       lat: "19.467667",
//       lng: "80.009148",
//       spd_gps: "0",
//       timestamp: 1757917343,
//       geofence: [{}],
//       last_geofence: [{}],
//     },
//     Geofence_Data: { assigned_Geofence: [30], last_Geofence: [] },
//     Alert_Triggers: {
//       subeventList: ["Route", "DIS", "DROW", "Geofence"],
//       AlerttriggersList: [
//         { subevent: "Route", Phone: ["7089653421"], Email: ["kk@gmail.com"] },
//         { subevent: "DIS", Phone: ["6543245678"], Email: ["kk@gmail.com"] },
//         {
//           subevent: "DROW",
//           Phone: ["7654565434"],
//           Email: ["kunal@starkenn.com"],
//         },
//         {
//           subevent: "Geofence",
//           Phone: ["7876787654"],
//           Email: ["kunal@starkenn.com"],
//         },
//       ],
//     },
//     Alerts_Data: {},
//     Driver_Details: {
//       driver_id: "1753165961050933",
//       verified: "0",
//       last_alc_test: null,
//       result: "0",
//     },
//     JSON_DUMP: {},
//     alerts_details: {
//       LOC: 1757917343,
//       LOCjson:
//         "{'device_health':{'cpu_load':78,'cpu_temp':47,'driver_status':1,'memory':311},'device_id':'DMS_0110A','event':'LOC','ignition':1,'message':13,'td':{'alat':'19.467667','alng':'80.009148','date':'20250915','dv':'A','lat':'19.467667','lng':'80.009148','nsv':'1','rssi':'17','spd':'0','utc':'062223'},'timestamp':1757917343,'trip_id':'20250915101926'}",
//       ALM1: null,
//       ALM1json: null,
//       ALM2: null,
//       ALM2json: null,
//       ASV: null,
//       ASVjson: null,
//       AUB: 1757907721,
//       AUBjson:
//         "{'data':{'CAS_Dashcam':'dashcam_1114_20240404_132329.mp4','bypass':0,'object':2,'off_pneumatic_pressure':0,'off_rel_velocity':-9.5,'off_speed':34,'off_steering_angle':0,'off_timestamp':1757907791,'off_ttc':653.3599853515625,'off_x_axis':26.799999237060547,'off_y_axis':1.343999981880188,'on_pneumatic_pressure':9,'on_rel_velocity':-9.800000190734863,'on_speed':34,'on_steering_angle':0,'on_timestamp':1757907789,'on_ttc':127,'on_x_axis':12.399999618530273,'on_y_axis':0.9599999785423279,'reason':0,'speed':34,'status':0},'device_id':'DMS_0110A','event':'BRK','ignition':1,'message':6,'td':{'alat':'19.478834','alng':'80.022051','date':'20250915','dv':'A','lat':'19.478834','lng':'80.022051','nsv':'1','rssi':'28','spd':'16','utc':'034306'},'timestamp':1757907721,'trip_id':'20250915005219'}",
//       ACC: null,
//       ACCjson: null,
//       LMP: null,
//       LMPjson: null,
//       ACD: null,
//       ACDjson: null,
//       SAF: null,
//       SAFjson: null,
//       HRA: null,
//       HRAjson: null,
//       SUB: null,
//       SUBjson: null,
//       SPB: null,
//       SPBjson: null,
//       LCH: null,
//       LCHjson: null,
//       TAL: 1757435898,
//       TALjson:
//         "{'device_id':'DMS_0110A','event':'NTF','ignition':1,'message':11,'notification':6,'speed':33,'td':{'alat':'19.684330','alng':'79.769056','date':'20250909','dv':'A','lat':'19.684330','lng':'79.769056','nsv':'1','rssi':'30','spd':'36','utc':'163818'},'timestamp':1757435898,'trip_id':'20250909204532'}",
//       CAO: null,
//       CAOjson: null,
//       SLPM: null,
//       SLPMjson: null,
//       TACC: null,
//       TACCjson: null,
//       WCVN: null,
//       WCVNjson: null,
//       LOVE: null,
//       LOVEjson: null,
//       FTH: null,
//       FTHjson: null,
//       BYP: 1757495903,
//       BYPjson:
//         "{'data':{'status':0,'timestamp':1757495911},'device_id':'DMS_0110A','event':'BYP','ignition':1,'message':38,'speed':19,'td':{'alat':'19.679798','alng':'79.796700','date':'20250910','dv':'A','lat':'19.679798','lng':'79.796700','nsv':'1','rssi':'31','spd':'21','utc':'091823'},'timestamp':1757495903,'trip_id':'20250910133210'}",
//       CVN: null,
//       CVNjson: null,
//       LDS: null,
//       LDSjson: null,
//       FLS: null,
//       FLSjson: null,
//       ALCP: 1757912482,
//       ALCPjson:
//         "{'data':{'Acc_cut_status':0,'BAC':0.003000000026077032,'img_url':'im_DMS_0110A__0877_20250915_103122.jpg','result':1,'speed':0,'vid_url':'vi_DMS_0110A__1602_20250915_103122.mp4'},'device_id':'DMS_0110A','event':'ALC','ignition':1,'message':51,'td':{'alat':'19.467490','alng':'80.009204','date':'20250915','dv':'A','lat':'19.467490','lng':'80.009204','nsv':'1','rssi':'20','spd':'0','utc':'050900'},'timestamp':1757912482,'trip_id':'20250915101926'}",
//       ALCF: null,
//       ALCFjson: null,
//       ALCT: null,
//       ALCTjson: null,
//       DMSO: 1757083444,
//       DMSOjson:
//         "{'data':{'alert_id':'20250905201404','alert_type':'OVERSPEEDING','dashcam':'/var/www/html/media/dashcam_1030_20240402_014344.mp4','media':'/var/www/html/media/im_DMS_0110A_OS_0780_20250905_201406.jpg','severity':'Low','speed':57},'device_id':'DMS_0110A','event':'DMS','ignition':1,'message':12,'td':{'alat':'0','alng':'0','date':'20250905','dv':'A','lat':'20.005402','lng':'79.237851','nsv':'1','rssi':'30','spd':'57','utc':'144404'},'timestamp':1757083444,'trip_id':'20250905164122'}",
//       DIS: 1757905280,
//       DISjson:
//         "{'data':{'alert_id':'20250915083120','alert_type':'DISTRACTION','dashcam':'dashcam_1113_20240404_124251.mp4','media':'vi_DMS_0110A_DS_1601_20250915_083122.mp4','severity':'HIGH_SEVERITY','speed':37},'device_id':'DMS_0110A','event':'DMS','ignition':1,'message':12,'td':{'alat':'0','alng':'0','date':'20250915','dv':'A','lat':'19.522915','lng':'80.175868','nsv':'1','rssi':'14','spd':'37','utc':'030120'},'timestamp':1757905280,'trip_id':'20250915005219'}",
//       DROW: 1757905022,
//       DROWjson:
//         "{'data':{'alert_id':'20250915082702','alert_type':'DROWSINESS','dashcam':'dashcam_1112_20240404_123833.mp4','media':'vi_DMS_0110A_DW_1600_20250915_082704.mp4','severity':'HIGH_SEVERITY','speed':27},'device_id':'DMS_0110A','event':'DMS','ignition':1,'message':12,'td':{'alat':'0','alng':'0','date':'20250915','dv':'A','lat':'19.534944','lng':'80.186816','nsv':'1','rssi':'21','spd':'27','utc':'025702'},'timestamp':1757905022,'trip_id':'20250915005219'}",
//       NODR: null,
//       NODRjson: null,
//       TS: 1757877739,
//       TSjson:
//         "{'data':{'alert_id':'20250915005219','alert_type':'TRIP_START','dashcam':'','media':'im_DMS_0110A_TS_0874_20250915_005456.jpg','severity':'Low','speed':0},'device_id':'DMS_0110A','event':'DMS','ignition':1,'message':12,'td':{'alat':'0','alng':'0','date':'20250915','dv':'A','lat':'19.466923','lng':'80.010357','nsv':'1','rssi':'23','spd':'0','utc':'192219'},'timestamp':1757877739,'trip_id':'20250915005219'}",
//       IGS: 1757911825,
//       IGSjson:
//         "{'device_id':'DMS_0110A','event':'IGS','ignition':1,'message':9,'td':{'alat':'19.468152','alng':'80.009758','date':'20250915','dv':'A','lat':'19.468152','lng':'80.009758','nsv':'1','rssi':'19','spd':'1','utc':'045025'},'timestamp':1757911825,'trip_id':'20250915101926'}",
//       ALM3: 1757290406,
//       ALM3json:
//         "{'data':{'alarm':3,'object':2,'speed':37,'steering_angle':0,'ttc':98,'x_axis':10.800000190734863,'y_axis':0.19200000166893005},'device_id':'DMS_0110A','event':'ALM','ignition':1,'message':5,'td':{'alat':'19.584451','alng':'79.871587','date':'20250908','dv':'A','lat':'19.584451','lng':'79.871587','nsv':'1','rssi':'15','spd':'37','utc':'001326'},'timestamp':1757290406,'trip_id':'20250908040026'}",
//     },
//     Routes_Data: { assigned_Routes: [1] },
//   }
// }
