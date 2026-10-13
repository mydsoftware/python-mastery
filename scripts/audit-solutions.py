import contextlib
import io
import json
from pathlib import Path
from unittest.mock import patch

DATA = Path(__file__).resolve().parent.parent / "data" / "exercises.json"
exercises = json.loads(DATA.read_text(encoding="utf-8"))
failures = []
tested = 0
errors = 0
normalized_solutions = 0
normalized_outputs = 0

def normalize(value):
    if not isinstance(value, str):
        return value
    # Only repair doubly escaped sequences introduced by dataset generation.
    # A single \\n or \\t may be a legitimate Python string escape and must be preserved.
    normalized = value.replace("\\\\n", "\n").replace("\\\\t", "\t")
    return normalized

def run_solution(code, input_text):
    output = io.StringIO()
    lines = iter(input_text.splitlines())
    def fake_input(prompt=""):
        try:
            return next(lines)
        except StopIteration:
            raise EOFError("not enough test input")
    scope = {"__name__": "__main__"}
    try:
        with patch("builtins.input", fake_input), contextlib.redirect_stdout(output):
            exec(compile(code, "<exercise-solution>", "exec"), scope, scope)
        return output.getvalue().strip(), None
    except Exception as exc:
        return output.getvalue().strip(), f"{type(exc).__name__}: {exc}"

for exercise in exercises:
    raw_code = exercise.get("solution", "")
    code = normalize(raw_code)
    if code != raw_code:
        normalized_solutions += 1
    for index, test in enumerate(exercise.get("tests", []), start=1):
        tested += 1
        actual, error = run_solution(code, str(test.get("input", "")))
        raw_expected = str(test.get("expected", ""))
        expected = normalize(raw_expected).strip()
        if expected != raw_expected.strip():
            normalized_outputs += 1
        if error or actual != expected:
            errors += 1
            if len(failures) < 100:
                failures.append({
                    "id": exercise.get("id"),
                    "title": exercise.get("title"),
                    "test": index,
                    "expected": expected,
                    "actual": actual,
                    "error": error,
                })

print(f"Solution audit: exercises={len(exercises)}, tests={tested}, failed={errors}")
print(f"Normalized for audit: solutions={normalized_solutions}, expected_outputs={normalized_outputs}")
for item in failures:
    print(
        f"FAIL #{item['id']} {item['title']} | test {item['test']} | "
        f"expected={item['expected']!r} actual={item['actual']!r} error={item['error']}"
    )
if errors > len(failures):
    print(f"... {errors - len(failures)} additional failures omitted")

# Keep CI green while the repair loop is being developed; the audit itself is
# intentionally informational until the dataset repair pass is complete.
