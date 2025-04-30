# My AI Scheduling Assistant

A personal AI-driven scheduling assistant that leverages ChatGPT for natural-language scheduling commands and provides a modern React-based UI with a Python/Flask backend for event management.

---

## Features

- **Natural-Language Scheduling**: Use ChatGPT prompts to create, update, and delete events via JSON commands.
- **Weekly Calendar View**: Scrollable 24-hour grid (7 AM–11 PM default view) with week navigation (Monday–Sunday).
- **Add/Edit Events**: Single-day events with separate date, start, and end time inputs.
- **Event List & Selection**: Side panel to view, edit, and delete events; click or right-click calendar events to highlight.
- **Responsive Layout**: Calendar occupies the main area; event management panel on the right.

---

## Tech Stack

- **Frontend**: React (Create React App)
- **Backend**: Python, Flask, SQLite
- **API**: RESTful endpoints for CRUD operations
- **Styling**: CSS modules with Roboto font

---

## Repository Structure

```
my-ai-schedule/
├── README.md                # This file
├── backend/                 # Python backend
│   ├── venv/                # Python virtual environment
│   ├── scheduler.py         # Event CRUD + JSON parser
│   ├── app.py               # Flask API endpoints
│   └── requirements.txt     # Python dependencies
└── client/                  # React frontend
    ├── public/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   │   ├── Header.js
    │   │   ├── EventList.js
    │   │   ├── EventForm.js
    │   │   └── WeeklyCalendar.js
    │   ├── App.js
    │   └── index.js
    └── package.json         # Frontend dependencies
```

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python 3.8+

### Backend Setup

```bash
cd backend
python -m venv venv            # Create virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (PowerShell):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\Activate.ps1

pip install -r requirements.txt
python app.py                  # Start Flask server on http://localhost:5000
```

### Frontend Setup

```bash
cd client
npm install                    # Install React dependencies
npm start                      # Launch frontend on http://localhost:3000
```

---

## Usage

1. **Navigate Weeks**: Use the **Previous Week** and **Next Week** buttons above the calendar.
2. **Add Event**: In the side panel, select a date, start time, end time, title, and details, then click **Add Event**.
3. **Edit Event**:
   - Click **Edit** in the side panel event list, or click/right-click an event block on the calendar.
   - Modify fields and click **Update Event**.
4. **Delete Event**: Click the **Delete** button in the side panel or highlight and delete via context menu.

---

## Future Improvements

- **Conflict Detection**: Warn or auto-resolve overlapping events.
- **Voice Integration**: Leverage ChatGPT voice commands for direct scheduling.
- **External Sync**: Two-way sync with Google Calendar or Outlook.
- **Event Types & Color Coding**: Categorize events by color and filter by type.
- **Additional Views**: Daily and monthly calendar views, agenda list view.

---

## License

This project is open source and available under the MIT License.

