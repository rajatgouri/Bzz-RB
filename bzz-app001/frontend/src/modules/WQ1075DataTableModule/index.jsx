import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import { FullPageLayout } from "@/layout";
import CrudDataTable from "./CrudDataTable";
import WQTableLayout from "./layout";

export default function WQ1075DataTableModule({ config }) {
  const dispatch = useDispatch();
  const childRef  = useRef()
  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  const [collapse, setCollapse] = useState()

  const onCollapsed = () => {
      setCollapse(true)
      setTimeout(() => {
        setCollapse(false)
      }, 1000)
  }
  
  return (
    // <FullPageLayout>
      <WQTableLayout ref={childRef}  collapse={collapse}>
        <CrudDataTable config={config} onCollapsed={onCollapsed}/>
      </WQTableLayout>
    // </FullPageLayout>
  );
}
