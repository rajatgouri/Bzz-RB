const express = require("express");

const { catchErrors } = require("../handlers/errorHandlers");

const router = express.Router();

const adminController = require("../controllers/adminController");
const wq1075Controller = require("../controllers/wq1075Controller");
const wq1075ProductivityController = require("../controllers/wq1075ProductivityController");
const DailyProductivityController = require("../controllers/dailyProductivityController");
const DailyProgressController = require("../controllers/dailyProgressController");
const DailyStartFinishController = require("../controllers/dailyStartFinishController");
const irbController = require("../controllers/irbController");
const coverageGovermentController = require("../controllers/coverageGovermentController");
const billingCalendarStaffController = require("../controllers/billingCalendarStaffController");
const billingColorController = require("../controllers/billingColorController");
const billingColorWq1262Controller = require("../controllers/billingColorWq1262Controller");
const IntakeRequestController = require('../controllers/IntakeRequestController')

const billingColorWq1075Controller = require("../controllers/billingColorWq1075Controller");
const billingColorWq3177Controller = require("../controllers/billingColorWq3177Controller");

const billingTeamListController = require("../controllers/billingTeamListController");
const billingReminderController = require('../controllers/billingReminderController');
const performanceCardsController = require('../controllers/performanceCardsController');
const authController = require('../controllers/authController');
const wq5508LoggerController = require("../controllers/wq5508LoggerController");
const wq5508ProgressController = require("../controllers/wq5508ProgressController");
const wq5508WorkController = require("../controllers/wq5508WorkController");
const wq5508Controller = require("../controllers/wq5508Controller");
const wq5508ProductivityController = require("../controllers/wq5508ProductivityController");
const wq5508ExportController = require('../controllers/wq5508ExportController');

const WQsController = require('../controllers/WQsController')
const tabsController = require('../controllers/tabsController')

const wq3177LoggerController = require("../controllers/wq3177LoggerController");
const wq3177ProgressController = require("../controllers/wq3177ProgressController");
const wq3177WorkController = require("../controllers/wq3177WorkController");
const wq3177Controller = require("../controllers/wq3177Controller");
const wq3177ProductivityController = require("../controllers/wq3177ProductivityController");
const wq3177ExportController = require('../controllers/wq3177ExportController');


const productivityController = require('../controllers/productivityController') 

const wq1262LoggerController = require("../controllers/wq1262LoggerController");
const wq1262ProgressController = require("../controllers/wq1262ProgressController");
const wq1262WorkController = require("../controllers/wq1262WorkController");
const wq1262Controller = require("../controllers/wq1262Controller");
const wq1262ProductivityController = require("../controllers/wq1262ProductivityController");
const wq1262ExportController = require('../controllers/wq1262ExportController');

const wq1075LoggerController = require("../controllers/wq1075LoggerController");
const feedbackController = require("../controllers/feedbackController");
const wq1075WorkController = require("../controllers/wq1075WorkController");
const wq1075ProgressController = require("../controllers/wq1075ProgressController");
const wq1075AnswersController = require('../controllers/wq1075AnswersController');
const wq1262AnswersController = require('../controllers/wq1262AnswersController');


const BillingIrbBudgetStatusController = require("../controllers/billingIrbBudgetStatusController");
const BillingNoPccStudiesController = require("../controllers/billingNoPccStudiesController");
const NonTherapeuticController = require("../controllers/nonTherapeuticController");
const DoNotScrubIRBsController = require("../controllers/DoNotScrubIRBsController");

const HIMSRBController = require('../controllers/himsrbdatabaseController')


const coveragesLLoggerController = require('../controllers/coveragesGovernmentLoggerController');
const NTStudiesLoggerController = require('../controllers/NTStudies');
const settingsLoggerController = require('../controllers/settingsLoggerController');

const JwtController = require('../controllers/JWTController');
const AchievementController = require('../controllers/achievements');



const pageLoggerController = require("../controllers/pageLoggerController");
const himsteamrosterController = require("../controllers/himsTeamRosterController");
const himsTeamUserScheduleController = require("../controllers/himsTeamUserScheduleController");
const epicProductivityController = require("../controllers/epicProductivityController");
const epicProductivity1Controller = require("../controllers/epicProductivity1Controller");
const dailyCheckmarkController = require('../controllers/dailyCheckmarkController');
const complianceController = require('../controllers/complianceController');
const emailLoggerController = require("../controllers/emailLoggerController");
const masterTaskListController = require("../controllers/masterTaskListController");
const totalKPIsController = require('../controllers/totalKpisController')
const weeklyKPIsController = require('../controllers/weeklyKpisController')
const AllKPIsController = require('../controllers/AllKpisController')

const performanceController = require('../controllers/performanceController')
const distributionController = require('../controllers/distributionController')
const DoNotScrubIRBsLogger =  require('../controllers/DoNotScrubIRBsLoggerController')
const wq1075ExportController = require('../controllers/wq1075ExportController')
const reportController = require('../controllers/reportController');
const truePBKPISummaryController = require('../controllers/truePBKPISummaryController');
const truePBKPIDetailsController = require('../controllers/truePBKPIDetailsController');
// const compareController = require('../controllers/compareController');
const pbReportController = require('../controllers/PBReportController');
const agendaController = require('../controllers/agendaController');
const studiesController = require('../controllers/mapping_module/studiesController')
const armOnCoreController = require('../controllers/mapping_module/armOnCoreController')
const timepointOnCoreController = require('../controllers/mapping_module/timepointOnCoreController')

