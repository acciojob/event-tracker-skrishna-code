
import React, { useState } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import Popup from "react-popup";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-popup/style.css";
import "./App.css";

const localizer = momentLocalizer(moment);

function App() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [editing, setEditing] = useState(false);

  const openCreate = ({ start }) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setTitle("");
    setLocation("");
    setEditing(false);
    Popup.create({
      title: "Create Event",
      content: "Enter your event details below.",
      buttons: {
        right: [{
          text: "Continue",
          className: "mm-popup__btn--info",
          action: popup => popup.close()
        }]
      }
    });
  };

  const saveEvent = () => {
    if (!title.trim() || !location.trim()) {
      alert("Please enter both title and location.");
      return;
    }

    if (editing && selectedEvent) {
      setEvents(prev =>
        prev.map(event =>
          event.id === selectedEvent.id
            ? { ...event, title, location }
            : event
        )
      );
    } else {
      const start = new Date(selectedDate);
      start.setHours(12, 0, 0, 0);

      setEvents(prev => [
        ...prev,
        {
          id: Date.now(),
          title: title.trim(),
          location: location.trim(),
          start,
          end: start,
          allDay: true
        }
      ]);
    }

    setSelectedEvent(null);
    setEditing(false);
    setTitle("");
    setLocation("");
  };

  const openEvent = event => {
    setSelectedEvent(event);
    setTitle(event.title);
    setLocation(event.location);
    setEditing(false);

    Popup.create({
      title: event.title,
      content: `${event.location}`,
      buttons: {
        left: [{
          text: "Delete",
          className: "mm-popup__btn--danger",
          action: popup => {
            setEvents(prev => prev.filter(e => e.id !== event.id));
            popup.close();
          }
        }],
        right: [{
          text: "Edit",
          className: "mm-popup__btn--info",
          action: popup => {
            popup.close();
            setEditing(true);
          }
        }]
      }
    });
  };

  const filteredEvents = events.filter(event => {
    const isPast = moment(event.start).isBefore(moment(), "day");

    if (filter === "Past") return isPast;
    if (filter === "Upcoming") return !isPast;
    return true;
  });

  const eventStyleGetter = event => {
    const isPast = moment(event.start).isBefore(moment(), "day");

    return {
      style: {
        backgroundColor: isPast
          ? "rgb(222, 105, 135)"
          : "rgb(140, 189, 76)",
        borderRadius: "4px",
        color: "white",
        border: "none"
      }
    };
  };

  return (
    <div className="app">
      <h1>Event Tracker Calendar</h1>

      <div className="filters">
        {["All", "Past", "Upcoming"].map(item => (
          <button
            key={item}
            className="btn"
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="calendar">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={openCreate}
          onSelectEvent={openEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: 550 }}
        />
      </div>

      <Popup />

      {editing && selectedEvent && (
        <div className="editor-overlay">
          <div className="editor">
            <h2>Edit Event</h2>

            <input
              placeholder="Event Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <input
              placeholder="Event Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />

            <div className="editor-actions">
              <button
                className="mm-popup__btn"
                onClick={() => {
                  setEditing(false);
                  setSelectedEvent(null);
                }}
              >
                Cancel
              </button>

              <button
                className="mm-popup__btn"
                onClick={saveEvent}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="btn create-btn"
        onClick={() => openCreate({ start: selectedDate })}
      >
        Create Event
      </button>

      {/* Accessible event creation form */}
      <div className="creation-form">
        <h2>Add Event</h2>

        <input
          type="date"
          aria-label="Event Date"
          value={moment(selectedDate).format("YYYY-MM-DD")}
          onChange={e => {
            if (e.target.value) {
              setSelectedDate(new Date(e.target.value + "T12:00:00"));
            }
          }}
        />

        <input
          placeholder="Event Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          placeholder="Event Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />

        <button
          className="mm-popup__btn"
          onClick={saveEvent}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default App;
