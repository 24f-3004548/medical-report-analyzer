"""
database.py — SQLite connection using the stdlib sqlite3 module.
We use a simple synchronous helper since SQLite doesn't need a connection pool.
"""

import sqlite3
import os

DB_PATH = os.getenv("DB_PATH", "veris.db")


def get_db() -> sqlite3.Connection:
    """
    Returns a new SQLite connection with:
      - Row factory so rows behave like dicts
      - Foreign keys enforced
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """
    Run schema.sql once on startup to create all tables if they don't exist.
    Safe to call every time — all statements use CREATE TABLE IF NOT EXISTS.
    """
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r") as f:
        sql = f.read()
    with get_db() as conn:
        conn.executescript(sql)
    print(f"[DB] Initialised at {DB_PATH}")
