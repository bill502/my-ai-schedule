import React, { useRef, useEffect } from 'react';
import './WeeklyCalendar.css';

const WeeklyCalendar = ({ events, weekStartDate, onSelectEvent }) => {
  // Compute start of week (Monday) from a given date
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    // Convert Sunday (0) to 6, so Monday becomes 0
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const startOfWeek = weekStartDate ? new Date(weekStartDate) : getStartOfWeek(new Date());

  // Generate days for the week (Monday to Sunday)
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  // Define full-day hours: 0 to 23
  const hours = [];
  for (let h = 0; h < 24; h++) {
    hours.push(h);
  }

  // Format day header (e.g., "Mon 4/1")
  const formatDayHeader = (date) =>
    date.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
  // Format time labels (e.g., "07:00 AM")
  const formatTimeLabel = (hour) =>
    new Date(0, 0, 0, hour).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  // Process events: compute dayIndex (relative to startOfWeek), startHour, and duration in hours.
  const processedEvents = events
    .map((event) => {
      const start = new Date(event.start_datetime);
      const end = new Date(event.end_datetime);
      const dayIndex = Math.floor((start - startOfWeek) / (1000 * 60 * 60 * 24));
      const startHour = start.getHours();
      const durationHours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
      return { ...event, dayIndex, startHour, durationHours };
    })
    .filter((event) => event.dayIndex >= 0 && event.dayIndex < 7);

  // Reference for scrolling the calendar body
  const calendarBodyRef = useRef(null);
  // On mount, scroll to 7:00 AM (7 * 60 = 420px)
  useEffect(() => {
    if (calendarBodyRef.current) {
      calendarBodyRef.current.scrollTop = 7 * 60;
    }
  }, []);

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <div className="time-label"></div>
        {days.map((day, index) => (
          <div key={index} className="day-header">
            {formatDayHeader(day)}
          </div>
        ))}
      </div>
      <div className="calendar-body" ref={calendarBodyRef}>
        <div className="time-column">
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              {formatTimeLabel(hour)}
            </div>
          ))}
        </div>
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="day-column">
            {hours.map((hour) => (
              <div key={hour} className="hour-slot">
                {processedEvents
                  .filter((ev) => ev.dayIndex === dayIndex && ev.startHour === hour)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="event-block"
                      style={{
                        backgroundColor: ev.color || '#2575fc',
                        height: `${ev.durationHours * 60}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent && onSelectEvent(ev);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onSelectEvent && onSelectEvent(ev);
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
