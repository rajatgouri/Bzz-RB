
import React, { useState } from "react";
import Modals from "@/components/Modal";
import Agenda from "@/pages/IRBs/Agenda";
import NoPccStudies from "@/pages/IRBs/No-Pcc-Studies";
import DataCollection from "@/pages/IRBs/DataCollection";
import IRBBudgetStatus from "@/pages/IRBs/IRBBudgetStatus2";

export default function DataControl() {
  
  {
  return  <div>
      
      <Agenda/>

      <NoPccStudies/>
      
      <DataCollection/>
       
       <IRBBudgetStatus/>
    </div>
  }  
}
