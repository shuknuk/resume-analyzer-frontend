// src/app/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { toast } from 'react-toastify';
// Removed uuidv4 import
import {
  CheckCircle,
  Zap,
  Loader2,
  FileText,
  Sparkles,
  HelpCircle,
  Download,
  Building2,
  Lightbulb,
  Terminal,
  Menu,
  X,
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

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [agentLog, setAgentLog] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Show help dialog automatically when the page loads
  useEffect(() => {
    setIsHelpOpen(true);
  }, []);

  // Input validation function
  const validateInput = (text: string): boolean => {
    if (text.length < 250) {
      toast.error("Resume text is too short. Please paste your full resume for an accurate analysis.");
      return false;
    }
    const keywords = ["experience", "education", "skills", "project", "summary", "objective"];
    const textLower = text.toLowerCase();
    const foundKeywords = keywords.filter(kw => textLower.includes(kw));
    if (foundKeywords.length < 2) {
      toast.error("Input does not appear to be a resume. Please check your text and include sections like 'Experience' or 'Skills'.");
      return false;
    }
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateInput(resumeText)) {
      return;
    }
    setLoading(true);
    setAnalysis(null);
    setAgentLog(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
          company_name: companyName,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setAnalysis(data.analysis);
      setAgentLog(data.log);
      toast.success("Analysis complete!");

    } catch (e) {
      if (e instanceof Error) toast.error('Failed to get analysis. Please try again.');
      else toast.error('An unknown error occurred.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    let report = `========================================\n`;
    report += ` AI RESUME ANALYSIS REPORT\n`;
    report += `========================================\n\n`;
    report += `Date: ${new Date().toLocaleDateString()}\n\n`;
    report += `----------------------------------------\n`;
    report += ` OVERVIEW\n`;
    report += `----------------------------------------\n`;
    report += `SCORE: ${analysis.score}/100\n`;
    report += `RATIONALE: ${analysis.scoreRationale}\n\n`;
    report += `----------------------------------------\n`;
    report += ` STRENGTHS\n`;
    report += `----------------------------------------\n`;
    analysis.strengths.forEach(strength => { report += `- ${strength}\n`; });
    report += `\n`;
    report += `----------------------------------------\n`;
    report += ` ACTIONABLE IMPROVEMENTS\n`;
    report += `----------------------------------------\n`;
    analysis.improvements.forEach(item => {
      report += `\nSuggestion: ${item.suggestion}\n`;
      report += `Why it matters: ${item.explanation}\n`;
      report += `Example: ${item.example}\n---`;
    });
    const dataBlob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI-Resume-Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Your report has been downloaded.");
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Help Dialog */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>How It Works</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Paste Your Resume</h4>
              <p className="text-muted-foreground">Add the full text of your resume into the main text area to get started.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Add Context (Optional, but Recommended)</h4>
              <p className="text-muted-foreground">- <strong>Job Description:</strong> Paste the description of the job you&apos;re targeting. The AI will analyze your resume against these specific requirements.</p>
              <p className="text-muted-foreground">- <strong>Company Name:</strong> Provide a company name. The AI agent will research the company&apos;s values and culture to give you an extra edge.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Get Analysis</h4>
              <p className="text-muted-foreground">Click the &quot;Analyze Resume&quot; button to receive your detailed, AI-powered breakdown.</p>
            </div>
            <hr className="my-2" />
            <h4 className="font-semibold">Your Privacy & Data</h4>
            <p className="text-xs text-muted-foreground">Your resume text is sent to our backend to be processed by Google&apos;s Gemini model. If you provide a company name, the agent uses the Tavily Search API to browse the web. No data is saved on our servers.</p>
          </div>
          <DialogFooter><DialogClose asChild><Button type="button" className="w-full sm:w-auto">Got it!</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Log Dialog */}
      <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Agent Execution Log</DialogTitle><DialogDescription>See the AI&apos;s thought process, including the tools it used.</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-md bg-muted p-4 min-h-0">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{agentLog || "No log available."}</pre>
          </div>
          <DialogFooter><DialogClose asChild><Button type="button" className="w-full sm:w-auto">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r shadow-lg">
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center justify-between border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  <span>Resume Analyzer</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-semibold">Your Resume</h3>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here..."
                      className="h-40 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Job Description (Optional)</h3>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste job description..."
                      className="h-32 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Company Name (Optional)</h3>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g. 'Netflix' or 'Stripe'"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      handleAnalyze();
                      setIsMobileSidebarOpen(false);
                    }}
                    disabled={loading}
                    className="w-full h-12 text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
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
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Header */}
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Resume Analyzer</h1>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsHelpOpen(true)}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-6">
            {!analysis && !loading && (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[60vh] lg:h-[80vh]">
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  <Sparkles className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl lg:text-2xl font-bold tracking-tight">Ready for your analysis?</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    <span className="lg:hidden">Tap the menu button above to add your resume and get started.</span>
                    <span className="hidden lg:inline">Paste your resume in the sidebar to get started.</span>
                  </p>
                  <Button
                    className="lg:hidden mt-4"
                    onClick={() => setIsMobileSidebarOpen(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Add Resume
                  </Button>
                </div>
              </div>
            )}
            {loading && (
              <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[60vh] lg:h-[80vh]">
                <div className="flex flex-col items-center gap-2 text-center px-4">
                  <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                  <h3 className="text-xl lg:text-2xl font-bold tracking-tight">Generating Feedback</h3>
                  <p className="text-sm text-muted-foreground">This will take some time, AI tokens don&apos;t grow on trees!</p>
                </div>
              </div>
            )}
            {analysis && (
              <div className="grid gap-4 lg:gap-6">
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg lg:text-xl">Analysis Overview</CardTitle>
                      <CardDescription className="text-sm">{analysis.scoreRationale}</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsLogOpen(true)}
                        disabled={!agentLog}
                        className="w-full sm:w-auto text-xs lg:text-sm"
                      >
                        <Terminal className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="hidden sm:inline">Show Agent Log</span>
                        <span className="sm:hidden">Agent Log</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadReport}
                        className="w-full sm:w-auto text-xs lg:text-sm"
                      >
                        <Download className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="hidden sm:inline">Download Report</span>
                        <span className="sm:hidden">Download</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-4 lg:p-6">
                    <div className={`text-4xl lg:text-6xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}/100</div>
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
