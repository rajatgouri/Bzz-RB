import React from "react";

import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { login, ssoLogin } from "@/redux/auth/actions";

import { useDispatch, useSelector } from "react-redux";
import { auth } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";
import {useLocation} from "react-router-dom";
import { resetPassword } from "@/auth";

const { Content, Footer } = Layout;

const ResetPasswordPage = () => {
  const { loading: isLoading } = useSelector(selectAuth);
  
 
  return (
    <>
      <Layout className="layout">
        <Row>
          <Col span={12} offset={6}>
            <Content
              style={{
                padding: "150px 0 180px",
                maxWidth: "360px",
                margin: "0 auto",
              }}
            >
              <h1>Reset Password Confirmation!</h1>
             
              <Divider />
              <div className="site-layout-content">
                <p>  Reset Password link sent to your email!</p>
                <Button type="primary" href="/">Back to Login Page</Button>
              </div>
            </Content>
          </Col>
        </Row>

        <Footer style={{ textAlign: "center" }}>
          
        </Footer>
      </Layout>
    </>
  );
};

export default ResetPasswordPage;
