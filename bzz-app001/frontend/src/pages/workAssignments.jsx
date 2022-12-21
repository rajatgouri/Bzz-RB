import FullPageLayout from "@/layout/FullPageLayout";
import React, { useState, useEffect } from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js'
import draftToHtml from 'draftjs-to-html';
import { Button } from "antd";
import { request } from "@/request";
import { notification } from "antd";
import { FullCalendarLayout } from "@/layout";
// import background from "../assets/images/background1.jpg";


const styles = {
  layout: {
    // backgroundImage : `url(${background})`,
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat"
  } ,
  content:  {
    padding: "30px 40px",
    margin: "85px auto",
    width: "100%",
    maxWidth: "1090px",
    height: "78vh",
    background: "white",
    boxShadow: "1px 1px 6px 5px lightgrey",
    borderRadius: "5px"
  } 
}

export default function WorkAssignments() {
  
  return (
    <FullCalendarLayout style={styles}>
      <h3 className="calendar-header">Work Assignments</h3>
      
    </FullCalendarLayout> 
  )

}
