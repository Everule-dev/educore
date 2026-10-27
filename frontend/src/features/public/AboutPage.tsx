import React from 'react';
import { BrandLogo } from '../../components/BrandLogo';
import {
  ShieldCheck,
  Lock,
  Globe,
  Award,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  Target,
  Eye,
  CheckCircle2,
  Cpu,
  GraduationCap,
  ArrowRight,
  Server,
  Zap,
} from 'lucide-react';

interface Props {
  onNavigateHome?: () => void;
  onNavigateVerify?: () => void;
  onOpenUserAuth?: () => void;
  onOpenRegisterSchool?: () => void;
}

export const AboutPage: React.FC<Props> = ({
  onNavigateHome,
  onNavigateVerify,
  onOpenUserAuth,
  onOpenRegisterSchool,
}) => {
  return (
    <div className="page-container" style={{ maxWidth: '1240px' }}>
      {/* =========================================================================
          HERO SECTION: ABOUT EDUCORE
          ========================================================================= */}
      <section style={{ textAlign: 'center', marginBottom: '64px' }}>
        {/* Official Brand Logo */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'center' }}>
          <BrandLogo
            alt="EDUCORE - Verify · Trust · Empower"
            style={{
              maxHeight: '64px',
              width: 'auto',
              maxWidth: '280px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.06))',
            }}
          />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.12))',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          padding: '7px 16px',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '20px',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)',
          maxWidth: '100%',
        }}>
          <Sparkles size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
          <span style={{ fontSize: 'clamp(0.68rem, 2.5vw, 0.825rem)', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.06em', lineHeight: 1.3 }}>
            UNIVERSAL CREDENTIAL VERIFICATION PLATFORM
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.035em',
          marginBottom: '16px',
        }}>
          About EDUCORE
        </h1>

        <div style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          letterSpacing: '0.02em',
          marginBottom: '28px',
        }}>
          <span className="text-gradient-cyan">Verify. Trust. Empower.</span>
        </div>

        <div className="glass-panel" style={{
          maxWidth: '920px',
          margin: '0 auto',
          padding: '36px 40px',
          textAlign: 'left',
          fontSize: '1.1rem',
          color: 'var(--text-sub)',
          lineHeight: 1.8,
        }}>
          <p style={{ marginBottom: '18px' }}>
            At EDUCORE, we believe that academic and professional achievements represent years of hard work, discipline, and ambition. Yet, across institutions and industries, credential fraud undermines legitimate success and burdens employers with slow, manual verification processes.
          </p>
          <p style={{ margin: 0, fontWeight: 500 }}>
            EDUCORE is building the trusted digital backbone for institutional records and credential authenticity. We bridge the gap between educational institutions, organizations, and employers by delivering instant, cryptographic proof of qualification—ensuring that every genuine achievement is recognized, valued, and permanently protected worldwide.
          </p>
        </div>
      </section>

      {/* =========================================================================
          MISSION & VISION
          ========================================================================= */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '28px',
        marginBottom: '72px',
      }}>
        {/* Mission Card */}
        <div className="glass-panel" style={{ padding: '36px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
          }}>
            <Target size={28} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px' }}>
            Our Mission
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
            To eliminate credential fraud and empower individuals and organizations by establishing a secure, accessible, and tamper-evident ecosystem for issuing and verifying credentials.
          </p>
        </div>

        {/* Vision Card */}
        <div className="glass-panel" style={{ padding: '36px', borderColor: 'rgba(6, 182, 212, 0.35)' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.25)',
          }}>
            <Globe size={28} color="var(--cyan)" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '14px' }}>
            Our Vision
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
            A world where every certificate, diploma, and training award is universally authentic, instantly verifiable, and universally trusted across borders and industries.
          </p>
        </div>
      </section>

      {/* =========================================================================
          THE EDUCORE STANDARD: ISSUE → HASH → VERIFY
          ========================================================================= */}
      <section style={{ marginBottom: '80px' }}>
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
            <Cpu size={16} /> Cryptographic Rigor
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
            The EDUCORE Standard: <span className="text-gradient-cyan">Issue → Hash → Verify</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto' }}>
            Traditional paper certificates and basic digital PDFs are easy to forge and cumbersome to validate. EDUCORE replaces doubt with mathematical certainty:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
        }}>
          {/* Pillar 1 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(37, 99, 235, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <GraduationCap size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>
              Controlled Issuance
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, margin: 0 }}>
              Approved institutions register students, track courses, and govern certificate generation through rigorous multi-level approval workflows.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(6, 182, 212, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Lock size={24} color="var(--cyan)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>
              Cryptographic Fingerprinting
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, margin: 0 }}>
              Every credential is cryptographically anchored using industry-standard SHA-256 canonical hashing, generating an unalterable digital fingerprint and unique verification reference.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <CheckCircle2 size={24} color="var(--emerald)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>
              Universal, Instant Verification
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, margin: 0 }}>
              Employers and the public can verify credentials in seconds using a direct hash lookup, verification reference, or built-in QR and barcode scanning—no phone calls, manual back-and-forth, or delays required.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          WHO WE SERVE
          ========================================================================= */}
      <section style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
            Who We Serve
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            Empowering the entire global education, certification, and recruitment ecosystem.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '24px',
        }}>
          {/* Audience 1 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                Traditional Schools & Higher Education
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                From secondary schools to universities, EDUCORE equips academic registrars with modern record management, automated certificate generation, and ironclad protection against forgery.
              </p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onOpenUserAuth && (
                <button
                  id="about-btn-school-login"
                  className="btn btn-primary btn-sm"
                  onClick={onOpenUserAuth}
                  style={{ fontSize: '0.78rem' }}
                >
                  <span>Portal Sign In</span>
                  <ArrowRight size={13} />
                </button>
              )}
              {onOpenRegisterSchool && (
                <button
                  id="about-btn-school-onboard"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenRegisterSchool}
                  style={{ fontSize: '0.78rem' }}
                >
                  <span>Onboard School</span>
                </button>
              )}
            </div>
          </div>

          {/* Audience 2 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Award size={24} color="var(--cyan)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                Informal & Vocational Training Centers
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Skills and vocational training power the modern economy. EDUCORE provides training institutes, bootcamps, and culinary or creative academies with enterprise-grade certification systems that lend immediate credibility to every graduate's portfolio.
              </p>
            </div>
            <div style={{ marginTop: '20px' }}>
              {onOpenRegisterSchool ? (
                <button
                  id="about-btn-vocational-register"
                  className="btn btn-cyan btn-sm"
                  onClick={onOpenRegisterSchool}
                  style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center' }}
                >
                  <span>Register Academy / Center</span>
                  <ArrowRight size={13} />
                </button>
              ) : onOpenUserAuth ? (
                <button
                  id="about-btn-vocational-auth"
                  className="btn btn-cyan btn-sm"
                  onClick={onOpenUserAuth}
                  style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center' }}
                >
                  <span>Academy Portal Sign In</span>
                  <ArrowRight size={13} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Audience 3 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
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
                <Layers size={24} color="var(--amber)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                Organizations & Professional Bodies
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Manage member registries, track continuing professional development, and issue recognized credentials to staff, trainees, or association members with complete transparency.
              </p>
            </div>
            <div style={{ marginTop: '20px' }}>
              {onOpenUserAuth && (
                <button
                  id="about-btn-org-access"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenUserAuth}
                  style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center', borderColor: 'rgba(245, 158, 11, 0.45)', color: 'var(--amber)', fontWeight: 700 }}
                >
                  <span>Organization Portal Sign In</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Audience 4 */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
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
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
                Employers & Verifying Companies
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Hiring moves fast. EDUCORE provides corporate teams and recruiters with a dedicated verification dashboard, complete audit histories, and dependable, real-time validation of applicant claims—all while respecting candidate privacy.
              </p>
            </div>
            <div style={{ marginTop: '20px' }}>
              {onNavigateVerify && (
                <button
                  id="about-btn-employer-verify"
                  className="btn btn-cyan btn-sm"
                  onClick={onNavigateVerify}
                  style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center' }}
                >
                  <CheckCircle2 size={13} />
                  <span>Verify Candidate Credentials</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OUR CORE VALUES
          ========================================================================= */}
      <section style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
            Our Core Values
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
            The architectural and philosophical principles guiding every line of code we write.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '24px',
        }}>
          {/* Value 1 */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--primary)' }}>
              <ShieldCheck size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--heading-color)' }}>
                Uncompromising Integrity
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, margin: 0 }}>
              We believe trust cannot be retrofitted; it must be built into the foundation. Every issued credential on EDUCORE is traceable, auditable, and immutable.
            </p>
          </div>

          {/* Value 2 */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--cyan)' }}>
              <Lock size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--heading-color)' }}>
                Privacy by Design
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, margin: 0 }}>
              Verification should establish authenticity without overexposing personal data. Our verification outputs share only what is necessary, strictly protecting sensitive student details and complying with national data protection standards.
            </p>
          </div>

          {/* Value 3 */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--violet)' }}>
              <Server size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--heading-color)' }}>
                Absolute Tenant Isolation
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, margin: 0 }}>
              Whether you are an international university or a local trade academy, your institutional data remains strictly separated, protected by multi-tenant security layers.
            </p>
          </div>

          {/* Value 4 */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--amber)' }}>
              <Zap size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--heading-color)' }}>
                Accessible Innovation
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.65, margin: 0 }}>
              Advanced security should not require complex software. EDUCORE provides clean, intuitive portals designed for educators, administrators, and hiring teams alike.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BUILT FOR TOMORROW & CALL TO ACTION
          ========================================================================= */}
      <section className="glass-panel" style={{
        padding: '48px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
        border: '1px solid var(--border-accent)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.4)',  
          padding: '6px 16px',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '20px',
        }}>
          <Sparkles size={16} color="var(--cyan)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.06em' }}>
            FUTURE-READY ARCHITECTURE
          </span>
        </div>

        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '16px' }}>
          Built for Tomorrow
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          maxWidth: '820px',
          margin: '0 auto 28px',
          lineHeight: 1.75,
        }}>
          Credential verification is only the beginning. As educational landscapes evolve, EDUCORE is actively expanding to meet the physical and digital needs of institutions, with integrated biometric attendance tracking, structured academic reporting, and reliable identity management arriving in our upcoming releases.
        </p>

        <p style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--heading-color)',
          marginBottom: '36px',
        }}>
          Join us as we build a more transparent, credible, and empowered future for education and employment.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {onNavigateVerify && (
            <button
              className="btn btn-cyan btn-lg"  
              onClick={onNavigateVerify}
            >
              <CheckCircle2 size={18} /> Test Verification Engine
            </button>
          )}
          {onOpenUserAuth && (
            <button
              className="btn btn-primary btn-lg"
              onClick={onOpenUserAuth}
            >
              <span>Get Started with EDUCORE</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
