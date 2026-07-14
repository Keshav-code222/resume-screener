import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')

def analyze_resume(resume_text, job_description):
    """Analyze resume using Groq API"""
    
    if not GROQ_API_KEY:
        print("❌ ERROR: GROQ_API_KEY not set!")
        return default_analysis(resume_text, job_description)
    
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        
        prompt = f"""You are an expert technical recruiter and resume screener.
Analyze this resume against the job description and provide a highly accurate assessment.
Calculate a realistic overall match score from 0 to 100 based on how well the candidate's skills and experience align with the job requirements.

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:2000]}

Return ONLY a valid JSON object matching this exact structure (do not include the schema keys, use actual calculated values instead):
{{
  "overall_score": <calculate an integer between 0 and 100>,
  "missing_keywords": ["List", "of", "missing", "skills"],
  "top_suggestions": ["Specific actionable advice 1", "Specific actionable advice 2", "Specific actionable advice 3"],
  "verdict": "A brief 1-line summary assessment."
}}"""
        
        print("📡 Calling Groq API...")
        message = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800
        )
        
        response_text = message.choices[0].message.content
        print(f"✅ Response: {response_text[:50]}...")
        
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        return default_analysis(resume_text, job_description)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return default_analysis(resume_text, job_description)

def default_analysis(resume_text, job_description):
    return {
        "overall_score": 50,
        "missing_keywords": [],
        "top_suggestions": ["Check your Groq API key"],
        "verdict": "Using default analysis"
    }