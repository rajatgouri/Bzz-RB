import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

export default function WQTableLayout({ children }) {
  return (
    <Layout className="" style={{ minHeight: "450px", maxHeight: "500px", minWidth: "1000px" }}>
      
        {children}
    </Layout>
  );
}
