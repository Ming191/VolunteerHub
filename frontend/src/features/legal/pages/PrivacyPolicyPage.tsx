import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const PrivacyPolicyPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    // Check if there's a previous page in history from our app
    if (
      document.referrer &&
      document.referrer.includes(window.location.origin)
    ) {
      window.history.back();
    } else {
      // Default to signup if no referrer
      window.location.href = "/signup";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button variant="ghost" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Privacy Policy
              </h1>
              <p className="text-gray-600 mt-2">
                Last updated: December 20, 2025
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Table of Contents
            </h2>
            <nav className="grid md:grid-cols-2 gap-3">
              <a
                href="#introduction"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                1. Introduction
              </a>
              <a
                href="#information-collect"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                2. Information We Collect
              </a>
              <a
                href="#how-use"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                3. How We Use Your Information
              </a>
              <a
                href="#information-sharing"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                4. How We Share Your Information
              </a>
              <a
                href="#data-security"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                5. Data Security
              </a>
              <a
                href="#your-rights"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                6. Your Privacy Rights
              </a>
              <a
                href="#data-retention"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                7. Data Retention
              </a>
              <a
                href="#children-privacy"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                8. Children's Privacy
              </a>
              <a
                href="#cookies"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                9. Cookies and Tracking Technologies
              </a>
              <a
                href="#international"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                10. International Data Transfers
              </a>
              <a
                href="#third-party"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                11. Third-Party Links
              </a>
              <a
                href="#policy-changes"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                12. Changes to This Policy
              </a>
              <a
                href="#contact"
                className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
              >
                13. Contact Us
              </a>
            </nav>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
              {/* Introduction */}
              <section id="introduction">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  At VolunteerHub ("we," "our," or "us"), we are committed to
                  protecting your privacy and personal information. This Privacy
                  Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our volunteer management
                  platform and services.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By using VolunteerHub, you consent to the practices described
                  in this Privacy Policy. If you do not agree, please do not use
                  our services.
                </p>
              </section>

              {/* Information We Collect */}
              <section id="information-collect">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  2.1 Information You Provide
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  When you create an account or use our services, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>
                    <strong>Account Information:</strong> Name, email address,
                    username, password, gender, and profile photo
                  </li>
                  <li>
                    <strong>Profile Details:</strong> Bio, interests, skills,
                    availability, and location
                  </li>
                  <li>
                    <strong>Volunteer Activity:</strong> Events registered,
                    hours volunteered, attendance records, and feedback
                  </li>
                  <li>
                    <strong>Organizer Information:</strong> Organization name,
                    contact details, event descriptions, and photos
                  </li>
                  <li>
                    <strong>Communications:</strong> Messages, comments, and
                    support inquiries
                  </li>
                  <li>
                    <strong>Payment Information:</strong> If applicable, payment
                    details processed through secure third-party providers
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  2.2 Automatically Collected Information
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  When you use VolunteerHub, we automatically collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>
                    <strong>Device Information:</strong> IP address, browser
                    type, operating system, and device identifiers
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Pages viewed, features used,
                    time spent, and click patterns
                  </li>
                  <li>
                    <strong>Location Data:</strong> Approximate location based
                    on IP address (precise location only with your permission)
                  </li>
                  <li>
                    <strong>Cookies and Tracking:</strong> Session cookies,
                    analytics cookies, and similar technologies
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  2.3 Information from Third Parties
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We may receive information from:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Social media platforms (if you connect your account)</li>
                  <li>
                    Event organizers (verification and attendance records)
                  </li>
                  <li>Analytics and advertising partners</li>
                  <li>Public databases and data providers</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section id="how-use">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>
                    <strong>Provide Services:</strong> Create and manage your
                    account, match you with events, and facilitate volunteer
                    activities
                  </li>
                  <li>
                    <strong>Communication:</strong> Send notifications, updates,
                    event reminders, and newsletters
                  </li>
                  <li>
                    <strong>Personalization:</strong> Recommend relevant events,
                    customize your experience, and display targeted content
                  </li>
                  <li>
                    <strong>Analytics:</strong> Understand usage patterns,
                    improve our platform, and develop new features
                  </li>
                  <li>
                    <strong>Safety and Security:</strong> Prevent fraud, detect
                    abuse, and protect user safety
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> Comply with laws,
                    regulations, and legal requests
                  </li>
                  <li>
                    <strong>Marketing:</strong> Send promotional materials (with
                    your consent and opt-out options)
                  </li>
                  <li>
                    <strong>Research:</strong> Conduct surveys, studies, and
                    community impact assessments
                  </li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. How We Share Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may share your information with:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.1 Event Organizers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  When you register for an event, we share your name, contact
                  information, and relevant profile details with the organizer.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.2 Other Volunteers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Your public profile (name, photo, bio) may be visible to other
                  volunteers and organizers to foster community connections.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.3 Service Providers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We work with third-party vendors for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Cloud hosting and data storage</li>
                  <li>Email delivery and notifications</li>
                  <li>Analytics and performance monitoring</li>
                  <li>Payment processing</li>
                  <li>Customer support tools</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.4 Legal Requirements
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose information when required by law, court order,
                  or to protect our rights, safety, or property.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.5 Business Transfers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your
                  information may be transferred to the acquiring entity.
                </p>
              </section>

              {/* Data Security */}
              <section id="data-security">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect
                  your information, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Encryption of data in transit and at rest (SSL/TLS)</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Employee training on data protection best practices</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  However, no system is completely secure. We cannot guarantee
                  absolute security, and you use our services at your own risk.
                </p>
              </section>

              {/* Your Rights */}
              <section id="your-rights">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Your Privacy Rights
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal
                    data
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your account
                    and data
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a
                    structured, machine-readable format
                  </li>
                  <li>
                    <strong>Objection:</strong> Opt-out of certain data
                    processing activities
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit how we use your data
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Revoke consent for data
                    processing
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, contact us at
                  privacy@volunteerhub.com. We will respond within 30 days.
                </p>
              </section>

              {/* Data Retention */}
              <section id="data-retention">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information for as long as:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Your account is active</li>
                  <li>Needed to provide our services</li>
                  <li>Required by law or regulations</li>
                  <li>
                    Necessary to resolve disputes or enforce our agreements
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  After account deletion, we may retain certain information in
                  anonymized or aggregated form for analytics and legal
                  purposes.
                </p>
              </section>

              {/* Children's Privacy */}
              <section id="children-privacy">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  VolunteerHub is not intended for children under 13. We do not
                  knowingly collect personal information from children. If you
                  believe we have collected information from a child, please
                  contact us immediately.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Users aged 13-17 may use our services with parental consent.
                  Parents have the right to review and request deletion of their
                  child's information.
                </p>
              </section>

              {/* Cookies */}
              <section id="cookies">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your account</li>
                  <li>Analyze usage patterns and performance</li>
                  <li>Deliver personalized content and ads</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookies through your browser settings.
                  Disabling cookies may limit certain features of our platform.
                </p>
              </section>

              {/* International Users */}
              <section id="international">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and stored on servers
                  in countries other than your own. By using VolunteerHub, you
                  consent to the transfer of your information to countries that
                  may have different data protection laws.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We implement appropriate safeguards, such as Standard
                  Contractual Clauses, to protect your information during
                  international transfers.
                </p>
              </section>

              {/* Third-Party Links */}
              <section id="third-party">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Third-Party Links
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our platform may contain links to external websites operated
                  by third parties. We are not responsible for the privacy
                  practices of these sites. We encourage you to review their
                  privacy policies before providing any information.
                </p>
              </section>

              {/* Policy Changes */}
              <section id="policy-changes">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  12. Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes by:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending an email notification</li>
                  <li>Displaying a prominent notice in the app</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Your continued use of VolunteerHub after changes indicates
                  your acceptance of the updated policy.
                </p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  13. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions, concerns, or requests regarding this
                  Privacy Policy, please contact us:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>VolunteerHub Privacy Team</strong>
                    <br />
                    Email: baytro.dev@gmail.com
                    <br />
                    Address: UET
                  </p>
                </div>
              </section>

              {/* Acceptance */}
              <section className="border-t border-gray-200 pt-6">
                <p className="text-gray-600 italic">
                  By using VolunteerHub, you acknowledge that you have read and
                  understood this Privacy Policy and agree to our collection,
                  use, and disclosure of your information as described herein.
                </p>
              </section>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <Link
              to="/terms-of-service"
              className="text-green-600 hover:text-green-700 font-semibold underline-offset-4 hover:underline"
            >
              View Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};
