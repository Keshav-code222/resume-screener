import PyPDF2
from docx import Document
import re

def extract_text_from_pdf(file_path):
    """Extract text from PDF"""
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_path):
    """Extract text from DOCX"""
    doc = Document(file_path)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text

def extract_skills(resume_text):
    """Extract skills from resume text (basic NLP)"""
    # Common tech skills
    tech_skills = [
        'python', 'javascript', 'java', 'c++', 'react', 'node.js', 'django',
        'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'git', 'linux',
        'typescript', 'golang', 'rust', 'machine learning', 'tensorflow',
        'pytorch', 'nlp', 'computer vision', 'devops', 'ci/cd'
    ]
    
    text_lower = resume_text.lower()
    found_skills = []
    
    for skill in tech_skills:
        if skill in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))  # Remove duplicates

def parse_resume(file_path):
    """Main function to parse resume"""
    if file_path.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file format")
    
    skills = extract_skills(text)
    return {
        'raw_text': text,
        'skills': skills,
        'word_count': len(text.split())
    }