'use client';

import { useState } from "react";
import { toast } from 'react-toastify';
import {
  CheckCircle,
  AlertTriangle,
  Zap,
  Loader2,
  FileText,
  Sparkles,
  ChevronRight
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
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Define the structure of the analysis object for TypeScript
type Analysis = {
  score: number;
  summary: string;
  keywords: string[];
  strengths: string[];
  improvements: string[];
};

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text first.");
      return;
    }
    setLoading(true);
    setAnalysis(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analyze`, {
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
      toast.success("Analysis complete!");

    } catch (e) {
      if (e instanceof Error) {
        toast.error('Failed to get analysis. Please try again.');
      } else {
        toast.error('An unknown error occurred.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        {/* --- LEFT SIDEBAR --- */}
        <div className="hidden border-r bg-muted/40 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
              <a href="/" className="flex items-center gap-2 font-semibold">
                <FileText className="h-6 w-6" />
                <span>Resume Analyzer</span>
              </a>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                <div className="p-2">
                  <h3 className="mb-2 font-semibold">Your Resume</h3>
                  <Textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here..."
                    className="h-64 text-sm"
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="m-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </nav>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Analysis Dashboard</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-4 md:p-6">
            {!analysis && !loading && (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[80vh]">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-2xl font-bold tracking-tight">
                    Ready for your analysis?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Paste your resume in the sidebar to get started.
                  </p>
                </div>
              </div>
            )}
            
            {loading && (
                 <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[80vh]">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                        <h3 className="text-2xl font-bold tracking-tight">Generating Feedback</h3>
                        <p className="text-sm text-muted-foreground">Our AI is working its magic... this may take a moment.</p>
                    </div>
                 </div>
            )}

            {analysis && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Overall Score</CardTitle>
                      <CardDescription>{analysis.summary}</CardDescription>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {analysis.score}/100
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                  <Tabs defaultValue="strengths" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="strengths">Strengths</TabsTrigger>
                      <TabsTrigger value="improvements">Areas for Improvement</TabsTrigger>
                    </TabsList>
                    <TabsContent value="strengths">
                      <CardContent className="pt-6">
                        <ul className="space-y-4">
                          {analysis.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                              <p className="text-muted-foreground">{strength}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </TabsContent>
                    <TabsContent value="improvements">
                      <CardContent className="pt-6">
                         <ul className="space-y-4">
                          {analysis.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                              <p className="text-muted-foreground">{improvement}</p>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