const armMcaController = require('../controllers/mapping_module/armMcaController')
const timepointMcaController = require('../controllers/mapping_module/timepointMcaController')


const WQ1075KPIsController = require('../controllers/WQ1075KPIsController')
const WQAuditController = require('../controllers/auditController')
const WQAuditErrorController = require('../controllers/auditErrorPBController')

const ErrorAuditController = require('../controllers/ErrorAuditController')

const HBWQAuditController = require('../controllers/hbAuditController')

const irbReportController = require('../controllers/irbReportController')
const irbReportTableController = require('../controllers/irbReportTableController')
const denialsController = require('../controllers/denialsController')
const denialsSubController = require('../controllers/denialsSubController')

const epicController = require('../controllers/epicController')
const databaseController = require('../controllers/databaseController')
const avatarController = require('../controllers/avatarController')
const chatController = require('../controllers/chatController')
const messageController = require('../controllers/messagesController')
const WQErrorController = require('../controllers/wqerrorController')



const multer  = require('multer');


const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'loader/WQ5508/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'loader/WQ1075/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'loader/WQ1262/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()  + "_" + file.originalname 
    cb(null,  uniqueSuffix)
  }
})

const upload1= multer({ storage: storage1 })
const upload2 = multer({ storage: storage2 })
const upload3 = multer({ storage: storage3 })


// ____________________________________ Upload _______________________________________________
router.route("/upload-file-wq5508/create").post(upload1.single('myFile'), catchErrors(wq5508ExportController.upload));
router.route("/upload-file-wq3177/create").post(upload1.single('myFile'), catchErrors(wq3177ExportController.upload));
router.route("/upload-file-wq1075/create").post(upload2.single('myFile'), catchErrors(wq1075ExportController.upload));
router.route("/upload-file-wq1262/create").post(upload3.single('myFile'), catchErrors(wq1262ExportController.upload));


//_______________________________ Database _______________________________________
router.route("/database/query").post(catchErrors(databaseController.query));

router.route("/avatar-tabs/list").get(catchErrors(avatarController.tabs));
router.route("/avatar-images/list").get(catchErrors(avatarController.photos));




// ______________________________ Page Logger __________________________________
router.route("/pageLogger/list").get(catchErrors(pageLoggerController.list));
router.route("/pageloggerfull/list").get(catchErrors(pageLoggerController.fullList));
router.route("/pageLogger-exports/list").get(catchErrors(pageLoggerController.exports));



// ______________________________ Epic Productivity __________________________________
router.route("/epic-productivity/list").get(catchErrors(epicProductivityController.list));

// ______________________________ Epic Productivity 1 __________________________________
router.route("/epic-productivity1/list").get(catchErrors(epicProductivity1Controller.list));

router.route("/productivity-log/list").get(catchErrors(productivityController.list));
router.route("/productivity-log-filters/list").get(catchErrors(productivityController.filters));
router.route("/productivity-log/create").post(catchErrors(productivityController.create));
router.route("/productivity-log/update/:id").patch(catchErrors(productivityController.update));
router.route("/productivity-log/delete/:id").delete(catchErrors(productivityController.delete));

router.route("/achievements/create").post(catchErrors(AchievementController.create));


router.route("/intake-request/list1").post(catchErrors(IntakeRequestController.list));
router.route("/intake-request/create").post(catchErrors(IntakeRequestController.create));
router.route("/intake-request/update/:id").patch(catchErrors(IntakeRequestController.update));
router.route("/intake-request-filters/list").get(catchErrors(IntakeRequestController.filters));
router.route("/intake-request/delete/:id").delete(catchErrors(IntakeRequestController.delete));



// ______________________________ Page Logger __________________________________
router.route("/emailLogger/list").get(catchErrors(emailLoggerController.list));
router.route("/emailuserfilter/list").get(catchErrors(emailLoggerController.userFilter));
router.route("/emailLogger1/list").get(catchErrors(emailLoggerController.list1));
router.route("/emailLogger-search/list").get(catchErrors(emailLoggerController.search));


// _________________________________ Compliance COntroller ___________________________
router.route("/compliance-user/list").get(catchErrors(complianceController.users));
router.route("/compliance/list").get(catchErrors(complianceController.list));
router.route("/compliance/create").post(catchErrors(complianceController.create));

const FlowchartsController = require('../controllers/flowchartController');
 
//_______________________________ Admin management_______________________________


router.route("/admin/create").post(catchErrors(adminController.create));
// router.route("/admin/read/:id").get(catchErrors(adminController.read));
router.route("/admin/update/:id").patch(catchErrors(adminController.update));
router.route("/admin/delete/:id").delete(catchErrors(adminController.delete));
// router.route("/admin/search").get(catchErrors(adminController.search));
router.route("/admin/list").get(catchErrors(adminController.list));
router.route("/admin-fulllist/list").get(catchErrors(adminController.fullList));
router.route("/admin-findall/list").get(catchErrors(adminController.findALL));
router.route("/getuserbysection/list").get(catchErrors(adminController.getUserBySection));


