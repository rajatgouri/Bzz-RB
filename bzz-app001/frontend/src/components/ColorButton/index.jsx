import React, { useEffect, useState } from "react";
import {  Button } from "antd";
import uniqueId from "@/utils/uinqueId";


export default function ColorsButton ({colorsList, onSelectColor}) {

  return  colorsList.map((element, index) => {
          let borderStyleColor = "lightgrey"
          return (
            <div className="colorPicker" key={uniqueId()}>
              <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: "bold" }} className="digital"> {element.total < 999 ? ('000' + element.total).substr(-3) : element.total}</div>
              <Button
                type="primary"
                shape="circle"
                style={{
                  minWidth: "25px",
                  width: "26px",
                  height: "25px",
                  background: element.color,
                  borderColor: element.selected ? '#000000' : borderStyleColor,
                  margin: "auto",
                  marginBottom: "5px",
                  display: element.text == "Review" ? "block" : "inline-block"
        
                }}
                onClick={(e) => {
                  onSelectColor(index, element.color)
                }}
              >
                &nbsp;
              </Button>
              <span >{element.text}</span>
            </div>
          );
        })
} 

 

    

  

  


         
          