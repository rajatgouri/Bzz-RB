import React, { useLayoutEffect } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import { DataTableLayout } from "@/layout";

import DataTable from "./DataTable";

export default function CoverageModule({ config }) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(crud.resetState());
  }, []);

  return (
    <DataTableLayout>
      <DataTable config={config} />
    </DataTableLayout>
  );
}
