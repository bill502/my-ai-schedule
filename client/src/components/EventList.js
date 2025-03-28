import React from 'react';
import './EventList.css';

const EventList = ({ events, onDelete, onEdit }) => {
  // Helper function to format ISO datetime strings
  const formatDateTime = (dateTimeStr) => {
    const dateObj = new Date(dateTimeStr);
    if (isNaN(dateObj)) return dateTimeStr;
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return dateObj.toLocaleString(undefined, options);
  };

  return (
    <div className="event-list">
      {events.length === 0 ? (
        <p className="no-events">No events available.</p>
      ) : (
        events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-card-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-datetime">
                {formatDateTime(event.start_datetime)} &mdash; {formatDateTime(event.end_datetime)}
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
