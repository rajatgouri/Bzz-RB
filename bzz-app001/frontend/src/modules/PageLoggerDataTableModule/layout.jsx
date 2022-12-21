import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

export default function loggerTableLayout2({ children }) {
  return (
    <Layout className="" style={{ minHeight: "100vh", maxHeight: "100vh",    }}>
      
        {children}
    </Layout>
  );
}