router.route("/admin-one/list1").post(catchErrors(adminController.one));
router.route("/admin-avatar/update/:id").patch(catchErrors(adminController.updateImage));


router.route("/jwt/update/:id").patch(catchErrors(JwtController.update));


// ______________________________User ___________________________________________
router.route("/admin/switch").post(catchErrors(authController.switch));


//_____________________________________ API for flowchartController __________________________
router.route("/flowcharts/read/:id").get(catchErrors(FlowchartsController.read));
router.route("/flowcharts/create").post(catchErrors(FlowchartsController.create));
router.route("/flowcharts/update/:id").patch(catchErrors(FlowchartsController.update));

router.route("/wq5508-flowchart/list").get(catchErrors(HIMSRBController.wq5508Flowchart));
router.route("/wq1075-flowchart/list").get(catchErrors(HIMSRBController.wq1075Flowchart));
router.route("/wq1262-flowchart/list").get(catchErrors(HIMSRBController.wq1262Flowchart));


router.route("/chat/create").post(catchErrors(chatController.create));
router.route("/chat/list").get(catchErrors(chatController.list));

router.route("/messages/list").get(catchErrors(messageController.list));


//_____________________________________ API for wq5508 __________________________

router.route("/wq5508/update/:id").patch(catchErrors(wq5508Controller.update));
router.route("/wq5508-updatetime/create").post(catchErrors(wq5508Controller.updatetime));
router.route("/wq5508-color/create").post(catchErrors(wq5508Controller.updateColor));
router.route("/wq5508-color/create").post(catchErrors(wq5508Controller.updateColor));
router.route("/wq5508-exports/list").get(catchErrors(wq5508ExportController.exports));


//_____________________________________ API for Error Audot ____________________________

router.route("/wq-error-audit/list1").post(catchErrors(ErrorAuditController.list));


//_____________________________________ API for wq5508 __________________________

router.route("/wq3177/update/:id").patch(catchErrors(wq3177Controller.update));
router.route("/wq3177-updatetime/create").post(catchErrors(wq3177Controller.updatetime));
router.route("/wq3177-color/create").post(catchErrors(wq3177Controller.updateColor));
router.route("/wq3177-color/create").post(catchErrors(wq3177Controller.updateColor));
router.route("/wq3177-exports/list").get(catchErrors(wq3177ExportController.exports));




router.route("/wq3177/list1").post(catchErrors(wq3177Controller.list));
router.route("/wq3177-full-list/list").get(catchErrors(wq3177Controller.fullList));
router.route("/wq3177-filters/list").get(catchErrors(wq3177Controller.filters));


router.route("/wq5508/list1").post(catchErrors(wq5508Controller.list));

router.route("/wq5508-full-list/list").get(catchErrors(wq5508Controller.fullList));
router.route("/wq5508-filters/list").get(catchErrors(wq5508Controller.filters));

router.route("/wq5508-error/list1").post(catchErrors(WQErrorController.WQ5508));
router.route("/wq5508-error-filters/list").get(catchErrors(WQErrorController.WQ5508Filters));
router.route("/wq5508-error/update/:id").patch(catchErrors(WQErrorController.WQ5508update));


router.route("/wq5508-error-kpi/list").get(catchErrors(WQErrorController.WQ5508KPI));
router.route("/wq1262-error-kpi/list").get(catchErrors(WQErrorController.WQ1262KPI));



router.route("/wq1262-error/list1").post(catchErrors(WQErrorController.WQ1262));
router.route("/wq1262-error-filters/list").get(catchErrors(WQErrorController.WQ1262Filters));
router.route("/wq1262-error/update/:id").patch(catchErrors(WQErrorController.WQ1262update));



//_____________________________________ API for wq5508 Progress __________________________
router.route("/wq5508Progress/create").post(catchErrors(wq5508ProgressController.create));
router.route("/wq5508Progress/update/:id").post(catchErrors(wq5508ProgressController.update));

//_____________________________________ API for wq3177 Progress __________________________
router.route("/wq3177Progress/create").post(catchErrors(wq3177ProgressController.create));
router.route("/wq3177Progress/update/:id").post(catchErrors(wq3177ProgressController.update));

router.route("/performance-pb/list").get(catchErrors(performanceController.PBlist));
router.route("/performance-hb/list").get(catchErrors(performanceController.HBlist));


//_____________________________________ API for wq5508 Progress __________________________
router.route("/wq5508Progress/create").post(catchErrors(wq5508ProgressController.create));
router.route("/wq5508Progress/update/:id").post(catchErrors(wq5508ProgressController.update));



//_____________________________________ API for Work ______________________________
router.route("/wq5508Work/list").get(catchErrors(wq5508WorkController.list));
router.route("/wq5508Work/create").post(catchErrors(wq5508WorkController.create));
router.route("/wq5508Work/update/:id").patch(catchErrors(wq5508WorkController.update));
router.route("/wq5508-user").post(catchErrors(wq5508Controller.updateUser));




//_____________________________________ API for Work ______________________________
router.route("/wq3177Work/list").get(catchErrors(wq3177WorkController.list));
router.route("/wq3177Work/create").post(catchErrors(wq3177WorkController.create));
router.route("/wq3177Work/update/:id").patch(catchErrors(wq3177WorkController.update));
router.route("/wq3177-user").post(catchErrors(wq3177Controller.updateUser));

