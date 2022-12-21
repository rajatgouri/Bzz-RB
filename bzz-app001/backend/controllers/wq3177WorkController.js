const methods = require("./crudController");
const endpoints = methods.crudController("WQ3177Checkmark");
const Util = require("./utilController");
var sql = require("mssql");

const Model = "WQ3177Checkmark";
const calendarModal = "CalendarStaff";
const userModal = "JWT";
const wqModal = "WQ3177";
const progressModel = 'WQ3177Progress'

delete endpoints["update"];
delete endpoints['list'];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


setInterval(() => {
  (async () => {


  // Badge Disappear code  
    Util.BadgeDisappearAfter48Hours(Model)
  
    //  ----------------------------------- absent code get tick mark -----------------------
    Util.Absent(calendarModal, userModal ,Model, cb => {
      clearData(cb)
    })

    //  ---------------------------------  Update data -------------------
    Util.UpdateDailyData(progressModel, userModal, wqModal);

    Util.Update3177HoursData(progressModel, userModal, wqModal);

    
    // Original userAssigned 
    // Util.UpdateOriginalUserAssigned(wqModal);

    Util.checkmark1(Model, 'JWT')

  })()

}, 50000)



// functionality for add tick mark and weeks
async function clearData(EMPID) {

  let { recordset: arr } = await sql.query(
    `select * from ${Model} where EMPID = ${EMPID}`
  );


  if (arr[0] && (arr[0].Total == null || arr[0].Total < 4)) {  
 
    let sum = (arr[0]['Mon'] ? arr[0]['Mon'] : 0) + (arr[0]['Tue'] ? arr[0]['Tue'] : 0) + (arr[0]['Wed'] ? arr[0]['Wed'] : 0) + (arr[0]['Thu'] ? arr[0]['Thu'] : 0) + (arr[0]['Fri'] ? arr[0]['Fri'] : 0) + (arr[0]['Sat'] ? arr[0]['Sat'] : 0) + (arr[0]['Sun'] ? arr[0]['Sun'] : 0);
    let updateQuery = `update ${Model} set Week${(arr[0].Total == null || arr[0].Total == 0) ? 1 : (arr[0].Total + 1)}=${sum >= 5 ? 1 : 0}  where ID = ${arr[0].ID}`
    await sql.query(updateQuery);
  }
  const interval = setInterval(async () => {
    console.log('running clear data!')
    Util.checkmark(Model, EMPID, cb => {
      clearInterval(interval)
    })



  }, 50000)
}




endpoints.list = async (req, res) => {
  try {

    const { id } = req.params;
    const { recordset } = await sql.query(
      `select ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS SNo, * from ${Model}`
    );

    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found all documents",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
};

endpoints.update = async (req, res) => {
  try {

    // var usDate = Util.getDateTime()
    var date1 = new Date();
    var utcDate1 = new Date(date1.toUTCString());
    utcDate1.setHours(utcDate1.getHours() - 7);
    var usDate = new Date(utcDate1)
    var timestamp = new Date(usDate.setHours(48)).toISOString();


    const { id } = req.params;
    const values = req.body;
    values.ActionTimeStamp = timestamp

    let valuesQuery = "";
    for (key in values) {
      if (values[key]) {
        valuesQuery += key + "='" + values[key] + "',";
      } else {
        valuesQuery += key + "=" + null + ",";

      }
    }

    valuesQuery = valuesQuery.slice(0, -1);
    const { recordset } = await sql.query(
      `update ${Model} set ${valuesQuery} where EMPID = ${id}`
    );

    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found all documents",
    });
  } catch (err) {

    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      error: err,
    });
  }
};



endpoints.create = async (req, res) => {
  try {
    const values = req.body;
    values.EMPID = req.admin.EMPID;
    const first = req.admin.StartDay;

    let day = new Date().toLocaleString("en-US", { weekday:'short',  timeZone: "America/Los_Angeles" })
    values[day] = 1


    const currentDay = day
    let lastDay = (days[days.indexOf(first) + 4])

    let workingDays = days.slice(days.indexOf(first), days.indexOf(first) + 5)
      if (workingDays.indexOf(currentDay) < 0) {
        return res.status(200).json({
          success: true,
          result: {},
          message: "Not a working day!",
        });
      }

    const columnsQ = "(" + Object.keys(values).toString() + ")"

    let { recordsets } = await sql.query(`Select * from ${Model} where EMPID = ${values.EMPID}`);

    if (recordsets[0].length > 0) {

      if (recordsets[0][0][currentDay]) {
        return res.status(200).json({
          success: true,
          result: {},
          message: "Already has a value for " + currentDay,
        });
      }

      let valuesQuery = "";
      for (key in values) {
        valuesQuery += key + "='" + values[key] + "',";
      }

      valuesQuery = valuesQuery.slice(0, -1);

      await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${values.EMPID}`);
      
      if (currentDay == lastDay) {
        clearData(req.admin.EMPID)
      }

      return res.status(200).json({
        success: true,
        result: {},
        message: "we update this document by this EMPID: " + values.EMPID,
      });

    } else {

      let valuesQuery = "";
      for (key in values) {
        if (values[key] === "null") {
          valuesQuery += "NULL" + ",";
        } else {
          valuesQuery += "'" + values[key] + "',";
        }
      }
      valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

      const insertQuery = `insert into ${Model} ${columnsQ} values ${valuesQuery}`

      await sql.query(insertQuery);

      return res.status(200).json({
        success: true,
        result: {},
        message: "Success",
      });
    }


  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }
};


module.exports = endpoints;




