"""
Logging configuration for the ResuMap backend.
Handles environment-based formatting and Sentry integration.
"""
import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger

def setup_logging():
    """
    Configures the root logger.
    - Development: Human-readable stdout.
    - Production: Structured JSON stdout.
    """
    env = os.getenv("ENV", "development").lower()
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()

    # Map string log level to logging constant
    log_level = getattr(logging, log_level_str, logging.INFO)

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear existing handlers to prevent duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    if env == "production":
        # JSON formatting for production log aggregators
        formatter = jsonlogger.JsonFormatter(
            fmt="%(asctime)s %(levelname)s %(name)s %(message)s"
        )
    else:
        # Human-readable formatting for development
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Sentry integration
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn:
        try:
            import sentry_sdk
            sentry_sdk.init(
                dsn=sentry_dsn,
                environment=env,
                # Integrate with logging module:
                # Any log record with level ERROR or CRITICAL will be sent to Sentry.
                integrations=[
                    sentry_sdk.integrations.logging.LoggingIntegration(
                        level=logging.INFO, # Capture INFO and above as breadcrumbs
                        event_level=logging.ERROR # Capture ERROR and above as events
                    ),
                ],
            )
        except ImportError:
            logging.error("sentry-sdk not installed, skipping Sentry integration")
        except Exception as e:
            logging.error(f"Failed to initialize Sentry: {e}")