//_____________________________________ API for wq5508 Logger __________________________
router.route("/wq5508Logger/create").post(catchErrors(wq5508LoggerController.create));
router.route("/wq5508filters/list").get(catchErrors(wq5508LoggerController.filters));
router.route("/wq5508logger-exports/list").get(catchErrors(wq5508LoggerController.exports));
router.route("/wq5508loggerfull/list").get(catchErrors(wq5508LoggerController.fullList));





//_____________________________________ API for wq3177 Logger __________________________
router.route("/wq3177Logger/create").post(catchErrors(wq3177LoggerController.create));
router.route("/wq3177filters/list").get(catchErrors(wq3177LoggerController.filters));
router.route("/wq3177logger-exports/list").get(catchErrors(wq3177LoggerController.exports));
router.route("/wq3177loggerfull/list").get(catchErrors(wq3177LoggerController.fullList));



//_____________________________________ API for True KPI Summary __________________________
router.route("/truepbkpisummary/list").get(catchErrors(truePBKPISummaryController.list));
router.route("/truepbkpidetails/list").get(catchErrors(truePBKPIDetailsController.list));

router.route("/pb-report/list").get(catchErrors(pbReportController.list));


//  ___________________________________ API for WQ5508 Productivy ___________________
router.route("/wq5508productivity/list").get(catchErrors(wq5508ProductivityController.list));


//  ___________________________________ API for WQ3177 Productivy ___________________
router.route("/wq3177productivity/list").get(catchErrors(wq3177ProductivityController.list));

//_____________________________________ API for wq5508 Progress __________________________
router.route("/wq5508progress/create").post(catchErrors(wq5508ProgressController.create));
router.route("/wq5508progress/list").get(catchErrors(wq5508ProgressController.list));


//  ___________________________________ API for WQ5508 Productivy ___________________
router.route("/wq5508logger/list").get(catchErrors(wq5508LoggerController.list));



//  ___________________________________ API for WQ3177 Productivy ___________________
router.route("/wq3177logger/list").get(catchErrors(wq3177LoggerController.list));



router.route("/wqaudit/list1").post(catchErrors(WQAuditController.list));
router.route("/wqaudit-filters/list").get(catchErrors(WQAuditController.filters));
router.route("/wqaudit/update/:id").patch(catchErrors(WQAuditController.update));
router.route("/wqaudit-kpi/list").get(catchErrors(WQAuditController.KPI));
router.route("/hbwqaudit-kpi/list").get(catchErrors(HBWQAuditController.KPI));
router.route("/wqaudit-exports/list").get(catchErrors(WQAuditController.exports));
router.route("/wqaudit-columns/list").get(catchErrors(WQAuditController.columns));
router.route("/wqaudit-columns/create").post(catchErrors(WQAuditController.create));






router.route("/audit-error/list1").post(catchErrors(WQAuditErrorController.list));
router.route("/audit-error-filters/list").get(catchErrors(WQAuditErrorController.filters));
router.route("/audit-error/update/:id").patch(catchErrors(WQAuditErrorController.update));
router.route("/audit-error-columns/list").get(catchErrors(WQAuditErrorController.columns));
router.route("/audit-error-columns/create").post(catchErrors(WQAuditErrorController.create));
router.route("/audit-error-exports/list").get(catchErrors(WQAuditErrorController.exports));



// router.route("/audit-error-hb/list1").post(catchErrors(WQAuditErrorController.hblist));
// router.route("/audit-error-hb-filters/list").get(catchErrors(WQAuditErrorController.hbfilters));
// router.route("/audit-error-hb/update/:id").patch(catchErrors(WQAuditErrorController.hbupdate));
// router.route("/audit-error-hb-columns/list").get(catchErrors(WQAuditErrorController.hbcolumns));
// router.route("/audit-error-hb-columns/create").post(catchErrors(WQAuditErrorController.hbcreate));


router.route("/hbwqaudit/list1").post(catchErrors(HBWQAuditController.list));
router.route("/hbwqaudit-filters/list").get(catchErrors(HBWQAuditController.filters));
router.route("/hbwqaudit/update/:id").patch(catchErrors(HBWQAuditController.update));
router.route("/hbwqaudit-kpi/list").get(catchErrors(HBWQAuditController.KPI));
router.route("/hbwqaudit-exports/list").get(catchErrors(HBWQAuditController.exports));
router.route("/hbwqaudit-columns/list").get(catchErrors(HBWQAuditController.columns));
router.route("/hbwqaudit-columns/create").post(catchErrors(HBWQAuditController.create));


// ____________________________________API For Mapping Module__________________________

router.route("/studies/list").get(catchErrors(studiesController.list));
router.route("/mapping-oncore/list").get(catchErrors(armOnCoreController.list));
router.route("/mapping-oncore-epic/update/:irb").patch(catchErrors(armOnCoreController.update));
router.route("/mapping-oncore-epic/create/").post(catchErrors(armOnCoreController.getItem));
router.route("/mapping-oncore-epic-save-all/create/").post(catchErrors(armOnCoreController.saveAll));
router.route("/mapping-oncore/create").post(catchErrors(armOnCoreController.create));

