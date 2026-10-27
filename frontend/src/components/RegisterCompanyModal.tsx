import React, { useState } from 'react';
import { X, Briefcase, CheckCircle, Shield } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: {
    name: string;
    business_type: string;
    registration_number: string;
    email: string;
    phone: string;
    address: string;
  }) => void;
}

export const RegisterCompanyModal: React.FC<Props> = ({ isOpen, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      name,
      business_type: businessType,
      registration_number: regNo,
      email,
      phone,
      address,
    });
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="register-company-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrandLogo
              alt="EDUCORE"
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ height: '18px', width: '1px', background: 'var(--border-subtle)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Company Verifier Registration</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={36} color="var(--accent-emerald)" />
            </div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Company Registered</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              <strong>{name}</strong> has been provisioned on EDUCORE. Your verifier team can now log in to perform credential audits and maintain immutable candidate verification histories.
            </p>
            <button className="btn btn-primary" onClick={handleReset}>
              Continue to Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
              }}>
                <Shield size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Company verifier accounts consume cryptographic verification services to audit prospective employees and contractors while strictly respecting institutional privacy boundaries.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Registered Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sterling Human Resources Ltd"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Industry / Business Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Banking / FinTech"
                    className="form-input"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CAC Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="RC-XXXXXX"
                    className="form-input"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="talent@company.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 1 000 0000"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street and corporate office address"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Register Verifier Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
