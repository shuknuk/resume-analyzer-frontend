// src/app/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  CheckCircle,
  AlertTriangle,
  Zap,
  Loader2,
  FileText,
  Sparkles,
  HelpCircle,
  Download,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Define the structure of the analysis object for TypeScript
type Analysis = {
  score: number;
  summary: string;
  keywords: string[];
  strengths: string[];
  improvements: string[];
  timestamp: string; // Add timestamp for history
};

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<Analysis[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // On initial load, check for history and show help modal for first-time visitors
  useEffect(() => {
    const storedHistory = localStorage.getItem('analysisHistory');
    if (storedHistory) {
      setAnalysisHistory(JSON.parse(storedHistory));
    }

    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsHelpOpen(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

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
      const newAnalysis: Analysis = {
        ...data.analysis,
        timestamp: new Date().toISOString(),
      };
      
      setAnalysis(newAnalysis);
      
      // Save to history
      const updatedHistory = [newAnalysis, ...analysisHistory];
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));

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

  const handleDownloadData = () => {
    const dataStr = JSON.stringify(analysisHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume-analysis-history.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Your analysis history has been downloaded.");
  };

  const handleClearData = () => {
    localStorage.removeItem('analysisHistory');
    setAnalysisHistory([]);
    setAnalysis(null);
    toast.warn("Your analysis history has been cleared.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* --- HELP DIALOG --- */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>How It Works</DialogTitle>
            <DialogDescription>
              Welcome! This is a quick guide to using the AI Resume Analyzer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <p>
              <strong>1. Paste Your Resume:</strong> Add the text from your resume into the main text area in the sidebar.
            </p>
            <p>
              <strong>2. Get Analysis:</strong> Click the &quot;Analyze Resume&quot; button. Our AI will read your resume and provide a detailed breakdown.
            </p>
            <p>
              <strong>3. Review Feedback:</strong> Your results will appear on the dashboard, including an overall score, keywords, strengths, and areas for improvement.
            </p>
            <hr className="my-2" />
            <h4 className="font-semibold">Your Privacy</h4>
            <p className="text-xs text-muted-foreground">
              Your resume text and analysis results are saved only in your browser local storage. This data is never sent to our servers or viewed by anyone. You are in full control.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Got it!</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        {/* --- LEFT SIDEBAR --- */}
        <div className="hidden border-r bg-muted/40 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <FileText className="h-6 w-6" />
                <span>Resume Analyzer</span>
              </Link>
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
                
                {/* --- DATA MANAGEMENT SECTION --- */}
                <Card className="m-2 mt-4 bg-transparent border-dashed">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Data Management</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 grid gap-2">
                      <Button variant="outline" size="sm" onClick={handleDownloadData} disabled={analysisHistory.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Download History
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleClearData} disabled={analysisHistory.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear History
                      </Button>
                    </CardContent>
                </Card>
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
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
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