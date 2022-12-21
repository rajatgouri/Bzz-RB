import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import { request } from "@/request";
import HBTopCard from "@/components/HBTopCard";
import Socket from "../../socket";
import PageLoader from "@/components/PageLoader";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector } from "react-redux";
import { GetSortOrder } from "@/utils/helpers";

export default function Cards() {
  const [reminders, setReminders] = useState("");
  const [cardData, setCardData] = useState([]);
  const [admins, setAdmins] = useState([])
  const { current } = useSelector(selectAuth);

  useEffect(() => {
    Socket.on('updated-hb-wqs', () => {
      load();
    });

    load();
  }, [])


  
  const load = () => {
    (async () => {

      const performance = await request.list('performance-hb');

      let {wq1Progress,  feedbackProgress, adminlist,  wq1WorkProgress = [], kpi, Crb, Logs,wq1262Charges = [], wq1262Workable = [], wq1262NonWorkable = [], wq1262BonusProd = [], wqHBAudit = []} = performance.result

      let wq1 = wq1Progress;
      let feedback = feedbackProgress;
      let wq1Work = wq1WorkProgress;
      let admin = adminlist;

      setAdmins(admin.filter(list => list.ManagementCard == '1' && list.First != 'Admin'))
      let user = admin.filter(list => list.ManagementCard != '1').sort(GetSortOrder('Nickname'))
      let firstPart = user.filter((u) => u.SubSection != 'RBB')
      let secondPart = user.filter((u) => u.SubSection == 'RBB')

      user = firstPart.concat(secondPart)

       
      let merged = [];

      if (!current.managementCard) {
        let emp = user.filter((u) => u.EMPID == current.EMPID)[0]
        user =user.filter((u) => u.EMPID != current.EMPID)  
        user.unshift(emp)
      }

      for (let i = 0; i < user.length; i++) {
        let KPI = kpi.filter(k => k.EMPID == user[i].EMPID)
        let CRB = Crb.filter(k => k.EMPID == user[i].EMPID)
        let LOGS = Logs.filter(k => k.EMPID == user[i].EMPID)[0]
      let WQ1262C = wq1262Charges.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
      let WQ1262W = wq1262Workable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
      let WQ1262NW = wq1262NonWorkable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
      let WQ1262BP = wq1262BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt
      let WQHBAudit = wqHBAudit.filter(k => k.Nickname == user[i].Nickname)[0].Cnt

      


       let obj = {
        wq1KPI: (KPI.map(res => ({
          value: res.WQ1262ChargesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace(/-/g, '/') 
        }))).splice(0,5), 
        
        wq1KPIAmount: (KPI.map(res => ({
          value: res.WQ1262AmountRemoved,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace(/-/g, '/') 
        }))).splice(0,5),
        
       }  

      

       let crb = {

        units: LOGS ? LOGS['Units'] : 0,
        minutes: LOGS ? LOGS['Minutes'] : 0,
        unitsG: (CRB.map(res => ({

          value: res.Units,
          year: res.Date.split('T')[0].replace(/-/g, '/').substr(5,10).replace(/-/g, '/')  
        }))).splice(0,5).reverse(), 
        
        minutesG: (CRB.map(res => ({
          value: res.Minutes,
          year: res.Date.split('T')[0].replace(/-/g, '/').substr(5,10).replace(/-/g, '/')  
        }))).splice(0,5).reverse(),
        
       }  



        merged.push({
          EMPID: user[i].EMPID,
          wq1: wq1.filter(wq => wq.EMPID == user[i].EMPID)[0],
          wq1KPI: obj.wq1KPI.reverse(),
          wq1KPIAmount: obj.wq1KPIAmount.reverse(),
          crb: crb,
          wq1262count: WQ1262C,
          wq1262workable: WQ1262W,
          wq1262nonworkable: WQ1262NW,
          wq1262bonusprod :  WQ1262BP,
          user: user[i],
          feedback: feedback.filter(f => f.EMPID == user[i].EMPID)[0],
          wq1Work: wq1Work.filter(w => w.EMPID == user[i].EMPID)[0],
          WQHBAudit:WQHBAudit
        });
      }

      
      setCardData(merged)


    })()
  }

  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", { EMPID: id, Stars: rating });
    if (feedback.success) {
      notification.success({ message: "Feedback given successfully!" })
    }
  }


  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4"
    },
    section: {
      minHeight: "100vh",
      maxHeight: "100vh",
      minWidth: "1300px"
    }

  }

  return (
    <DashboardLayout style={dashboardStyles}>
      {
        cardData.length > 0 ?
          <Row gutter={[20, 20]}style={{ width: "100%", display: "block", marginLeft: "0px" }}>
            <Col className="" style={{ width: "100%", textAlign: "left", padding: "0px"  }}>
              <div
                className="whiteBox shadow"
                style={{ color: "#595959", fontSize: 13 }}
              >

                <Row gutter={[24, 24]} className="texture">
                  {
                    admins && admins.map((admin) => {
                      return <Col style={{ width: "20%", height: "142px" }}>
                        <div
                          className="pad5 strong"
                          style={{ textAlign: "left" }}
                        >
                          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">

                            {admin.Nickname}

                          </h3>

                          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
                            {
                              admin && admin.Avatar && admin.Avatar != "null"  ?
                                <img src={admin.Avatar} className="user-avatar scale2"></img>
                                : null
                            }
                          </div>

                        </div>
                      </Col>
                    })
                  }


                  
                <Col  style={{ width: "260px", position: "absolute", right: "0px", display: "flex" ,height: "142px"}}>
                      <span  className="topbar-header">Management</span>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          : null
      }

      <div className="space30"></div>

      <Row gutter={[20, 20]}>

        {
          cardData.length > 0 ?
            cardData.map((data) => {
              return <HBTopCard
                EMPID={data.EMPID}
                user={data.user}
                KPI= {{
                  wq1 : data.wq1KPI,
                  wq1KPIAmount: data.wq1KPIAmount
                }}
                wq1262count={data.wq1262count}
                workable={data.wq1262workable}
                nonworkable={data.wq1262nonworkable}
                wq1262bonusprod={data.wq1262bonusprod}
                wqHBAudit ={data.WQHBAudit}
                CRB= {data.crb}
                feedback={data.feedback}
                WQ1WorkDone={data.wq1Work}
                showCalendar={false}
                title={data?.user?.First}
                kpi1={data?.wq1?.KPI}
                percent1={data?.wq1?.ChargesProcessed}
                percent3={data?.wq1?.ChargesToReview}
                hasRN={data?.wq1?.HasRN}
                amountWQ1={data?.wq1?.Amount ? JSON.parse(data.wq1.Amount) : []}
                agingDaysWq1={data?.wq1?.AgingDays ? JSON.parse(data.wq1.AgingDays) : []}
                onRatingChanged={(id, rating) => ratingChanged(id, rating)}
                notes={() => { }}
              />
            })

            :
            <PageLoader />
        }
      </Row>
    </DashboardLayout>
  );
}
