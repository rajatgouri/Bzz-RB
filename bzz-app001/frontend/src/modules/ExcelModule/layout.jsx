import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

export default function WQTableLayout({ children }) {
  return (
      <Content
        className="site-layout-background"
        style={{
          width: "100%",
        }}
      >
        {children}
      </Content>
  );
}
