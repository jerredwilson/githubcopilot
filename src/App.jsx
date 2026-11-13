import React, { useState } from "react";

const STORAGE_KEY = "people-directory-users";
const EMPTY_USER = { name: "", email: "", phone: "", role: "", department: "" };
const FIELDS = [
  { name: "name", label: "Full name", placeholder: "e.g. Alex Morgan" },
  { name: "email", label: "Email address", placeholder: "alex@example.com", type: "email" },
  { name: "phone", label: "Phone number", placeholder: "+1 (555) 000-0000", type: "tel" },
  { name: "role", label: "Job title", placeholder: "e.g. Product Designer" },
  { name: "department", label: "Department", placeholder: "e.g. Design" },
];

function readUsers() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === null) return { users: [], error: "" };

    const users = JSON.parse(saved);
    if (
      !Array.isArray(users) ||
      users.some(
        (user) =>
          !user ||
          typeof user.id !== "string" ||
          FIELDS.some((field) => typeof user[field.name] !== "string"),
      )
    ) {
      throw new Error("Saved user data has an unexpected format.");
    }

    return { users, error: "" };
  } catch {
    return {
      users: [],
      error: "Saved user data could not be read. Creating or editing a user will replace it.",
    };
  }
}

function App() {
  const [initialData] = useState(readUsers);
  const [users, setUsers] = useState(initialData.users);
  const [storageError, setStorageError] = useState(initialData.error);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState("");

  function saveUsers(nextUsers) {
    setUsers(nextUsers);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
      setStorageError("");
    } catch {
      setStorageError("Your changes could not be saved to this browser's local storage.");
    }
  }

  function openForm(user = null) {
    setEditingUser(user ? { ...user } : { ...EMPTY_USER });
    setFormError("");
  }

  function submitUser(event) {
    event.preventDefault();
    const user = { ...editingUser, name: editingUser.name.trim() };
    if (!user.name || !user.email.trim()) {
      setFormError("Name and email address are required.");
      return;
    }
    user.email = user.email.trim();

    const nextUsers = editingUser.id
      ? users.map((existing) => (existing.id === editingUser.id ? user : existing))
      : [{ ...user, id: crypto.randomUUID() }, ...users];
    saveUsers(nextUsers);
    setEditingUser(null);
  }

  function deleteUser(user) {
    if (!window.confirm(`Delete ${user.name} from your directory?`)) return;
    saveUsers(users.filter((item) => item.id !== user.id));
  }

  const filteredUsers = users.filter((user) =>
    FIELDS.some((field) => user[field.name].toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Employees directory home">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>Employees<span className="brand-light"> directory</span></span>
        </a>
        <span className="privacy-note"><span className="privacy-dot" /> Stored on this device</span>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Employees</h1>
            <p className="subtitle">Keep your team’s contact details in one place.</p>
          </div>
          <button className="button button-primary" onClick={() => openForm()}>
            <span aria-hidden="true">＋</span> Add person
          </button>
        </div>

        {storageError && <p className="notice" role="alert">{storageError}</p>}

        <section className="directory-card" aria-label="Employees directory">
          <div className="directory-toolbar">
            <div>
              <h2>All employees <span className="count">{users.length}</span></h2>
              <p>{users.length === 1 ? "One person in your directory" : `${users.length} employees in your directory`}</p>
            </div>
            <label className="search-box">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <span className="sr-only">Search employees</span>
              <input
                type="search"
                placeholder="Search employees..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">♧</div>
              <h3>{query ? "No matching employees" : "Your directory is empty"}</h3>
              <p>{query ? "Try a different name, email, role, or department." : "Add your first person to get your directory started."}</p>
              {!query && (
                <button className="button button-secondary" onClick={() => openForm()}>
                  Add your first person
                </button>
              )}
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Job title</th>
                    <th scope="col">Department</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Email</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar">{user.name.trim().charAt(0).toUpperCase()}</span>
                          <span className="person-name">{user.name}</span>
                        </div>
                      </td>
                      <td>{user.role || <span className="muted">—</span>}</td>
                      <td>{user.department ? <span className="department-tag">{user.department}</span> : <span className="muted">—</span>}</td>
                      <td>{user.phone || <span className="muted">—</span>}</td>
                      <td><a className="email-link" href={`mailto:${user.email}`}>{user.email}</a></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" aria-label={`Edit ${user.name}`} onClick={() => openForm(user)}>Edit</button>
                          <button className="icon-button danger" aria-label={`Delete ${user.name}`} onClick={() => deleteUser(user)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {query && filteredUsers.length > 0 && (
            <div className="filter-summary">Showing {filteredUsers.length} of {users.length} employees</div>
          )}
        </section>
        <footer className="page-footer">Your directory is private and saved only in this browser.</footer>
      </section>

      {editingUser && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setEditingUser(null);
        }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editingUser.id ? "UPDATE DETAILS" : "NEW CONTACT"}</p>
                <h2 id="form-title">{editingUser.id ? "Edit person" : "Add a person"}</h2>
              </div>
              <button className="close-button" aria-label="Close form" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <p className="modal-description">Add the details you want to keep on hand.</p>
            <form onSubmit={submitUser}>
              <div className="form-grid">
                {FIELDS.map((field) => (
                  <label className={`form-field ${field.name === "name" || field.name === "email" ? "field-wide" : ""}`} key={field.name}>
                    <span>{field.label}{(field.name === "name" || field.name === "email") && <span className="required"> *</span>}</span>
                    <input
                      autoFocus={field.name === "name"}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      required={field.name === "name" || field.name === "email"}
                      value={editingUser[field.name]}
                      onChange={(event) => setEditingUser({ ...editingUser, [field.name]: event.target.value })}
                    />
                  </label>
                ))}
              </div>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="button button-primary">{editingUser.id ? "Save changes" : "Add person"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
