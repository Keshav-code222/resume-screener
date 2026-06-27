import os
from dotenv import load_dotenv  # ADD THIS
from groq import Groq
import json
import re

# Load .env file FIRST
load_dotenv()  # ADD THIS

# Now read the key
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

if not GROQ_API_KEY:
    print("⚠️ WARNING: GROQ_API_KEY not set in .env file!")

client = Groq(api_key=GROQ_API_KEY)

def analyze_resume(resume_text, job_description):
    """
    Analyze resume against job description using Groq (FREE AI)
    """
    
    if not GROQ_API_KEY:
        print("❌ ERROR: GROQ_API_KEY is not set!")
        return default_analysis(resume_text, job_description)
    
    prompt = f"""Analyze this resume against the job description and provide a JSON response with:
1. overall_score (0-100): How well does this resume match the job?
2. missing_keywords: List of important skills/keywords from job description NOT in resume
3. top_suggestions: 3 actionable improvements for the resume
4. verdict: Brief 1-line assessment

RESUME:
{resume_text[:1500]}

JOB DESCRIPTION:
{job_description[:1500]}

Return ONLY valid JSON (no markdown, no extra text):
{{
  "overall_score": 75,
  "missing_keywords": ["Python", "Docker"],
  "top_suggestions": ["Add Docker experience", "Highlight team projects", "Quantify achievements"],
  "verdict": "Good match with minor skill gaps"
}}"""
    
    try:
        print("📡 Calling Groq API...")
        message = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.7
)
        
        response_text = message.choices[0].message.content
        print(f"✅ Groq Response: {response_text[:100]}...")
        
        # Extract JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            print(f"✅ Score: {result.get('overall_score')}")
            return result
        else:
            print("⚠️ No JSON found in response")
            return default_analysis(resume_text, job_description)
            
    except Exception as e:
        print(f"❌ Groq API Error: {str(e)}")
        return default_analysis(resume_text, job_description)

def default_analysis(resume_text, job_description):
    """Fallback analysis"""
    return {
        "overall_score": 50,
        "missing_keywords": ["Check job description for keywords"],
        "top_suggestions": [
            "Improve resume format",
            "Add more quantified achievements",
            "Highlight relevant experience"
        ],
        "verdict": "Using default analysis - check Groq API key"
    }