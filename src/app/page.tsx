
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Clipboard,
  Download,
  Star,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text first.");
      return;
    }
    setLoading(true);
    setAnalysis(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${apiUrl}/analyze`, { // Use the dynamic URL
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
      setAnalysis(data.analysis);
    } catch (e) {
      if (e instanceof Error) {
        toast.error('Failed to get analysis. Please try again. ' + e.message);
      } else {
        toast.error('An unknown error occurred.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
          Unlock Your Career Potential
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Craft the Perfect Resume with AI
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Your Resume</CardTitle>
              <CardDescription>
                Paste the full text of your resume here to begin your analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume here..."
                className="w-full h-96 bg-gray-900 border-gray-700 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="mr-2" />
                    <span>Analyze My Resume</span>
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {loading && (
            <Card className="bg-gray-800 border-gray-700 p-6 flex flex-col items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse">
                  <Zap size={48} className="text-purple-400 mx-auto" />
                </div>
                <p className="mt-4 text-lg font-semibold">
                  Analyzing your resume...
                </p>
                <p className="text-gray-400">
                  This might take a moment.
                </p>
              </div>
            </Card>
          )}

          {analysis && (
            <Card className="bg-gray-800 border-gray-700 sticky top-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Analysis Summary</CardTitle>
                <div className="relative w-32 h-32 mx-auto mt-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-700"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-purple-500"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * analysis.score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      style={{
                        transition: "stroke-dashoffset 1.5s ease-out",
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {analysis.score}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-gray-300">{analysis.summary}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {analysis && !loading && (
          <div className="lg:col-span-3 mt-8">
            <Tabs defaultValue="strengths" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
              </TabsList>
              <TabsContent value="strengths">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <p>{strength}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="improvements">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {analysis.improvements.map((improvement, i) => (
                      <div key={i} className="flex items-start">
                        <AlertTriangle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                        <p>{improvement}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeAnalyzer;
