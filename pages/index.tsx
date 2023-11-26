
import { Inter } from 'next/font/google'
import {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Button, Form, Input, message, Modal, Select, Space, Table, Tag} from "antd";
import { faker } from '@faker-js/faker';
import {User} from ".prisma/client";
const inter = Inter({ subsets: ['latin'] })

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    console.log(values);
    setIsModalOpen(false);
    fetch('/api/create_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(async response => {
      if (response.status === 200) {
        const user = await response.json();
        message.success('created user ' + user.name);
        setUsers([...users, user]);

      } else message.error(
          `Failed to create user:\n ${JSON.stringify(await response.json())}`);
    }).catch(res=>{message.error(res)})
  };

  const onDelete = async (user: any) => {
    const {id} = user;
    setIsModalOpen(false);
    fetch('/api/delete_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id})
    }).then(async response => {
      if (response.status === 200) {
        await response.json();
        message.success('Deleted user ' + user.name);
        setUsers(users.filter(u=> u.id !== id ));

      } else message.error(
          `Failed to delete user:\n ${user.name}`);
    }).catch(res=>{message.error(res)})
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },

    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
          <Space size="middle">
            <a onClick={()=>onDelete(record)}>Delete</a>
          </Space>
      ),
    },
  ];


  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state  = faker.location.state({ abbreviated: true });
    const zip = faker.location.zipCode()

    form.setFieldsValue({
      name: `${firstName} ${lastName}`,
      email: email,
      address:
          `${street}, ${city}, ${state}, US, ${zip}`
    });
  };
  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };
  useEffect(()=>{
    fetch('api/all_user', {method: "GET"})
        .then(res => {
          res.json().then(
              (json=> {setUsers(json)})
          )
        })
  }, []);

  if (!users) return "Give me a second";

  return  <>
    <Button type="primary" onClick={showModal}>
      Add User
    </Button>
    <Modal title="Basic Modal" onCancel={handleCancel}
           open={isModalOpen} footer={null}  width={800}>
      <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout} >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button  htmlType="button" onClick={onFill}>
            Fill form
          </Button>
          <Button  htmlType="button" onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    {/*<p>{JSON.stringify(users)}</p>*/}
    <Table columns={columns} dataSource={users} />;
  </>;


}