router.route("/mapping-oncore-timepoint-save-all/create/").post(catchErrors(timepointOnCoreController.saveAll));
router.route("/mapping-oncore-timepoint/update/:irb").patch(catchErrors(timepointOnCoreController.update));
router.route("/mapping-oncore-timepoint/create/").post(catchErrors(timepointOnCoreController.getItem));
router.route("/timepoint-oncore/list1").post(catchErrors(timepointOnCoreController.list));
router.route("/timepoint-oncore/create").post(catchErrors(timepointOnCoreController.create));

router.route("/mapping-mca/list").get(catchErrors(armMcaController.list));
router.route("/mapping-mca-epic/update/:irb").patch(catchErrors(armMcaController.update));
router.route("/mapping-mca-epic/create/").post(catchErrors(armMcaController.getItem));
router.route("/mapping-mca-epic-save-all/create/").post(catchErrors(armMcaController.saveAll));
router.route("/mapping-mca/create").post(catchErrors(armMcaController.create));

router.route("/mapping-mca-timepoint-save-all/create/").post(catchErrors(timepointMcaController.saveAll));
router.route("/mapping-mca-timepoint/update/:irb").patch(catchErrors(timepointMcaController.update));
router.route("/mapping-mca-timepoint/create/").post(catchErrors(timepointMcaController.getItem));
router.route("/timepoint-mca/list1").post(catchErrors(timepointMcaController.list));
router.route("/timepoint-mca/create").post(catchErrors(timepointMcaController.create));





router.route("/wq1075kpis/list").get(catchErrors(WQ1075KPIsController.list));
router.route("/wq1075kpis-table/list").get(catchErrors(WQ1075KPIsController.table));
router.route("/wq1075kpis-table-filters/list").get(catchErrors(WQ1075KPIsController.filters));



// ____________________________________API For WQ1262__________________________
router.route("/wq1262/update/:id").patch(catchErrors(wq1262Controller.update));
router.route("/wq1262-updatetime/create").post(catchErrors(wq1262Controller.updatetime));
router.route("/wq1262-color/create").post(catchErrors(wq1262Controller.updateColor));
router.route("/wq1262-color/create").post(catchErrors(wq1262Controller.updateColor));
router.route("/wq1262-exports/list").get(catchErrors(wq1262ExportController.exports));

// router.route("/wq1262/delete/:id").delete(catchErrors(wq1262Controller.delete));
// router.route("/wq1262/search").get(catchErrors(wq1262Controller.search));
router.route("/wq1262/list1").post(catchErrors(wq1262Controller.list));
router.route("/wq1262-full-list/list").get(catchErrors(wq1262Controller.fullList));
router.route("/wq1262-filters/list").get(catchErrors(wq1262Controller.filters));


//__________________________________Columns ___________________________________//

router.route("/wq1262-columns/list").get(catchErrors(wq1262Controller.columns));
router.route("/wq1262-columns/create").post(catchErrors(wq1262Controller.create));

router.route("/wq3177-columns/list").get(catchErrors(wq3177Controller.columns));
router.route("/wq3177-columns/create").post(catchErrors(wq3177Controller.create));

router.route("/wq5508flowcharthistorical/list").get(catchErrors(HIMSRBController.WQ5508FlowchartSpeed));
router.route("/wq1075flowcharthistorical/list").get(catchErrors(HIMSRBController.WQ1075FlowchartSpeed));

router.route("/wq5508-columns/list").get(catchErrors(wq5508Controller.columns));
router.route("/wq5508-columns/create").post(catchErrors(wq5508Controller.create));


//______________________________WQ Data Graphs__________________________


router.route("/entire-wq-data/list").get(catchErrors(WQsController.WQEntireData));
router.route("/daily-wq-data/list").get(catchErrors(WQsController.WQDailyData));


router.route("/wq1075-columns/list").get(catchErrors(wq1075Controller.columns));
router.route("/wq1075-columns/create").post(catchErrors(wq1075Controller.create));




//_____________________________________ API for wq1262 Progress __________________________
router.route("/wq1262Progress/create").post(catchErrors(wq1262ProgressController.create));
router.route("/wq1262Progress/update/:id").post(catchErrors(wq1262ProgressController.update));



// ____________________________________ Ditribution ___________________________
router.route("/distributions/create").post(catchErrors(distributionController.create));
router.route("/distributions-assigned/create").post(catchErrors(distributionController.assign));


//_____________________________________ API for Feedback __________________________
router.route("/feedback/list").get(catchErrors(feedbackController.list));
router.route("/feedback/create").post(catchErrors(feedbackController.create));


//_____________________________________ API for Daily Checkmark __________________________
router.route("/dailycheckmark/list1").post(catchErrors(dailyCheckmarkController.list));
router.route("/dailycheckmark/create").post(catchErrors(dailyCheckmarkController.create));



//_____________________________________ API for Work ______________________________
router.route("/wq1262Work/list").get(catchErrors(wq1262WorkController.list));
router.route("/wq1262Work/create").post(catchErrors(wq1262WorkController.create));
router.route("/wq1262Work/update/:id").patch(catchErrors(wq1262WorkController.update));
router.route("/wq1262-user").post(catchErrors(wq1262Controller.updateUser));


