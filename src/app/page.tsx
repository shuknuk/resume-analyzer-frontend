// src/app/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
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
  Building2,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define the NEW structure of the analysis object
type Improvement = {
  suggestion: string;
  explanation: string;
  example: string;
};
type Analysis = {
  score: number;
  scoreRationale: string;
  strengths: string[];
  improvements: Improvement[];
};

// This is a separate type for the history to include the timestamp
type HistoryEntry = Analysis & {
    timestamp: string;
};


export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<HistoryEntry[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
    let storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('sessionId', storedSessionId);
    }
    setSessionId(storedSessionId);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          resume_text: resumeText,
          job_description: jobDescription,
          company_name: companyName,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAnalysis(data.analysis);

      // Save to history with a timestamp
      const newHistoryEntry: HistoryEntry = { ...data.analysis, timestamp: new Date().toISOString() };
      const updatedHistory = [newHistoryEntry, ...analysisHistory];
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
      
      toast.success("Analysis complete!");

    } catch (e) {
      if (e instanceof Error) toast.error('Failed to get analysis. Please try again.');
      else toast.error('An unknown error occurred.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };
  
  const handleDownloadData = () => {
    const dataStr = JSON.stringify({sessionId, history: analysisHistory}, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-analysis-session-${sessionId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Your session data has been downloaded.");
  };

  const handleClearData = () => {
    localStorage.removeItem('analysisHistory');
    localStorage.removeItem('sessionId');
    setAnalysisHistory([]);
    setAnalysis(null);
    const newSessionId = uuidv4();
    localStorage.setItem('sessionId', newSessionId);
    setSessionId(newSessionId);
    toast.warn("Your session data has been cleared.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>How It Works</DialogTitle>
            <DialogDescription>
              Welcome! This is a quick guide to using the AI Resume Analyzer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="space-y-2">
                <h4 className="font-semibold">1. Paste Your Resume</h4>
                <p className="text-muted-foreground">Add the full text of your resume into the main text area to get started.</p>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">2. Add Context (Optional, but Recommended)</h4>
                <p className="text-muted-foreground">
                    - <strong>Job Description:</strong> Paste the description of the job you&apos;re targeting. The AI will analyze your resume against these specific requirements.
                </p>
                <p className="text-muted-foreground">
                    - <strong>Company Name:</strong> Provide a company name. The AI agent will research the company&apos;s values and culture to give you an extra edge.
                </p>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">3. Get Analysis</h4>
                <p className="text-muted-foreground">Click the &quot;Analyze Resume&quot; button to receive your detailed, AI-powered breakdown.</p>
            </div>
            <hr className="my-2" />
            <h4 className="font-semibold">Your Privacy</h4>
            <p className="text-xs text-muted-foreground">
              Your data is saved only in your browser local storage. It is never sent to our servers. You are in full control.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button">Got it!</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
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
                <div className="p-2 space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">Your Resume</h3>
                    <Textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text here..." className="h-48 text-sm" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Job Description (Optional)</h3>
                    <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description..." className="h-32 text-sm" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Company Name (Optional)</h3>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="text" placeholder="e.g. 'Netflix' or 'Stripe'" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="pl-8" />
                    </div>
                  </div>
                </div>
                <Button onClick={handleAnalyze} disabled={loading} className="m-2">
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>) : (<><Zap className="mr-2 h-4 w-4" />Analyze Resume</>)}
                </Button>
                <Card className="m-2 mt-4 bg-transparent border-dashed">
                  <CardHeader className="p-4"><CardTitle className="text-sm">Data Management</CardTitle></CardHeader>
                  <CardContent className="p-4 pt-0 grid gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadData} disabled={analysisHistory.length === 0}><Download className="mr-2 h-4 w-4" />Download History</Button>
                    <Button variant="destructive" size="sm" onClick={handleClearData} disabled={analysisHistory.length === 0}><Trash2 className="mr-2 h-4 w-4" />Clear History</Button>
                  </CardContent>
                </Card>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
            <div className="flex-1"><h1 className="text-lg font-semibold">Analysis Dashboard</h1></div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsHelpOpen(true)}><HelpCircle className="h-4 w-4" /></Button>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-6">
            {!analysis && !loading && (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[80vh]">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-2xl font-bold tracking-tight">Ready for your analysis?</h3>
                  <p className="text-sm text-muted-foreground">Paste your resume in the sidebar to get started.</p>
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
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Overview</CardTitle>
                    <CardDescription>{analysis.scoreRationale}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/100
                    </div>
                  </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                            {analysis.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-yellow-500" /> Actionable Improvements</CardTitle>
                        <CardDescription>Expand each section to see why it matters and how to fix it.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {analysis.improvements.map((item, i) => (
                                <AccordionItem value={`item-${i}`} key={i}>
                                    <AccordionTrigger className="font-semibold">{item.suggestion}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground"><strong className="text-foreground">Why it matters:</strong> {item.explanation}</p>
                                            <div>
                                                <p className="font-semibold">Example:</p>
                                                <blockquote className="mt-2 border-l-2 pl-6 italic text-sm">
                                                    {item.example}
                                                </blockquote>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
