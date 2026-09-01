import re
from typing import Any


def _to_camel_case(value: str) -> str:
    return re.sub(r"_([a-z])", lambda match: match.group(1).upper(), value)


def serialize_api(value: Any) -> Any:
    """Convert database/Python snake_case data to the public camelCase API contract."""
    if isinstance(value, list):
        return [serialize_api(item) for item in value]
    if isinstance(value, dict):
        return {
            _to_camel_case(key): serialize_api(item)
            for key, item in value.items()
        }
    return value
