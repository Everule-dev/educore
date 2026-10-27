import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { VerificationResponse } from '../../app/state';
import {
  ShieldCheck,
  Search,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Lock,
  Camera,
  CameraOff,
  SwitchCamera,
  Upload,
  X,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Award,
  Terminal,
} from 'lucide-react';
import { Credential } from '../../types';

interface Props {
  onVerify: (query: string) => Promise<VerificationResponse>;
  allCredentials: Credential[];
  onViewCertificate?: (cred: Credential) => void;
  initialQuery?: string;
}

export const UniversalVerifier: React.FC<Props> = ({
  onVerify,
  allCredentials,
  onViewCertificate,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Optical Hardware Camera QR Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanStatus, setScanStatus] = useState<string>('Initializing optical viewfinder...');
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleExecuteVerify(initialQuery);
    }
  }, [initialQuery]);

  const handleExecuteVerify = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsVerifying(true);
    setResult(null);

    // Brief realistic cryptographic calculation pause
    await new Promise((r) => setTimeout(r, 450));
    const res = await onVerify(searchQuery.trim());
    setResult(res);
    setIsVerifying(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteVerify(query);
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Hardware Camera Control Routines
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleScannedResult = useCallback((rawValue: string) => {
    if (!rawValue || !rawValue.trim()) return;
    const cleanRaw = rawValue.trim();
    setScannedFeedback(cleanRaw);
    setScanStatus('QR Code recognized! Verifying ledger record...');
    stopCamera();

    // Parse if the QR code is an HTTP/HTTPS deep-link or direct Verification ID/Hash
    let parsedToken = cleanRaw;
    try {
      if (parsedToken.includes('http://') || parsedToken.includes('https://')) {
        const url = new URL(parsedToken);
        const param =
          url.searchParams.get('id') ||
          url.searchParams.get('token') ||
          url.searchParams.get('query') ||
          url.searchParams.get('hash') ||
          url.searchParams.get('verify');
        if (param) {
          parsedToken = param;
        } else {
          const segments = url.pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            parsedToken = segments[segments.length - 1];
          }
        }
      }
    } catch {
      // keep raw token
    }

    setTimeout(() => {
      setShowScanner(false);
      setScannedFeedback(null);
      setQuery(parsedToken);
      handleExecuteVerify(parsedToken);
    }, 600);
  }, [stopCamera]);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            handleScannedResult(code.data);
            return;
          }
        } catch (err) {
          console.warn('Frame scan warning:', err);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleScannedResult]);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    setScanStatus('Requesting device camera permissions...');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or connection (HTTPS / localhost is required).');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback for devices without rear facing camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setScanStatus('Align the credential QR code inside the optical viewfinder frame');
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      console.error('Camera startup error:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser or select an image file with a QR code below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your hardware. You can capture or upload an image file instead.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('The camera is in use by another application. Please close other camera programs and try again.');
      } else {
        setCameraError(err.message || 'Unable to access device camera.');
      }
    }
  }, [stopCamera, scanFrame]);

  useEffect(() => {
    if (showScanner) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showScanner, facingMode, startCamera, stopCamera]);

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus('Decoding QR code from image file...');
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          setCameraError('Failed to initialize 2D decoding canvas.');
          return;
        }
        offCtx.drawImage(img, 0, 0);
        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleScannedResult(code.data);
        } else {
          setCameraError('No valid QR code was detected in the selected image. Please make sure the code is sharp and well-lit.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const matchedFullCredential = allCredentials.find(
    (c) =>
      c.verification_id.toUpperCase() === (result?.credential?.verification_id || '').toUpperCase() ||
      c.credential_hash.toLowerCase() === query.trim().toLowerCase()
  );
  const credentialForInspection = matchedFullCredential;

  return (
    <div className="page-container" style={{ maxWidth: '1080px' }}>
      {/* Hidden File Input for Image Capture / Upload Fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '16px',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
          maxWidth: '100%',
        }}>
          <ShieldCheck size={16} color="var(--cyan)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 'clamp(0.68rem, 2.5vw, 0.8rem)', fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.06em', lineHeight: 1.3 }}>
            UNIVERSAL PUBLIC VERIFICATION TERMINAL
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 900, marginBottom: '14px' }}>
          Universal Credential Verification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto' }}>
          Query any degree, diploma or vocational certificate across accredited institutions worldwide. Evaluates authoritative ledger records and re-computes the <strong>SHA-256 canonical hash</strong> in real-time.
        </p>
      </div>

      {/* Main Terminal Search Console */}
      <div className="glass-panel verifier-search-panel" style={{ padding: '36px', marginBottom: '36px', borderColor: 'var(--border-glow)' }}>
        <form onSubmit={handleFormSubmit}>
          <div className="verifier-search-row">
            <div className="verifier-input-wrap">
              <Search
                size={22}
                style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--cyan)',
                }}
              />
              <input
                id="universal-verifier-input"
                type="text"
                className="form-input"
                style={{
                  paddingLeft: '54px',
                  height: '56px',
                  fontSize: '1.05rem',
                  fontFamily: query.length > 20 ? 'var(--font-mono)' : 'inherit',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                }}
                placeholder="Enter Verification ID (e.g. V-XXXX-XXXX) or 64-char SHA-256 Hash..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="verifier-buttons-group">
              <button
                id="universal-verifier-btn-submit"
                type="submit"
                className="btn btn-cyan verifier-submit-btn"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> <span>Verify Authenticity</span>
                  </>
                )}
              </button>

              <button
                id="universal-verifier-btn-qr"
                type="button"
                className="btn btn-secondary verifier-qr-btn"
                style={{
                  background: showScanner ? 'rgba(6, 182, 212, 0.25)' : undefined,
                  borderColor: showScanner ? 'var(--cyan)' : undefined,
                }}
                onClick={() => setShowScanner(!showScanner)}
                title="Open Device Camera QR Scanner"
              >
                <Camera size={18} color="var(--cyan)" style={{ flexShrink: 0 }} />
                <span>{showScanner ? 'Close Scanner' : 'Scan QR'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Verification Support Guide */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-card-subtle)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            lineHeight: 1.5,
          }}>
            <ShieldCheck size={18} color="var(--cyan)" style={{ flexShrink: 0 }} />
            <div>
              Enter any official Verification ID (e.g. <code>V-XXXX-XXXX</code>), Credential Reference Number, or the 64-character SHA-256 cryptographic hash printed on an issued certificate or credential badge.
            </div>
          </div>
        </div>
      </div>

      {/* Optical Hardware Camera QR Scanner Panel */}
      {showScanner && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '36px', borderColor: 'var(--cyan)', boxShadow: '0 0 35px rgba(6, 182, 212, 0.25)' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Camera size={20} color="var(--cyan)" />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>Live Camera Optical QR Scanner</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Hardware media feed active · Real-time cryptographic barcode decoding
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleToggleFacingMode}
                title="Flip Camera (Front/Back)"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <SwitchCamera size={15} />
                <span>{facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image file of QR code"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={15} />
                <span>Upload QR Image</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowScanner(false)}
                aria-label="Close Scanner"
                style={{ padding: '6px 8px' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Viewfinder Viewport */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            margin: '0 auto',
            height: '360px',
            background: '#030712',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid rgba(6, 182, 212, 0.4)',
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.8), 0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Live Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isCameraActive ? 'block' : 'none',
              }}
            />

            {/* Hidden Offscreen Canvas for Frame Extraction */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Optical Target Frame Brackets */}
            <div className="viewfinder-bracket bracket-top-left" />
            <div className="viewfinder-bracket bracket-top-right" />
            <div className="viewfinder-bracket bracket-bottom-left" />
            <div className="viewfinder-bracket bracket-bottom-right" />

            {/* Animated Laser Scanning Line */}
            {isCameraActive && <div className="scanner-laser-line" />}

            {/* Scanned Success Overlay Indicator */}
            {scannedFeedback && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(16, 185, 129, 0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                zIndex: 20,
                color: '#ffffff',
                padding: '20px',
                textAlign: 'center',
              }}>
                <CheckCircle2 size={48} />
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>QR Code Recognized</div>
                <div className="mono" style={{ fontSize: '0.9rem', background: 'rgba(0, 0, 0, 0.4)', padding: '6px 14px', borderRadius: '6px' }}>
                  {scannedFeedback}
                </div>
              </div>
            )}

            {/* Camera Error / Fallback State */}
            {cameraError && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.95)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '14px',
                zIndex: 15,
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--rose)',
                }}>
                  <CameraOff size={26} />
                </div>
                <div style={{ fontSize: '0.925rem', color: 'var(--rose)', maxWidth: '420px', lineHeight: 1.5 }}>
                  {cameraError}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => startCamera(facingMode)}
                  >
                    <RefreshCw size={14} /> Retry Camera
                  </button>
                  <button
                    type="button"
                    className="btn btn-cyan btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> Upload QR Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sub-status and Instructions */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isCameraActive ? 'var(--emerald)' : 'var(--amber)',
                boxShadow: isCameraActive ? '0 0 10px var(--emerald)' : 'none',
              }} />
              <span>{scanStatus}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Supports physical diplomas, official PDF badges, and digital certificates
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VERIFICATION RESULT CARD (HIGH IMPACT HOLOGRAPHIC RESULT)
          ========================================================================= */}
      {result && (
        <div
          id="verification-result-card"
          className="glass-panel"
          style={{
            padding: '40px',
            border: `2px solid ${
              result.result === 'VALID'
                ? 'rgba(16, 185, 129, 0.6)'
                : result.result === 'REVOKED'
                ? 'rgba(244, 63, 94, 0.6)'
                : 'rgba(255, 255, 255, 0.18)'
            }`,
            boxShadow:
              result.result === 'VALID'
                ? '0 0 50px rgba(16, 185, 129, 0.2), 0 20px 40px rgba(0,0,0,0.6)'
                : result.result === 'REVOKED'
                ? '0 0 50px rgba(244, 63, 94, 0.2), 0 20px 40px rgba(0,0,0,0.6)'
                : 'none',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {result.result === 'VALID' && (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.2))',
                  border: '2px solid rgba(16, 185, 129, 0.6)',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle2 size={38} color="#34d399" />
                </div>
              )}
              {result.result === 'REVOKED' && (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(244, 63, 94, 0.25)',
                  border: '2px solid rgba(244, 63, 94, 0.6)',
                  boxShadow: '0 0 24px rgba(244, 63, 94, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <XCircle size={38} color="#fb7185" />
                </div>
              )}
              {result.result === 'NOT_FOUND' && (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(148, 163, 184, 0.18)',
                  border: '2px solid rgba(148, 163, 184, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertTriangle size={36} color="#94a3b8" />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span
                    className={`badge ${
                      result.result === 'VALID'
                        ? 'badge-valid'
                        : result.result === 'REVOKED'
                        ? 'badge-revoked'
                        : result.result === 'SUPERSEDED'
                        ? 'badge-superseded'
                        : 'badge-draft'
                    }`}
                    style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                  >
                    {result.result === 'VALID' ? 'AUTHORITATIVE & VALID RECORD' : result.result}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Audit Checked: {new Date(result.verification?.checked_at || '').toLocaleTimeString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                  {result.credential?.title || (result.result === 'NOT_FOUND' ? 'No Record Found' : 'Record Alert')}
                </h3>
              </div>
            </div>

            {credentialForInspection && onViewCertificate && (
              <button
                id="verify-inspect-cert-btn"
                className="btn btn-outline"
                style={{ height: '48px', padding: '0 22px' }}
                onClick={() => onViewCertificate(credentialForInspection)}
              >
                <Award size={18} color="var(--amber)" />
                <span style={{ fontWeight: 700 }}>Inspect Certificate PDF</span>
              </button>
            )}
          </div>

          {/* Privacy-Safe Response Banner */}
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '24px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={15} color="var(--cyan)" />
              <span>
                <strong>Privacy-Safe Response Engine:</strong> Conferred qualification, award type, and issuance integrity confirmed. Private records (Date of Birth, national ID, home address, full transcripts) are strictly withheld.
              </span>
            </div>
            <code style={{ fontSize: '0.72rem', color: 'var(--cyan)', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              POST /api/v1/verify
            </code>
          </div>

          {/* Privacy-Safe Record Detail Cards */}
          {result.credential ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Verified Recipient
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {result.credential.recipient_name}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>Alumnus / Awardee</span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Issuing Institution
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {result.credential.issuer_name}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 600 }}>
                  Accredited {result.credential.issuer_type.toUpperCase()}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Verification Ref
                </span>
                <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--cyan)', marginTop: '4px' }}>
                  {result.credential.verification_id}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No: {result.credential.credential_number}</span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Date of Conferment
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {result.credential.issued_at ? new Date(result.credential.issued_at).toLocaleDateString() : 'N/A'}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Award: {result.credential.credential_type}</span>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-subtle)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{result.message}</p>
              <p style={{ fontSize: '0.85rem', marginTop: '10px', color: 'var(--text-muted)' }}>
                Tip: Verify that you entered the complete Verification Reference (e.g. <code>V-XXXX-XXXX</code>) or a valid 64-character SHA-256 hexadecimal hash.
              </p>
            </div>
          )}

          {/* Revocation Warning Box */}
          {result.revocation?.is_revoked && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              marginBottom: '28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb7185', fontWeight: 800, marginBottom: '6px' }}>
                <AlertTriangle size={20} /> Formal Revocation Stamped
              </div>
              <p style={{ fontSize: '0.925rem', color: '#fecdd3', lineHeight: 1.6 }}>
                {result.revocation.reason}
              </p>
            </div>
          )}

          {/* Cryptographic Ledger Breakdown */}
          {result.verification && (
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={16} color="var(--emerald)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Authoritative Cryptographic Digest (SHA-256)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {result.verification.integrity_verified && (
                    <span className="badge badge-valid" style={{ fontSize: '0.7rem' }}>
                      Integrity Match Confirmed
                    </span>
                  )}
                  {result.verification.credential_hash && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleCopyHash(result.verification?.credential_hash || '')}
                    >
                      {copiedHash ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                      {copiedHash ? 'Copied' : 'Copy Hash'}
                    </button>
                  )}
                </div>
              </div>

              <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)', wordBreak: 'break-all', background: 'rgba(0,0,0,0.5)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                {result.verification.credential_hash || query}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
                <span>Canonical Schema: <strong>v{result.verification.canonical_version || '1.0'}</strong></span>
                <span>Algorithm: <strong>{result.verification.hash_algorithm || 'SHA-256'}</strong></span>
                <span>Evaluated at: <strong>{result.verification.checked_at}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
