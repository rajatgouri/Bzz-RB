import React, { useState, useEffect } from "react";
import { Select, Row, Col, Button, Form, Input, message, notification } from "antd";
import { selectUsersList } from "@/redux/user/selectors";
import { selectAuth } from "@/redux/auth/selectors";

import { useDispatch, useSelector } from "react-redux";
import GreenDot from "@/assets/images/green-dot.png"
import RedDot from "@/assets/images/red-dot.png"
import Logo from "@/assets/images/logo.png"
import { CaretDownOutlined, DownCircleFilled, DownCircleOutlined, MessageOutlined, RollbackOutlined, SendOutlined } from "@ant-design/icons";
import { request } from "@/request";
import socket from "@/socket";
import { user } from '@/redux/user/actions'
import { GetSortOrder } from "@/utils/helpers";


const { Option } = Select;



export default function Chat() {

  const { current } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false)
  const [From, setFrom] = useState(current.EMPID)
  const [page, setPage] = useState(0)
  const [messages, setMessages] = useState([])
  const [activeChatID, setActiveChatID] = useState()
  const [To, setTo] = useState()
  const [form] = Form.useForm()
  const [users, setUsers] = useState([])
  const [newMessage, setNewMessage] = useState()
  const [activeUser, setActiveUser] = useState()
  const [chats, setChats] = useState([])
  const [showChat, setShowChat] = useState(true)
  const [incomingMessage, setIncomingMessage] = useState(false)


  const openChatWindow = (value) => {
    setOpen(value)
    scrollToBottom()
    setMessages([])
    setActiveUser()
    setShowChat(true)
    setIncomingMessage(false)

    if (value) {
      getChats()
    }


  }

  const getUsers = () => {
    (async () => {
      let { result } = await request.list('admin-findall')
      setUsers(result.filter((r) => r.First != 'Adrienne').sort(GetSortOrder('First')))
    })()
  }

  const getChats = async () => {
    let { result } = await request.list('chat', { user: current.EMPID })
    let c = result.map((r) => {
      return ({
        user: r.User1 == current.EMPID ? r.User2 : r.User1,
        LastMsg: r.LastMsg,
        unread: r.User1 == current.EMPID ? r.Unread1: r.Unread2
      })
    })
    setChats(c)
  }

  useEffect(() => {


    getUsers()
    getChats()


  }, [])

  const onSendMesasge = async ({ Message }) => {


    socket.emit("new-message", {
      room: activeChatID,
      to: To,
      from: From,
      message: Message
    })

    form.resetFields()
  }

  const getMessages = async (ChatID, Page) => {

    let { result } = await request.list('messages', {
      Chat: ChatID,
      Page: Page
    })

    if (messages && messages.length > 0) {
      let mess = (result.reverse()).concat(messages)
      setMessages(mess)
    } else {
      setMessages([])
     
      setMessages(result.reverse())
      scrollToBottom()
    }

  }


  socket.on("on-new-message", (data) => {
    setNewMessage(data)
  })


  useEffect(() => {
    if (newMessage) {

      if (activeChatID && activeUser && ((activeUser.EMPID == newMessage.From) || (newMessage.From == current.EMPID))) {
        setMessages([...messages, newMessage])
        setTimeout(() => scrollToBottom(), 200)

      }

      if(!open) {
        setIncomingMessage(true)
      }

      let user = users.filter(u => u.EMPID == newMessage.From)[0];
      if (user.EMPID != current.EMPID) {
        notification.success({ message: `${user.Nickname}: ${newMessage.Message}` })

        if (!activeUser || ((activeUser && activeUser.EMPID) ? activeUser.EMPID != newMessage.From : false)) {
          socket.emit("unread-message", {
            room: newMessage.Chat,
            to: newMessage.To,
            
          })
        }
      }
    }
  }, [newMessage])

  const onUserChanged = async (value) => {

    setActiveUser(getUser(value))
    let { result } = await request.create('chat', {
      User1: From,
      User2: value
    })

    socket.emit("join-room", { room: result.ID })
    socket.emit('read-message', { room: result.ID, to: value })

    setActiveChatID(result.ID)
    
    setPage(10)
    setTo(value)
      getMessages(result.ID, 0)
    setShowChat(false)

    setMessages([])

    setTimeout(()=> {
      scrollToBottom()
    }, 500)

  }

  const scrollToBottom = () => {
    let el = document.getElementsByClassName("messages")[0]
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }


  const handleScroll = (e, activeChatID, skip = []) => {
    let el = document.getElementsByClassName("messages")[0]
    if (el.scrollTop < 5) {
      getMessages(activeChatID, skip.length)
      let el = document.getElementsByClassName("messages")[0]
      if (el) {
        el.scrollTop = 10;
      }

    }
  }

  const getUser = (EMPID) => {
    return users.filter(u => u.EMPID == EMPID)[0]
  }

  const getImage = (EmpID) => {
    let user = users.filter(u => u.EMPID == EmpID)[0]
    if (user && user.Avatar && user.Avatar != "null") {

      return users.filter(u => u.EMPID == EmpID)[0].Avatar
    }

  }


  return (
    <Row className="chat">
      {
        open ?
          <Row gutter={[24, 24]} className="chat-window border">
            <Col span={24} className="whiteBox p-5">

              <Row gutter={[24, 24]} className="bg-grey  chat-header">
                <Col span={12}>
                  <label><MessageOutlined size="small" /> <span>{activeUser ? activeUser.Nickname : "Chat"}</span></label>
                </Col>
                <Col span={12} className="text-end">
                  {
                    showChat ? 
                    ''
                    :
                    <RollbackOutlined onClick={() =>  {
                      setMessages([])
                      setShowChat(true)
                      getChats()
                      setActiveUser(null)
                    }}  className="mr-5"/>
                 
                  }

                  <DownCircleOutlined onClick={() => openChatWindow(!open)} />
                </Col>
              </Row>
              

              {
                showChat ?
                <div>
                  <Select className="mt-5 w-100" placeholder="Search Users" onChange={(e) => onUserChanged(e)}>
                {users && users.map(u => {
                  return <Option value={u.EMPID}>
                    {u.Nickname}
                  </Option>

                })}
              </Select>
                  <div className="border border-rounded mt-5 chat-container">
                    <div className="chats" id="chats" >
                      {
                        chats && chats.map(m => {
                          let user = getUser(m.user)

                          if (!user) {
                            return
                          }

                          return <Row gutter={[24, 24]} className="w-100  chat" onClick={() => onUserChanged(user.EMPID)}>
                            <Col span={4}>
                              <img className="mt-1" src={(user.Avatar && user.Avatar != 'null') ? user.Avatar : Logo} height="30" width="30" style={{ borderRadius: "50%" }}></img>
                            </Col>
                            <Col span={20} className="p-2">
                              <Row>
                                  <Col span={20}>
                                    <h4 className="chat-username"> {user.Nickname}</h4>
                                  </Col>
                                  <Col span={4} className="text-end"> 
                                  {
                                    m.unread ?
                                    <span className="unread"> {m.unread}</span>
                                     : null 
                                  }
                                  </Col>
                              </Row>
                            </Col>
                          </Row>
                        })
                      }
                    </div>
                  </div>
                </div>

                  :
                  <div className="border border-rounded mt-5 message-container">
                    <div className="messages" id="messages" onScroll={(e) => handleScroll(e, activeChatID, messages)}>


                      {
                        messages && messages.map(m => {

                          let src = getImage(m.From) ? getImage(m.From) : Logo

                          if (m.From == current.EMPID) {
                            return <Row gutter={[24, 24]} className="w-100 ">

                              <Col span={20} className="text-end p-2">
                                <span className="to-message ">

                                <span className="ft-12 d-block mt-15">
                                  {m.Message}
                                </span>
                                <span className="to-time">
                                  <Row>
                                    
                                    <Col span={12} className="bold ">
                                     <span className="ml-5"> {getUser(m.From).Nickname}</span>
                                    </Col>
                                    <Col span={12} className="text-end">
                                    {m.UploadDateTime.split('T')[0].substring(5,10).replace('-','/') + " "} 
                                    {m.UploadDateTime.split('T')[1].substring(0,5)}
                                    </Col>

                                  </Row>
                                 
                                  </span>

                                </span>
                              </Col>
                              <Col span={4} className="text-end">
                                <img src={src} height="30" width="30" style={{ borderRadius: "50%" }}></img>
                                {/* <span className="to-date">
                                  {m.UploadDateTime.split('T')[0].substring(5,10).replace('-', '/')}
                                  </span> */}
                              </Col>
                            </Row>

                          } else {

                            return <Row gutter={[24, 24]} className="w-100 ">
                              <Col span={4}>
                                <img src={src} height="30" width="30" style={{ borderRadius: "50%" }}></img>
                                {/* <span className="from-date">
                                  {m.UploadDateTime.split('T')[0].substring(5,10).replace('-', '/')}
                                  </span> */}
                              </Col>
                              <Col span={20} className="p-2">
                                <span className="from-message"> 
                                <span className="ft-12 d-block mt-15">
                                  {m.Message}
                                </span>
                                <span className="from-time">
                                <Row>
                                    
                                    <Col span={12} className="bold">
                                    <span className="ml-5"> {getUser(m.From).Nickname}</span>

                                    </Col>
                                    <Col span={12} className="text-end">
                                    {m.UploadDateTime.split('T')[0].substring(5,10).replace('-','/') + " "} 
                                    {m.UploadDateTime.split('T')[1].substring(0,5)}
                                    </Col>

                                  </Row>
                                  </span>
                                </span>

                              </Col>
                            </Row>


                          }
                        })
                      }








                    </div>
                    <div className="message-box">
                      <Form
                        name="basic"
                        labelCol={{ span: 0 }}
                        wrapperCol={{ span: 24 }}
                        onFinish={onSendMesasge}
                        autoComplete="off"
                        form={form}
                      >

                        <Row gutter={[24, 24]}>
                          <Col span={18}>
                            <Form.Item
                              label=""
                              name="Message"
                              rules={[{ required: true, message: 'Please input Message!' }]}
                            >
                              <Input placeholder="Message" />
                            </Form.Item>
                          </Col>

                          <Col span={6} className="p-0">
                            <Button type="primary" htmlType="submit" >
                              <SendOutlined />
                            </Button>
                          </Col>

                        </Row>


                      </Form>

                    </div>
                  </div>
              }
            </Col>

          </Row>
          :
          <Button className={incomingMessage ?  "chat-button bg-green" : "chat-button bg-dark" } onClick={() => openChatWindow(true)}>
            <MessageOutlined /> <span>Chat Window</span>
          </Button>
      }
    </Row>

  );
};


