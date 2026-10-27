import React, { useState } from 'react';
import { BrandLogo } from '../../components/BrandLogo';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Lock,
  Building2,
  Briefcase,
  GraduationCap,
  Fingerprint,
  CheckCircle2,
  Sparkles,
  Activity,
  Award,
  BookOpen,
} from 'lucide-react';

interface Props {
  onNavigateVerify: (query?: string) => void;
  onOpenRegisterSchool: () => void;
  onOpenRegisterCompany: () => void;
  onOpenUserAuth: () => void;
}

export const HomePage: React.FC<Props> = ({
  onNavigateVerify,
  onOpenRegisterSchool,
  onOpenRegisterCompany,
  onOpenUserAuth,
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigateVerify(heroSearch.trim());
    } else {
      onNavigateVerify();
    }
  };

  return (
    <div className="page-container">
      {/* =========================================================================
          SECTION 1: HERO SHOWCASE (TWO-COLUMN WITH 3D HOLOGRAPHIC EMBLEM)
          ========================================================================= */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '48px',
        alignItems: 'center',
        marginBottom: '84px',
        position: 'relative',
      }}>
        {/* Left Column: Mission, Search & Metrics */}
        <div>
          {/* Shimmer Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.12))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            padding: '7px 16px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '24px',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)',
            maxWidth: '100%',
          }}>
            <Sparkles size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(0.68rem, 2.5vw, 0.8rem)', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em', lineHeight: 1.3 }}>
              GLOBAL ZERO-TRUST CREDENTIAL ENGINE · UNIVERSAL STANDARD
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            marginBottom: '20px',
          }}>
            Verify. Trust.
            <br />
            <span className="text-gradient-cyan">
              Empower.
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: '32px',
            maxWidth: '560px',
          }}>
            Eliminate credential fraud and forged academic transcripts. EDUCORE binds educational degrees to <strong>deterministic SHA-256 fingerprints</strong> with mathematically verified multi-tenant isolation.
          </p>

          {/* Interactive Search Console */}
          <form onSubmit={handleHeroSubmit} style={{ maxWidth: '580px', marginBottom: '24px' }}>
            <div className="hero-search-console">
              <Search size={22} style={{ color: 'var(--cyan)', marginLeft: '12px', flexShrink: 0 }} />
              <input
                id="hero-verifier-input"
                type="text"
                placeholder="Enter Verification Reference (e.g. V-XXXX-XXXX) or SHA-256..."
                className="form-input"
                style={{
                  border: 'none',
                  background: 'transparent',
                  height: '48px',
                  fontSize: '0.975rem',
                  paddingLeft: '6px',
                  color: 'var(--text-main)',
                  boxShadow: 'none',
                }}
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-cyan"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Verify Live <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Live Lookup Protocol Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--cyan)" />
              Accepts Verification ID, Credential Number, or 64-character SHA-256 Hash
            </span>
          </div>

          {/* Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '36px',
            paddingTop: '28px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', fontWeight: 900, color: 'var(--heading-color)' }}>14,800+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Anchored Records</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', fontWeight: 900, color: 'var(--cyan)' }}>100%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tamper-Evident</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', fontWeight: 900, color: 'var(--emerald)' }}>&lt; 0.2s</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Instant Lookup</div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Holographic Crest & Floating Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%', overflow: 'hidden' }}>
          {/* Glowing Aura Ring */}
          <div style={{
            position: 'absolute',
            width: 'min(420px, 86vw)',
            height: 'min(420px, 86vw)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 70%)',
            filter: 'blur(45px)',
            zIndex: 0,
          }}></div>

          {/* Central 3D Emblem Container */}
          <div className="hero-seal-pedestal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-surface)' }}>
            <img
              src="/favicon.png"
              alt="EDUCORE Brand Crest"
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                marginBottom: '16px',
                borderRadius: '28px',
                boxShadow: '0 12px 30px rgba(6, 182, 212, 0.25)',
              }}
            />
            <BrandLogo
              alt="EDUCORE - Verify · Trust · Empower"
              style={{
                width: '85%',
                height: 'auto',
                maxHeight: '60px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Floating Glass Chip 1 (Top Left) */}
          <div
            className="hero-floating-badge"
            style={{
              top: '-15px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Lock size={16} color="var(--cyan)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Security Layer</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--heading-color)' }}>SHA-256 Canonical v1.0</div>
            </div>
          </div>

          {/* Floating Glass Chip 2 (Bottom Right) */}
          <div
            className="hero-floating-badge"
            style={{
              bottom: '-15px',
              right: '20px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={18} color="var(--emerald)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Data Boundary</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--heading-color)' }}>Zero-Trust Multi-Tenancy</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE 3-STEP PIPELINE: ISSUE → HASH → VERIFY
          ========================================================================= */}
      <section style={{ marginBottom: '84px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--cyan)',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}>
            <Activity size={16} /> Architectural Workflow
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
            The Core Pipeline: <span className="text-gradient-cyan">ISSUE → HASH → VERIFY</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Every credential travels through a deterministic state machine before being stamped with cryptographic authenticity.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '28px',
          position: 'relative',
        }}>
          {/* Card 1: ISSUE */}
          <div className="glass-panel" style={{ padding: '36px 30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.05))',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
              }}>
                <GraduationCap size={28} color="var(--primary-light)" />
              </div>
              <span className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--border-light)' }}>
                01
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>
              Controlled Issuance
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Academic boards and registrars follow the strict state machine: <code>DRAFT → PENDING_APPROVAL → APPROVED</code>. Separation of duties prevents rogue credential creation.
            </p>

            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--primary)',
            }}>
              <strong>Enforces:</strong> Role separation & academic board validation
            </div>
            <button
              id="pipeline-btn-issuance"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
              onClick={onOpenUserAuth}
            >
              <span>Portal Sign In & Issuance</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: HASH */}
          <div className="glass-panel" style={{ padding: '36px 30px', borderColor: 'rgba(6, 182, 212, 0.35)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)',
              }}>
                <Lock size={28} color="var(--cyan)" />
              </div>
              <span className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--border-light)' }}>
                02
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>
              SHA-256 Fingerprint
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Deterministic canonical serialization generates an unalterable 256-bit hash. Any subtle forgery in student name, degree or GPA changes the hash and fails instant lookup.
            </p>

            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--cyan)',
            }}>
              <strong>Hash:</strong> 64-character deterministic digest + QR token
            </div>
            <button
              id="pipeline-btn-hash"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
              onClick={() => onNavigateVerify('3a478b1d4c72ef21087bca609ffb73918a0e5b7c2514d3392a832c3f19119c3b')}
            >
              <span>Test Deterministic Hash</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: VERIFY */}
          <div className="glass-panel" style={{ padding: '36px 30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
              }}>
                <CheckCircle2 size={28} color="var(--emerald)" />
              </div>
              <span className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--border-light)' }}>
                03
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>
              Universal Verification
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Employers, embassies and universities verify credentials in under 200 milliseconds. Returns authoritative status without leaking private student identity data.
            </p>

            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--emerald)',
            }}>
              <strong>Result:</strong> VALID · REVOKED · SUPERSEDED · NOT_FOUND
            </div>
            <button
              id="pipeline-btn-verifier"
              className="btn btn-cyan btn-sm"
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center', fontWeight: 800 }}
              onClick={() => onNavigateVerify()}
            >
              <span>Open Universal Verifier</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: RELEASE 2 BIOMETRICS SHOWCASE WITH HIGH-RES HARDWARE TERMINAL
          ========================================================================= */}
      <section className="biometric-preview-panel" style={{
        marginBottom: '84px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '40px',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '5px 14px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '16px',
          }}>
            <Fingerprint size={16} color="var(--emerald)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--emerald)', letterSpacing: '0.05em' }}>
              HARDWARE SPECIFICATION · RELEASE 2 ROADMAP
            </span>
          </div>

          <h3 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
            BIOMETRIC → ATTENDANCE → REPORT
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '24px' }}>
            In Section 13 of the Technical Specification, hardware biometric fingerprint terminals interface with EDUCORE via secure edge gateways. Enrolled identity references are mapped directly to student records without storing raw minutiae templates in public databases.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--cyan)" />
              <span>Anti-replay protection using unique cryptographically signed event IDs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--cyan)" />
              <span>Offline caching & transactional reconciliation with server receipt timestamps</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--cyan)" />
              <span>Global privacy & data protection compliance readiness (GDPR, NDPA & International Standards)</span>
            </div>
          </div>
        </div>

        {/* High-Resolution Biometric Terminal Image Display */}
        <div style={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg-surface)',
          position: 'relative',
        }}>
          <img
            src="/biometric-terminal.jpg"
            alt="Biometric Terminal Gateway"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            <span style={{ color: 'var(--cyan)', fontWeight: 700, wordBreak: 'break-all' }}>POST /api/v1/devices/{'{id}'}/attendance-events</span>
            <span className="badge badge-valid" style={{ fontSize: '0.65rem', flexShrink: 0 }}>Contract Ready</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FOUR ACCOUNT PATHWAYS & INSTITUTIONAL PORTALS
          ========================================================================= */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
            Unified Platform Pathways
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Dedicated portals configured with role-based access control and strict institutional data boundaries.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '24px',
        }}>
          {/* Card 1: Schools & Higher Education */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Building2 size={24} color="var(--primary)" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Schools & Higher Education</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Universities, polytechnics, and colleges. Manage student rosters, faculties, courses, graduation honors, and academic board approvals.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', marginBottom: '8px' }}
              onClick={onOpenUserAuth}
            >
              <span>School Portal Sign In</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={onOpenRegisterSchool}
            >
              <span>Onboard New School</span>
            </button>
          </div>

          {/* Card 2: Churches & Religious Organizations */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <BookOpen size={24} color="var(--violet)" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Churches & Seminaries</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Theological seminaries, ministerial academies, and faith-based institutes. Issue recognized pastoral diplomas and theological certificates.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', marginBottom: '8px' }}
              onClick={onOpenUserAuth}
            >
              <span>Church Portal Sign In</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={onOpenRegisterSchool}
            >
              <span>Register Church / Academy</span>
            </button>
          </div>

          {/* Card 3: Organizations & Professional Bodies */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Award size={24} color="var(--amber)" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Organizations & Institutes</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Professional institutes, trade bodies, vocational academies, and NGOs. Govern professional registries, CPD points, and certified credentials.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', marginBottom: '8px' }}
              onClick={onOpenUserAuth}
            >
              <span>Organization Portal Sign In</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={onOpenRegisterSchool}
            >
              <span>Register Organization</span>
            </button>
          </div>

          {/* Card 4: Employers & Verifying Companies */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Briefcase size={24} color="var(--emerald)" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Companies & Employers</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Corporate HR teams, recruitment agencies, and background check auditors. Perform instant cryptographic validation and candidate audits.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', marginBottom: '8px' }}
              onClick={onOpenUserAuth}
            >
              <span>Employer Portal Sign In</span>
              <ArrowRight size={14} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={onOpenRegisterCompany}
            >
              <span>Register Company</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
