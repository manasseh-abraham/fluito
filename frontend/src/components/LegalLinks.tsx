const LegalLinks = ({ className = '' }: { className?: string }) => {
  return (
    <p className={`legal-links ${className}`.trim()}>
      <a href="/privacy" target="_blank" rel="noreferrer">
        Privacy Policy
      </a>
      <span className="legal-sep"> · </span>
      <a href="/terms" target="_blank" rel="noreferrer">
        Terms of Service
      </a>
    </p>
  );
};

export default LegalLinks;
