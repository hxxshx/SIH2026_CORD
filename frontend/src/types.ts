export interface Institution {
  id: number;
  name: string;
  aicte_pid: string | null;
  verification_state: 'VERIFIED' | 'UNVERIFIED_PENDING_REVIEW' | 'UNVERIFIED_NAME_MATCH';
  region: string;
  state: string;
  district: string;
  institution_type: string;
  active_cases_count?: number;
  overlaps_count?: number;
}

export interface CaseItem {
  id: number;
  synthetic_case_id: string;
  institution_id: number;
  bureau_code: string;
  category: string;
  subject: string;
  summary: string;
  status: string;
  last_action: string;
  opened_date?: string;
  officer_assigned: string;
  complainant_type: string;
  severity: string;
  days_open: number;
}

export interface PotentialOverlap {
  id: number;
  institution_id: number;
  institution_name?: string;
  institution_pid?: string | null;
  verification_state?: string;
  source_case_id: string;
  candidate_case_id: string;
  pid_matched: boolean;
  tfidf_score: number;
  match_rationale: string;
  rationale_list?: string[];
  review_status: 'FLAGGED_PENDING_REVIEW' | 'CONFIRMED_RELATED' | 'MARKED_UNRELATED';
  flagged_date: string;
  source_case?: CaseItem;
  candidate_case?: CaseItem;
}

export interface CoDocketReceiptItem {
  receipt_id: string;
  review_note: string;
  reviewer: string;
  timestamp: string;
  hash_signature: string;
  coordination_action: string;
}

export interface CoDocketPack {
  id: number;
  pack_id: string;
  title: string;
  institution_id: number;
  institution_name?: string;
  institution_pid?: string;
  primary_case_id: string;
  related_case_ids: string[];
  status: string;
  lead_bureau: string;
  created_at: string;
  receipts_count?: number;
}

export interface DashboardStats {
  cards: {
    monitored_institutions: number;
    institutions_active_here: number;
    verified_pids_here: number;
    cross_bureau_overlaps_flagged: number;
    overlaps_pending_here: number;
    codocket_review_packs: number;
    codockets_here: number;
  };
  cases_by_bureau: { bureau: string; cases: number }[];
  cases_by_status: { status: string; count: number }[];
  ageing_distribution: { bracket: string; count: number }[];
  overlap_metrics: {
    total_flagged: number;
    confirmed_related: number;
    pending_review: number;
    marked_unrelated: number;
  };
}
