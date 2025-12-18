import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EventResponse } from "@/api-client";
import {
  Heart,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HandHeart,
  Award,
} from "lucide-react";
import AnimatedPage from "@/components/common/AnimatedPage";
import { usePublicEvents } from "@/features/events/hooks/usePublicEvents";
import { EventCard } from "@/features/events/components/EventCard";
import LogoImg from "@/assets/logo.svg";

export const LandingPage = () => {
  const { data: events, isLoading } = usePublicEvents();
  const featuredEvents = events?.slice(0, 6) || [];

  return (
    <AnimatedPage className="min-h-screen bg-gradient-hero">
      {/* Header/Nav - Bright & Clean */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b-2 border-brand-teal-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={LogoImg}
              alt="VolunteerHub"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-teal-500 via-brand-orange-500 to-accent-coral bg-clip-text text-transparent">
              VolunteerHub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/signin">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-brand-teal-600 hover:bg-brand-teal-50 font-semibold"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-brand-teal-500 to-brand-teal-600 hover:from-brand-teal-400 hover:to-brand-teal-500 text-white shadow-vibrant font-bold px-6 transform hover:scale-105 transition-all">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Vibrant & Energetic */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-teal-50 to-brand-orange-50 border-2 border-brand-teal-200 text-brand-teal-700 text-sm font-bold mb-4 animate-pulse-vibrant">
            <Sparkles className="h-5 w-5 text-brand-orange-500" />
            Make a difference in your community today
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-brand-teal-500 via-brand-orange-500 to-accent-coral bg-clip-text text-transparent drop-shadow-sm">
              Connect. Volunteer.
            </span>
            <br />
            <span className="text-gray-900">Change Lives.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed">
            Join{" "}
            <span className="text-brand-teal-600 font-bold">10,000+ volunteers</span>{" "}
            making an impact. Find opportunities that match your passion and skills.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-vibrant hover:shadow-2xl text-white text-lg px-10 py-7 shadow-vibrant font-extrabold transform hover:scale-110 transition-all animate-bounce-gentle"
              >
                Start Volunteering
                <Heart className="ml-2 h-6 w-6 fill-white" />
              </Button>
            </Link>
            <Link to="/events">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-3 border-brand-orange-300 text-brand-orange-600 hover:bg-brand-orange-50 hover:border-brand-orange-500 font-bold transform hover:scale-105 transition-all"
              >
                Browse Events
                <Calendar className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Colorful Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-3 border-brand-teal-200 bg-gradient-to-br from-white to-brand-teal-50 backdrop-blur hover:shadow-vibrant transition-all transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 mb-4 shadow-vibrant">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="text-5xl font-extrabold text-brand-teal-600">
                10K+
              </div>
              <div className="text-gray-700 mt-2 font-semibold">
                Active Volunteers
              </div>
            </CardContent>
          </Card>

          <Card className="border-3 border-brand-orange-200 bg-gradient-to-br from-white to-brand-orange-50 backdrop-blur hover:shadow-warm transition-all transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 mb-4 shadow-warm">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <div className="text-5xl font-extrabold text-brand-orange-600">
                500+
              </div>
              <div className="text-gray-700 mt-2 font-semibold">
                Events This Month
              </div>
            </CardContent>
          </Card>

          <Card className="border-3 border-blue-200 bg-gradient-to-br from-white to-blue-50 backdrop-blur hover:shadow-lg hover:shadow-blue-300/50 transition-all transform hover:scale-105">
            <CardContent className="p-8 text-center">
              <div className="inline-flex p-5 rounded-2xl bg-gradient-to-br from-accent-blue to-blue-600 mb-4 shadow-lg shadow-blue-300/50">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div className="text-5xl font-extrabold text-accent-blue">
                50K+
              </div>
              <div className="text-gray-700 mt-2 font-semibold">
                Hours Contributed
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section - Bright & Inviting */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-brand-teal-50/30 to-brand-orange-50/30 rounded-3xl my-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Why Choose VolunteerHub?
          </h2>
          <p className="text-2xl text-gray-600 font-medium">
            Everything you need to start making a difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-3 border-brand-teal-200 bg-white hover:shadow-vibrant transition-all transform hover:scale-105 hover:-translate-y-2">
            <CardContent className="p-10 text-center space-y-4">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-brand-teal-100 to-brand-teal-200">
                <HandHeart className="h-12 w-12 text-brand-teal-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Easy Discovery
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Find volunteer opportunities that match your interests, skills,
                and schedule with our smart matching
              </p>
            </CardContent>
          </Card>

          <Card className="border-3 border-brand-orange-200 bg-white hover:shadow-warm transition-all transform hover:scale-105 hover:-translate-y-2">
            <CardContent className="p-10 text-center space-y-4">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-brand-orange-100 to-brand-orange-200">
                <Users className="h-12 w-12 text-brand-orange-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Connect & Collaborate
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Join a vibrant community of passionate volunteers and make lasting
                connections that matter
              </p>
            </CardContent>
          </Card>

          <Card className="border-3 border-blue-200 bg-white hover:shadow-lg hover:shadow-blue-300/50 transition-all transform hover:scale-105 hover:-translate-y-2">
            <CardContent className="p-10 text-center space-y-4">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200">
                <Award className="h-12 w-12 text-accent-blue" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Track Impact
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                See your contributions and the real difference you're making in
                your community in real-time
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Events Preview Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-br from-green-50/50 to-orange-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join these amazing volunteer opportunities
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredEvents.map((event: EventResponse) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No events available at the moment
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/events">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-2xl">
          <CardContent className="p-12 text-center text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-green-50">
              Join our community of volunteers today and start creating positive
              change
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 text-lg px-8"
                >
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                VolunteerHub
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              © 2024 VolunteerHub. Making a difference together.
            </p>
          </div>
        </div>
      </footer>
    </AnimatedPage>
  );
};
