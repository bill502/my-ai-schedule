import React, { useState, useEffect } from 'react';
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

  // Compute current week start (Monday)
  const getCurrentMonday = () => {
    const today = new Date();
    const day = (today.getDay() + 6) % 7; // Monday=0
    const monday = new Date(today);
    monday.setDate(today.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [currentWeek, setCurrentWeek] = useState(getCurrentMonday());

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add event handler with conflict error handling
  const handleAddEvent = async (eventData) => {
    setFormError(null);
    const res = await fetch('http://localhost:5000/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (res.status === 409) {
      const { error } = await res.json();
      setFormError(error);
    } else {
      await res.json();
      fetchEvents();
    }
  };

  // Delete event handler
  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`http://localhost:5000/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Enter edit mode
  const handleEditEvent = (event) => {
    setFormError(null);
    setEditingEvent(event);
  };

  // Update event handler with conflict error handling
  const handleUpdateEvent = async (updatedData) => {
    setFormError(null);
    const res = await fetch(`http://localhost:5000/events/${editingEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (res.status === 409) {
      const { error } = await res.json();
      setFormError(error);
    } else {
      await res.json();
      setEditingEvent(null);
      fetchEvents();
    }
  };

  // Highlight selected event when clicked in calendar
  const handleSelectEvent = (event) => {
    setSelectedEventId(event.id);
  };

  // Week navigation handlers
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

  // Format week range for display
  const formatWeekRange = () => {
    const start = currentWeek.toLocaleDateString();
    const end = new Date(
      currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000
    ).toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <div className="App">
      <Header />
      <main className="container">
        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="week-navigation">
            <button onClick={handlePrevWeek}>Previous Week</button>
            <span>{formatWeekRange()}</span>
            <button onClick={handleNextWeek}>Next Week</button>
          </div>
          <WeeklyCalendar
            events={events}
            weekStartDate={currentWeek}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {/* Side Panel for Add/Edit and List */}
        <div className="side-panel">
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
        </div>
      </main>
    </div>
  );
}

export default App;