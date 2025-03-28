import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

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
      const res = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      await res.json();
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/events/${id}`, {
        method: 'DELETE',
      });
      await res.json();
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = event => {
    setEditingEvent(event);
  };

  const handleUpdateEvent = async (updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      await res.json();
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="container">
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
        <EventList 
          events={events} 
          onDelete={handleDeleteEvent} 
          onEdit={handleEditEvent} 
        />
      </main>
    </div>
  );
}

export default App;
