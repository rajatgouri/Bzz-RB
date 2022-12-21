import React, { useLayoutEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import { FullPageLayout } from "@/layout";
import CrudDataTable from "./CrudDataTable";
import WQTableLayout from "./layout";

export default function WQ1262DataTableModule({ config }) {
  const dispatch = useDispatch();
  const [collapse, setCollapse] = useState()

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  const onCollapsed = () => {
    setCollapse(true)
    setTimeout(() => {
      setCollapse(false)
    },1000)
  }

  return (
    // <FullPageLayout>
      <WQTableLayout config={config} collapse={collapse}>
        <CrudDataTable config={config} onCollapsed={onCollapsed}/>
      </WQTableLayout>
    // </FullPageLayout>
  );
}
