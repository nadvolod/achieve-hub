
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Target, TrendingUp, Clock } from "lucide-react";

const FeaturesSection = () => {
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
    <>
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
    </>
  );
};

export default FeaturesSection;
