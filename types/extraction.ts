import { z } from "zod";

// ==========================================
// 1. Evidence Schema
// ==========================================
export const EvidenceSchema = z.object({
  page: z.number().int().positive().nullable(),
  section: z.string().nullable(),
  original_text: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// ==========================================
// 2. Metadata Schema
// ==========================================
export const MetadataSchema = z.object({
  title: z.string(),
  document_type: z.string(),
  issuing_organization: z.string().nullable(),
  issue_date: z.string().nullable(),
  language: z.string(),
});

export type Metadata = z.infer<typeof MetadataSchema>;

// ==========================================
// 3. Summary Schema
// ==========================================
export const SummarySchema = z.object({
  one_line: z.string(),
  key_points: z.array(z.string()),
});

export type Summary = z.infer<typeof SummarySchema>;

// ==========================================
// 4. Applicability Schema
// ==========================================
export const ApplicabilitySchema = z.object({
  audience: z.string(),
  conditions: z.array(z.string()),
  exclusions: z.array(z.string()),
  status: z.enum(["explicit", "conditional", "unclear", "not_specified"]),
  evidence: EvidenceSchema.nullable(),
});

export type Applicability = z.infer<typeof ApplicabilitySchema>;

// ==========================================
// 5. Action Schema
// ==========================================
export const ActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  deadline: z.string().nullable(),
  prerequisites: z.array(z.string()),
  completion_method: z.string().nullable(),
  evidence: EvidenceSchema.nullable(),
});

export type Action = z.infer<typeof ActionSchema>;

// ==========================================
// 6. Requirements Schema
// ==========================================
export const RequirementsSchema = z.object({
  documents: z.array(z.string()),
  information: z.array(z.string()),
  payments: z.array(z.string()),
  prerequisites: z.array(z.string()),
  other: z.array(z.string()),
});

export type Requirements = z.infer<typeof RequirementsSchema>;

// ==========================================
// 7. TimelineEvent Schema
// ==========================================
export const TimelineEventSchema = z.object({
  event: z.string(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  type: z.string(),
  importance: z.enum(["critical", "high", "medium", "low"]),
  evidence: EvidenceSchema.nullable(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

// ==========================================
// 8. ProcedureStep Schema
// ==========================================
export const ProcedureStepSchema = z.object({
  number: z.number().int().positive(),
  instruction: z.string(),
  evidence: EvidenceSchema.nullable(),
});

export type ProcedureStep = z.infer<typeof ProcedureStepSchema>;

// ==========================================
// 9. Procedure Schema
// ==========================================
export const ProcedureSchema = z.object({
  available: z.boolean(),
  steps: z.array(ProcedureStepSchema),
  missing_information: z.array(z.string()),
});

export type Procedure = z.infer<typeof ProcedureSchema>;

// ==========================================
// 10. Warning Schema
// ==========================================
export const WarningSchema = z.object({
  warning: z.string(),
  consequence: z.string().nullable(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  evidence: EvidenceSchema.nullable(),
});

export type Warning = z.infer<typeof WarningSchema>;

// ==========================================
// 11. Contact Schema
// ==========================================
export const ContactSchema = z.object({
  department: z.string().nullable(),
  person: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  purpose: z.string().nullable(),
});

export type Contact = z.infer<typeof ContactSchema>;

// ==========================================
// 12. Complete Extraction Schema
// ==========================================
export const ExtractionSchema = z.object({
  metadata: MetadataSchema,
  summary: SummarySchema,
  applicability: ApplicabilitySchema,
  actions: z.array(ActionSchema),
  requirements: RequirementsSchema,
  timeline: z.array(TimelineEventSchema),
  procedure: ProcedureSchema,
  warnings: z.array(WarningSchema),
  contacts: z.array(ContactSchema),
});

export type Extraction = z.infer<typeof ExtractionSchema>;