import React from 'react';
import { Credential } from '../types';
import { X, Printer, ShieldCheck, QrCode } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import '../styles/certificate.css';

interface Props {
  credential: Credential | null;
  onClose: () => void;
  onVerifyNow?: (verId: string) => void;
}

export const CertificateModal: React.FC<Props> = ({ credential, onClose, onVerifyNow }) => {
  if (!credential) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="certificate-modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: '880px', background: '#0a0f1d' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ background: '#0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrandLogo
              alt="EDUCORE"
              style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ height: '18px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>Certificate Inspection</h3>
            <span className="badge badge-valid" style={{ fontSize: '0.65rem' }}>
              SHA-256 Sealed
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={14} /> Print / Save
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '16px', background: '#030712' }}>
          {/* Certificate Frame */}
          <div className="certificate-frame">
            <div className="certificate-watermark">EDUCORE</div>

            <div className="certificate-header">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <BrandLogo
                  isParchment={true}
                  alt="EDUCORE"
                  style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="certificate-institution">{credential.issuer_name}</div>
              <div className="certificate-accreditation">
                Universal Credential Registry · Verified Institutional Accreditation
              </div>
            </div>

            <div className="certificate-body">
              <div className="certificate-subtitle">This certifies that</div>
              <div className="certificate-recipient">{credential.recipient_name}</div>
              <div className="certificate-conferred-text">
                having satisfactorily completed all required academic criteria and examinations prescribed by the Academic Board, is hereby conferred the award of
              </div>

              <div className="certificate-title">{credential.title}</div>

              {credential.grade_or_honor && (
                <div className="certificate-honor">{credential.grade_or_honor}</div>
              )}

              <p style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '620px', margin: '0 auto 16px' }}>
                {credential.description}
              </p>

              {/* Signatures */}
              <div className="certificate-signatures">
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <div className="signature-name">
                    {credential.approver_name || credential.approved_by || credential.issuer_name || 'Academic Governing Board'}
                  </div>
                  <div className="signature-role">Authorized Institutional Signatory</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #fde68a 0%, #b48c36 100%)',
                    border: '3px solid #78350f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  }}>
                    <ShieldCheck size={32} color="#78350f" />
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#92400e', marginTop: '4px', letterSpacing: '0.05em' }}>
                    OFFICIAL SEAL
                  </span>
                </div>
                <div className="signature-block">
                  <div className="signature-line"></div>
                  <div className="signature-name">
                    {credential.issuer_name || 'Office of the Academic Registrar'}
                  </div>
                  <div className="signature-role">Registrar & Cryptographic Issuing Officer</div>
                </div>
              </div>

              {/* Cryptographic Security Box */}
              <div className="certificate-crypto-box">
                <div className="crypto-meta">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div>
                      <span className="crypto-label">Verification ID: </span>
                      <strong className="mono" style={{ color: '#0f172a', fontSize: '0.8rem' }}>
                        {credential.verification_id}
                      </strong>
                    </div>
                    <div>
                      <span className="crypto-label">Credential No: </span>
                      <span className="mono" style={{ color: '#0f172a', fontSize: '0.75rem' }}>
                        {credential.credential_number}
                      </span>
                    </div>
                    <div>
                      <span className="crypto-label">Date Issued: </span>
                      <span style={{ color: '#0f172a', fontSize: '0.75rem' }}>
                        {credential.issued_at ? new Date(credential.issued_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="crypto-label">Authoritative SHA-256 Cryptographic Fingerprint</div>
                  <div className="crypto-hash">
                    {credential.credential_hash || 'SHA-256 fingerprint generated upon authorized issuance'}
                  </div>

                  {/* Step 4 Document Generation & Storage Metadata */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      fontSize: '0.68rem',
                      color: '#475569',
                    }}
                  >
                    <span>
                      ⚙️ Worker Job: <strong>GenerateCredentialDocumentJob (Completed)</strong>
                    </span>
                    <span>
                      🗄️ Storage: <strong>Private Object Storage (Encrypted Vault)</strong>
                    </span>
                    <span>
                      🔗 Access Token: <strong>GET /api/v1/credentials/{credential.id}/document (Temporary Signed Link)</strong>
                    </span>
                  </div>
                </div>

                <div className="crypto-seal">
                  <QrCode size={36} color="#92400e" />
                  <span>SCAN TO VERIFY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ background: '#0f172a', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tampering with printed or digital credential will immediately cause cryptographic verification to fail.
          </div>
          {onVerifyNow && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onVerifyNow(credential.verification_id);
              }}
            >
              Verify This Credential Live →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
