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

  const handleAddEvent = async (eventData) => {
    try {
      await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`http://localhost:5000/events/${id}`, {
        method: 'DELETE',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
  };

  const handleUpdateEvent = async (updatedData) => {
    try {
      await fetch(`http://localhost:5000/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEventId(event.id);
  };

  // Week navigation handlers
  const handlePrevWeek = () => {
    setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNextWeek = () => {
    setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  // Format the week range for display
  const formatWeekRange = () => {
    const start = currentWeek.toLocaleDateString();
    const end = new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <div className="App">
      <Header />
      <main className="container">
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
        <div className="side-panel">
          {editingEvent ? (
            <>
              <h2>Edit Event</h2>
              <EventForm
                initialData={editingEvent}
                onSubmit={handleUpdateEvent}
                onCancel={() => setEditingEvent(null)}
              />
            </>
          ) : (
            <>
              <h2>Add New Event</h2>
              <EventForm onSubmit={handleAddEvent} />
            </>
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
