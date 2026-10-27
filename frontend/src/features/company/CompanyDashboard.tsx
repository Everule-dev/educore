import React, { useState } from 'react';
import { Company, User, VerificationLog, Credential } from '../../types';
import { VerificationResponse } from '../../app/state';
import {
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Download,
  Users,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface Props {
  activeCompany: Company;
  currentUser: User;
  verificationLogs: VerificationLog[];
  onVerify: (query: string, category: 'public' | 'company', companyId: string) => Promise<VerificationResponse>;
  allCredentials: Credential[];
  onViewCertificate?: (cred: Credential) => void;
}

export const CompanyDashboard: React.FC<Props> = ({
  activeCompany,
  currentUser,
  verificationLogs,
  onVerify,
  allCredentials,
  onViewCertificate,
}) => {
  const [candidateQuery, setCandidateQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<VerificationResponse | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateQuery.trim()) return;
    setIsVerifying(true);
    const res = await onVerify(candidateQuery.trim(), 'company', activeCompany.id);
    setCurrentResult(res);
    setIsVerifying(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Lookup Value', 'Result', 'Candidate Name', 'Award Title', 'Issuer', 'Date'];
    const rows = verificationLogs.map((l) => [
      l.id,
      l.lookup_value,
      l.result,
      l.recipient_name || 'N/A',
      l.title || 'N/A',
      l.issuer_name || 'N/A',
      l.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `educore_verification_audit_${activeCompany.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1280px' }}>
      {/* Company Header */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-valid">Enterprise Verifier Portal</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                RC: {activeCompany.registration_number}
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>{activeCompany.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              {activeCompany.business_type} · Lead Verifier: <strong>{currentUser.name}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} /> Export Verification Audit (CSV)
            </button>
          </div>
        </div>

        {/* Verifier Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '28px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-dim)',
        }}>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(56, 189, 248, 0.25)' }}>
            <div className="stat-card-label">Total Candidate Audits</div>
            <div className="stat-card-value">{verificationLogs.length}</div>
            <div className="stat-card-badge">Logged in Company Audit Ledger</div>
          </div>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(16, 185, 129, 0.25)' }}>
            <div className="stat-card-label">Authentic Verified (VALID)</div>
            <div className="stat-card-value" style={{ color: 'var(--emerald-400)' }}>
              {verificationLogs.filter((v) => v.result === 'VALID').length}
            </div>
            <div className="stat-card-badge" style={{ color: 'var(--emerald-400)' }}>Cryptographically Clear</div>
          </div>
          <div className="stat-card" style={{ ['--card-accent' as any]: 'rgba(244, 63, 94, 0.25)' }}>
            <div className="stat-card-label">Fraud / Revoked Flagged</div>
            <div className="stat-card-value" style={{ color: 'var(--rose-400)' }}>
              {verificationLogs.filter((v) => v.result === 'REVOKED' || v.result === 'INVALID').length}
            </div>
            <div className="stat-card-badge" style={{ color: 'var(--rose-400)' }}>Adverse Findings</div>
          </div>
        </div>
      </div>

      {/* Instant Candidate Verification Box */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Instant Candidate Credential Audit</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Enter an applicant's EDUCORE Verification Code (e.g. <code>V-XXXX-XXXX</code>) or 64-character SHA-256 fingerprint from their official credential.
        </p>

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              required
              className="form-input"
              style={{ flex: 1, height: '48px', minWidth: '280px' }}
              placeholder="Enter Verification ID or SHA-256 fingerprint..."
              value={candidateQuery}
              onChange={(e) => setCandidateQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 24px' }}>
              <Search size={16} /> Audit Candidate Record
            </button>
          </div>
        </form>

        {/* Instant Audit Result */}
        {currentResult && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${currentResult.result === 'VALID' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${currentResult.result === 'VALID' ? 'badge-valid' : 'badge-revoked'}`}>
                  {currentResult.result}
                </span>
                <strong style={{ fontSize: '1.1rem' }}>{currentResult.credential?.title || currentResult.message}</strong>
              </div>
              {currentResult.credential && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ref: {currentResult.credential.verification_id}
                </span>
              )}
            </div>

            {currentResult.credential && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                <div>Candidate: <strong>{currentResult.credential.recipient_name}</strong></div>
                <div>Institution: <strong>{currentResult.credential.issuer_name}</strong></div>
                <div>Award Type: <strong>{currentResult.credential.credential_type}</strong></div>
                <div>Conferred: <strong>{new Date(currentResult.credential.issued_at || '').toLocaleDateString()}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification History Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Company Audit Log & History</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Maintained for corporate compliance and HR background records
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Date & Time</th>
                <th style={{ padding: '12px 16px' }}>Queried Identifier</th>
                <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                <th style={{ padding: '12px 16px' }}>Credential Award</th>
                <th style={{ padding: '12px 16px' }}>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {verificationLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px' }} className="mono">
                    {log.lookup_value}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>
                    {log.recipient_name || 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {log.title || 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${log.result === 'VALID' ? 'badge-valid' : log.result === 'REVOKED' ? 'badge-revoked' : 'badge-invalid'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
