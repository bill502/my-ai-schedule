import React, { useState } from 'react';
import './EventForm.css';

const EventForm = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      start_datetime: '',
      end_datetime: '',
      details: '',
    }
  );

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData({
        title: '',
        start_datetime: '',
        end_datetime: '',
        details: '',
      });
    }
  };

  // Helper function to format datetime for preview
  const formatDateTimePreview = (dateTimeStr) => {
    const dateObj = new Date(dateTimeStr);
    if (isNaN(dateObj)) return '';
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
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Start DateTime:</label>
        <input type="datetime-local" name="start_datetime" value={formData.start_datetime} onChange={handleChange} required />
        {formData.start_datetime && (
          <small className="datetime-preview">
            {formatDateTimePreview(formData.start_datetime)}
          </small>
        )}
      </div>
      <div className="form-group">
        <label>End DateTime:</label>
        <input type="datetime-local" name="end_datetime" value={formData.end_datetime} onChange={handleChange} required />
        {formData.end_datetime && (
          <small className="datetime-preview">
            {formatDateTimePreview(formData.end_datetime)}
          </small>
        )}
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
