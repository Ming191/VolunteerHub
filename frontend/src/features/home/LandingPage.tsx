import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Target,
  Globe,
  Award,
  Shield,
  Zap,
} from "lucide-react";
import LogoImg from "@/assets/logo.svg";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={LogoImg}
                alt="VolunteerHub"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">
                VolunteerHub
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Testimonials
              </a>
              <Link
                to="/events"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Browse Events
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 hover:text-green-600"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              Connect volunteers with
              <span className="text-green-600"> meaningful causes</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform for discovering volunteer opportunities,
              organizing events, and making a lasting impact in your community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-base px-8 h-14 shadow-lg"
                >
                  Start Volunteering
                  <Heart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 text-base px-8 h-14"
                >
                  Browse Events
                  <Calendar className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Empowering communities through volunteering
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                VolunteerHub bridges the gap between passionate individuals and
                organizations making a difference. Whether you're looking to
                volunteer or organize events, we provide the tools you need to
                create lasting change.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Find opportunities that match your passion
                    </p>
                    <p className="text-gray-600 text-sm">
                      Smart matching based on your interests and availability
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Track your volunteer journey
                    </p>
                    <p className="text-gray-600 text-sm">
                      See the impact you're making in real-time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Connect with like-minded volunteers
                    </p>
                    <p className="text-gray-600 text-sm">
                      Build meaningful relationships in your community
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Image Placeholder */}
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl aspect-square lg:aspect-auto lg:h-[500px] flex items-center justify-center shadow-xl">
              <div className="text-center p-8">
                <Heart className="h-32 w-32 text-green-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-green-800">
                  Making a Difference Together
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to volunteer effectively
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make volunteering seamless and
              impactful
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Matching
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find volunteer opportunities tailored to your interests, skills,
                and availability
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Event Management
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Organize and manage volunteer events with powerful tools and
                real-time updates
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Impact Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your volunteer hours and see the tangible difference
                you're making
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community Building
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with passionate volunteers and build lasting
                relationships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-8 h-8 text-white fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
          <blockquote className="text-2xl lg:text-3xl font-semibold text-white mb-6 leading-relaxed">
            "VolunteerHub has transformed how we connect with volunteers. The
            platform is intuitive, powerful, and has helped us make a real
            impact in our community."
          </blockquote>
          <div className="text-white/90">
            <p className="font-semibold text-lg">Sarah Johnson</p>
            <p className="text-white/75">
              Community Organizer, Hope Foundation
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section (Zig-zag) */}
      <section id="how-it-works" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          {/* Step 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl aspect-video lg:aspect-square flex items-center justify-center shadow-lg">
              <div className="text-center p-8">
                <Shield className="h-24 w-24 text-green-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-green-800">
                  Create Your Profile
                </p>
              </div>
            </div>
            <div>
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Sign up and tell us about yourself
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Create your free account in minutes. Share your interests,
                skills, and availability so we can match you with the perfect
                volunteer opportunities.
              </p>
              <Link to="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Discover opportunities near you
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Browse hundreds of volunteer events and causes. Use smart
                filters to find opportunities that match your passion, schedule,
                and location.
              </p>
              <Link to="/events">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Browse Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl aspect-video lg:aspect-square flex items-center justify-center shadow-lg">
              <div className="text-center p-8">
                <Globe className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-blue-800">
                  Find Your Cause
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl aspect-video lg:aspect-square flex items-center justify-center shadow-lg">
              <div className="text-center p-8">
                <Zap className="h-24 w-24 text-purple-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-purple-800">
                  Make an Impact
                </p>
              </div>
            </div>
            <div>
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Start making a difference
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Register for events, connect with other volunteers, and track
                your impact. Watch as your contributions make a real difference
                in your community.
              </p>
              <Link to="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Logos Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Trusted by organizations worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-300 h-12 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-600 font-bold">
                  Organization {i}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-24 bg-green-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to start your volunteer journey?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of volunteers making a real impact. Create your free
            account today and discover opportunities near you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100 text-base px-8 h-14 font-semibold shadow-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/events">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-base px-8 h-14 font-semibold"
              >
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={LogoImg}
                  alt="VolunteerHub"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold text-white">
                  VolunteerHub
                </span>
              </div>
              <p className="text-gray-400 max-w-md">
                Connecting volunteers with meaningful causes to create lasting
                impact in communities worldwide.
              </p>
            </div>

            {/* Links Column 1 */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/events"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signin"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400">
              © 2025 VolunteerHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
