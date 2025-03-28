import React, { useState, useEffect } from 'react';
import './EventForm.css';

// Helper to parse initialData for edit mode
const parseInitialData = (data) => {
  if (!data) return { date: '', start_time: '', end_time: '', title: '', details: '' };
  const start = new Date(data.start_datetime);
  const end = new Date(data.end_datetime);
  const dateStr = start.toISOString().split('T')[0];
  const startTimeStr = start.toTimeString().slice(0, 5);
  const endTimeStr = end.toTimeString().slice(0, 5);
  return { date: dateStr, start_time: startTimeStr, end_time: endTimeStr, title: data.title || '', details: data.details || '' };
};

const EventForm = ({ onSubmit, initialData, onCancel }) => {
  const defaultData = { date: '', start_time: '', end_time: '', title: '', details: '' };
  const [formData, setFormData] = useState(initialData ? parseInitialData(initialData) : defaultData);

  useEffect(() => {
    setFormData(initialData ? parseInitialData(initialData) : defaultData);
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { date, start_time, end_time, title, details } = formData;
    const start_datetime = `${date}T${start_time}:00`;
    const end_datetime = `${date}T${end_time}:00`;
    onSubmit({ title, details, start_datetime, end_datetime });
    if (!initialData) {
      setFormData(defaultData);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Start Time:</label>
        <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>End Time:</label>
        <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Details:</label>
        <textarea name="details" value={formData.details} onChange={handleChange}></textarea>
      </div>
      <div className="form-buttons">
        <button type="submit" className="btn btn-submit">
          {initialData ? 'Update Event' : 'Add Event'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EventForm;
