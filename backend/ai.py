"""
AI resume analysis via Groq API.
Falls back to default (rule-based) analysis when the API key is missing
or the call fails.
"""
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def _log(msg: str) -> None:
    """Print a log line, safely encoding characters that may not be supported."""
    try:
        print(f"[ai] {msg}")
    except UnicodeEncodeError:
        safe = msg.encode("ascii", errors="replace").decode("ascii")
        print(f"[ai] {safe}")


def _normalize_analysis(data: dict) -> dict:
    """Normalize AI analysis response: fill missing keys and clamp score."""
    try:
        score = int(data.get("overall_score", 0))
        score = max(0, min(100, score))
    except (ValueError, TypeError):
        score = 0

    missing = data.get("missing_keywords")
    if not isinstance(missing, list):
        missing = []

    suggestions = data.get("top_suggestions")
    if not isinstance(suggestions, list):
        suggestions = []

    verdict = data.get("verdict")
    if not isinstance(verdict, str):
        verdict = "No assessment available."

    return {
        "overall_score": score,
        "missing_keywords": missing,
        "top_suggestions": suggestions,
        "verdict": verdict,
    }


def _smart_truncate(text: str, max_length: int) -> str:
    """Truncate text to max_length, attempting to cut at sentence or word boundaries."""
    if len(text) <= max_length:
        return text

    truncated = text[:max_length]

    # Try to find the last sentence boundary within the last 200 characters
    window_start = max(0, max_length - 200)
    # Find all positions of sentence endings (. ! ?) followed by whitespace or end of string
    endings = [m.start() + 1 for m in re.finditer(r'[.!?](\s|$)', truncated)]

    if endings:
        # The last ending found is the best sentence boundary
        return truncated[:endings[-1]].rstrip()

    # Fallback: Find the last whitespace
    last_space = truncated.rfind(' ')
    if last_space != -1:
        return truncated[:last_space].rstrip()

    # Hard limit fallback
    return truncated.rstrip()


def analyze_resume(resume_text: str, job_description: str) -> dict:

    """Analyze resume using Groq API. Returns a dict with overall_score,
    missing_keywords, top_suggestions, and verdict."""
    if not GROQ_API_KEY:
        _log("No GROQ_API_KEY set -- using default analysis")
        return default_analysis(resume_text, job_description)

    try:
        from groq import Groq

        client = Groq(api_key=GROQ_API_KEY)

        prompt = f"""You are an expert technical recruiter and resume screener.
Analyze this resume against the job description and provide a highly accurate assessment.
Calculate a realistic overall match score from 0 to 100 based on how well the candidate's skills and experience align with the job requirements.

RESUME:
{_smart_truncate(resume_text, 4000)}

JOB DESCRIPTION:
{_smart_truncate(job_description, 4000)}

Return ONLY a valid JSON object matching this exact structure (do not include the schema keys, use actual calculated values instead):
{{
  "overall_score": <calculate an integer between 0 and 100>,
  "missing_keywords": ["List", "of", "missing", "skills"],
  "top_suggestions": ["Specific actionable advice 1", "Specific actionable advice 2", "Specific actionable advice 3"],
  "verdict": "A brief 1-line summary assessment."
}}"""

        _log("Calling Groq API...")
        message = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            response_format={"type": "json_object"},
        )

        response_text = message.choices[0].message.content
        _log(f"Response received ({len(response_text)} chars)")

        try:
            parsed = json.loads(response_text)
            normalized = _normalize_analysis(parsed)
            _log(f"Score: {normalized['overall_score']}")
            return normalized
        except json.JSONDecodeError as e:
            _log(f"JSON decode error: {e}")
            _log("Using default analysis")
            return default_analysis(resume_text, job_description)

    except Exception as e:
        _log(f"Error: {e}")
        return default_analysis(resume_text, job_description)


def default_analysis(resume_text: str, job_description: str) -> dict:
    """Rule-based fallback when AI is unavailable."""
    _log("Using default analysis")

    # Simple keyword-match scoring
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    # Extract key terms from job description
    words = set(re.findall(r"[a-z]+", job_lower))
    stopwords = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
        "been", "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "shall", "can", "need",
        "must", "not", "no", "nor", "this", "that", "these", "those", "it",
        "its", "you", "your", "we", "our", "they", "them", "their", "what",
        "which", "who", "whom", "when", "where", "why", "how", "all", "each",
        "every", "both", "few", "more", "most", "other", "some", "such",
        "only", "own", "same", "so", "than", "too", "very", "just", "about",
        "above", "after", "again", "against", "below", "between", "during",
        "without", "through", "before", "between", "under", "over", "out",
        "off", "up", "down", "if", "then", "else", "also", "using",
        "looking", "experience", "work", "team", "skills", "including",
    }
    keywords = [w for w in words if len(w) > 2 and w not in stopwords]

    matched = [kw for kw in keywords if kw in resume_lower]
    score = int((len(matched) / max(len(keywords), 1)) * 70) + 15
    score = min(max(score, 5), 92)

    missing = [kw for kw in keywords if kw not in matched][:10]

    suggestions = [
        f"Add experience with '{kw}' to strengthen your match for this role."
        for kw in missing[:3]
    ] if missing else [
        "Your resume covers the key requirements. Consider adding quantifiable achievements.",
        "Tailor your summary to highlight the most relevant experience first.",
    ]

    return {
        "overall_score": score,
        "missing_keywords": missing,
        "top_suggestions": suggestions,
        "verdict": f"Resume matches {score}% of key job requirements."
                   f"{' Core gaps remain.' if score < 50 else ''}"
                   f"{' Strong alignment.' if score >= 70 else ''}",
    }