router.route("/wq1262-tabs/list").get(catchErrors(tabsController.tabs));
router.route("/wq1262-tabs/create").post(catchErrors(tabsController.create));




//_____________________________________ API for Work ______________________________
router.route("/wq1075Work/list").get(catchErrors(wq1075WorkController.list));
router.route("/wq1075Work/create").post(catchErrors(wq1075WorkController.create));
router.route("/wq1075Work/update/:id").patch(catchErrors(wq1075WorkController.update));
router.route("/wq1075-user").post(catchErrors(wq1075Controller.updateUser));
router.route("/wq1075-updatetime/create").post(catchErrors(wq1075Controller.updatetime));
router.route("/wq1075-color/create").post(catchErrors(wq1075Controller.updateColor));
router.route("/wq1075-exports/list").get(catchErrors(wq1075ExportController.exports));

router.route("/wq1075-answers/list").get(catchErrors(wq1075AnswersController.list));
router.route("/wq1075-answers/update/:id").patch(catchErrors(wq1075AnswersController.update));


router.route("/wq1262-answers/list").get(catchErrors(wq1262AnswersController.list));



//_____________________________________ API for wq1262 Logger __________________________
router.route("/wq1262Logger/create").post(catchErrors(wq1262LoggerController.create));
router.route("/wq1262filters/list").get(catchErrors(wq1262LoggerController.filters));
router.route("/wq1262logger-exports/list").get(catchErrors(wq1262LoggerController.exports));



//_____________________________________ API for wq1075 Logger __________________________
router.route("/wq1075Logger/create").post(catchErrors(wq1075LoggerController.create));
router.route("/wq1075logger-exports/list").get(catchErrors(wq1075LoggerController.exports));
router.route("/wq1075filters/list").get(catchErrors(wq1075LoggerController.filters));
router.route("/wq1075loggerfull/list").get(catchErrors(wq1075LoggerController.fullList));


//_____________________________________ API for wq5508 Progress __________________________
router.route("/wq1262progress/create").post(catchErrors(wq1262ProgressController.create));
router.route("/wq1262progress/list").get(catchErrors(wq1262ProgressController.list));
router.route("/wq1262loggerfull/list").get(catchErrors(wq1262LoggerController.fullList));


//_____________________________________ API for wq1075 Progress __________________________
router.route("/wq1075progress/create").post(catchErrors(wq1075ProgressController.create));
router.route("/wq1075progress/list").get(catchErrors(wq1075ProgressController.list));
router.route("/wq1075-full-list/list").get(catchErrors(wq1075Controller.fullList));
router.route("/wq1075-filters/list").get(catchErrors(wq1075Controller.filters));
router.route("/wq1075-filters/list1").post(catchErrors(wq1075Controller.getFilters));
router.route("/wq5508-filters/list1").post(catchErrors(wq5508Controller.getFilters));
router.route("/wq1262-filters/list1").post(catchErrors(wq1262Controller.getFilters));


//  ___________________________________ API for WQ1075 Productivy ___________________
router.route("/wq1075productivity/list").get(catchErrors(wq1075ProductivityController.list));

//  ___________________________________ API for WQ5508 Productivy ___________________
router.route("/wq1262productivity/list").get(catchErrors(wq1262ProductivityController.list));


//  ___________________________________ API for WQ1075 Productivy ___________________
router.route("/wq1075logger/list").get(catchErrors(wq1075LoggerController.list));


//  ___________________________________ API for WQ5508 Productivy ___________________
router.route("/wq1262logger/list").get(catchErrors(wq1262LoggerController.list));



//  ___________________________________ API for DailyProductivy ___________________
router.route("/dailyproductivity/list").get(catchErrors(DailyProductivityController.list));


//  ___________________________________ API for EpicDailyProgress ___________________
router.route("/dailyprogress/list").get(catchErrors(DailyProgressController.list));


//  ___________________________________ API for EpicDailyProgress ___________________
router.route("/dailystartfinish/list").get(catchErrors(DailyStartFinishController.list));

router.route("/totalpbkpis/list").get(catchErrors(totalKPIsController.list));
router.route("/totalpbkpis/read/:EMPID").get(catchErrors(totalKPIsController.get5Days));
router.route("/totalkpisyear/list").get(catchErrors(totalKPIsController.year));


router.route("/weeklypbkpis/list").get(catchErrors(weeklyKPIsController.list));
router.route("/allpbkpis/list").get(catchErrors(AllKPIsController.list));

// 

// ____________________________________  

router.route("/wq1075/update/:id").patch(catchErrors(wq1075Controller.update));
router.route("/wq1075/list1").post(catchErrors(wq1075Controller.list));
router.route("/populate-soc/list").get(catchErrors(wq1262Controller.populateSOC));
router.route("/populate-pbnotes/list").get(catchErrors(epicController.populatePBnotes));
router.route("/populate-hbnotes/list").get(catchErrors(epicController.populateHBnotes));





//_____________________________________ API for irbs ___________________________
router.route("/irb/create").post(catchErrors(irbController.create));
router.route("/irb/delete/:id").delete(catchErrors(irbController.delete));
router.route("/irb/update/:id").patch(catchErrors(irbController.update));
router.route("/irb/list").get(catchErrors(irbController.list));


