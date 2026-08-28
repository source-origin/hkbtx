import React from 'react';
import { Typography, Skeleton } from 'antd';
import { CrownOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import PageShell from '../components/PageShell';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

interface DAOProps {
  provider: any;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  hlthBalance: string;
}

const DAOPage: React.FC<DAOProps> = ({ isConnected, hlthBalance }) => {
  return (
    <PageShell>
      <div className="hero fade-up-1">
        <div className="hero-icon">👑</div>
        <Title level={2} style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--token-hlth)' }}>DAO</span> 治理
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          HLTH 持有者投票决定协议未来 · 提案 → 投票 → 执行
        </Text>
      </div>

      {!isConnected ? (
        <GradientCard className="fade-up-2">
          <div style={{ textAlign: 'center', padding: 20 }}>
            <CrownOutlined style={{ fontSize: 36, color: 'var(--text-dim)' }} />
            <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>连接钱包后可查看治理详情和参与投票</div>
          </div>
        </GradientCard>
      ) : (
        <>
          {/* Stats */}
          <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div className="stat-card accent-hlth">
              <span className="stat-label">我的投票权</span>
              <div className="stat-value" style={{ color: 'var(--token-hlth)' }}>
                {Number(hlthBalance).toLocaleString()} <span style={{ fontSize: 14 }}>HLTH</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-label">提案法定人数</span>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                500K <span style={{ fontSize: 14 }}>HLTH</span>
              </div>
            </div>
          </div>

          {/* Placeholder: proposals */}
          <GradientCard className="fade-up-3">
            <div className="flex-between mb-2">
              <Text strong style={{ color: 'var(--text-primary)' }}>📜 提案列表</Text>
              <span className="tag tag-purple">即将开放</span>
            </div>
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: 13 }}>
              <FileTextOutlined style={{ fontSize: 32, opacity: 0.3 }} />
              <div style={{ marginTop: 8 }}>提案数据将从此处加载</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>HLTH_Gov 合约待 BSC 主网部署</div>
            </div>
          </GradientCard>

          {/* Governance Rules */}
          <GradientCard style={{ marginTop: 16 }}>
            <div className="flex-between mb-2">
              <Text strong style={{ color: 'var(--text-primary)' }}>📖 治理规则</Text>
              <span className="tag tag-cyan">3 Phase</span>
            </div>
            <div className="hairline" />
            <div className="data-row">
              <span className="data-key">📝 提案门槛</span>
              <span className="data-val" style={{ color: 'var(--text-primary)' }}>100,000 HLTH</span>
            </div>
            <div className="data-row">
              <span className="data-key">⚖️ 法定人数</span>
              <span className="data-val" style={{ color: 'var(--text-primary)' }}>500,000 HLTH</span>
            </div>
            <div className="data-row">
              <span className="data-key">🗳️ 投票期</span>
              <span className="data-val" style={{ color: 'var(--text-primary)' }}>7 天</span>
            </div>
            <div className="data-row">
              <span className="data-key">⏱️ 执行延迟</span>
              <span className="data-val" style={{ color: 'var(--accent-cyan)' }}>48 小时</span>
            </div>
          </GradientCard>
        </>
      )}
    </PageShell>
  );
};

export default DAOPage;
