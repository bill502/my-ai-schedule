import sqlite3
import json
from datetime import datetime, timedelta
from dateutil.rrule import rrulestr

DATABASE = "scheduler.db"

class ConflictError(Exception):
    """Raised when a new or updated event overlaps an existing one."""
    pass


def init_db():
    """Initialize the SQLite database and create the events table with recurrence support."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Drop old table if it exists (for prototyping)
    cursor.execute('DROP TABLE IF EXISTS events')

    # Create new table with a recurrence_rule column
    cursor.execute('''
        CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            start_datetime TEXT NOT NULL,
            end_datetime TEXT NOT NULL,
            details TEXT,
            recurrence_rule TEXT
        )
    ''')

    conn.commit()
    conn.close()


def create_event(title, start_datetime, end_datetime, details=None, recurrence_rule=None):
    """Create a new event, checking for conflicts on the first occurrence."""
    # Conflict check for the initial occurrence
    date_str = start_datetime.split("T")[0]
    new_start = datetime.fromisoformat(start_datetime)
    new_end = datetime.fromisoformat(end_datetime)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT start_datetime, end_datetime FROM events
        WHERE start_datetime BETWEEN ? AND ?
    ''', (f"{date_str}T00:00:00", f"{date_str}T23:59:59"))
    for s_iso, e_iso in cursor.fetchall():
        existing_start = datetime.fromisoformat(s_iso)
        existing_end = datetime.fromisoformat(e_iso)
        if existing_start < new_end and new_start < existing_end:
            conn.close()
            raise ConflictError(
                f"Conflicts with existing event ({existing_start.strftime('%H:%M')}–{existing_end.strftime('%H:%M')})"
            )

    # Insert the event
    cursor.execute('''
        INSERT INTO events (title, start_datetime, end_datetime, details, recurrence_rule)
        VALUES (?, ?, ?, ?, ?)
    ''', (title, start_datetime, end_datetime, details, recurrence_rule))
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return event_id


def list_events():
    """Retrieve all stored events ordered by start time (masters and non-recurring)."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, title, start_datetime, end_datetime, details, recurrence_rule
        FROM events
        ORDER BY start_datetime
    ''')
    rows = cursor.fetchall()
    conn.close()
    return rows


def list_events_range(start_date, end_date):
    """
    Return all event instances between ISO dates start_date and end_date (inclusive).
    Expands recurring events based on their RRULE.
    """
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, title, start_datetime, end_datetime, details, recurrence_rule
        FROM events
    ''')
    rows = cursor.fetchall()
    conn.close()

    instances = []
    dt_start = datetime.fromisoformat(start_date)
    dt_end = datetime.fromisoformat(end_date) + timedelta(days=1)  # include full end_date

    for eid, title, s_iso, e_iso, details, rule in rows:
        start0 = datetime.fromisoformat(s_iso)
        end0 = datetime.fromisoformat(e_iso)
        duration = end0 - start0

        if rule:
            try:
                rrule = rrulestr(rule, dtstart=start0)
                for occ in rrule.between(dt_start, dt_end, inc=True):
                    instances.append({
                        "id": eid,
                        "title": title,
                        "start_datetime": occ.isoformat(),
                        "end_datetime": (occ + duration).isoformat(),
                        "details": details,
                        "recurrence_rule": rule
                    })
            except Exception:
                # Invalid rule; skip expansion
                pass
        else:
            if dt_start <= start0 < dt_end:
                instances.append({
                    "id": eid,
                    "title": title,
                    "start_datetime": s_iso,
                    "end_datetime": e_iso,
                    "details": details,
                    "recurrence_rule": ''
                })
    return instances


def update_event(event_id, title=None, start_datetime=None, end_datetime=None, details=None, recurrence_rule=None):
    """Update existing event; checks conflict on initial occurrence and updates recurrence."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT title, start_datetime, end_datetime, details, recurrence_rule FROM events WHERE id=?', (event_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    curr_title, curr_start, curr_end, curr_details, curr_rule = row

    new_title = title or curr_title
    new_start = start_datetime or curr_start
    new_end = end_datetime or curr_end
    new_details = details if details is not None else curr_details
    new_rule = recurrence_rule if recurrence_rule is not None else curr_rule

    # Conflict check for initial occurrence
    date_str = new_start.split("T")[0]
    ns = datetime.fromisoformat(new_start)
    ne = datetime.fromisoformat(new_end)
    cursor.execute('''
        SELECT start_datetime, end_datetime FROM events
        WHERE start_datetime BETWEEN ? AND ? AND id != ?
    ''', (f"{date_str}T00:00:00", f"{date_str}T23:59:59", event_id))
    for s_iso, e_iso in cursor.fetchall():
        existing_start = datetime.fromisoformat(s_iso)
        existing_end = datetime.fromisoformat(e_iso)
        if existing_start < ne and ns < existing_end:
            conn.close()
            raise ConflictError(
                f"Conflicts with existing event ({existing_start.strftime('%H:%M')}–{existing_end.strftime('%H:%M')})"
            )

    cursor.execute('''
        UPDATE events
        SET title=?, start_datetime=?, end_datetime=?, details=?, recurrence_rule=?
        WHERE id=?
    ''', (new_title, new_start, new_end, new_details, new_rule, event_id))
    conn.commit()
    conn.close()
    return True


def delete_event(event_id):
    """Delete an event by its ID."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM events WHERE id=?', (event_id,))
    conn.commit()
    conn.close()
    return True


def parse_chatgpt_output(json_string):
    """
    Parse the JSON output from ChatGPT and execute scheduling actions.
    """
    results = []
    try:
        data = json.loads(json_string)
        actions = data.get("actions", [])
        for action in actions:
            t = action.get("type")
            try:
                if t == "create_event":
                    eid = create_event(
                        action["title"],
                        action["start_datetime"],
                        action["end_datetime"],
                        action.get("details", ""),
                        action.get("recurrence_rule")
                    )
                    results.append(f"Created event ID {eid}")
                elif t == "update_event":
                    eid = action.get("event_id")
                    updated = update_event(
                        eid,
                        title=action.get("title"),
                        start_datetime=action.get("start_datetime"),
                        end_datetime=action.get("end_datetime"),
                        details=action.get("details"),
                        recurrence_rule=action.get("recurrence_rule")
                    )
                    results.append(f"Updated event ID {eid}" if updated else f"Event ID {eid} not found")
                elif t == "delete_event":
                    eid = action.get("event_id")
                    delete_event(eid)
                    results.append(f"Deleted event ID {eid}")
                elif t == "move_event":
                    eid = action.get("event_id")
                    new_start = action.get("new_start")
                    new_end = action.get("new_end")
                    moved = update_event(eid, start_datetime=new_start, end_datetime=new_end)
                    results.append(f"Moved event ID {eid}" if moved else f"Event ID {eid} not found for move")
                else:
                    results.append(f"Unknown action type: {t}")
            except ConflictError as ce:
                results.append(f"Conflict for action {t} on event {action.get('event_id', '')}: {ce}")
        return results
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]

# Example runner
if __name__ == "__main__":
    init_db()
    print("Database initialized.")
    # Example listing for today
    today = datetime.now().date().isoformat()
    print(list_events_range(today, today))
