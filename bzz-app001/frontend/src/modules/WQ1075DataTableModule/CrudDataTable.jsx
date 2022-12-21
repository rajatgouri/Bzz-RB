import React from "react";

import DataTable from "./DataTable";

export default function CrudDataTable({ config , onCollapsed}) {


  return <DataTable config={config}  onCollapsed={onCollapsed} />;
}
