
import React from "react";

const LandingFooter = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400 mb-2">
          © 2025 Achieve Hub. Stop dreaming, start achieving.
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
  );
};

export default LandingFooter;
