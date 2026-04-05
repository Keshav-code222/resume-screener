from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_resume(resume_text: str, job_description: str):
    prompt = f"""
You are an expert Indian placement consultant.
Analyze this resume against the job description and respond ONLY in valid 
JSON with exactly this structure, no extra text, no markdown:
{{
  "overall_score": 78,
  "sections": {{
    "keywords_match": {{ "score": 80, "feedback": "..." }},
    "experience_relevance": {{ "score": 75, "feedback": "..." }},
    "skills_alignment": {{ "score": 85, "feedback": "..." }},
    "formatting": {{ "score": 70, "feedback": "..." }},
    "education": {{ "score": 90, "feedback": "..." }}
  }},
  "missing_keywords": ["keyword1", "keyword2"],
  "top_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "Overall assessment in 2-3 sentences"
}}

JOB DESCRIPTION:
{job_description}

RESUME TEXT:
{resume_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())