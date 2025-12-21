import { Link } from "@tanstack/react-router";
import { FileText, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const TermsOfServicePage = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-green-100 rounded-2xl">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Terms of Service
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
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                1. Introduction
              </a>
              <a
                href="#eligibility"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                2. Eligibility
              </a>
              <a
                href="#account"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                3. Account Registration and Security
              </a>
              <a
                href="#user-roles"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                4. User Roles and Responsibilities
              </a>
              <a
                href="#acceptable-use"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                5. Acceptable Use Policy
              </a>
              <a
                href="#content"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                6. Content and Intellectual Property
              </a>
              <a
                href="#liability"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                7. Limitation of Liability
              </a>
              <a
                href="#indemnification"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                8. Indemnification
              </a>
              <a
                href="#termination"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                9. Termination
              </a>
              <a
                href="#dispute"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                10. Dispute Resolution
              </a>
              <a
                href="#governing-law"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                11. Governing Law
              </a>
              <a
                href="#contact"
                className="text-green-600 hover:text-green-700 hover:underline underline-offset-4"
              >
                12. Contact Information
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
                  Welcome to VolunteerHub ("we," "our," or "us"). These Terms of
                  Service ("Terms") govern your access to and use of our
                  volunteer management platform, website, and related services
                  (collectively, the "Service"). By accessing or using
                  VolunteerHub, you agree to be bound by these Terms.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If you do not agree to these Terms, please do not use our
                  Service. We reserve the right to modify these Terms at any
                  time, and we will notify you of any material changes.
                </p>
              </section>

              {/* Eligibility */}
              <section id="eligibility">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Eligibility
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To use VolunteerHub, you must:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>
                    Be at least 13 years of age (or the age of majority in your
                    jurisdiction)
                  </li>
                  <li>Have the legal capacity to enter into these Terms</li>
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>
                    Not be prohibited from using the Service under applicable
                    laws
                  </li>
                  <li>
                    Not have been previously suspended or banned from our
                    platform
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Users under 18 may need parental or guardian consent to
                  participate in certain volunteer opportunities.
                </p>
              </section>

              {/* Account Registration */}
              <section id="account">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Account Registration and Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  When you create an account, you must:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password confidential and secure</li>
                  <li>Immediately notify us of any unauthorized access</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You may not share your account credentials, transfer your
                  account to others, or create multiple accounts without our
                  permission.
                </p>
              </section>

              {/* User Roles */}
              <section id="user-roles">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. User Roles and Responsibilities
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.1 Volunteers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  As a volunteer, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Honor your commitments to attend registered events</li>
                  <li>Follow instructions provided by event organizers</li>
                  <li>
                    Behave respectfully toward other volunteers and organizers
                  </li>
                  <li>
                    Cancel registrations at least 24 hours in advance when
                    possible
                  </li>
                  <li>Report your volunteer hours accurately</li>
                  <li>Comply with all safety guidelines and requirements</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  4.2 Event Organizers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  As an event organizer, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Provide accurate and complete event information</li>
                  <li>
                    Ensure events comply with all applicable laws and
                    regulations
                  </li>
                  <li>Maintain appropriate insurance and safety measures</li>
                  <li>Treat volunteers with respect and professionalism</li>
                  <li>Verify and approve volunteer hours truthfully</li>
                  <li>Cancel events with reasonable notice if necessary</li>
                  <li>Not discriminate based on protected characteristics</li>
                </ul>
              </section>

              {/* Acceptable Use */}
              <section id="acceptable-use">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Acceptable Use Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree NOT to use VolunteerHub to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>
                    Create events for commercial purposes without authorization
                  </li>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload viruses, malware, or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>
                    Scrape, crawl, or collect user data without permission
                  </li>
                  <li>Impersonate others or misrepresent your affiliations</li>
                  <li>
                    Promote illegal activities, violence, or discrimination
                  </li>
                </ul>
              </section>

              {/* Content Ownership */}
              <section id="content">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Content and Intellectual Property
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  6.1 Your Content
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of content you submit to VolunteerHub
                  (profiles, event descriptions, photos, etc.). By posting
                  content, you grant us a worldwide, non-exclusive, royalty-free
                  license to use, display, and distribute your content in
                  connection with the Service.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  6.2 Our Content
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  The VolunteerHub platform, including its design, features,
                  graphics, and software, is owned by us and protected by
                  intellectual property laws. You may not copy, modify, or
                  create derivative works without our written permission.
                </p>
              </section>

              {/* Liability */}
              <section id="liability">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  VolunteerHub is a platform that connects volunteers with
                  organizations. We do not:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>
                    Employ, supervise, or control volunteers or organizers
                  </li>
                  <li>Conduct background checks on users</li>
                  <li>Verify the legitimacy of events or organizations</li>
                  <li>Guarantee the safety of volunteer activities</li>
                  <li>Assume liability for injuries, damages, or losses</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                  PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                </p>
              </section>

              {/* Indemnification */}
              <section id="indemnification">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Indemnification
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless VolunteerHub, its
                  officers, directors, employees, and agents from any claims,
                  damages, losses, or expenses (including legal fees) arising
                  from:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Your violation of these Terms</li>
                  <li>Your use of the Service</li>
                  <li>Your content or conduct</li>
                  <li>Your participation in volunteer activities</li>
                  <li>Your violation of any third-party rights</li>
                </ul>
              </section>

              {/* Termination */}
              <section id="termination">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account at
                  any time, with or without notice, for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Abuse of the platform or other users</li>
                  <li>Inactivity for extended periods</li>
                  <li>Any other reason at our sole discretion</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You may terminate your account at any time through your
                  account settings. Upon termination, your right to use the
                  Service ceases immediately.
                </p>
              </section>

              {/* Dispute Resolution */}
              <section id="dispute">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Dispute Resolution
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Any disputes arising from these Terms or your use of
                  VolunteerHub shall be resolved through binding arbitration in
                  accordance with the rules of the American Arbitration
                  Association. You waive your right to participate in class
                  action lawsuits.
                </p>
              </section>

              {/* Governing Law */}
              <section id="governing-law">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance
                  with the laws of [Your Jurisdiction], without regard to its
                  conflict of law provisions.
                </p>
              </section>

              {/* Contact */}
              <section id="contact">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  12. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about these Terms, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>VolunteerHub Support</strong>
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
                  By using VolunteerHub, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
              </section>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <Link
              to="/privacy-policy"
              className="text-green-600 hover:text-green-700 font-semibold underline-offset-4 hover:underline"
            >
              View Privacy Policy
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
          className="fixed bottom-8 right-8 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};