//_____________________________________ API for Agenda ___________________________
router.route("/agenda/create").post(catchErrors(agendaController.create));
router.route("/agenda/delete/:id").delete(catchErrors(agendaController.delete));
router.route("/agenda/update/:id").patch(catchErrors(agendaController.update));
router.route("/agenda/list").get(catchErrors(agendaController.list));
router.route("/agenda-filters/list").get(catchErrors(agendaController.filters));
router.route("/agenda-exports/list").get(catchErrors(agendaController.exports));

router.route("/live-report/list").get(catchErrors(reportController.list));

// ____________________________________ API for himsteamroster __________________ 
router.route("/himsteamroster/list").get(catchErrors(himsteamrosterController.list));
router.route("/himsteamroster-department/list").get(catchErrors(himsteamrosterController.department));
router.route("/himsteamroster/update/:id").patch(catchErrors(himsteamrosterController.update));
router.route("/himsteamroster/create").post(catchErrors(himsteamrosterController.create));
router.route("/himsteamroster/delete/:id").delete(catchErrors(himsteamrosterController.delete));
router.route("/himsteamroster-contractor/list").get(catchErrors(himsteamrosterController.contactor));
router.route("/himsteamroster-columns/list").get(catchErrors(himsteamrosterController.columns));
router.route("/himsteamroster-columns/create").post(catchErrors(himsteamrosterController.createC));


// ____________________________________ API for himsUserSchedule __________________ 
router.route("/himsuserschedule/list").get(catchErrors(himsTeamUserScheduleController.list));
router.route("/himsuserschedule-filters/list").get(catchErrors(himsTeamUserScheduleController.filters));
router.route("/himsuserschedule/create").post(catchErrors(himsTeamUserScheduleController.create));
router.route("/himsuserschedule/delete/:id").delete(catchErrors(himsTeamUserScheduleController.delete));
router.route("/himsuserschedule/update/:id").patch(catchErrors(himsTeamUserScheduleController.update));

// ____________________________________ API for himsUserSchedule __________________ 
router.route("/himsmastertasklist/list").get(catchErrors(masterTaskListController.list));
router.route("/himsmastertasklist-filters/list").get(catchErrors(masterTaskListController.filters));
router.route("/himsmastertasklist/create").post(catchErrors(masterTaskListController.create));
router.route("/himsmastertasklist/delete/:id").delete(catchErrors(masterTaskListController.delete));
router.route("/himsmastertasklist/update/:id").patch(catchErrors(masterTaskListController.update));



//_____________________________________ API for billingCalendarStaffController __________________________
router.route("/billingcalendarstaff/list/:month/:year/:date_column").get(catchErrors(billingCalendarStaffController.list));
router.route("/billingcalendarstaff1/list/:year/:date_column/:EMPID").get(catchErrors(billingCalendarStaffController.listYear));
router.route("/billingcalendarstaff/create").post(catchErrors(billingCalendarStaffController.create));
router.route("/billingcalendarstaff/update/:id").patch(catchErrors(billingCalendarStaffController.update));
router.route("/billingcalendarstaff/delete/:id").delete(catchErrors(billingCalendarStaffController.delete));

//_____________________________________ API for billingColorController __________________________
router.route("/billingcolor/read/:id").get(catchErrors(billingColorController.read));
router.route("/billingcolor/create").post(catchErrors(billingColorController.create));
router.route("/billingcolorwq5508/update/:id").patch(catchErrors(billingColorController.update));


//_____________________________________ API for billingColorController __________________________
router.route("/billingcolor1262/read/:id").get(catchErrors(billingColorWq1262Controller.read));
router.route("/billingcolor1262/create").post(catchErrors(billingColorWq1262Controller.create));
router.route("/billingcolorwq1262/update/:id").patch(catchErrors(billingColorWq1262Controller.update));



//_____________________________________ API for billingColorController __________________________
router.route("/billingcolor1075/read/:id").get(catchErrors(billingColorWq1075Controller.read));
router.route("/billingcolor1075/create").post(catchErrors(billingColorWq1075Controller.create));
router.route("/billingcolorwq1075/update/:id").patch(catchErrors(billingColorWq1075Controller.update));


//_____________________________________ API for billingColorController __________________________
router.route("/billingcolor3177/read/:id").get(catchErrors(billingColorWq3177Controller.read));
router.route("/billingcolor3177/create").post(catchErrors(billingColorWq3177Controller.create));
router.route("/billingcolorwq3177/update/:id").patch(catchErrors(billingColorWq3177Controller.update));



//_____________________________________ API for billingColorController __________________________
router.route("/epic-data-wq1262/list").get(catchErrors(epicController.read1262));
router.route("/epic-data-wq1075/list").get(catchErrors(epicController.read1075));
router.route("/epic-data-wq5508/list").get(catchErrors(epicController.read5508));


router.route("/irb-report/list1").post(catchErrors(irbReportController.list));
router.route("/irb-report-filters/list").get(catchErrors(irbReportController.filters));
router.route("/irb-report-table-filters/list").get(catchErrors(irbReportTableController.filters));
router.route("/irb-report-table/list1").post(catchErrors(irbReportTableController.list));



router.route("/denials/list1").post(catchErrors(denialsController.list));
router.route("/denials-filters/list").get(catchErrors(denialsController.filters));
router.route("/denials-answers/list").get(catchErrors(denialsSubController.list));




