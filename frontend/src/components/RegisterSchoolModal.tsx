import React, { useState } from 'react';
import { Tenant } from '../types';
import { X, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: {
    name: string;
    tenant_type: 'school' | 'organization';
    institution_type: Tenant['institution_type'];
    registration_number: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    lga: string;
  }) => void;
}

export const RegisterSchoolModal: React.FC<Props> = ({ isOpen, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [tenantType, setTenantType] = useState<'school' | 'organization'>('school');
  const [institutionType, setInstitutionType] = useState<Tenant['institution_type']>('polytechnic');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      name,
      tenant_type: tenantType,
      institution_type: institutionType,
      registration_number: regNo,
      email,
      phone,
      address,
      state,
      lga,
    });
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="register-school-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrandLogo
              alt="EDUCORE"
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ height: '18px', width: '1px', background: 'var(--border-subtle)' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Institutional Onboarding</h3>
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
            <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Application Submitted</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Your application for <strong>{name}</strong> has been routed to the EDUCORE Platform Review Board. You will be notified once accreditation documents are verified.
            </p>
            <button className="btn btn-primary" onClick={handleReset}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
              }}>
                <AlertCircle size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Per Section 1.2 of the Technical Specification, all new educational institutions undergo vetting before privileged credential issuance access is activated.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Institution / Entity Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn ${tenantType === 'school' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setTenantType('school');
                      setInstitutionType('polytechnic');
                    }}
                  >
                    Academic Institution
                  </button>
                  <button
                    type="button"
                    className={`btn ${tenantType === 'organization' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setTenantType('organization');
                      setInstitutionType('professional_body');
                    }}
                  >
                    Professional Organization
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos City Institute of Applied Technologies"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Sub-Type</label>
                  <select
                    className="form-select"
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value as Tenant['institution_type'])}
                  >
                    {tenantType === 'school' ? (
                      <>
                        <option value="traditional">Traditional University</option>
                        <option value="polytechnic">Polytechnic / Monotechnic</option>
                        <option value="vocational">Vocational / Technical</option>
                        <option value="culinary">Culinary / Hospitality</option>
                      </>
                    ) : (
                      <>
                        <option value="professional_body">Professional Chartered Body</option>
                        <option value="ngo">Non-Governmental Organization</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration / CAC / Accreditation No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NBTE/ACCR/2026/012"
                    className="form-input"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="registry@institution.edu.ng"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Headquarters / Campus Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street and campus location"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LGA</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
