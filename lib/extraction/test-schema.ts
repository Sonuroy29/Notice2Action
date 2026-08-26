import { ExtractionSchema } from "@/types/extraction";

// Base valid extraction object representing an Indian university examination notice
const validExtractionData = {
  metadata: {
    title: "Odd Semester End-Term Examination (ETE) Form Submission 2026-27",
    document_type: "Official Circular",
    issuing_organization: "Office of the Controller of Examinations, Rajasthan Technical University",
    issue_date: "2026-08-20",
    language: "en",
  },
  summary: {
    one_line: "Mandatory submission of examination forms and semester fee clearance for all B.Tech/M.Tech regular students.",
    key_points: [
      "ERP portal open for online form filling from 25th August 2026.",
      "Examination fee of ₹2,500 must be deposited online before the due date.",
      "75% minimum attendance required for admit card (hall ticket) generation.",
    ],
  },
  applicability: {
    audience: "All regular undergraduate and postgraduate students enrolled in odd semesters",
    conditions: [
      "Minimum 75% aggregate attendance up to the current academic term",
      "No pending semester tuition dues with the accounts department",
    ],
    exclusions: ["Students debarred due to disciplinary proceedings"],
    status: "explicit" as const,
    evidence: {
      page: 1,
      section: "Eligibility Criteria",
      original_text: "All regular students of B.Tech and M.Tech having at least 75% attendance are required to fill the exam form.",
      confidence: 0.96,
    },
  },
  actions: [
    {
      id: "act-001",
      title: "Fill and Submit University Exam Form",
      description: "Log in to the student ERP portal, verify elective subject codes, and complete online payment.",
      priority: "critical" as const,
      deadline: "2026-09-10T23:59:59+05:30",
      prerequisites: ["Obtain No-Dues clearance from Central Library"],
      completion_method: "University ERP Portal (erp.rtu.ac.in)",
      evidence: {
        page: 1,
        section: "Submission Process",
        original_text: "Forms must be submitted through the student ERP portal by 10th September 2026.",
        confidence: 0.98,
      },
    },
  ],
  requirements: {
    documents: ["College Identity Card Copy", "Latest Semester Fee Receipt"],
    information: ["University Roll Number / Enrollment Number", "Subject Course Codes"],
    payments: ["Examination Fee: ₹2,500", "Late Fee Penalty: ₹500 (if submitted after deadline)"],
    prerequisites: ["Attendance verification from Head of Department (HOD)"],
    other: ["Valid mobile number and email ID linked with Aadhaar/DigiLocker"],
  },
  timeline: [
    {
      event: "ERP Portal Registration Commences",
      date: "2026-08-25",
      time: "10:00:00",
      type: "Commencement",
      importance: "medium" as const,
      evidence: {
        page: 2,
        section: "Important Dates",
        original_text: "Online registration portal opens on 25-08-2026 at 10:00 AM.",
        confidence: 0.94,
      },
    },
    {
      event: "Last Date for Form Submission without Late Fee",
      date: "2026-09-10",
      time: "23:59:59",
      type: "Deadline",
      importance: "critical" as const,
      evidence: {
        page: 2,
        section: "Important Dates",
        original_text: "Last date for submission without late fine is 10-09-2026 up to 11:59 PM.",
        confidence: 0.99,
      },
    },
  ],
  procedure: {
    available: true,
    steps: [
      {
        number: 1,
        instruction: "Visit the university ERP portal at erp.rtu.ac.in and log in using Enrollment Number and Date of Birth.",
        evidence: {
          page: 2,
          section: "Steps for Online Application",
          original_text: "Log in to erp.rtu.ac.in using your university enrollment number.",
          confidence: 0.91,
        },
      },
      {
        number: 2,
        instruction: "Click on 'Exam Form 2026-27' and select the assigned theory and practical subjects.",
        evidence: null,
      },
      {
        number: 3,
        instruction: "Pay the required examination fee of ₹2,500 via SBI Collect / Net Banking / UPI.",
        evidence: null,
      },
      {
        number: 4,
        instruction: "Download and print two copies of the generated acknowledgement slip for departmental submission.",
        evidence: null,
      },
    ],
    missing_information: [],
  },
  warnings: [
    {
      warning: "Strict deadline compliance required; server closes automatically after cutoff.",
      consequence: "Admit card will not be issued, resulting in year loss or supplementary status.",
      severity: "critical" as const,
      evidence: {
        page: 3,
        section: "General Instructions",
        original_text: "No offline forms or late representations will be entertained under any circumstances.",
        confidence: 0.97,
      },
    },
  ],
  contacts: [
    {
      department: "Examination Section & Student Helpline Cell",
      person: "Prof. R. K. Sharma (Assistant Controller)",
      phone: "+91-141-2713300",
      email: "controller-exams@rtu.ac.in",
      website: "https://www.rtu.ac.in",
      purpose: "Queries regarding subject selection, fee payment failures, and admit card errors",
    },
  ],
};

