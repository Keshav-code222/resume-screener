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
        
        prompt = f"""Analyze this resume against the job description and provide JSON:
1. overall_score (0-100)
2. missing_keywords: List of missing skills
3. top_suggestions: 3 improvements
4. verdict: 1-line assessment

RESUME:
{resume_text[:1500]}

JOB DESCRIPTION:
{job_description[:1500]}

Return ONLY JSON:
{{
  "overall_score": 75,
  "missing_keywords": ["Python", "Docker"],
  "top_suggestions": ["Add skill", "Improve format", "Quantify results"],
  "verdict": "Good match"
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