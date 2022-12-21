import React from "react";

import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { login, ssoLogin } from "@/redux/auth/actions";

import { useDispatch, useSelector } from "react-redux";
import { auth } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";
import { useEffect, useState } from "react";
import {useLocation} from "react-router-dom";

const { Content, Footer } = Layout;

const LoginPage = () => {
  const { loading: isLoading } = useSelector(selectAuth);
  const [ssoToken, setSSOToken] = useState()
  
  const search = useLocation().search;
  const id = new URLSearchParams(search).get('token');

    useEffect(() => {
      let token = localStorage.getItem('SSO')
      setSSOToken(token)
    }, [])


    useEffect(() => {
      if(id) {
        dispatch(ssoLogin({token: id.replace(/"/g, '')}));

      }
    },[id])

    const loginWIthSSO = () => {
      dispatch(ssoLogin({token: ssoToken}));

    }

  const dispatch = useDispatch();
  const onFinish = (values) => {
    dispatch(login(values));
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
              <h1>Login</h1>
              {/* {error && (
                <ErrorNotice
                  message={error}
                  clearError={() => setError(undefined)}
                />
              )} */}
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
                      placeholder=""
                      autoComplete="off"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Password!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder=""
                      autoComplete="off"
                    />
                  </Form.Item>
                  <Form.Item>
                    

                    <a className="login-form-forgot" href="/reset-password">
                      Forgot password
                    </a>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                      loading={isLoading}
                    >
                      Log In
                    </Button>
                    {/* Or <a href="">register now!</a> */}
                  </Form.Item>

                  {

                    ssoToken ? 
                    <div>
                     <p style={{textAlign:"center", marginTop: "-20px"}}>or</p>
                   
                     <Form.Item>
                         
                     <Button
                         type="primary"
                         htmlType="button"
                         className="login-form-button"
                         loading={isLoading}
                         onClick={loginWIthSSO}
                       >
                         Login with Single Sign-On
                       </Button>
                     </Form.Item>
                     </div>

                    : null
                  }
                 
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

export default LoginPage;
