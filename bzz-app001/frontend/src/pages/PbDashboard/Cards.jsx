import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import { DashboardLayout } from "@/layout";
import { request } from "@/request";
import TopCard from "@/components/TopCard";
import Socket from "../../socket";
import PageLoader from "@/components/PageLoader";
import { selectAuth } from "@/redux/auth/selectors";
import { useSelector } from "react-redux";
import { GetSortOrder } from "@/utils/helpers";

export default function Cards() {
  const [reminders, setReminders] = useState("");
  const [cardData, setCardData] = useState([]);
  const [admins, setAdmins] = useState([]);
   const { current } = useSelector(selectAuth);

  useEffect(() => {
    Socket.on('updated-wqs', () => {
      load();
    });

    load();
  }, [])

  const load = () => {
    (async () => {


      const performance = await request.list('performance-pb');

      let {wq5508Progress, wq1075Progress, feedbackProgress, adminlist, wq1075WorkProgress =  [], wq5508WorkProgress = [], kpi, wq1075Charges = [], wq5508Charges = [], wq1075Workable = [], wq5508Workable = [], wq1075NonWorkable = [], wq5508NonWorkable = [], wq1075BonusProd = [], wq5508BonusProd = [] , wq3177BonusProd = [], wqPBAudit = []} = performance.result

      let wq5508 = wq5508Progress;
      let wq1075 = wq1075Progress;
      let feedback = feedbackProgress;
      let wq5508Work = wq5508WorkProgress;
      let wq1075Work = wq1075WorkProgress;
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
        let WQ1075C = wq1075Charges.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508C = wq5508Charges.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 

        let WQ1075W = wq1075Workable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508W = wq5508Workable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 

        let WQ1075NW = wq1075NonWorkable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508NW = wq5508NonWorkable.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
      
        let WQ1075BP = wq1075BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt 
        let WQ5508BP = wq5508BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt
        let WQ3177BP = wq3177BonusProd.filter(k => k.Nickname == user[i].Nickname)[0].Cnt
        let WQPBAudit = wqPBAudit.filter(k => k.Nickname == user[i].Nickname)[0].Cnt


       let obj = {
        wq5508KPI: (KPI.map(res => ({
          value: res.WQ5508ChargesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace(/-/g, '/') 
        }))).splice(0,5), 
        wq1075KPI: (KPI.map(res => ({
          value: res.WQ1075ChargesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace(/-/g, '/') 
        }))).splice(0,5),
        wq5508KPIAmount: (KPI.map(res => ({
          value: res.WQ5508AmountRemoved,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace(/-/g, '/') 
        }))).splice(0,5),
        wq1075KPIAmount: (KPI.map(res => ({
          value: res.WQ1075AmountRemoved,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace(/-/g, '/') 
        }))).splice(0,5)
       }  


        merged.push({
          EMPID: user[i].EMPID,
          wq5508: wq5508.filter(wq => wq.EMPID == user[i].EMPID)[0],
          wq5508KPI: obj.wq5508KPI.reverse(),
          wq1075KPI: obj.wq1075KPI.reverse(),
          wq5508count: WQ5508C,
          wq1075count: WQ1075C,
          wq5508workable: WQ5508W,
          wq1075workable: WQ1075W,
          wq5508nonworkable: WQ5508NW,
          wq1075nonworkable: WQ1075NW,
          wq1075bonusprod: WQ1075BP,
          wq5508bonusprod: WQ5508BP,
          wq3177bonusprod: WQ3177BP,
          wqPBAudit: WQPBAudit,
          wq5508KPIAmount: obj.wq5508KPIAmount.reverse(),
          wq1075KPIAmount: obj.wq1075KPIAmount.reverse(),
          user: user[i],
          wq1075: wq1075.filter(wq => wq.EMPID == user[i].EMPID)[0],
          feedback: feedback.filter(f => f.EMPID == user[i].EMPID)[0],
          wq5508Work: wq5508Work.filter(w => w.EMPID == user[i].EMPID)[0],
          wq1075Work: wq1075Work.filter(w => w.EMPID == user[i].EMPID)[0],

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
              return <TopCard
                EMPID={data.EMPID}
                user={data.user}
                KPI= {{
                  wq1075 :data.wq1075KPI,
                  wq5508 : data.wq5508KPI,
                  wq5508KPIAmount: data.wq5508KPIAmount,
                  wq1075KPIAmount: data.wq1075KPIAmount
                }}
                wq5508count= {data.wq5508count}
                wq1075count= {data.wq1075count}
                wq5508workable= {data.wq5508workable}
                wq1075workable= {data.wq1075workable}
                wq5508nonworkable= {data.wq5508nonworkable}
                wq1075nonworkable= {data.wq1075nonworkable}
                wq1075bonusprod={data.wq1075bonusprod}
                wq5508bonusprod={data.wq5508bonusprod}
                wq3177bonusprod={data.wq3177bonusprod}
                wqPBAudit={data.wqPBAudit}
                feedback={data.feedback}
                WQ5508WorkDone={data.wq5508Work}
                showCalendar={false}
                WQ1075WorkDone={data.wq1075Work}
                title={data?.user?.First}
                kpi1={data?.wq5508?.KPI}
                kpi2={data?.wq1075?.KPI}
                percent1={data?.wq5508?.ChargesProcessed}
                percent2={data?.wq1075?.ChargesProcessed}
                percent3={data?.wq5508?.ChargesToReview}
                percent4={data?.wq1075?.ChargesToReview}
                amountWQ1075={data?.wq1075?.Amount ? JSON.parse(data.wq1075.Amount) : []}
                amountWQ5508={data?.wq5508?.Amount ? JSON.parse(data.wq5508.Amount) : []}
                agingDaysWq1075={data?.wq1075?.AgingDays ? JSON.parse(data.wq1075.AgingDays) : []}
                agingDaysWq5508={data?.wq5508?.AgingDays ? JSON.parse(data.wq5508.AgingDays) : []}
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
