import React, { useState, useEffect } from 'react';

function Events() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start_datetime: '',
    end_datetime: '',
    details: '',
  });

  // Function to fetch events from the backend API
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

  // Handle form input changes
  const handleChange = (e) => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the form to create a new event
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
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
      // Clear the form
      setNewEvent({
        title: '',
        start_datetime: '',
        end_datetime: '',
        details: '',
      });
      // Refresh the events list
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
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
            </li>
          ))}
        </ul>
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
