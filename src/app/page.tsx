// src/app/page.tsx
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [resumeText, setResumeText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Reset state and start loading
    setIsLoading(true);
    setAnalysisResult('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);

    } catch (e: any) {
      setError('Failed to get analysis. Please try again. ' + e.message);
      console.error(e);
    } finally {
      // Stop loading regardless of success or error
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            AI Resume Analyzer
          </h1>
          <p className="text-md text-gray-500 mt-2">
            Paste your resume below to get instant feedback from our AI career coach.
          </p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="resume-text" className="block text-lg font-medium text-gray-700 mb-2">
            Your Resume Text
          </label>
          <textarea
            id="resume-text"
            rows={15}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="Paste the full text of your resume here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !resumeText}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze My Resume'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
            <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Analysis Results
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {analysisResult}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}