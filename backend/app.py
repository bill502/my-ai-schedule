from flask import Flask, request, jsonify
from flask_cors import CORS  # Import flask-cors
import scheduler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# List all events
@app.route('/events', methods=['GET'])
def get_events():
    events = scheduler.list_events()
    events_list = []
    for event in events:
        events_list.append({
            "id": event[0],
            "title": event[1],
            "start_datetime": event[2],
            "end_datetime": event[3],
            "details": event[4]
        })
    return jsonify(events_list)

# Create a new event
@app.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    title = data.get("title")
    start_datetime = data.get("start_datetime")
    end_datetime = data.get("end_datetime")
    details = data.get("details", "")

    if not title or not start_datetime or not end_datetime:
        return jsonify({"error": "Missing required fields"}), 400

    event_id = scheduler.create_event(title, start_datetime, end_datetime, details)
    return jsonify({"message": "Event created", "id": event_id}), 201

# Update an existing event
@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    title = data.get("title")
    start_datetime = data.get("start_datetime")
    end_datetime = data.get("end_datetime")
    details = data.get("details")

    updated = scheduler.update_event(event_id, title, start_datetime, end_datetime, details)
    if not updated:
        return jsonify({"error": "Event not found"}), 404

    return jsonify({"message": "Event updated"})

# Delete an event
@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    scheduler.delete_event(event_id)
    return jsonify({"message": "Event deleted"})

if __name__ == '__main__':
    scheduler.init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
