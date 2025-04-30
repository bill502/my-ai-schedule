import React, { useState, useEffect } from 'react';
import './EventForm.css';

// Default form data including recurrence
const defaultData = {
  date: '',
  start_time: '',
  end_time: '',
  title: '',
  details: '',
  recurrence_rule: ''
};

// Helper to parse initialData for edit mode
const parseInitialData = (data) => {
  if (!data) return defaultData;
  const start = new Date(data.start_datetime);
  const end = new Date(data.end_datetime);
  return {
    date: start.toISOString().split('T')[0],
    start_time: start.toTimeString().slice(0,5),
    end_time: end.toTimeString().slice(0,5),
    title: data.title || '',
    details: data.details || '',
    recurrence_rule: data.recurrence_rule || ''
  };
};

const EventForm = ({ onSubmit, initialData, onCancel, error }) => {
  const [formData, setFormData] = useState(
    initialData ? parseInitialData(initialData) : defaultData
  );

  useEffect(() => {
    setFormData(initialData ? parseInitialData(initialData) : defaultData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { date, start_time, end_time, title, details, recurrence_rule } = formData;
    const start_datetime = `${date}T${start_time}:00`;
    const end_datetime = `${date}T${end_time}:00`;
    onSubmit({ title, details, start_datetime, end_datetime, recurrence_rule });
    if (!initialData) {
      setFormData(defaultData);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Start Time:</label>
        <input
          type="time"
          name="start_time"
          value={formData.start_time}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>End Time:</label>
        <input
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Repeats:</label>
        <select
          name="recurrence_rule"
          value={formData.recurrence_rule}
          onChange={handleChange}
        >
          <option value="">None</option>
          <option value="FREQ=DAILY">Daily</option>
          <option value="FREQ=WEEKLY">Weekly</option>
          <option value="FREQ=MONTHLY">Monthly</option>
        </select>
      </div>
      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Details:</label>
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="form-buttons">
        <button type="submit" className="btn btn-submit">
          {initialData ? 'Update Event' : 'Add Event'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EventForm;
