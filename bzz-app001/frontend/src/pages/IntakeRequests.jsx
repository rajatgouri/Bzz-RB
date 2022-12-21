
import React, { useState, useEffect, useRef } from "react";

import { Input, Button, Space, Form, Row, Col, Select, notification, DatePicker, Modal } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
let { request } = require('../request/index');

import IntakeRequestTable from "./Request";
const dateFormat = 'YYYY/MM/DD';



export default function IntakeRequest() {
 


  {
    return (
      <div>
        <IntakeRequestTable page={'Intake Requests'}/>
      </div>
    )
  }
}
