"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Extraction, Evidence } from "@/types/extraction";

const MAX_CHAR_LIMIT = 50000;

interface AnalyzeSuccessResponse {
  success: true;
  data: Extraction;
}

interface AnalyzeErrorResponse {
  success: false;
  error?: string;
}

type AnalyzeApiResponse = AnalyzeSuccessResponse | AnalyzeErrorResponse;

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

// ==========================================
// Reusable Evidence Disclosure Component
// ==========================================
function EvidenceDisclosure({ evidence }: { evidence: Evidence | null | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  if (!evidence || !evidence.original_text) {
    return null;
  }

  const matchScore =
    typeof evidence.confidence === "number" &&
    !isNaN(evidence.confidence) &&
    evidence.confidence >= 0 &&
    evidence.confidence <= 1
      ? Math.round(evidence.confidence * 100)
      : null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100/80">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded transition-colors group cursor-pointer"
      >
        <span
          className="text-[10px] font-bold transition-transform duration-200"
          aria-hidden="true"
        >
          {isOpen ? "▼" : "▶"}
        </span>
        <span>View source evidence</span>
      </button>

      {isOpen && (
        <div
          id={contentId}
          className="mt-2.5 p-3.5 bg-slate-100/90 border border-slate-200/80 rounded-xl space-y-2 text-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Source Evidence
            </span>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {evidence.section && (
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium text-slate-700">
                  {evidence.section}
                </span>
              )}
              {evidence.page !== null && evidence.page !== undefined && (
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium text-slate-700">
                  Page {evidence.page}
                </span>
              )}
              {matchScore !== null && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                  Evidence match · {matchScore}%
                </span>
              )}
            </div>
          </div>

          <blockquote className="relative p-2.5 bg-white border-l-4 border-blue-500 rounded-r-lg text-slate-800 font-mono text-[11px] leading-relaxed shadow-2xs whitespace-pre-wrap">
            {evidence.original_text}
          </blockquote>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"file" | "text">("text");
  const [noticeText, setNoticeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<Extraction | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleAnalyze = async () => {
    const trimmedText = noticeText.trim();
    if (!trimmedText) {
      setErrorMessage("Please enter or paste notice text to analyze.");
      return;
    }

    if (noticeText.length > MAX_CHAR_LIMIT) {
      setErrorMessage(
        `Notice text exceeds the maximum allowed limit of ${MAX_CHAR_LIMIT.toLocaleString()} characters.`
      );
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);
    setExtractionResult(null);

    try {
      let response: Response;
      try {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: noticeText }),
          signal: controller.signal,
        });
      } catch (fetchErr: unknown) {
        if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
          return;
        }
        throw new Error(
          "Unable to connect to the analysis service. Please check that the server is running and try again."
        );
      }

      const rawText = await response.text();
      let parsedData: unknown;

      try {
        parsedData = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error(
          `Server returned an invalid response (HTTP ${response.status}). Please try again later.`
        );
      }

      if (!isObject(parsedData)) {
        throw new Error("Invalid response format received from the server.");
      }

      const responsePayload = parsedData as unknown as AnalyzeApiResponse;

      if (!response.ok || !responsePayload.success) {
        const serverError =
          "error" in responsePayload && typeof responsePayload.error === "string"
            ? responsePayload.error
            : "Failed to analyze the notice.";
        throw new Error(serverError);
      }

      if (!responsePayload.data || typeof responsePayload.data !== "object") {
        throw new Error("The server succeeded but returned incomplete extraction data.");
      }

      if (abortControllerRef.current === controller) {
        setExtractionResult(responsePayload.data);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      if (abortControllerRef.current === controller) {
        setErrorMessage(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const getPriorityBadgeClass = (priority: string = "") => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatApplicabilityStatus = (status: string = "") => {
    switch (status) {
      case "explicit":
        return "Explicit";
      case "conditional":
        return "Conditional";
      case "unclear":
        return "Unclear";
      case "not_specified":
        return "Not Specified";
      default:
        return status || "Not Specified";
    }
  };

  const isOverLimit = noticeText.length > MAX_CHAR_LIMIT;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-baseline space-x-3">
            <a
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-slate-700 transition-colors"
              aria-label="Notice2Action Home"
            >
              Notice<span className="text-blue-600">2</span>Action
            </a>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400 border-l border-slate-300 pl-3">
              Understand it. Act on it.
            </span>
          </div>

          <nav aria-label="Main Navigation">
            <ul className="flex items-center space-x-6 text-sm font-medium text-slate-600">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#trust"
                  className="hover:text-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 rounded"
                >
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO */}
        <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            Clarity for official notices
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
            Turn confusing notices into clear actions.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload or paste a college, government, workplace, or official notice. Notice2Action extracts what it means, who it affects, what you need to do, and when you need to do it.
          </p>
        </section>

        {/* 3. INPUT CARD */}
        <section id="upload-section" className="pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="flex border-b border-slate-200 mb-6" role="tablist" aria-label="Input Method">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "text"}
                aria-controls="panel-text"
                id="tab-text"
                onClick={() => setActiveTab("text")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors mr-6 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-4 cursor-pointer ${
                  activeTab === "text"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Paste notice text
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "file"}
                aria-controls="panel-file"
                id="tab-file"
                onClick={() => setActiveTab("file")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-4 cursor-pointer ${
                  activeTab === "file"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Upload File (Coming Soon)
              </button>
            </div>

            {activeTab === "text" ? (
              <div id="panel-text" role="tabpanel" aria-labelledby="tab-text" className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="notice-raw-text" className="block text-sm font-medium text-slate-700">
                    Notice Content
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      isOverLimit ? "text-rose-600 font-bold" : "text-slate-400"
                    }`}
                  >
                    {noticeText.length.toLocaleString()} / {MAX_CHAR_LIMIT.toLocaleString()}
                  </span>
                </div>
                <textarea
                  id="notice-raw-text"
                  rows={9}
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder="Paste the raw text of the circular, exam schedule, policy change, or official notice here..."
                  className={`w-full p-4 text-sm text-slate-900 bg-slate-50 border rounded-xl focus:bg-white focus:ring-1 focus:outline-none transition-all resize-y font-mono ${
                    isOverLimit
                      ? "border-rose-400 focus:border-rose-600 focus:ring-rose-600"
                      : "border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                  }`}
                  disabled={isLoading}
                />

                {errorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                    <span className="font-semibold">Error: </span>
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <span className="text-xs text-slate-400">
                    Maximum text length: 50,000 characters
                  </span>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isLoading || !noticeText.trim() || isOverLimit}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-all cursor-pointer"
                  >
                    {isLoading ? "Analyzing Notice..." : "Process Text"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                id="panel-file"
                role="tabpanel"
                aria-labelledby="tab-file"
                className="border border-slate-200 bg-slate-50/70 rounded-xl p-8 text-center flex flex-col items-center justify-center select-none"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-500 rounded-md">PDF</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-500 rounded-md">Image</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  File upload is currently in development
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Direct document and image parsing will be available in an upcoming release. Please use the &quot;Paste notice text&quot; tab to analyze notices.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. RESULTS DASHBOARD */}
        {extractionResult && (
          <section id="results-dashboard" className="pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
            {/* Header / Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {extractionResult.metadata?.document_type || "Notice"}
                </span>
                {extractionResult.metadata?.language && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600">
                    {extractionResult.metadata.language.toUpperCase()}
                  </span>
                )}
                {extractionResult.metadata?.issue_date && (
                  <span className="text-xs text-slate-500 ml-auto">
                    Issued: {extractionResult.metadata.issue_date}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">
                {extractionResult.metadata?.title || "Untitled Notice"}
              </h2>

              {extractionResult.metadata?.issuing_organization && (
                <p className="text-sm font-medium text-slate-600 mt-1">
                  {extractionResult.metadata.issuing_organization}
                </p>
              )}

              <div className="mt-6 p-4 sm:p-5 bg-blue-50/60 border border-blue-100 rounded-xl">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                  Summary
                </span>
                <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                  {extractionResult.summary?.one_line || "No summary provided."}
                </p>
              </div>

              {(extractionResult.summary?.key_points ?? []).length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Key Highlights</h3>
                  <ul className="space-y-1.5 list-disc list-inside text-sm text-slate-700">
                    {(extractionResult.summary?.key_points ?? []).map((pt, idx) => (
                      <li key={idx} className="leading-normal">{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Applicability Card */}
            {extractionResult.applicability && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Who This Affects</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    extractionResult.applicability.status === "explicit"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}>
                    {formatApplicabilityStatus(extractionResult.applicability.status)}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-900 mb-4">
                  {extractionResult.applicability.audience || "Audience unspecified."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(extractionResult.applicability.conditions ?? []).length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Conditions / Prerequisites
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {extractionResult.applicability.conditions.map((cond, idx) => (
                          <li key={idx}>{cond}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(extractionResult.applicability.exclusions ?? []).length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Exclusions
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {extractionResult.applicability.exclusions.map((exc, idx) => (
                          <li key={idx}>{exc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <EvidenceDisclosure evidence={extractionResult.applicability.evidence} />
              </div>
            )}

            {/* Actions Section */}
            {(extractionResult.actions ?? []).length > 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-950">Required Actions</h3>
                  <p className="text-sm text-slate-500">Tasks and deadlines extracted from the notice.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractionResult.actions.map((act, index) => (
                    <div
                      key={act.id || `act-${index}`}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded border ${getPriorityBadgeClass(act.priority)}`}>
                            {act.priority || "Low"} Priority
                          </span>
                          {act.deadline && (
                            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                              Due: {act.deadline}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-2">
                          {act.title}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        {act.completion_method && (
                          <div>
                            <span className="font-semibold text-slate-700">How to complete: </span>
                            <span className="text-slate-600">{act.completion_method}</span>
                          </div>
                        )}
                        {(act.prerequisites ?? []).length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-700">Prerequisites: </span>
                            <span className="text-slate-600">{act.prerequisites.join(", ")}</span>
                          </div>
                        )}

                        <EvidenceDisclosure evidence={act.evidence} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings Section (if present) */}
            {(extractionResult.warnings ?? []).length > 0 && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-rose-950 mb-1">
                  Important Warnings & Penalties
                </h3>
                <p className="text-xs text-rose-700 mb-4">Consequences or risks outlined in the document.</p>
                <div className="space-y-3">
                  {extractionResult.warnings.map((w, idx) => (
                    <div key={idx} className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${getPriorityBadgeClass(w.severity)}`}>
                          {w.severity || "Low"} Severity
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-2">{w.warning}</p>
                      {w.consequence && (
                        <p className="text-xs text-rose-700 mt-1">
                          <span className="font-bold">Consequence:</span> {w.consequence}
                        </p>
                      )}

                      <EvidenceDisclosure evidence={w.evidence} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Requirements Card */}
              {extractionResult.requirements && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements Checklist</h3>
                  <div className="space-y-4 text-xs">
                    {(extractionResult.requirements.documents ?? []).length > 0 && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Required Documents</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {extractionResult.requirements.documents.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(extractionResult.requirements.payments ?? []).length > 0 && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Fees & Payments</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {extractionResult.requirements.payments.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(extractionResult.requirements.information ?? []).length > 0 && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Required Information</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {extractionResult.requirements.information.map((info, i) => (
                            <li key={i}>{info}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(extractionResult.requirements.prerequisites ?? []).length > 0 && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Prerequisites</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {extractionResult.requirements.prerequisites.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(extractionResult.requirements.other ?? []).length > 0 && (
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Other Criteria</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {extractionResult.requirements.other.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Key Dates & Timeline</h3>
                {(extractionResult.timeline ?? []).length > 0 ? (
                  <div className="space-y-4">
                    {extractionResult.timeline.map((evt, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{evt.event}</span>
                            <span className="text-slate-500 capitalize">{evt.type}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-semibold text-slate-800 block">
                              {evt.date || "Date Unspecified"}
                            </span>
                            {evt.time && <span className="text-slate-500">{evt.time}</span>}
                          </div>
                        </div>

                        <EvidenceDisclosure evidence={evt.evidence} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No specific timeline events mentioned in notice.</p>
                )}
              </div>
            </div>

            {/* Procedure Section (if available) */}
            {extractionResult.procedure?.available && (extractionResult.procedure.steps ?? []).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Step-by-Step Procedure</h3>
                <div className="space-y-3">
                  {extractionResult.procedure.steps.map((st, idx) => (
                    <div key={st.number || idx + 1} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex gap-4 items-start">
                        <span className="font-black text-blue-600 text-sm bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                          {st.number || idx + 1}
                        </span>
                        <p className="text-sm text-slate-800 leading-relaxed">{st.instruction}</p>
                      </div>

                      <EvidenceDisclosure evidence={st.evidence} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Section (if present) */}
            {(extractionResult.contacts ?? []).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {extractionResult.contacts.map((c, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      {c.department && <p className="font-bold text-slate-900">{c.department}</p>}
                      {c.person && <p className="font-medium text-slate-700">{c.person}</p>}
                      {c.phone && <p className="text-slate-600">Phone: {c.phone}</p>}
                      {c.email && <p className="text-slate-600">Email: {c.email}</p>}
                      {c.website && <p className="text-blue-600 truncate">Website: {c.website}</p>}
                      {c.purpose && <p className="text-slate-500 italic pt-1">{c.purpose}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 mt-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workflow</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
              How It Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              From complex bureaucratic language to an actionable roadmap in three structured steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <span className="text-3xl font-black text-slate-300 block mb-4">01</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upload or Paste</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Give us the notice text or upload a document.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <span className="text-3xl font-black text-slate-300 block mb-4">02</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Understand</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                AI extracts explicit deadlines, required actions, and requirements.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <span className="text-3xl font-black text-slate-300 block mb-4">03</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Act</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Follow a step-by-step extracted action plan.
              </p>
            </div>
          </div>
        </section>

        {/* 6. TRUST / SAFETY SECTION */}
        <section id="trust" className="py-16 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Reliability First</span>
              <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
                Built for Accuracy and Trust
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Official documents require grounded facts, not AI guesswork.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-slate-800 bg-slate-800/40 rounded-xl p-5">
                <div className="w-2 h-2 rounded-full bg-blue-500 mb-3" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white mb-2">Fact Separation</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Separates extracted facts from interpretation to maintain complete clarity.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-800/40 rounded-xl p-5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mb-3" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white mb-2">Evidence Grounded</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Shows exact source evidence and section references when possible.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-800/40 rounded-xl p-5">
                <div className="w-2 h-2 rounded-full bg-amber-500 mb-3" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white mb-2">Strict Fact Extraction</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Does not invent missing information—explicitly marks unknowns as unspecified.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-800/40 rounded-xl p-5">
                <div className="w-2 h-2 rounded-full bg-rose-500 mb-3" aria-hidden="true" />
                <h3 className="text-base font-semibold text-white mb-2">Risk Detection</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Highlights critical deadlines, strict requirements, and potential penalties.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-base font-bold text-slate-900">
              Notice<span className="text-blue-600">2</span>Action
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Making official information easier to act on.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            &copy; 2026 Notice2Action. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}