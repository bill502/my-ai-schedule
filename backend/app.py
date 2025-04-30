import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import scheduler

# Load environment variables
load_dotenv()

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# List events with optional recurrence expansion
@app.route('/events', methods=['GET'])
def get_events():
    start = request.args.get('start')  # e.g. '2025-05-01'
    end = request.args.get('end')      # e.g. '2025-05-07'
    if start and end:
        evs = scheduler.list_events_range(start, end)
    else:
        raw = scheduler.list_events()
        evs = [
            {
                "id": e[0],
                "title": e[1],
                "start_datetime": e[2],
                "end_datetime": e[3],
                "details": e[4],
                "recurrence_rule": e[5] or ""
            }
            for e in raw
        ]
    return jsonify(evs)

# Create a new event (including recurrence)
@app.route('/events', methods=['POST'])
def create_event():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    title = data.get("title")
    start_datetime = data.get("start_datetime")
    end_datetime = data.get("end_datetime")
    details = data.get("details", "")
    recurrence_rule = data.get("recurrence_rule")

    # Validate required fields
    if not title or not start_datetime or not end_datetime:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        eid = scheduler.create_event(
            title,
            start_datetime,
            end_datetime,
            details,
            recurrence_rule
        )
        return jsonify({"message": "Event created", "id": eid}), 201
    except scheduler.ConflictError as ce:
        return jsonify({"error": str(ce)}), 409

# Update an existing event (including recurrence)
@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    title = data.get("title")
    start_datetime = data.get("start_datetime")
    end_datetime = data.get("end_datetime")
    details = data.get("details")
    recurrence_rule = data.get("recurrence_rule")

    # Ensure at least one field to update
    if not any([title, start_datetime, end_datetime, details, recurrence_rule]):
        return jsonify({"error": "No fields to update provided"}), 400

    try:
        updated = scheduler.update_event(
            event_id,
            title=title,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            details=details,
            recurrence_rule=recurrence_rule
        )
        if not updated:
            return jsonify({"error": "Event not found"}), 404
        return jsonify({"message": "Event updated"})
    except scheduler.ConflictError as ce:
        return jsonify({"error": str(ce)}), 409

# Delete an event
@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    scheduler.delete_event(event_id)
    return jsonify({"message": "Event deleted"})

# Apply a JSON actions payload from ChatGPT or UI
@app.route('/apply', methods=['POST'])
def apply_actions():
    data = request.get_json(force=True)
    if not data or 'actions' not in data:
        return jsonify({"error": "Request JSON must include 'actions' list"}), 400

    results = []
    for action in data['actions']:
        t = action.get('type')
        try:
            if t == 'create_event':
                eid = scheduler.create_event(
                    action['title'],
                    action['start_datetime'],
                    action['end_datetime'],
                    action.get('details', ''),
                    action.get('recurrence_rule')
                )
                results.append(f"Created event ID {eid}")
            elif t == 'update_event':
                eid = action.get('event_id')
                updated = scheduler.update_event(
                    eid,
                    title=action.get('title'),
                    start_datetime=action.get('start_datetime'),
                    end_datetime=action.get('end_datetime'),
                    details=action.get('details'),
                    recurrence_rule=action.get('recurrence_rule')
                )
                if updated:
                    results.append(f"Updated event ID {eid}")
                else:
                    results.append(f"Event ID {eid} not found")
            elif t == 'delete_event':
                eid = action.get('event_id')
                scheduler.delete_event(eid)
                results.append(f"Deleted event ID {eid}")
            elif t == 'move_event':
                eid = action.get('event_id')
                new_start = action.get('new_start')
                new_end = action.get('new_end')
                moved = scheduler.update_event(
                    eid,
                    start_datetime=new_start,
                    end_datetime=new_end
                )
                if moved:
                    results.append(f"Moved event ID {eid}")
                else:
                    results.append(f"Event ID {eid} not found for move")
            else:
                results.append(f"Unknown action type: {t}")
        except scheduler.ConflictError as ce:
            results.append(f"Conflict for action {t} on event {action.get('event_id', '')}: {ce}")
    return jsonify({"results": results})

if __name__ == '__main__':
    scheduler.init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)