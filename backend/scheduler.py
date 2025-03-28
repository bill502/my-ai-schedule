import sqlite3
import json

DATABASE = "scheduler.db"

def init_db():
    """Initialize the SQLite database and create the events table if it doesn't exist."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            start_datetime TEXT NOT NULL,
            end_datetime TEXT NOT NULL,
            details TEXT
        )
    ''')
    conn.commit()
    conn.close()

def create_event(title, start_datetime, end_datetime, details=None):
    """Create a new event and return its ID."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO events (title, start_datetime, end_datetime, details)
        VALUES (?, ?, ?, ?)
    ''', (title, start_datetime, end_datetime, details))
    conn.commit()
    event_id = cursor.lastrowid
    conn.close()
    return event_id

def list_events():
    """Retrieve and return all events ordered by start time."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, start_datetime, end_datetime, details FROM events ORDER BY start_datetime')
    events = cursor.fetchall()
    conn.close()
    return events

def update_event(event_id, title=None, start_datetime=None, end_datetime=None, details=None):
    """Update an existing event's details. Only provided fields are updated."""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    # Fetch current event details
    cursor.execute('SELECT title, start_datetime, end_datetime, details FROM events WHERE id=?', (event_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current_title, current_start, current_end, current_details = row
    new_title = title if title is not None else current_title
    new_start = start_datetime if start_datetime is not None else current_start
    new_end = end_datetime if end_datetime is not None else current_end
    new_details = details if details is not None else current_details
    cursor.execute('''
        UPDATE events
        SET title=?, start_datetime=?, end_datetime=?, details=?
        WHERE id=?
    ''', (new_title, new_start, new_end, new_details, event_id))
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

    Expected JSON format:
    {
      "actions": [
         {
           "type": "create_event",
           "title": "Meeting with Alice",
           "start_datetime": "2025-03-30T14:00:00",
           "end_datetime": "2025-03-30T15:00:00",
           "details": "Discuss project status"
         }
      ]
    }
    """
    results = []
    try:
        data = json.loads(json_string)
        actions = data.get("actions", [])
        for action in actions:
            action_type = action.get("type")
            if action_type == "create_event":
                title = action.get("title")
                start_dt = action.get("start_datetime")
                end_dt = action.get("end_datetime")
                details = action.get("details", "")
                event_id = create_event(title, start_dt, end_dt, details)
                results.append(f"Created event '{title}' with ID {event_id}")
            elif action_type == "update_event":
                event_id = action.get("event_id")
                if not event_id:
                    results.append("update_event action missing event_id")
                    continue
                title = action.get("title")
                start_dt = action.get("start_datetime")
                end_dt = action.get("end_datetime")
                details = action.get("details")
                if update_event(event_id, title, start_dt, end_dt, details):
                    results.append(f"Updated event with ID {event_id}")
                else:
                    results.append(f"Event with ID {event_id} not found for update")
            elif action_type == "delete_event":
                event_id = action.get("event_id")
                if not event_id:
                    results.append("delete_event action missing event_id")
                    continue
                delete_event(event_id)
                results.append(f"Deleted event with ID {event_id}")
            else:
                results.append(f"Unknown action type: {action_type}")
        return results
    except json.JSONDecodeError as e:
        return [f"Invalid JSON: {e}"]

def main():
    # Initialize the database and table
    init_db()
    print("Database initialized.\n")

    # List current events (should be empty initially)
    print("Current events:")
    events = list_events()
    for event in events:
        print(event)
    print()

    # Sample JSON output from ChatGPT (simulate a scheduling request)
    sample_json = '''
    {
      "actions": [
         {
           "type": "create_event",
           "title": "Meeting with Alice",
           "start_datetime": "2025-03-30T14:00:00",
           "end_datetime": "2025-03-30T15:00:00",
           "details": "Discuss project status"
         }
      ]
    }
    '''

    # Parse and execute the actions from the JSON
    results = parse_chatgpt_output(sample_json)
    print("Action results:")
    for res in results:
        print(res)
    print()

    # List events after processing the sample action
    print("Updated events:")
    events = list_events()
    for event in events:
        print(event)

if __name__ == "__main__":
    main()
