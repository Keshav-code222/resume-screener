# Implementation Plan: Structured Logging and Error Tracking

This plan describes the transition from `print()` based logging to structured logging using Python's `logging` module and the integration of Sentry for error tracking in the `resume-screener` backend.

## 1. Modified Files

### New Files
- `backend/logger.py`: Centralized logging and error tracking configuration.

### Modified Files
- `backend/requirements.txt`: Add `sentry-sdk`.
- `backend/main.py`: Initialize logging, replace `print()` calls.
- `backend/ai.py`: Update `_log` helper to use the new logger.
- `backend/database.py`: Replace `print()` calls.

## 2. Proposed Logging Configuration

### Format and Handlers
- **Structure**: Logs will be emitted in JSON format to stdout. This ensures compatibility with modern log aggregators (e.g., Datadog, CloudWatch, ELK).
- **Fields**:
    - `timestamp`: ISO 8601 UTC timestamp.
    - `level`: Log level (e.g., INFO, ERROR).
    - `name`: Logger name (typically the module name).
    - `message`: The log message.
    - `exception`: Stack trace (included only for `ERROR` or `CRITICAL` logs with `exc_info=True`).
- **Handlers**: A single `logging.StreamHandler` directed to `sys.stdout`.
- **Levels**:
    - `DEBUG`: Detailed diagnostic information.
    - `INFO`: General application flow (e.g., "Server started", "Database initialized").
    - `WARNING`: Unexpected events that aren't errors (e.g., "Using SQLite fallback").
    - `ERROR`: Recoverable errors or failures in specific operations (e.g., "File extraction failed").
    - `CRITICAL`: Severe failures that may require immediate attention.

### Centralized Utility (`backend/logger.py`)
A `setup_logging()` function will be implemented to:
1. Configure the root logger level via `LOG_LEVEL` environment variable (default: `INFO`).
2. Attach a `JsonFormatter` to the `StreamHandler`.
3. Initialize Sentry if `SENTRY_DSN` is provided.

## 3. Error Tracking Integration

### Sentry Integration Strategy
- **SDK**: Use `sentry-sdk`.
- **Conditional Initialization**: The SDK will only be initialized if the `SENTRY_DSN` environment variable is set. This prevents errors or unnecessary overhead in local development environments where Sentry is not configured.
- **Automatic Capture**: By default, `sentry-sdk` captures unhandled exceptions. We will rely on this for critical crashes. For handled exceptions that should still be tracked, we will use `logger.exception()` which logs the error and, if Sentry is active, sends the event to Sentry.

## 4. Step-by-Step Implementation

### Step 1: Dependencies
- Add `sentry-sdk` to `backend/requirements.txt`.

### Step 2: Create `backend/logger.py`
- Implement `JsonFormatter(logging.Formatter)`.
- Implement `setup_logging()` and `get_logger(name)`.
- Integrate `sentry_sdk.init()` inside `setup_logging()`.

### Step 3: Integrate in `backend/main.py`
- Import `setup_logging` and `get_logger`.
- Call `setup_logging()` at the application entry point.
- Replace `print()` calls in `_lifespan` and other endpoints with `logger.error()` or `logger.info()`.

### Step 4: Integrate in `backend/ai.py`
- Import `get_logger`.
- Replace the body of `_log(msg)` to call `logger.info(msg)` (or `logger.debug`).

### Step 5: Integrate in `backend/database.py`
- Import `get_logger`.
- Replace `print()` calls with `logger.info()` or `logger.warning()`.

## 5. Verification Plan

### Logging Verification
1. **Local Execution**: Run the backend and check the console output.
2. **Format Check**: Verify that all logs are valid JSON objects.
3. **Level Check**:
    - Ensure "Using SQLite" is logged as `WARNING` or `INFO`.
    - Ensure startup failures are logged as `ERROR`.
4. **Log Level Filtering**: Set `LOG_LEVEL=WARNING` and verify that `INFO` logs are suppressed.

### Error Tracking Verification
1. **Sentry Configuration**: Set a valid `SENTRY_DSN` in the `.env` file.
2. **Exception Trigger**: Intentionally trigger an unhandled exception (e.g., by modifying a function to raise a `RuntimeError`).
3. **Sentry Dashboard**: Verify that the exception appears in the Sentry project dashboard with the correct stack trace and environment info.
4. **Optionality Check**: Unset `SENTRY_DSN` and verify that the application still starts and runs normally without Sentry errors.
