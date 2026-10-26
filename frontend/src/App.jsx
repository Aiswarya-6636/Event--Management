
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/events";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  category: "Other",
};

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch events from MongoDB through the backend
  async function fetchEvents() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API);
      setEvents(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load events. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle changes in the form
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  // Add a new event or update an existing event
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
        setMessage("Event updated successfully!");
      } else {
        await axios.post(API, form);
        setMessage("Event added successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save the event."
      );
    } finally {
      setSaving(false);
    }
  }

  // Load event details into the form for editing
  function handleEdit(event) {
    setEditingId(event._id);

    const dateValue = new Date(event.date);
    const localDate = [
      dateValue.getFullYear(),
      String(dateValue.getMonth() + 1).padStart(2, "0"),
      String(dateValue.getDate()).padStart(2, "0"),
    ].join("-");

    setForm({
      title: event.title || "",
      description: event.description || "",
      date: localDate,
      time: event.time || "",
      venue: event.venue || "",
      category: event.category || "Other",
    });

    setError("");
    setMessage("");
    document.getElementById("manage")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // Delete an event
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await axios.delete(`${API}/${id}`);
      setEvents((previous) =>
        previous.filter((event) => event._id !== id)
      );

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Event deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete the event."
      );
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">E</span>
          Eventora
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#events">Events</a>
          <a href="#manage">Manage Events</a>
        </nav>
      </header>

      <main id="home">
        <section className="hero">
          <p className="eyebrow">YOUR EVENTS, ORGANIZED</p>
          <h1>Make Every Event Memorable.</h1>
          <p>
            Create, organize, and manage all your events in one place.
          </p>
          <a className="hero-button" href="#manage">
            + Create an Event
          </a>
        </section>

        <section id="manage" className="form-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVENT MANAGEMENT</p>
              <h2>{editingId ? "Update Event" : "Create an Event"}</h2>
            </div>
          </div>

          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="alert success" role="status">
              {message}
            </div>
          )}

          <form className="event-form" onSubmit={handleSubmit}>
            <label>
              Event Name *
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Annual Tech Fest"
                maxLength={120}
                required
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Other</option>
                <option>Conference</option>
                <option>Workshop</option>
                <option>Music</option>
                <option>Sports</option>
                <option>College</option>
                <option>Wedding</option>
                <option>Party</option>
              </select>
            </label>

            <label>
              Event Date *
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Event Time *
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
              />
            </label>

            <label className="full-width">
              Venue *
              <input
                type="text"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Enter the event venue"
                maxLength={200}
                required
              />
            </label>

            <label className="full-width">
              Description *
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                rows={4}
                maxLength={2000}
                required
              />
            </label>

            <div className="form-actions full-width">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Event"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section id="events" className="events-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DISCOVER YOUR SCHEDULE</p>
              <h2>All Events</h2>
            </div>

            <span className="event-count">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {loading ? (
            <p className="loading-text">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">▦</span>
              <h3>No events yet</h3>
              <p>Add your first event using the form above.</p>
              <a className="empty-link" href="#manage">
                Create your first event
              </a>
            </div>
          ) : (
            <div className="event-grid">
              {events.map((event) => (
                <article className="event-card" key={event._id}>
                  <div className="card-top">
                    <span className="category-tag">
                      {event.category || "Other"}
                    </span>
                    <span className="calendar-icon">▣</span>
                  </div>

                  <h3>{event.title}</h3>

                  <p className="description">{event.description}</p>

                  <div className="event-detail">
                    <span aria-hidden="true">📅</span>
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="event-detail">
                    <span aria-hidden="true">◷</span>
                    <span>{event.time}</span>
                  </div>

                  <div className="event-detail">
                    <span aria-hidden="true">⌖</span>
                    <span>{event.venue}</span>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>Eventora · Event Management System</p>
        <p>Built with React, Express, and MongoDB</p>
      </footer>
    </div>
  );
}

export default App;
