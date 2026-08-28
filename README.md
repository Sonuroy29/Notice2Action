# Notice2Action

> **Turn complicated notices into clear, actionable steps.**

Notice2Action is an AI-powered document intelligence platform that transforms official notices, circulars, and announcements into structured, easy-to-understand actions.

Instead of forcing users to read long and confusing notices, Notice2Action answers the questions that actually matter:

**Who does this affect? What do I need to do? When do I need to do it? What do I need? Where is the evidence?**

---

## 🚨 The Problem

Important information is often buried inside lengthy official notices.

College notices, government circulars, workplace announcements, and other official documents can contain:

* Important deadlines
* Eligibility conditions
* Required documents
* Application procedures
* Fees and payments
* Warnings and consequences
* Contact information

The problem isn't necessarily that the information is unavailable.

**The problem is that finding and understanding the information takes time.**

A user may read an entire notice and still be unsure:

> "Does this apply to me?"

> "What exactly do I have to do?"

> "What's the deadline?"

> "What documents do I need?"

---

## 💡 The Solution

Notice2Action uses AI to analyze a notice and convert it into a structured action-oriented summary.

### Instead of:

> "Students who satisfy the aforementioned eligibility criteria are hereby instructed to submit the requisite documentation..."

### Notice2Action produces:

**Action:** Submit the required documents
**Priority:** High
**Deadline:** 2026-09-15
**Requirements:** ID proof, application form
**Evidence:** Exact text from the original notice

The goal is simple:

> **Don't just summarize the notice. Tell the user what the notice means for them.**

---

## ✨ Core Features

### 📄 Multi-format Notice Analysis

Analyze notices through:

* 📝 Plain text
* 🖼️ Images
* 📑 PDF documents

---

### 🎯 Applicability Detection

Identify:

* Who the notice applies to
* Conditions that must be satisfied
* Exclusions
* Whether applicability is explicit, conditional, unclear, or unspecified

---

### ✅ Action Extraction

Convert instructions from the notice into actionable tasks.

Each action can contain:

* Action ID
* Title
* Description
* Priority
* Deadline
* Prerequisites
* Completion method
* Source evidence

---

### ⏰ Timeline Extraction

Extract important events and deadlines including:

* Dates
* Times
* Event descriptions
* Importance levels

---

### 📋 Requirements Extraction

Organize requirements into categories:

* Documents
* Information
* Payments
* Prerequisites
* Other requirements

---

### 🧭 Procedure Extraction

When a notice contains a multi-step procedure, Notice2Action attempts to convert it into an ordered sequence of steps.

If the procedure is incomplete or unavailable, the system identifies the missing information instead of inventing instructions.

---

### ⚠️ Warning & Consequence Detection

Important warnings are extracted along with:

* Severity
* Consequences
* Supporting evidence

---

### 📞 Contact Extraction

Extract explicitly mentioned:

* Departments
* Contact persons
* Phone numbers
* Email addresses
* Websites
* Contact purpose

---

## 🔎 Evidence-First AI

One of the core design principles of Notice2Action is:

> **AI should show where its conclusions came from.**

Whenever possible, extracted information is accompanied by evidence from the original notice.

Each evidence object contains:

```text
Page
Section
Original text
Confidence
```

The `original_text` field is required to be a **verbatim quote from the source document**.

This makes the system easier to verify and reduces the risk of users blindly trusting an AI-generated interpretation.

---

## 🛡️ AI Safety & Reliability

Notice2Action treats uploaded documents as **untrusted data**.

The extraction model is explicitly instructed not to follow commands or instructions contained inside uploaded documents.

The system also applies multiple validation layers:

```text
User Input
    ↓
Input Validation
    ↓
File / Text Processing
    ↓
Gemini AI
    ↓
Structured JSON
    ↓
Normalization
    ↓
Zod Validation
    ↓
Validated Extraction
    ↓
User Interface
```

### Reliability principles

Notice2Action instructs the AI to:

* Never invent information
* Never guess missing facts
* Never guess page numbers
* Preserve exact evidence quotes
* Return `null` when nullable information is unavailable
* Return empty arrays when lists are unavailable
* Validate structured output against a defined schema

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Frontend  │
                    └──────────┬──────────┘
                               │
                    Text / Image / PDF
                               │
                               ▼
                    ┌─────────────────────┐
                    │   /api/analyze      │
                    │   API Route         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Gemini AI         │
                    │ gemini-3.6-flash    │
                    └──────────┬──────────┘
                               │
                         Structured JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Normalization     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Zod Validation    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Validated Extraction│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Action-Oriented   │
                    │        UI           │
                    └─────────────────────┘