function runTests() {
  console.log("Starting Notice2Action Schema Validation Tests...\n");

  // ==========================================
  // TEST 1 — VALID DATA
  // ==========================================
  const test1Result = ExtractionSchema.safeParse(validExtractionData);
  if (test1Result.success) {
    console.log("TEST 1 PASSED");
  } else {
    console.error("TEST 1 FAILED:", test1Result.error.format());
  }

  // ==========================================
  // TEST 2 — INVALID CONFIDENCE (1.5)
  // ==========================================
  const invalidConfidenceData = {
    ...validExtractionData,
    applicability: {
      ...validExtractionData.applicability,
      evidence: {
        ...validExtractionData.applicability.evidence!,
        confidence: 1.5,
      },
    },
  };

  const test2Result = ExtractionSchema.safeParse(invalidConfidenceData);
  if (!test2Result.success) {
    console.log("TEST 2 PASSED");
  } else {
    console.error("TEST 2 FAILED: Expected schema to reject confidence 1.5, but validation passed.");
  }

  // ==========================================
  // TEST 3 — INVALID ACTION PRIORITY ("urgent")
  // ==========================================
  const invalidPriorityData = {
    ...validExtractionData,
    actions: [
      {
        ...validExtractionData.actions[0],
        priority: "urgent",
      },
    ],
  };

  const test3Result = ExtractionSchema.safeParse(invalidPriorityData);
  if (!test3Result.success) {
    console.log("TEST 3 PASSED");
  } else {
    console.error("TEST 3 FAILED: Expected schema to reject action priority 'urgent', but validation passed.");
  }

  // ==========================================
  // TEST 4 — NULL INFORMATION (Legitimate missing fields)
  // ==========================================
  const nullInformationData = {
    ...validExtractionData,
    metadata: {
      ...validExtractionData.metadata,
      issuing_organization: null,
      issue_date: null,
    },
    applicability: {
      ...validExtractionData.applicability,
      evidence: null,
    },
    actions: [
      {
        ...validExtractionData.actions[0],
        deadline: null,
        completion_method: null,
        evidence: null,
      },
    ],
    timeline: [
      {
        ...validExtractionData.timeline[0],
        date: null,
        time: null,
        evidence: null,
      },
    ],
    procedure: {
      ...validExtractionData.procedure,
      steps: [
        {
          number: 1,
          instruction: "Follow oral instructions from the departmental exam coordinator.",
          evidence: null,
        },
      ],
    },
    warnings: [
      {
        warning: "Keep student copy of receipt safe.",
        consequence: null,
        severity: "low" as const,
        evidence: null,
      },
    ],
    contacts: [
      {
        department: null,
        person: null,
        phone: null,
        email: null,
        website: null,
        purpose: null,
      },
    ],
  };

  const test4Result = ExtractionSchema.safeParse(nullInformationData);
  if (test4Result.success) {
    console.log("TEST 4 PASSED");
  } else {
    console.error("TEST 4 FAILED:", test4Result.error.format());
  }

  // ==========================================
  // TEST 5 — INVALID APPLICABILITY STATUS ("probably")
  // ==========================================
  const invalidApplicabilityData = {
    ...validExtractionData,
    applicability: {
      ...validExtractionData.applicability,
      status: "probably",
    },
  };

  const test5Result = ExtractionSchema.safeParse(invalidApplicabilityData);
  if (!test5Result.success) {
    console.log("TEST 5 PASSED");
  } else {
    console.error("TEST 5 FAILED: Expected schema to reject applicability status 'probably', but validation passed.");
  }

  // ==========================================
  // TEST 6 — INVALID WARNING SEVERITY ("urgent")
  // ==========================================
  const invalidSeverityData = {
    ...validExtractionData,
    warnings: [
      {
        ...validExtractionData.warnings[0],
        severity: "urgent",
      },
    ],
  };

  const test6Result = ExtractionSchema.safeParse(invalidSeverityData);
  if (!test6Result.success) {
    console.log("TEST 6 PASSED");
  } else {
    console.error("TEST 6 FAILED: Expected schema to reject warning severity 'urgent', but validation passed.");
  }

  console.log("\nAll schema test runs completed.");
}

runTests();