import React from "react";

import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { login } from "@/redux/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";
import { Content } from "antd/lib/layout/layout";
import { request } from "@/request";
import { logout } from "@/redux/auth/actions";

const ChangePassword = () => {

  const { current } = useSelector(selectAuth);
  const dispatch = useDispatch();

  const onFinish = async(value) => {
    if(value.password != value.c_password) {
      notification.error({message: "Password doesn't match!"})
      return
    }


    await request.create('change-password', {password: value.password, EMPID: current.EMPID})
    logger('Submit Password')
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('x-auth-token');
    // localStorage.clear()    
    window.location.href = "/login"
    
  }

  const logger = async (status) => {
    await request.create('settingsLogger', {status})

  }


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
              <h1 style={{height: "25px", fontSize: "26px"}} >Set Your Account Password</h1>
              
              <Divider />
              <h6 style={{fontSize: "15px"}}>Your password must have the following: </h6>

              <p className="mb-0">8 characters minimum and 32 characters maximum</p>
              <p className="mb-0">1 allowed special character (! @ # $ % & + -)</p>
              <p className="mb-0">1 uppercase letter</p>
              <p className="mb-0">1 lowercase letter</p>
              <p className="mb-0">1 number</p>
              <p className="mb-2">no spaces</p>
              

              <div className="site-layout-content">
                {" "}
                <Form
                  name="change_password"
                  className="login-form"
    
                  onFinish={onFinish}
                >
                 
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Password!",
                      },
                      {pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.* )[A-Za-z\d! @#$%&+-]{6,}$/), message: "Please enter valid password"} 
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="New Password"
                      autoComplete="off"
                      onBlur={() => logger('Input Password')}
                    />
                  </Form.Item>

                  <Form.Item
                    name="c_password"
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
                      placeholder="Confirm Password"
                      autoComplete="off"
                      onBlur={() => logger('Confirm Password')}

                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      Confirm Password
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Content>
          </Col>
        </Row>

      </Layout>
    </>
  );
};

export default ChangePassword;
