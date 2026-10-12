import contextlib
import io
import json
import sys
from pathlib import Path
from unittest.mock import patch

DATA = Path(__file__).resolve().parent.parent / "data" / "exercises.json"
exercises = json.loads(DATA.read_text(encoding="utf-8"))
failures = []
tested = 0
errors = 0

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
    code = exercise.get("solution", "")
    tests = exercise.get("tests", [])
    for index, test in enumerate(tests, start=1):
        tested += 1
        actual, error = run_solution(code, str(test.get("input", "")))
        expected = str(test.get("expected", "")).strip()
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
for item in failures:
    print(
        f"FAIL #{item['id']} {item['title']} | test {item['test']} | "
        f"expected={item['expected']!r} actual={item['actual']!r} error={item['error']}"
    )
if errors > len(failures):
    print(f"... {errors - len(failures)} additional failures omitted")
# This is initially an audit/reporting step; it does not fail CI until the
# existing dataset has been triaged and its known baseline is established.
