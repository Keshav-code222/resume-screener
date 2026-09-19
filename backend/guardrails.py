"""
ResuMap — Input Guardrails.
Prevents low-quality, gibberish, or too-short inputs from reaching the LLM.
"""

import re

def is_low_quality_input(text: str, min_length: int = 20) -> bool:
    """
    Returns True if the input text is considered low quality (too short or gibberish).
    """
    if not text:
        return True

    text = text.strip()

    # 1. Minimum length check
    if len(text) < min_length:
        return True

    # 2. Gibberish detection: Too many repeated characters (e.g., "aaaaaaaaaaaa")
    # Matches any character repeated 5+ times consecutively
    if re.search(r'(.)\1{4,}', text):
        return True

    # 3. Gibberish detection: Lack of whitespace/punctuation in long strings
    # If the text is long but has no spaces, it's likely a random string or a URL
    if len(text) > 50 and " " not in text:
        return True

    # 4. Gibberish detection: Low alphanumeric density
    # If less than 30% of the text is alphanumeric, it's likely noise
    alnum_count = sum(1 for char in text if char.isalnum())
    if len(text) > 20 and (alnum_count / len(text)) < 0.3:
        return True

    return False
