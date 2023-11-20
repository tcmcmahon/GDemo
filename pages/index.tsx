import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Button, Form, Input, message, Modal, Space, Table } from 'antd';
import { faker } from '@faker-js/faker';
import { Post } from '.prisma/client'; // Import the Post model instead of User

const inter = Inter({ subsets: ['latin'] });

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // Use posts instead of users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    console.log(values);
    setIsModalOpen(false);
    fetch('/api/create_post', { // Update the API endpoint to create a post
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then(async (response) => {
        if (response.status === 200) {
          const post = await response.json();
          message.success('created post ' + post.title);
          setPosts([...posts, post]);
        } else
          message.error(
            `Failed to create post:\n ${JSON.stringify(await response.json())}`
          );
      })
      .catch((res) => {
        message.error(res);
      });
  };

  const onDelete = async (post: any) => {
    const { id } = post;
    setIsModalOpen(false);
    fetch('/api/delete_post', { // Update the API endpoint to delete a post
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
      .then(async (response) => {
        if (response.status === 200) {
          await response.json();
          message.success('Deleted post ' + post.title);
          setPosts(posts.filter((p) => p.id !== id));
        } else message.error(`Failed to delete post:\n ${post.title}`);
      })
      .catch((res) => {
        message.error(res);
      });
  };

  const columns: ColumnsType<Post> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Published',
      dataIndex: 'published',
      key: 'published',
      render: (published) => <span>{published ? 'Yes' : 'No'}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onDelete(record)}>Delete</a>
        </Space>
      ),
    },
  ];

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    const title = faker.lorem.sentence();
    const content = faker.lorem.paragraph();
    const published = faker.random.boolean();

    form.setFieldsValue({
      title: title,
      content: content,
      published: published,
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

  useEffect(() => {
    fetch('api/all_posts', { method: 'GET' }) // Update the API endpoint to fetch all posts
      .then((res) => {
        res.json().then((json) => {
          setPosts(json);
        });
      });
  }, []);

  if (!posts) return 'Give me a second';

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Add Post
      </Button>
      <Modal
        title="Basic Modal"
        onCancel={handleCancel}
        open={isModalOpen}
        footer={null}
        width={800}
      >
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="published"
            label="Published"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
            <Button htmlType="button" onClick={onFill}>
              Fill form
            </Button>
            <Button htmlType="button" onClick={handleCancel}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table columns={columns} dataSource={posts} />
    </>
  );
}
