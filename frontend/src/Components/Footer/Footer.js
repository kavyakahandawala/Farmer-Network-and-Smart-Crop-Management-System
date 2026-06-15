import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverColumn, setHoverColumn] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    const footer = document.querySelector('.agro-footer');
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const footerLinks = {
    services: [
      { name: 'Crop Consultation', path: '/cropList' },
      { name: 'Land Testing', path: '/land-testing' },
      { name: 'Market Prices', path: '/user_view' },
      { name: 'Crop Input', path: '/product' }
    ],
    resources: [
      { name: 'Agricultural Blog', path: '/posts' },
      { name: 'Farming Guides', path: '/advisor' },
      { name: 'FAQ', path: '/forum' },
      { name: 'Privacy Policy', path: '/privacy' }
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'About Us', path: '/about' },
      { name: 'Terms & Condition', path: '/terms' },
      { name: 'Feedback', path: '/feedback' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', url: '#', icon: <FaFacebookF /> },
    { name: 'Twitter', url: '#', icon: <FaTwitter /> },
    { name: 'Instagram', url: '#', icon: <FaInstagram /> },
    { name: 'LinkedIn', url: '#', icon: <FaLinkedinIn /> }
  ];

  return (
    <footer className="agro-footer">
      <div className="footer-bg-decoration">
        <div className="gradient-orb footer-orb-1"></div>
        <div className="gradient-orb footer-orb-2"></div>
        <div className="gradient-orb footer-orb-3"></div>
      </div>
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className={`footer-column brand-column ${isVisible ? 'animate-in' : ''}`} style={{ '--item-index': 0 }}>
            <div className="brand-wrapper">
              <h3 className="brand-name">AgroSphere</h3>
              <div className="brand-line"></div>
            </div>
            <p className="brand-description">
              Empowering farmers with smart agricultural solutions for a sustainable future.
            </p>
            <div className="social-links">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="social-link"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services, Resources, Support Columns */}
          {['services', 'resources', 'support'].map((col, index) => (
            <div
              key={col}
              className={`footer-column ${isVisible ? 'animate-in' : ''}`}
              style={{ '--item-index': index + 1 }}
              onMouseEnter={() => setHoverColumn(col)}
              onMouseLeave={() => setHoverColumn(null)}
            >
              <h4 className="column-title">{col.charAt(0).toUpperCase() + col.slice(1)}</h4>
              <ul className="footer-links">
                {footerLinks[col].map((link, idx) => (
                  <li key={idx} style={{ '--link-index': idx }}>
                    <a href={link.path} className="footer-link">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-divider">
            <div className="divider-line"></div>
            <div className="divider-glow"></div>
          </div>
          <div className="bottom-content">
            <p className="copyright">
              © 2025 AgroSphere. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .agro-footer { background: linear-gradient(135deg,#1a2f0f 0%,#0f1f08 100%); color:white; position: relative; overflow: hidden; }
        .footer-container { max-width: 1300px; margin:0 auto; padding:60px 20px 20px; position: relative; z-index:1; }
        .footer-grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(250px,1fr)); gap:50px; margin-bottom:50px; }
        .footer-column { opacity:0; transform: translateY(40px); }
        .footer-column.animate-in { animation: slideUpFooter 0.8s cubic-bezier(0.68,-0.55,0.265,1.55) forwards; animation-delay: calc(var(--item-index)*0.15s); }
        @keyframes slideUpFooter { to { opacity:1; transform: translateY(0); } }
        .brand-name { font-size:2.2rem; color:#90EE90; margin-bottom:12px; font-weight:700; }
        .brand-line { width:80px; height:3px; background:linear-gradient(90deg,#90EE90,#aed581); border-radius:2px; margin-bottom:20px; }
        .brand-description { color:#b8b8b8; line-height:1.7; margin-bottom:28px; font-size:0.95rem; }
        .social-links { display:flex; gap:12px; }
        .social-link { color:#b8b8b8; font-size:1.2rem; display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background: rgba(144,238,144,0.05); border:2px solid rgba(144,238,144,0.3); transition: all 0.3s ease; }
        .social-link:hover { background: rgba(144,238,144,0.15); color:#90EE90; transform: scale(1.2); }
        .footer-links { list-style:none; padding:0; }
        .footer-links li { margin-bottom:12px; }
        .footer-link { text-decoration:none; color:#b8b8b8; font-size:0.95rem; transition:0.3s; }
        .footer-link:hover { color:#90EE90; }
        .footer-bottom { margin-top:60px; }
        .footer-divider { position:relative; height:1px; margin-bottom:30px; }
        .divider-line { height:1px; background: linear-gradient(to right, transparent, rgba(144,238,144,0.3), transparent); }
        .divider-glow { position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(to right, transparent, rgba(144,238,144,0.8), transparent); animation: shimmerGlow 3s ease-in-out infinite; }
        @keyframes shimmerGlow { 0%,100%{opacity:0;transform:translateX(-100%);}50%{opacity:1;transform:translateX(100%);} }
        .bottom-content { display:flex; justify-content:center; align-items:center; text-align:center; }
        .copyright { color:#888; font-size:0.9rem; }
        @media (max-width:768px) { .footer-container{padding:40px 15px 15px;} .footer-grid{gap:40px;} .bottom-content{flex-direction:column;} }
      `}</style>
    </footer>
  );
};

export default Footer;
