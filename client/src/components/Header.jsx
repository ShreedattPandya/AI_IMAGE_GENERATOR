export default function Header() {
  return (
    <header>
      <div className="brand">
        <div className="logo-wrap">
          <img src="/assets/mainLogo.gif" alt="AI Image Generator" className="logo-main" />
        </div>
        <div>
          <h1>AI Image Generator</h1>
          <span>Powered by HuggingFace FLUX + Cloudinary</span>
        </div>
      </div>
    </header>
  );
}
