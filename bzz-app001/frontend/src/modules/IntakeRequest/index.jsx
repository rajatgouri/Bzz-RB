import React, { useLayoutEffect } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import CrudDataTable from "./CrudDataTable";
import WQTableLayout from "./layout";

export default function IntakeRequestTableModule({ config }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    // <FullPageLayout>
      <WQTableLayout>
        <CrudDataTable config={config} />
      </WQTableLayout>
    // </FullPageLayout>
  );
}
