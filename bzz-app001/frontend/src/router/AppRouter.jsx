import React, { lazy, Suspense } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PageLoader from "@/components/PageLoader";
import Reminder from "@/pages/Reminder";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector, useDispatch } from "react-redux";

const Dashboard = lazy(() =>
  import( "@/pages/Dashboard")
);

const PBReminders = lazy(() =>
  import( "@/pages/PbDashboard/Reminders")
);

const PBCards = lazy(() =>
  import( "@/pages/PbDashboard/Cards")
);

const HBCards = lazy(() =>
  import( "@/pages/PbDashboard/HBCards")
);

const PBCalendar = lazy(() =>
  import( "@/pages/PbDashboard/Calendar")
);

const PageLogger = lazy(() =>
  import( "@/pages/Loggers/PageLogger")
);

const Denials = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/Denials")
);


const OutlookLogger = lazy(() =>
  import( "@/pages/OutlookLogger")
);

const PBAvatars = lazy(() =>
  import( "@/pages/PbDashboard/Avatars")
);

const ProductivityLog = lazy(() =>
  import( "@/pages/ProductivityLog")
);

const ManagementMilestones = lazy(() =>
  import( "@/pages/ManagementMilestones")
);

const DoNotScrubIrbs = lazy(() =>
  import( "@/pages/DoNotScrubIRBs")
);


const PBAudit = lazy(() =>
  import( "@/pages/Audits/PBAudit")
);

const ManagementRoadmap = lazy(() =>
  import( "@/pages/ManagementRoadmap")
);


const ManagementDashboard = lazy(() =>
  import(
     "@/pages/ManagementDashboard"
  )
);

const ProductivityGraphs = lazy(() =>
  import(
     "@/pages/ManagementDashboard/ProductivityGraphs"
  )
);


const ProductivityTables = lazy(() =>
  import(
     "@/pages/ManagementDashboard/ProductivityTables"
  )
);


const PerformanceCards = lazy(() =>
  import(
     "@/pages/ManagementDashboard/PerformanceCards"
  )
);


const WQ1075Productivity = lazy(() =>
  import(
     "@/pages/ManagementDashboard/WQ1075Productivity"
  )
);

const WQ5508Productivity = lazy(() =>
  import(
     "@/pages/ManagementDashboard/WQ5508Productivity"
  )
);


const EpicProductivity = lazy(() =>
  import(
     "@/pages/EpicProductivity"
  )
);

const EpicProductivity1 = lazy(() =>
  import(
     "@/pages/EpicProductivity1"
  )
);


const ChangePassword = lazy(() =>
  import(
     "@/pages/PasswordManagement/ChangePassword"
  )
);

const DailyProductivity = lazy(() =>
  import(
     "@/pages/ManagementDashboard/DailyProductivity"
  )
);
const WQ1075KPIs = lazy(() =>
  import(
     "@/pages/KPIs/WQ1075KPIs"
  )
);


const WQAudit = lazy(() =>
  import(
     "@/pages/Audits/WqAudit"
  )
);



const WQError = lazy(() =>
  import(
     "@/pages/WQErrors"
  )
);




const WQErrorGraph = lazy(() =>
  import(
     "@/pages/WQErrorGraph"
  )
);

const WQErrorAudit = lazy(() =>
  import(
     "@/pages/Audits/WqErrorAudit"
  )
);


const HBWQAudit = lazy(() =>
  import(
     "@/pages/Audits/HBWqAudit"
  )
);



const WQAuditErrors = lazy(() =>
  import(
     "@/pages/Audits/AuditsErrors"
  )
);


const CalendarBoard = lazy(() =>
  import( "@/pages/CalendarBoard")
);
const TaskCalendar = lazy(() =>
  import( "@/pages/TaskCalendar")
);
const Admin = lazy(() =>
  import( "@/pages/Admin")
);

const Wq5508 = lazy(() =>
  import( "@/pages/WQs/Wq5508")
);


const Wq1075Answers = lazy(() =>
  import( "@/pages/WQs/Wq1075")
);

const Wq1262 = lazy(() =>
  import( "@/pages/WQs/Wq1262")
);


const Wq3177 = lazy(() =>
  import( "@/pages/WQs/Wq3177")
);

const MilestonesAndRoadmap = lazy(() =>
  import( "@/pages/MilestonesAndRoadmap")
);


const MappingOnCoreModule = lazy(() =>
  import( "@/pages/Mapping/MappingOnCore")
);



const MappingArmModule = lazy(() =>
  import( "@/pages/Mapping/MappingArm")
);


const Irb = lazy(() => import( "@/pages/IRBs/Irb"));

