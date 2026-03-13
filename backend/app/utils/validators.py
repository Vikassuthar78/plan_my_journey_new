import re
import bleach


def sanitize_input(text):
    """Sanitize user input to prevent XSS and injection attacks."""
    if not isinstance(text, str):
        return text
    return bleach.clean(text, strip=True)


def sanitize_dict(data):
    """Recursively sanitize all string values in a dictionary."""
    if isinstance(data, dict):
        return {k: sanitize_dict(v) for k, v in data.items() if not k.startswith('$')}
    elif isinstance(data, list):
        return [sanitize_dict(item) for item in data]
    elif isinstance(data, str):
        return sanitize_input(data)
    return data


def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"


def validate_phone(phone):
    """Validate phone number."""
    pattern = r'^[+]?[\d\s\-()]{10,15}$'
    return re.match(pattern, phone) is not None
