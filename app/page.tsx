"use client";

import React, { useState } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-baseline space-x-3">
            <a
              href="#"
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
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            Clarity for official notices
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
            Turn confusing notices into clear actions.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload a college, government, workplace, or official notice. Notice2Action explains what it means, who it affects, what you need to do, and when you need to do it.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#upload-section"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-all active:scale-[0.99]"
            >
              Analyze a Notice
            </a>
          </div>
        </section>

        {/* 3. UPLOAD CARD */}
        <section id="upload-section" className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="flex border-b border-slate-200 mb-6" role="tablist" aria-label="Input Method">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "file"}
                aria-controls="panel-file"
                id="tab-file"
                onClick={() => setActiveTab("file")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors mr-6 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-4 ${
                  activeTab === "file"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "text"}
                aria-controls="panel-text"
                id="tab-text"
                onClick={() => setActiveTab("text")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-4 ${
                  activeTab === "text"
                    ? "border-blue-600 text-blue-600"
                    : "border-slate-300 text-slate-500 hover:text-slate-800"
                }`}
              >
                Paste notice text instead
              </button>
            </div>

            {activeTab === "file" ? (
              <div
                id="panel-file"
                role="tabpanel"
                aria-labelledby="tab-file"
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 transition-all rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md">PDF</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md">Image</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md">Text</span>
                </div>

                <p className="text-base font-semibold text-slate-900">
                  Drop your notice here
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or choose a file
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-medium rounded-lg shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-colors"
                  >
                    Select Document
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-5">
                  Maximum file size: 10 MB
                </p>
              </div>
            ) : (
              <div id="panel-text" role="tabpanel" aria-labelledby="tab-text" className="space-y-4">
                <label htmlFor="notice-raw-text" className="block text-sm font-medium text-slate-700">
                  Notice Content
                </label>
                <textarea
                  id="notice-raw-text"
                  rows={8}
                  placeholder="Paste the raw text of the circular, exam schedule, policy change, or official notice here..."
                  className="w-full p-4 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all resize-y font-mono"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-colors"
                  >
                    Process Text
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
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
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upload</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Give us the notice.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <span className="text-3xl font-black text-slate-300 block mb-4">02</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Understand</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                AI extracts the important information.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <span className="text-3xl font-black text-slate-300 block mb-4">03</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Act</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Get a clear, step-by-step action plan.
              </p>
            </div>
          </div>
        </section>

        {/* 5. TRUST / SAFETY SECTION */}
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
                <h3 className="text-base font-semibold text-white mb-2">Zero Hallucination</h3>
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

      {/* 6. FOOTER */}
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
            &copy; {new Date().getFullYear()} Notice2Action. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}