// router.route("/irb-report-kpi/list").get(catchErrors(irbReportController.KPI));


//_____________________________________ API for billingReminderController __________________________
router.route("/billingreminder/read/:id").get(catchErrors(billingReminderController.read));
router.route("/billingreminder/create").post(catchErrors(billingReminderController.create));
router.route("/billingreminder/update/:id").patch(catchErrors(billingReminderController.update));


//_____________________________________ API for billingReminderController __________________________
router.route("/performance-cards/read/:id").get(catchErrors(performanceCardsController.read));
router.route("/performance-cards/create").post(catchErrors(performanceCardsController.create));
router.route("/performance-cards/update/:id").patch(catchErrors(performanceCardsController.update));

//_____________________________________ API for billingColorWQ1075Controller __________________________
router.route("/billingcolorwq1075/read/:id").get(catchErrors(billingColorWq1075Controller.read));
router.route("/billingcolorwq1075/create").post(catchErrors(billingColorWq1075Controller.create));
router.route("/billingcolorwq1075/update/:id").patch(catchErrors(billingColorWq1075Controller.update));

//_____________________________________ API for billingteamList __________________________
router.route("/billingteamlist/list").get(catchErrors(billingTeamListController.list));

//_____________________________________ API for coverageGoverments ___________________________
// router
//   .route("/coverageGoverment/create")
//   .post(catchErrors(coverageGovermentController.create));
// router
//   .route("/coverageGoverment/read/:id")
//   .get(catchErrors(coverageGovermentController.read));
router
  .route("/coverageGoverment/update/:id")
  .patch(catchErrors(coverageGovermentController.update));
// router
//   .route("/coverageGoverment/delete/:id")
//   .delete(catchErrors(coverageGovermentController.delete));
// router
//   .route("/coverageGoverment/search")
//   .get(catchErrors(coverageGovermentController.search));
router
  .route("/coverageGoverment/list")
  .get(catchErrors(coverageGovermentController.list));


  
//_____________________________________ API for coverages Governemt Logger __________________________
router.route("/coverageGovermentLogger/create").post(catchErrors(coveragesLLoggerController.create));

//_____________________________________ API for coverages Governemt Logger __________________________
router.route("/settingsLogger/create").post(catchErrors(settingsLoggerController.create));

//_____________________________________ API for NT Studies Logger __________________________
router.route("/ntstudiesLogger/create").post(catchErrors(NTStudiesLoggerController.create));
router.route("/donotscrubirbsLogger/create").post(catchErrors(DoNotScrubIRBsLogger.create));

//_____________________________________ API for BillingIRBBudgetStatus ___________________________

router
  .route("/billingirbbudgetstatus/update/:id")
  .patch(catchErrors(BillingIrbBudgetStatusController.update));

router
  .route("/billingirbbudgetstatus/list")
  .get(catchErrors(BillingIrbBudgetStatusController.list));


  router
  .route("/billingirbbudgetstatus-status/list")
  .get(catchErrors(BillingIrbBudgetStatusController.getStatus));

router.route("/billingirbbudgetstatus/create").post(catchErrors(BillingIrbBudgetStatusController.create));
router.route("/billingirbbudgetstatus/delete/:id").delete(catchErrors(BillingIrbBudgetStatusController.delete));
router.route("/billingirbbudgetstatus-status-list/list").get(catchErrors(BillingIrbBudgetStatusController.fullList));
  



//_____________________________________ API for Status ___________________________

router
  .route("/nontherapeuticstudies/update/:id")
  .patch(catchErrors(NonTherapeuticController.update));

router
  .route("/nontherapeuticstudies/list")
  .get(catchErrors(NonTherapeuticController.list));

router.route("/nontherapeuticstudies/create").post(catchErrors(NonTherapeuticController.create));
router.route("/nontherapeuticstudies/delete/:id").delete(catchErrors(NonTherapeuticController.delete));
router.route("/nontherapeuticstudies-studies-list/list").get(catchErrors(NonTherapeuticController.fullList));



router
  .route("/donotscrubirbs/update/:id")
  .patch(catchErrors(DoNotScrubIRBsController.update));

router
  .route("/donotscrubirbs/list")
  .get(catchErrors(DoNotScrubIRBsController.list));

router.route("/donotscrubirbs/create").post(catchErrors(DoNotScrubIRBsController.create));
router.route("/donotscrubirbs/delete/:id").delete(catchErrors(DoNotScrubIRBsController.delete));
router.route("/donotscrubirbs-studies-list/list").get(catchErrors(DoNotScrubIRBsController.fullList));


//_____________________________________ API for BillingNoPccStatus ___________________________

router
  .route("/billingnopccstudies/update/:id")
  .patch(catchErrors(BillingNoPccStudiesController.update));

router
  .route("/billingnopccstudies/list")
  .get(catchErrors(BillingNoPccStudiesController.list));

router.route("/billingnopccstudies/create").post(catchErrors(BillingNoPccStudiesController.create));
router.route("/billingnopccstudies/delete/:id").delete(catchErrors(BillingNoPccStudiesController.delete));
router.route("/billingnopccstudies-studies-list/list").get(catchErrors(BillingNoPccStudiesController.fullList));
  
module.exports = router;
