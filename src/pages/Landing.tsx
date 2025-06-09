
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Target, TrendingUp, Clock, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Target className="h-8 w-8 text-teal-500" />,
      title: "Daily Reflection Questions",
      description: "Structured questions that guide you towards clarity and purpose every single day"
    },
    {
      icon: <Calendar className="h-8 w-8 text-teal-500" />,
      title: "Weekly SMART Priorities",
      description: "Set meaningful goals with built-in progress tracking that keeps you accountable"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-teal-500" />,
      title: "Progress Visualization",
      description: "Watch your growth unfold with streak tracking and completion insights"
    },
    {
      icon: <Clock className="h-8 w-8 text-teal-500" />,
      title: "Historical Insights",
      description: "Look back on your journey and see how far you've come with detailed history"
    }
  ];

  const benefits = [
    "Transform scattered thoughts into focused action",
    "Build unshakeable daily habits that compound over time",
    "Gain crystal-clear direction on what truly matters",
    "Experience the satisfaction of consistent progress",
    "Develop deep self-awareness and emotional intelligence"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-navy-500">Daily Dreamer</h1>
          <div className="flex gap-3">
            {user ? (
              <Button 
                onClick={() => navigate("/")}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Go to My App
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")}
                className="border-teal-500 text-teal-700 hover:bg-teal-50"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-navy-500 mb-6 leading-tight">
            Stop Letting Your Dreams
            <span className="text-teal-500 block">Slip Away</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Every day without intention is a day lost forever. While others drift through life on autopilot, 
            you could be building the focused, purposeful life you've always imagined.
          </p>
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 text-left max-w-2xl mx-auto">
            <p className="text-red-800 font-medium">
              <strong>The Cost of Waiting:</strong> Research shows that people who don't track their progress are 
              42% less likely to achieve their goals. How many opportunities have already passed you by?
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate(user ? "/" : "/auth")}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold"
          >
            {user ? "Go to My Daily Dreamer" : "Start Your Transformation Today"}
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            {user ? "Continue your journey" : "Join thousands who've already taken control"}
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">2,847 Active Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">98% Report Better Focus</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              <span className="font-medium">Average 73% Goal Completion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Pain Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-navy-500 mb-8">
            Are You Tired of Feeling Stuck?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-100 p-6 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-4">Without Daily Dreamer:</h4>
              <ul className="text-left space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Days blur together without purpose or direction</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Goals set but never achieved, leading to frustration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Constant feeling of being busy but not productive</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Lack of self-awareness about what truly matters</span>
                </li>
              </ul>
            </div>
            <div className="bg-teal-50 p-6 rounded-lg">
              <h4 className="font-bold text-teal-800 mb-4">With Daily Dreamer:</h4>
              <ul className="text-left space-y-3 text-teal-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span>Crystal-clear daily intentions that drive action</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span>Measurable progress on goals that actually matter</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span>Deep satisfaction from consistent growth</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 mt-1 flex-shrink-0" />
                  <span>Unshakeable confidence in your life's direction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-navy-500 mb-4">
              Everything You Need to Transform Your Life
            </h3>
            <p className="text-xl text-gray-600">
              Powerful tools designed to turn your aspirations into achievements
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-navy-500">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-navy-500 text-center mb-12">
            The Life-Changing Benefits You'll Experience
          </h3>
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-red-700 mb-6">
              Every Day You Wait Is Another Day Lost
            </h3>
            <p className="text-lg text-red-600 mb-8">
              While you're reading this, successful people are already using tools like Daily Dreamer to 
              build the life they want. The gap between where you are and where you could be grows wider every day.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <p className="text-2xl font-bold text-navy-500 mb-2">
                What will your life look like in 90 days?
              </p>
              <p className="text-gray-600">
                With consistent daily reflection and weekly goal tracking, you could be living the focused, 
                intentional life you've always wanted. Or you could still be wondering "what if?"
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate(user ? "/" : "/auth")}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold"
            >
              {user ? "Continue Your Journey" : "Don't Wait Another Day - Start Now"}
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">
              Join the Daily Dreamer Community Today
            </h3>
            <p className="text-xl mb-8 text-gray-200">
              Take the first step towards the focused, intentional life you deserve. 
              Your future self will thank you for starting today.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate(user ? "/" : "/auth")}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold"
            >
              {user ? "Open Daily Dreamer" : "Get Started Free"}
            </Button>
            <p className="text-sm text-gray-300 mt-4">
              {user ? "Continue building your better life" : "No credit card required • Start transforming your life in under 2 minutes"}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">
            © 2024 Daily Dreamer. Transform your life, one day at a time.
          </p>
          <p className="text-gray-500 text-sm">
            Built by{" "}
            <a 
              href="http://ultimateqa.com/nikolay-advolodkin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Nikolay Advolodkin
            </a>
            {" "}from{" "}
            <a 
              href="https://ultimateqa.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              UltimateQA.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