const Agenda = lazy(() => import( "@/pages/IRBs/DataControl"));

const IRBReport = lazy(() => import( "@/pages/IRBs/IRBReport"));

const HIMSTeamRoster = lazy(() => import( "@/pages/HIMS/HIMSTeamRoster"));

const HIMSStaffSchedule = lazy(() => import( "@/pages/HIMS/HIMSUserSchedule"));

const HIMSMasterTaskList = lazy(() => import( "@/pages/HIMS/HIMSMasterTaskList"));

const NoPccStudies = lazy(() => import( "@/pages/IRBs/No-Pcc-Studies"));

const Wq1075Logger = lazy(() => import( "@/pages/Loggers/WQ1075Logger"));

const Wq5508Logger = lazy(() => import( "@/pages/Loggers/WQ5508Logger"));

const Wq3177Logger = lazy(() => import( "@/pages/Loggers/WQ3177Logger"));

const NonTherapeuticStudies =  lazy(() => import( "@/pages/NonTheraputic"));

const Overview = lazy(() => import( "@/pages/Overview"));

const WorkAssignments = lazy(() => import( "@/pages/workAssignments"));

const IntakeRequest = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/IntakeRequests")
);


const Flowchart5508 = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/Flowcharts/5508Flowchart")
);

const Flowchart1075 = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/Flowcharts/1075Flowchart")
);



const Flowchart1262 = lazy(() =>
  import(/*webpackChunkName:'Denials'*/ "@/pages/Flowcharts/1262Flowchart")
);

const Iframe = lazy(() => import( "@/pages/iframe"));

const Documentation = lazy(() => import( "@/pages/Documentation"));

const PredictiveBilling = lazy(() => import( "@/pages/PredictiveBilling"));

const NLPRouting = lazy(() => import( "@/pages/NLPRouting"));

const UsefulChanges = lazy(() => import( "@/pages/UsefulChanges"));

const Pages = lazy(() => import( "@/pages/Pages"));

const CoverageGovernment = lazy(() =>
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/CoverageGovernment"
  )
);

const ResetPassword = lazy(() => 
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/PasswordManagement/ResetPassword"
  )
)

const ResetPasswordDone = lazy(() => 
  import(
    /*webpackChunkName:'CoverageGovernmentPage'*/ "@/pages/PasswordManagement/ResetPasswordDone"
  )
)

const Logout = lazy(() =>
  import(/*webpackChunkName:'LogoutPage'*/ "@/pages/Logout")
);
const NotFound = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/NotFound")
);


const EmailLogger = lazy(() =>
  import( "@/pages/Loggers/EmailLogger")
);

