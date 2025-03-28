import React, { useState, useEffect } from 'react';

function Events() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start_datetime: '',
    end_datetime: '',
    details: '',
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    start_datetime: '',
    end_datetime: '',
    details: '',
  });

  // Fetch events from the backend API
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

  // Handle input changes for the new event form
  const handleChange = (e) => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the form to create a new event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start_datetime || !newEvent.end_datetime) {
      alert('Title, start date/time, and end date/time are required.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      console.log('Event created:', data);
      setNewEvent({ title: '', start_datetime: '', end_datetime: '', details: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Delete an event by calling the API's DELETE endpoint
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      console.log('Event deleted:', data);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Start editing an event
  const handleEdit = (event) => {
    setEditingEvent(event);
    setEditData({
      title: event.title,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      details: event.details,
    });
  };

  // Handle input changes for the edit form
  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the updated event data
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData.title || !editData.start_datetime || !editData.end_datetime) {
      alert('Title, start date/time, and end date/time are required.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      console.log('Event updated:', data);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Cancel editing mode
  const cancelEdit = () => {
    setEditingEvent(null);
  };

  return (
    <div>
      <h1>My Events</h1>
      {events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong> from {event.start_datetime} to {event.end_datetime}
              <p>{event.details}</p>
              <button onClick={() => handleDelete(event.id)}>Delete</button>
              <button onClick={() => handleEdit(event)}>Edit</button>
            </li>
          ))}
        </ul>
      )}

      {/* Render the edit form if an event is being edited */}
      {editingEvent && (
        <div>
          <h2>Edit Event</h2>
          <form onSubmit={handleUpdate}>
            <div>
              <label>Title: </label>
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label>Start DateTime: </label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={editData.start_datetime}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label>End DateTime: </label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={editData.end_datetime}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label>Details: </label>
              <textarea
                name="details"
                value={editData.details}
                onChange={handleEditChange}
              ></textarea>
            </div>
            <button type="submit">Update Event</button>
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <h2>Add New Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input type="text" name="title" value={newEvent.title} onChange={handleChange} />
        </div>
        <div>
          <label>Start DateTime: </label>
          <input
            type="datetime-local"
            name="start_datetime"
            value={newEvent.start_datetime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>End DateTime: </label>
          <input
            type="datetime-local"
            name="end_datetime"
            value={newEvent.end_datetime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Details: </label>
          <textarea name="details" value={newEvent.details} onChange={handleChange}></textarea>
        </div>
        <button type="submit">Add Event</button>
      </form>
    </div>
  );
}

export default Events;
