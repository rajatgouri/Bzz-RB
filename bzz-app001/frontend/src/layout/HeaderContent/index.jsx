import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Layout, Avatar, Menu, Dropdown } from "antd";

import { UserOutlined } from "@ant-design/icons";
import { logout } from "@/redux/auth/actions";
import uniqueId from "@/utils/uinqueId";
import { selectListItems } from "@/redux/crud/selectors";
import { crud } from "@/redux/crud/actions";

const { Header } = Layout;

export default function HeaderContent() {

  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const { result: listResult, isLoading: listIsLoading } =
    useSelector(selectListItems);

  useEffect(() => {
    (async() => {
      dispatch(crud.list(entity));
    })()
  }, [])


  const menu = (
    <Menu>
      <Menu.Item key={`${uniqueId()}`} onClick={() => dispatch(logout())}>
        Log Out
      </Menu.Item>

      {
        users.map((user) => {
          return <Menu.Item key={`${uniqueId()}`} >
            {user.First}
          </Menu.Item>
          
        })
      }
    </Menu>
  );
  return (
    <Header
      className="site-layout-background"
      style={{ padding: 0, background: "none" }}
    >
      {/* <Dropdown overlay={menu} placement="bottomRight" arrow>
        <Avatar icon={<UserOutlined />} />
      </Dropdown> */}
    </Header>
  );
}
