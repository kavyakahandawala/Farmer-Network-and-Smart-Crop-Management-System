import React, { useState } from 'react';
import './PrivacyPolicy.css';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import {Helmet} from "react-helmet";


const PrivacyPolicy = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus('Thank you for your message! We will get back to you within 24 hours.');
    setTimeout(() => {
      setShowContactModal(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setFormStatus('');
    }, 2000);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <Helmet>
      <title>AgroSphere | Privacy Policy</title>
    </Helmet>
    <div>
      <Header />
    <div className="privacy-policy-wrapper">
      <div className="banner-container">
        <img 
          src="/images/cropinput10.avif" 
          alt="Agricultural Banner" 
          className="banner-image"
        />
        <div className="banner-overlay">
          <h1>Privacy Policy</h1>
        </div>
      </div>
      <div className="privacy-policy-container">
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        {/* Navigation */}
        <div className="policy-nav">
          <button onClick={() => scrollToSection('introduction')}>Introduction</button>
          <button onClick={() => scrollToSection('data-collection')}>Data Collection</button>
          <button onClick={() => scrollToSection('data-usage')}>Data Usage</button>
          <button onClick={() => scrollToSection('data-sharing')}>Data Sharing</button>
          <button onClick={() => scrollToSection('data-security')}>Data Security</button>
          <button onClick={() => scrollToSection('user-rights')}>Your Rights</button>
          <button onClick={() => scrollToSection('cookies')}>Cookies</button>
          <button onClick={() => scrollToSection('contact')}>Contact Us</button>
        </div>

        {/* Introduction */}
        <section id="introduction">
          <h2>Introduction</h2>
          <p>
            Welcome to our Agricultural Management Platform. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our agricultural services, including crop tracking, land management, market watch, and community forums.
          </p>
          <p>
            By using our platform, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access or use our services.
          </p>
        </section>

        {/* Information We Collect */}
        <section id="data-collection">
          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>We may collect the following types of personal information:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
            <li><strong>Profile Information:</strong> Profile picture, location, farming experience, and preferences</li>
            <li><strong>Land Information:</strong> Property details, land size, soil type, and geographical coordinates</li>
            <li><strong>Crop Data:</strong> Crop types, planting dates, harvest information, and yield data</li>
            <li><strong>Financial Information:</strong> Billing address, payment methods, and transaction history</li>
            <li><strong>Communication Data:</strong> Messages sent through our platform, forum posts, and support requests</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, and click patterns</li>
            <li><strong>Location Data:</strong> GPS coordinates (with your permission) for land mapping and weather services</li>
            <li><strong>Technical Data:</strong> Log files, error reports, and performance metrics</li>
          </ul>

          <h3>Third-Party Information</h3>
          <p>We may receive information from third-party services such as:</p>
          <ul>
            <li>Weather services for crop planning</li>
            <li>Market data providers for price information</li>
            <li>Payment processors for transaction verification</li>
            <li>Social media platforms (if you choose to connect your accounts)</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section id="data-usage">
          <h2>How We Use Your Information</h2>
          
          <h3>Service Provision</h3>
          <ul>
            <li>Provide and maintain our agricultural management platform</li>
            <li>Process transactions and manage billing</li>
            <li>Deliver personalized crop recommendations and alerts</li>
            <li>Enable communication between farmers and agricultural advisors</li>
            <li>Provide market watch and pricing information</li>
          </ul>

          <h3>Platform Improvement</h3>
          <ul>
            <li>Analyze usage patterns to improve our services</li>
            <li>Develop new features and functionality</li>
            <li>Conduct research and analytics</li>
            <li>Test and optimize platform performance</li>
          </ul>

          <h3>Communication</h3>
          <ul>
            <li>Send important service updates and notifications</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Share agricultural tips and industry news</li>
          </ul>

          <h3>Legal and Safety</h3>
          <ul>
            <li>Comply with legal obligations and regulations</li>
            <li>Protect against fraud and security threats</li>
            <li>Enforce our terms of service</li>
            <li>Respond to legal requests and court orders</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section id="data-sharing">
          <h2>Information Sharing and Disclosure</h2>
          
          <h3>We Do Not Sell Your Personal Information</h3>
          <p>We do not sell, trade, or rent your personal information to third parties for marketing purposes.</p>

          <h3>Service Providers</h3>
          <p>We may share your information with trusted third-party service providers who assist us in operating our platform:</p>
          <ul>
            <li>Cloud hosting and data storage providers</li>
            <li>Payment processing services</li>
            <li>Email and communication services</li>
            <li>Analytics and performance monitoring tools</li>
            <li>Customer support platforms</li>
          </ul>

          <h3>Business Transfers</h3>
          <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>

          <h3>Legal Requirements</h3>
          <p>We may disclose your information if required by law or to:</p>
          <ul>
            <li>Comply with legal processes or government requests</li>
            <li>Protect our rights, property, or safety</li>
            <li>Protect the rights, property, or safety of our users</li>
            <li>Investigate or prevent fraud or security issues</li>
          </ul>

          <h3>Consent</h3>
          <p>We may share your information with your explicit consent or at your direction.</p>
        </section>

        {/* Data Security */}
        <section id="data-security">
          <h2>Data Security</h2>
          
          <h3>Security Measures</h3>
          <p>We implement appropriate technical and organizational security measures to protect your personal information:</p>
          <ul>
            <li><strong>Encryption:</strong> Data is encrypted in transit and at rest using industry-standard protocols</li>
            <li><strong>Access Controls:</strong> Strict access controls limit who can view and modify your data</li>
            <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
            <li><strong>Employee Training:</strong> Our team is trained on data protection and privacy best practices</li>
            <li><strong>Secure Infrastructure:</strong> We use secure cloud infrastructure with multiple layers of protection</li>
          </ul>

          <h3>Data Retention</h3>
          <p>We retain your personal information only as long as necessary to:</p>
          <ul>
            <li>Provide our services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
            <li>Improve our services</li>
          </ul>

          <h3>Data Breach Response</h3>
          <p>In the unlikely event of a data breach, we will:</p>
          <ul>
            <li>Notify affected users within 72 hours</li>
            <li>Report the incident to relevant authorities</li>
            <li>Take immediate steps to contain and remediate the breach</li>
            <li>Provide guidance on protective measures users can take</li>
          </ul>
        </section>

        {/* User Rights */}
        <section id="user-rights">
          <h2>Your Rights and Choices</h2>
          
          <h3>Access and Portability</h3>
          <ul>
            <li>Request a copy of your personal information</li>
            <li>Export your data in a machine-readable format</li>
            <li>View and update your account information</li>
          </ul>

          <h3>Correction and Updates</h3>
          <ul>
            <li>Correct inaccurate or incomplete information</li>
            <li>Update your preferences and settings</li>
            <li>Modify your profile and land information</li>
          </ul>

          <h3>Deletion</h3>
          <ul>
            <li>Request deletion of your account and personal data</li>
            <li>Remove specific information from our systems</li>
            <li>Opt out of certain data processing activities</li>
          </ul>

          <h3>Communication Preferences</h3>
          <ul>
            <li>Unsubscribe from marketing emails</li>
            <li>Adjust notification settings</li>
            <li>Control how we communicate with you</li>
          </ul>

          <h3>Data Processing Restrictions</h3>
          <ul>
            <li>Object to certain types of data processing</li>
            <li>Request restriction of data processing</li>
            <li>Withdraw consent where applicable</li>
          </ul>

          <p><strong>To exercise these rights, please contact us using the information provided in the Contact Us section below.</strong></p>
        </section>

        {/* Cookies and Tracking */}
        <section id="cookies">
          <h2>Cookies and Tracking Technologies</h2>
          
          <h3>What Are Cookies?</h3>
          <p>Cookies are small text files stored on your device that help us provide and improve our services.</p>

          <h3>Types of Cookies We Use</h3>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
            <li><strong>Performance Cookies:</strong> Help us understand how users interact with our platform</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics Cookies:</strong> Provide insights into platform usage and performance</li>
          </ul>

          <h3>Managing Cookies</h3>
          <p>You can control cookies through your browser settings. However, disabling certain cookies may affect platform functionality.</p>

          <h3>Third-Party Tracking</h3>
          <p>We may use third-party analytics services that place their own cookies. These services help us understand user behavior and improve our platform.</p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>
        </section>

        {/* International Transfers */}
        <section>
          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers, including standard contractual clauses and adequacy decisions.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by:
          </p>
          <ul>
            <li>Posting the updated policy on our platform</li>
            <li>Sending you an email notification</li>
            <li>Displaying a prominent notice on our platform</li>
          </ul>
          <p>
            Your continued use of our services after any changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        {/* Contact Information */}
        <section id="contact">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@agriculturalplatform.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Farm Road, Agricultural City, AC 12345</p>
            <p><strong>Data Protection Officer:</strong> dpo@agriculturalplatform.com</p>
          </div>

          <button 
            className="contact-button"
            onClick={() => setShowContactModal(true)}
          >
            Send Us a Message
          </button>
        </section>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Contact Us</h3>
              <form onSubmit={handleContactSubmit}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </label>
                <label>
                  Subject:
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </label>
                <label>
                  Message:
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                </label>
                <button type="submit">Send Message</button>
              </form>
              {formStatus && <div className="form-status">{formStatus}</div>}
            </div>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
    </>
  );
}

export default PrivacyPolicy;