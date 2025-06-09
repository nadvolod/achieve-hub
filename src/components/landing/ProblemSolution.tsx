
import React from "react";
import { CheckCircle } from "lucide-react";

const ProblemSolution = () => {
  return (
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
  );
};

export default ProblemSolution;
