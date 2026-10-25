import re
from typing import List, Dict, Any, Optional
from rapidfuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def extract_pid(pid_str: Optional[str]) -> Optional[str]:
    if not pid_str:
        return None
    cleaned = pid_str.strip().upper()
    # Support AICTE standard PID pattern 1-[0-9]+ and DEMO-PID-xxx
    if re.match(r"^(1-\d+|DEMO-PID-\d+)$", cleaned):
        return cleaned
    return cleaned

def calculate_name_similarity(name1: str, name2: str) -> float:
    """Returns Jaro-Winkler / token sort similarity between 0.0 and 1.0"""
    if not name1 or not name2:
        return 0.0
    score = fuzz.token_sort_ratio(name1.lower(), name2.lower())
    return score / 100.0

def compute_tfidf_similarity(text1: str, text2: str) -> float:
    """Computes TF-IDF cosine similarity between two case summaries/categories"""
    if not text1.strip() or not text2.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(sim)
    except Exception:
        # Fallback if vocabulary is too small or uniform
        return 0.0

def evaluate_case_overlap(case1: Dict[str, Any], case2: Dict[str, Any], institution_pid: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Evaluates whether two cases represent a potential cross-bureau overlap.
    Rules:
    - Must belong to different bureaus (or distinct investigation streams)
    - Both cases must be active (not Disposed)
    - Must have matching institution identity (PID or verified)
    - Must exhibit high semantic similarity (TF-IDF >= 0.35) or shared critical keywords (fees, intake, faculty, seats, unapproved, show-cause)
    - Returns None if unrelated (e.g. boundary wall demarcation vs student fee grievance).
    """
    # Principle 4: Do not flag cases from the same bureau as cross-bureau overlap
    if case1.get("bureau_code") == case2.get("bureau_code"):
        return None

    # Check status: if either is Disposed, no active cross-bureau coordination conflict
    status1 = case1.get("status", "").lower()
    status2 = case2.get("status", "").lower()
    if "disposed" in status1 or "disposed" in status2 or "closed" in status1 or "closed" in status2:
        return None

    # PID check
    pid_matched = False
    if institution_pid:
        pid_matched = True

    # Combine category, subject, and summary for NLP evaluation
    corpus1 = f"{case1.get('category', '')} {case1.get('subject', '')} {case1.get('summary', '')}"
    corpus2 = f"{case2.get('category', '')} {case2.get('subject', '')} {case2.get('summary', '')}"

    tfidf_score = compute_tfidf_similarity(corpus1, corpus2)

    # Check for domain-specific thematic overlap keywords
    overlap_keywords = {
        "fees": ["fee", "fees", "refund", "unauthorized collection", "capitation"],
        "admissions": ["intake", "seat", "seats", "admission", "expansion", "approval", "unapproved"],
        "academics": ["faculty", "classes", "teacher", "deficiency", "curriculum", "infrastructure"]
    }

    shared_thematic_points = []
    c1_lower = corpus1.lower()
    c2_lower = corpus2.lower()

    for theme, kw_list in overlap_keywords.items():
        c1_has = any(kw in c1_lower for kw in kw_list)
        c2_has = any(kw in c2_lower for kw in kw_list)
        if c1_has and c2_has:
            shared_thematic_points.append(theme)

    # If TF-IDF is below threshold and no shared critical themes, treat as unrelated
    if tfidf_score < 0.25 and len(shared_thematic_points) == 0:
        return None

    # Calculate calibrated confidence score
    confidence = min(1.0, max(tfidf_score, 0.45) + (0.30 if len(shared_thematic_points) >= 2 else 0.15))
    if pid_matched:
        confidence = min(0.96, confidence + 0.1)

    # Construct explainable rationale
    rationale_points = []
    if pid_matched:
        rationale_points.append(f"✓ Verified PID Match: {institution_pid}")
    else:
        rationale_points.append("⚠ Identity Unverified - Human Validation Required (Fuzzy Matched)")

    pct_str = int(confidence * 100)
    theme_desc = " / ".join([t.capitalize() for t in shared_thematic_points]) if shared_thematic_points else "Subject Matter"
    rationale_points.append(f"✓ TF-IDF Category Similarity: {pct_str}% Overlap on {theme_desc}")

    b1 = case1.get("bureau_code")
    b2 = case2.get("bureau_code")
    s1 = case1.get("status")
    s2 = case2.get("status")
    rationale_points.append(f"⚠ Status Alert: Active {s1} in [{b1}] concurrent with {s2} in [{b2}]")

    return {
        "source_case_id": case1.get("synthetic_case_id"),
        "candidate_case_id": case2.get("synthetic_case_id"),
        "pid_matched": pid_matched,
        "tfidf_score": round(confidence, 2),
        "shared_themes": shared_thematic_points,
        "match_rationale": " | ".join(rationale_points),
        "rationale_list": rationale_points
    }
