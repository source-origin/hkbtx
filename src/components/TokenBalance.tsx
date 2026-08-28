import React from 'react';
import { Row, Col, Card, Typography, Skeleton } from 'antd';
import { DollarOutlined, GiftOutlined, FireOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  bnb?: string;
  drg?: string;
  hlth?: string;
  loading?: boolean;
}

const TokenCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <Card size="small" className="glass-card" style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 20, color, marginBottom: 4 }}>{icon}</div>
    <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
    <div style={{ fontFamily: 'SF Mono,Consolas,monospace', fontWeight: 700, fontSize: 15, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '0.00'}</div>
  </Card>
);

const TokenBalance: React.FC<Props> = ({ bnb = '0', drg = '0', hlth = '0', loading }) => {
  if (loading) return <Skeleton active paragraph={{ rows: 1 }} />;
  return (
    <Row gutter={[10, 10]}>
      <Col span={8}>
        <TokenCard icon={<DollarOutlined />} label="BNB 余额" value={Number(bnb).toFixed(4)} color="#f0b429" />
      </Col>
      <Col span={8}>
        <TokenCard icon={<GiftOutlined />} label="DRG 积分" value={Number(drg).toLocaleString(undefined, { maximumFractionDigits: 2 })} color="#22c55e" />
      </Col>
      <Col span={8}>
        <TokenCard icon={<FireOutlined />} label="HLTH 治理" value={Number(hlth).toLocaleString(undefined, { maximumFractionDigits: 2 })} color="#3b82f6" />
      </Col>
    </Row>
  );
};

export default TokenBalance;
