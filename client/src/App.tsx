import { useEffect, useState } from "react";
import axios from "axios";

type Item = {
  _id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

export const App = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<Item[]>("/api/items");
      setItems(res.data);
    } catch (err) {
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const health = await axios.get("/api/health");
        setApiHealthy(health.status === 200);
      } catch {
        setApiHealthy(false);
      }
      await loadItems();
    };

    void init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await axios.post("/api/items", { title, description });
      setTitle("");
      setDescription("");
      await loadItems();
    } catch {
      setError("Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Yapp MERN Demo</h1>
        <div className="status-row">
          <span
            className={`status-pill ${
              apiHealthy === null
                ? "pending"
                : apiHealthy
                ? "healthy"
                : "unhealthy"
            }`}
          >
            <span className="dot" />
            {apiHealthy === null
              ? "Checking API status…"
              : apiHealthy
              ? "API online"
              : "API unreachable"}
          </span>
          <span className="status-caption">
            Frontend on <code>http://localhost:3000</code>, API on{" "}
            <code>http://localhost:5000</code>
          </span>
        </div>
        <p className="subtitle">
          Simple corporate-style MERN stack example (React + Node + Mongo +
          Nginx + Docker)
        </p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Create Item</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quarterly planning"
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline priorities and milestones…"
              />
            </label>
            <button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Saving..." : "Add item"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Items</h2>
            <button
              type="button"
              className="secondary"
              onClick={() => void loadItems()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          {loading && items.length === 0 ? (
            <p>Loading items…</p>
          ) : items.length === 0 ? (
            <p className="muted">
              No items yet. Create your first item to test the stack.
            </p>
          ) : (
            <ul className="item-list">
              {items.map((item) => (
                <li key={item._id} className="item">
                  <h3>{item.title}</h3>
                  {item.description && (
                    <p className="description">{item.description}</p>
                  )}
                  {item.createdAt && (
                    <p className="meta">
                      Created{" "}
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};


