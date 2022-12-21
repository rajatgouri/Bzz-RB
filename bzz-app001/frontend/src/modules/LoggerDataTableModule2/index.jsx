import React, { useLayoutEffect } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import { FullPageLayout } from "@/layout";
import CrudDataTable from "./CrudDataTable";
import WQTableLayout from "./layout";

export default function LoggerDataTableModule1({ config }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    // <FullPageLayout>
      <loggerTableLayout2>
        <CrudDataTable config={config} />
      </loggerTableLayout2>
    // </FullPageLayout>
  );
}
