import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [message, setMessage] = useState("");

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      const data = await response.json();

      setContacts(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const addContact = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add contact");
        return;
      }

      setMessage("Contact added successfully!");

      setForm({
        name: "",
        email: "",
        phone: ""
      });

      fetchContacts();
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend");
    }
  };

  const deleteContact = async (id) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setMessage("Contact deleted successfully!");
        fetchContacts();
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete contact");
    }
  };

  return (
    <div className="container">

      <h1>Contact Management System</h1>

      <div className="card">

        <h2>Add Contact</h2>

        <form onSubmit={addContact}>

          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Enter Phone Number"
            value={form.phone}
            onChange={handleChange}
          />

          <button type="submit">
            Add Contact
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

      <div className="card">

        <h2>Contact List</h2>

        {contacts.length === 0 ? (
          <p>No contacts found.</p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {contacts.map((contact) => (
                <tr key={contact.id}>

                  <td>{contact.id}</td>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>

                  <td>
                    <button
                      className="delete"
                      onClick={() => deleteContact(contact.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default App;
