from docx import Document
import re

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
