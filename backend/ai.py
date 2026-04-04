import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def analyze_resume(resume_text: str, job_description: str):
    prompt = f"""
You are an expert Indian placement consultant who has reviewed thousands 
of resumes for companies like TCS, Infosys, Google India, Zomato, and startups.

Analyze this resume against the job description and respond ONLY in valid 
JSON with exactly this structure, no extra text:
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
  "top_suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ],
  "verdict": "Overall assessment in 2-3 sentences"
}}

JOB DESCRIPTION:
{job_description}

RESUME TEXT:
{resume_text}
"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    import json
    response_text = message.content[0].text
    return json.loads(response_text)