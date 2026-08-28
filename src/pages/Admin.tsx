import React from 'react';
import { Typography } from 'antd';
import { SafetyCertificateOutlined, SettingOutlined } from '@ant-design/icons';
import PageShell from '../components/PageShell';
import GradientCard from '../components/GradientCard';

const { Title, Text } = Typography;

interface AdminProps {
  provider: any;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
}

const AdminPage: React.FC<AdminProps> = ({ isConnected }) => {
  return (
    <PageShell>
      <div className="hero fade-up-1">
        <div className="hero-icon">⚙️</div>
        <Title level={2} style={{ color: 'var(--text-primary)' }}>
          管理<span style={{ color: 'var(--accent-cyan)' }}>后台</span>
        </Title>
        <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          合约配置 · 系统监控 · 权限管理
        </Text>
        <Text style={{ color: 'var(--text-dim)', fontSize: 12, display: 'block', marginTop: 4 }}>
          管理合约待 BSC 主网部署
        </Text>
      </div>

      {!isConnected ? (
        <GradientCard className="fade-up-2">
          <div style={{ textAlign: 'center', padding: 20 }}>
            <SafetyCertificateOutlined style={{ fontSize: 36, color: 'var(--text-dim)' }} />
            <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>连接管理员钱包后查看控制面板</div>
          </div>
        </GradientCard>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div className="stat-card">
              <span className="stat-label">合约注册</span>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)', fontSize: 20 }}>11</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">管理角色</span>
              <div className="stat-value" style={{ color: 'var(--token-hlth)', fontSize: 20 }}>6</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">审计日志</span>
              <div className="stat-value" style={{ color: 'var(--token-drg)', fontSize: 20 }}>—</div>
            </div>
          </div>

          {/* Contract List */}
          <GradientCard className="fade-up-3">
            <div className="flex-between mb-2">
              <Text strong style={{ color: 'var(--text-primary)' }}>📋 已注册合约</Text>
              <span className="tag tag-cyan">AdminManager</span>
            </div>
            <div className="hairline" />
            {[
              { name: 'Vault', addr: '0x70e0...FC49' },
              { name: 'Distributor', addr: '0x9540...3778' },
              { name: 'ReservePool', addr: '0xf505...6f36' },
              { name: 'Staking', addr: '0x8f86...E4Cf' },
              { name: 'ReferralTree', addr: '0x1291...C274' },
              { name: 'Reward', addr: '0x4826...8528' },
            ].map((c, i) => (
              <div className="data-row" key={i}>
                <span className="data-key">{c.name}</span>
                <span className="data-val" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{c.addr}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button className="btn-outline" style={{ flex: 1 }}>↻ 刷新</button>
              <button className="btn-danger" style={{ flex: 1 }}>⏸ 暂停系统</button>
            </div>
          </GradientCard>

          {/* RBAC */}
          <GradientCard style={{ marginTop: 16 }}>
            <div className="flex-between mb-2">
              <Text strong style={{ color: 'var(--text-primary)' }}>🔑 角色管理</Text>
              <span className="tag tag-purple">RBAC</span>
            </div>
            <div className="hairline" />
            {['SUPER_ADMIN', 'CONFIG_ADMIN', 'FINANCE_ADMIN', 'PRODUCT_ADMIN', 'EMERGENCY_ADMIN'].map(r => (
              <div className="data-row" key={r}>
                <span className="data-key">{r}</span>
                <span className="data-val" style={{ color: 'var(--token-drg)' }}>已配置</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <button className="btn-outline" style={{ width: '100%' }}>
                管理角色授权 → 连接 AdminManager 合约
              </button>
            </div>
          </GradientCard>
        </>
      )}
    </PageShell>
  );
};

export default AdminPage;
