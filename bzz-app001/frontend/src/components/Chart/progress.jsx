import React, {useState, useEffect} from "react";
import {
  Progress
} from "antd";

export default function ProgressChart({ wq1 = true , percent , text, height = 80 , width = 78 , data = null,  customClassName, color = "#BEE6BE"}) {


  
  
  return (
    <div className={customClassName ? customClassName + " progress-chart" : "liquid-chart progress-chart"} style={{textAlign: "center",}}>
      {
        wq1 ?
        <Progress type="dashboard" strokeColor={color} percent={percent} height={height} width={width} style={{padding:"11px 0px 4px 0px"}}  />
          : 
        <Progress type="dashboard" strokeColor={color} percent={percent} height={height} width={width} style={{padding:"11px 0px 4px 0px"}} format={percent => `${percent} %` }  />

      }

<p className="liquid-chart-label">{text}</p>
      {
        data ?
        <div className="mb-7 mt-2  ft-10"> 
        <div>
        <span className="bold">
          { data.toDo} 
        </span>  {" "}
         out of  {" "}
        <span className="bold">
          {data.count}
        </span>
        </div>
        <div className="">
        <span className="">
          Scrubs:
        </span>  {" "}
       
        <span className="bold">
          {data.workable}
        </span>
        </div>
        <div className="">
        <span className="">
          Do Not Scrubs:
        </span>  {" "}
       
        <span className="bold">
          {data.nonworkable}
        </span>
        </div>
        <div className="">
        <span className="">
          Bonus Productivity:
        </span>  {" "} <br/>
       
        <span className="bold">
          {data.bonusprod}
        </span>
        </div>
        <div className="" style={{height: data.SubSection == 'PB' ? "30px" : "0px", width: "200%"}}>
          {
            data.hasOwnProperty('bonusprod3177') &&  data.user && data.user.Nickname == 'Suzanne' && data.SubSection == 'PB' ?
            <div>
            
            <span className="">
              Bonus Productivity {" "} <br/> WQ3177: {" "}
            </span> 
            
            <span className="bold">
              {data.bonusprod3177 ? data.bonusprod3177: 0}
            </span>

            
            </div>
            : null
          }

{
            data.hasOwnProperty('wqAudit') &&  data.user && data.user.Nickname == 'Anna Maria' && data.SubSection == 'PB' ?
            <div>
            
            <span className="">
              WQ Audits: <br/> {" "}
            </span> 
            
            <span className="bold">
              {data.wqAudit ? data.wqAudit: 0}
            </span>

            
            </div>
            : null
          }
            </div>
        </div>
        :null
      }
     
    </div>

  );

}
