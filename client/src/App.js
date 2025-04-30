import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import WeeklyCalendar from './components/WeeklyCalendar';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [applyText, setApplyText] = useState('');
  const [applyResults, setApplyResults] = useState([]);

  const getCurrentMonday = () => {
    const today = new Date();
    const day = (today.getDay() + 6) % 7; // Monday=0
    const monday = new Date(today);
    monday.setDate(today.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [currentWeek, setCurrentWeek] = useState(getCurrentMonday());

  // Memoized fetchEvents to satisfy linter
  const fetchEvents = useCallback(async () => {
    const start = currentWeek.toISOString().split('T')[0];
    const endDate = new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    const end = endDate.toISOString().split('T')[0];
    try {
      const res = await fetch(
        `http://localhost:5000/events?start=${start}&end=${end}`
      );
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }, [currentWeek]);

  // Fetch when currentWeek changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = async (eventData) => {
    setFormError(null);
    try {
      const res = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add');
      fetchEvents();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`http://localhost:5000/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleEditEvent = (event) => {
    setFormError(null);
    setEditingEvent(event);
  };

  const handleUpdateEvent = async (updatedData) => {
    setFormError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/events/${editingEvent.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleApplyActions = async () => {
    setApplyResults([]);
    try {
      const payload = JSON.parse(applyText);
      const res = await fetch('http://localhost:5000/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.results) {
        setApplyResults(data.results);
        fetchEvents();
      } else if (data.error) {
        setApplyResults([data.error]);
      }
    } catch (err) {
      setApplyResults([err.message]);
    }
  };

  const handlePrevWeek = () => {
    setCurrentWeek(
      new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
  };
  const handleNextWeek = () => {
    setCurrentWeek(
      new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    );
  };

  const formatWeekRange = () => {
    const start = currentWeek.toLocaleDateString();
    const end = new Date(
      currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000
    ).toLocaleDateString();
    return `${start} - ${end}`;
  };

  const handleSelectEvent = (event) => setSelectedEventId(event.id);

  return (
    <div className="App">
      <Header />
      <main className="container">
        <section className="calendar-section">
          <div className="week-nav">
            <button onClick={handlePrevWeek}>‹</button>
            <span>{formatWeekRange()}</span>
            <button onClick={handleNextWeek}>›</button>
          </div>
          <WeeklyCalendar
            events={events}
            weekStartDate={currentWeek}
            onSelectEvent={handleSelectEvent}
          />
        </section>

        <aside className="side-panel">
          {editingEvent ? (
            <EventForm
              initialData={editingEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setEditingEvent(null)}
              error={formError}
            />
          ) : (
            <EventForm onSubmit={handleAddEvent} error={formError} />
          )}

          <h2>Event List</h2>
          <EventList
            events={events}
            onDelete={handleDeleteEvent}
            onEdit={handleEditEvent}
            selectedEventId={selectedEventId}
          />

          <div className="apply-actions">
            <h2>Apply JSON Actions</h2>
            <textarea
              rows={6}
              value={applyText}
              onChange={e => setApplyText(e.target.value)}
              placeholder="Paste actions JSON here"
            />
            <button onClick={handleApplyActions}>Apply</button>
            <ul className="apply-results">
              {applyResults.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