export default function AppRouter() {

  const { current } = useSelector(selectAuth);
  
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        {
          current.managementCard ? 
          <Switch location={location} key={location.pathname}>
         
          <PrivateRoute path="/rb-team-dashboard-reminders" component={PBReminders} exact />
          <PrivateRoute path="/pb-team-dashboard-cards" component={PBCards} exact />
          <PrivateRoute path="/hb-team-dashboard-cards" component={HBCards} exact />
          <PrivateRoute path="/rb-team-dashboard-calendar" component={PBCalendar} exact />
          <PrivateRoute path="/rb-team-dashboard-avatars" component={PBAvatars} exact />

          <PrivateRoute path="/productivity-metrics/graphs" component={ProductivityGraphs} exact/>
          <PrivateRoute path="/productivity-metrics/tables" component={ProductivityTables} exact/>

          <PrivateRoute path="/performance-cards" component={PerformanceCards} exact/>
          <PrivateRoute path="/wq1075-matrix" component={WQ1075Productivity} exact/>
          <PrivateRoute path="/wq5508-matrix" component={WQ5508Productivity} exact/>
          <PrivateRoute path="/daily-productivity" component={DailyProductivity} exact/>
          <PrivateRoute path="/wq5508-logger" component={Wq5508Logger} exact/>
          <PrivateRoute path="/wq1075-logger" component={Wq1075Logger} exact/>
          <PrivateRoute path="/professionals-center" component={Iframe} exact />
          <PrivateRoute path="/documentation" component={Documentation} exact />
          <PrivateRoute path="/team-calendar" component={CalendarBoard} exact />
          <PublicRoute path="/taskcalendar" component={TaskCalendar} exact />
          <PrivateRoute component={ManagementMilestones} path="/management-milestones" exact />
          <PrivateRoute component={ManagementRoadmap} path="/management-roadmap" exact />
          <PrivateRoute path="/milestones-and-roadmap" component={MilestonesAndRoadmap} exact />
          <PrivateRoute path="/pagelogger" component={PageLogger} exact />
          <PrivateRoute path="/outlooklogger" component={OutlookLogger} exact />
          <PrivateRoute path="/irb-report" component={IRBReport} exact />
          <PrivateRoute path="/master-staff-list" component={HIMSTeamRoster} exact />
          <PrivateRoute path="/hims-staff-schedule" component={HIMSStaffSchedule} exact />
          <PrivateRoute path="/wq-1075-kpis" component={WQ1075KPIs} exact />
          <PrivateRoute path="/denials" component={Denials} exact />
          <PrivateRoute path="/intake-request" component={IntakeRequest} exact />
          <PrivateRoute path="/epic-productivity" component={EpicProductivity1} exact />
          <PrivateRoute path="/emaillogger" component={EmailLogger} exact />
          <PrivateRoute component={Wq1075Answers} path="/wq1075" exact />
          <PrivateRoute component={Wq1075Answers} path="/wq1075-answers" exact />
          <PrivateRoute component={WQAudit} path="/pbwqaudit" exact />
          <PrivateRoute component={HBWQAudit} path="/hbwqaudit" exact />
          <PrivateRoute path="/team-audit-graphs" component={PBAudit} exact />
          <PrivateRoute path="/error-irbs" component={WQErrorAudit} exact />


          <PrivateRoute path="/5508-flowchart" component={Flowchart5508} exact />
          <PrivateRoute path="/1075-flowchart" component={Flowchart1075} exact />
          <PrivateRoute path="/1262-flowchart" component={Flowchart1262} exact />


          
          <PrivateRoute component={Wq5508} path="/wq5508" exact />
          <PrivateRoute component={Wq3177} path="/wq3177" exact />

          <PrivateRoute component={Wq1262} path="/wq1262" exact />
          <PrivateRoute component={Agenda} path="/data-control-center/irb" exact />
          <PrivateRoute component={WQAuditErrors} path="/wqauditerrors" exact />

          <PrivateRoute component={Irb} path="/irb" exact />
          <PrivateRoute component={Overview} path="/overview" exact />
          <PrivateRoute component={WorkAssignments} path="/work-assignments" exact />
          <PrivateRoute component={Reminder} path="/reminders" exact />
          <PrivateRoute component={Pages} path="/pages" exact />
          <PrivateRoute component={PredictiveBilling} path="/predictive-billing" exact />
          <PrivateRoute component={NLPRouting} path="/nlp-routing" exact />
          <PrivateRoute component={UsefulChanges} path="/useful-change" exact />
          <PrivateRoute component={NoPccStudies} path="/no-pcc-studies" exact />
          <PrivateRoute component={NonTherapeuticStudies} path="/non-therapeutic-studies" exact />
          <PrivateRoute component={DoNotScrubIrbs} path="/do-not-scrub-irbs" exact />
          <PrivateRoute component={MappingOnCoreModule} path="/mapping-oncore" exact />
          <PrivateRoute component={MappingArmModule} path="/mapping-mca" exact />
          <PrivateRoute component={WQError} path="/wq-errors" exact />
          <PrivateRoute component={WQErrorGraph} path="/wq-error-graphs" exact />

          


          <PrivateRoute path="/productivity-log" component={ProductivityLog} exact />

          <PrivateRoute component={HIMSMasterTaskList} path="/hims-master-task-list" exact />
          
          <PrivateRoute component={ChangePassword} path="/change-password" exact />


          <PrivateRoute
            component={CoverageGovernment}
            path="/coverage"
            exact
          />
          <PrivateRoute component={Admin} path="/team-members" exact />
          <PrivateRoute component={Logout} path="/logout"  />
          <PublicRoute path="/reset-password" component={ResetPassword} />  
          <PublicRoute path="/reset-password-done" component={ResetPasswordDone} />  


          <PublicRoute path="/login" render={() => <Redirect to="/" />} />

          <Route exact path="/">
            {current ? <Redirect to="/pb-team-dashboard-cards" /> : <NotFound />}
          </Route>
          <Route
            path="*"
            render={() => <Redirect to="/" />}
          />
        </Switch>
        :
         
        (
      <Switch location={location} key={location.pathname}>
        {/* <PrivateRoute path="/" component={} exact /> */}

        <PrivateRoute path="/rb-team-dashboard-reminders" component={PBReminders} exact />
          <PrivateRoute path="/pb-team-dashboard-cards" component={PBCards} exact />
          <PrivateRoute path="/hb-team-dashboard-cards" component={HBCards} exact />
          <PrivateRoute path="/rb-team-dashboard-calendar" component={PBCalendar} exact />
          <PrivateRoute path="/rb-team-dashboard-avatars" component={PBAvatars} exact />
          <PrivateRoute component={HIMSMasterTaskList} path="/hims-master-task-list" exact />
          
          <PrivateRoute path="/productivity-metrics/graphs" component={ProductivityGraphs} exact/>
          <PrivateRoute path="/productivity-metrics/tables" component={ProductivityTables} exact/>
          <PrivateRoute path="/denials" component={Denials} exact />

          <PrivateRoute path="/performance-cards" component={PerformanceCards} exact/>
          <PrivateRoute path="/epic-productivity" component={EpicProductivity1} exact />
          <PrivateRoute path="/emaillogger" component={EmailLogger} exact />
          <PrivateRoute path="/productivity-log" component={ProductivityLog} exact />

          <PrivateRoute component={WQAudit} path="/pbwqaudit" exact />

          <PrivateRoute component={HBWQAudit} path="/hbwqaudit" exact />
          <PrivateRoute path="/team-audit-graphs" component={PBAudit} exact />
          <PrivateRoute path="/error-irbs" component={WQErrorAudit} exact />

          <PrivateRoute component={ManagementMilestones} path="/management-milestones" exact />
          <PrivateRoute component={ManagementRoadmap} path="/management-roadmap" exact />
          <PrivateRoute path="/milestones-and-roadmap" component={MilestonesAndRoadmap} exact />
          <PrivateRoute path="/wq-1075-kpis" component={WQ1075KPIs} exact />
          <PrivateRoute component={WQError} path="/wq-errors" exact />
          <PrivateRoute component={WQErrorGraph} path="/wq-error-graphs" exact />


          
          <PrivateRoute path="/master-staff-list" component={HIMSTeamRoster} exact />
          <PrivateRoute path="/hims-staff-schedule" component={HIMSStaffSchedule} exact />

          <PrivateRoute path="/milestones-and-roadmap" component={MilestonesAndRoadmap} exact />
          <PrivateRoute path="/hims-staff-schedule" component={HIMSStaffSchedule} exact />
          <PrivateRoute component={WQAuditErrors} path="/wqauditerrors" exact />

          <PrivateRoute path="/professionals-center" component={Iframe} exact />
          <PrivateRoute path="/documentation" component={Documentation} exact />
          <PrivateRoute path="/team-calendar" component={CalendarBoard} exact />

          <PrivateRoute component={Reminder} path="/reminders" exact />

        <PrivateRoute component={Wq5508} path="/wq5508" exact />
        <PrivateRoute component={Wq1075Answers} path="/wq1075" exact />
        <PrivateRoute component={Wq1075Answers} path="/wq1075-answers" exact />

        <PrivateRoute component={Agenda} path="/data-control" exact />

        <PrivateRoute component={Wq1262} path="/wq1262" exact />
        <PrivateRoute component={Wq3177} path="/wq3177" exact />

        <PrivateRoute component={Irb} path="/irb" exact />
        <PrivateRoute component={NoPccStudies} path="/no-pcc-studies" exact />
        <PrivateRoute component={NonTherapeuticStudies} path="/non-therapeutic-studies" exact />
        <PrivateRoute component={ChangePassword} path="/change-password" exact />
        <PrivateRoute component={DoNotScrubIrbs} path="/do-not-scrub-irbs" exact />
        <PrivateRoute component={MappingOnCoreModule} path="/mapping-oncore" exact />
          <PrivateRoute component={MappingArmModule} path="/mapping-mca" exact />
          
        <PrivateRoute component={Agenda} path="/data-control-center/irb" exact />


        <PrivateRoute
          component={CoverageGovernment}
          path="/coverage"
          exact
        />
        <PrivateRoute component={Logout} path="/logout" exact />
        <PublicRoute path="/reset-password" component={ResetPassword} />
        <PublicRoute path="/reset-password-done" component={ResetPasswordDone} />  


        <PublicRoute path="/login" render={() => <Redirect to="/" />} />
        
        <Route exact path="/">

          {
          current && current.subSection == 'PB' ?
           <Redirect to="/pb-team-dashboard-cards" /> :
           current && current.subSection == 'HB' ?
           <Redirect to="/hb-team-dashboard-cards" /> :
           current && current.subSection == 'RBB' ?
           <Redirect to="/pb-team-dashboard-cards" /> 
           
           :
          
           <NotFound />}
        </Route>
        <Route
          path="*"
          render={() => <Redirect to="/" />}
        />
      </Switch>
    
        )
        
        
        }

      
      </AnimatePresence>
    </Suspense>
  );
}
