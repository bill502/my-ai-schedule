import React from 'react';
import './EventList.css';

const EventList = ({ events, onDelete, onEdit, selectedEventId }) => {
  return (
    <div className="event-list">
      {events.length === 0 ? (
        <p className="no-events">No events available.</p>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            className={`event-card ${selectedEventId === event.id ? 'selected' : ''}`}
          >
            <div className="event-card-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-datetime">
                {new Date(event.start_datetime).toLocaleString()} &mdash;{' '}
                {new Date(event.end_datetime).toLocaleString()}
              </p>
              <p className="event-details">{event.details}</p>
            </div>
            <div className="event-card-actions">
              <button className="btn btn-edit" onClick={() => onEdit(event)}>
                Edit
              </button>
              <button className="btn btn-delete" onClick={() => onDelete(event.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EventList;
