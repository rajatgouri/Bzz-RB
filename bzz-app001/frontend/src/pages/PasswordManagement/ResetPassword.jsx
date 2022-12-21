import React from "react";

import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";


import { useDispatch, useSelector } from "react-redux";
import { auth } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";
import {useLocation} from "react-router-dom";
import { resetPassword } from "@/redux/auth/actions";

const { Content, Footer } = Layout;

const ResetPasswordPage = () => {
  const { loading: isLoading } = useSelector(selectAuth);
  
  const dispatch = useDispatch();
  const onFinish = (values) => {
    dispatch(resetPassword(values));
  };

  
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
              <h1>Reset Password</h1>
             
              <Divider />
              <div className="site-layout-content">
                {" "}
                <Form
                  name="normal_login"
                  className="login-form"
                  initialValues={{
                    remember: true,
                  }}
                  onFinish={onFinish}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Email!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="Email"
                      autoComplete="off"
                    />
                  </Form.Item>
                 

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                      loading={isLoading}
                    >
                      Send
                    </Button>
                    {/* Or <a href="">register now!</a> */}
                  </Form.Item>

                
                </Form>


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
