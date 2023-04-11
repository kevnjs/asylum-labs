import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Space, Card } from 'antd';

const ProfilePage = () => {
  const { user } = useAuth0();
  console.log(user);
  if (!user) {
    return <p>Please login</p>;
  }

  return (
    <div>
      <div class="profile-card">
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Card
            size="Large"
            title={`Welcome ${user.nickname}!`}
            style={{ width: 600, marginLeft: 100, marginTop: 20 }}
          >
            <Avatar size={48} src={user.picture} />
            <span style={{ padding: 0, marginLeft: 20, fontSize: 21 }}>
              {user.name}
            </span>
          </Card>
          <Card
            size="small"
            style={{ width: 600, marginLeft: 100, marginBottom: 0 }}
          >
            <strong>Name: </strong>
            {user.name} <br />
          </Card>
          <Card
            size="small"
            style={{ width: 600, marginLeft: 100, marginBottom: 500 }}
          >
            <strong>Email: </strong>
            {user.email}
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default ProfilePage;