```

---

## 🧰 Tech Stack

| Technology            | Purpose                           |
| --------------------- | --------------------------------- |
| **Next.js**           | Full-stack React framework        |
| **TypeScript**        | Type-safe application development |
| **Tailwind CSS**      | UI styling                        |
| **Google Gemini API** | AI document analysis              |
| **@google/genai**     | Gemini API integration            |
| **Zod**               | Runtime schema validation         |
| **Supabase**          | Backend/database infrastructure   |
| **Turbopack**         | Development bundler               |

---

## 📁 Project Structure

```text
notice2action/
│
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   │
│   └── ...
│
├── components/
│   └── ...
│
├── types/
│   └── extraction.ts
│
├── public/
│
├── ARCHITECTURE.md
├── PRODUCT_SPEC.md
├── SECURITY.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/notice2action.git
cd notice2action
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key
```

If Supabase is configured in your version of the project, also add the required Supabase environment variables.

**Never commit `.env.local` to GitHub.**

Use `.env.example` as the template for required environment variables.

---

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔐 Security

Notice2Action follows several security practices:

* Gemini API keys remain server-side
* User-uploaded files are size-limited
* Supported file formats are explicitly validated
* AI output is validated using Zod
* Uploaded document content is treated as untrusted data
* Evidence is required to be verbatim
* Contact information is extracted only when explicitly present

See [`SECURITY.md`](./SECURITY.md) for more details.

---

## 📊 Extraction Schema

The AI output is validated against a structured extraction schema containing:

```text
metadata
summary
applicability
actions
requirements
timeline
procedure
warnings
contacts
```

This prevents the frontend from having to rely on unpredictable free-form AI responses.

---

## 🧪 Current Capabilities

| Capability               | Status |
| ------------------------ | ------ |
| Plain text analysis      | ✅      |
| Image analysis           | ✅      |
| PDF analysis             | ✅      |
| Structured Gemini output | ✅      |
| Zod validation           | ✅      |
| Evidence extraction      | ✅      |
| Applicability detection  | ✅      |
| Action extraction        | ✅      |
| Deadline extraction      | ✅      |
| Requirements extraction  | ✅      |
| Procedure extraction     | ✅      |
| Warning detection        | ✅      |
| Contact extraction       | ✅      |

---

## 🎯 Example Use Cases

### 🎓 College & University

A student receives a long examination or scholarship notice.

Notice2Action can identify:

* Eligibility
* Required documents
* Registration deadline
* Payment requirements
* Submission procedure

---

### 🏛️ Government Notices

Citizens can use Notice2Action to understand:

* Eligibility requirements
* Application deadlines
* Required documents
* Fees
* Submission procedures
* Official contacts

---

### 🏢 Workplace Notices

Employees can quickly identify:

* Required actions
* Deadlines
* Compliance requirements
* Required documents
* Consequences

---

## 🧠 Design Philosophy

Notice2Action is built around three principles:

### 1. Action over summarization

A traditional summarizer answers:

> "What is this document about?"

Notice2Action aims to answer:

> **"What do I need to do?"**

---

### 2. Evidence over blind trust

AI-generated information should be verifiable.

That's why important extracted information can be connected to the original source text.

---

### 3. Uncertainty over hallucination

If the notice doesn't provide enough information, Notice2Action should say so.

It is better to return:

```text
Not specified
```

than to confidently invent an answer.

---

## 🛣️ Roadmap

### Phase 1 — Evidence UI

* [x] Extract supporting evidence
* [x] Store page information where available
* [ ] Connect extracted actions directly to source evidence in the UI

### Phase 2 — Real-world Testing

* [ ] Test against diverse real-world notices
* [ ] Identify extraction failures
* [ ] Improve prompts and validation
* [ ] Test ambiguous deadlines and eligibility conditions

### Phase 3 — Document Support

* [x] Plain text
* [x] Images
* [x] PDF
* [ ] Improve complex PDF handling
* [ ] Improve scanned-document reliability

### Phase 4 — Action-focused UX

* [ ] Better action prioritization
* [ ] Deadline-focused interface
* [ ] Clear "What you need to do" dashboard
* [ ] Improved evidence interaction

### Phase 5 — Production Polish

* [ ] Authentication
* [ ] Persistent analysis history
* [ ] Performance optimization
* [ ] Accessibility improvements
* [ ] Deployment
* [ ] Production monitoring

---

## 🏆 Built For

**Prompt War — AI Project Competition**

Notice2Action was created to demonstrate how AI can transform complex official communication into information that is:

**Understandable → Verifiable → Actionable**

---

## ⚠️ Disclaimer

Notice2Action is an AI-assisted information extraction and interpretation tool.

It does not replace the original notice or official authority.

Users should verify important decisions, deadlines, eligibility requirements, and legal or financial information against the original source document.

---

## 👨‍💻 Development

This project is currently under active development.

Contributions, feedback, and suggestions are welcome.

---

## 📄 License

Add your preferred license before publishing the repository.

For example:

```text
MIT License
```

---

> **Notice2Action — From Notice to Action.**
