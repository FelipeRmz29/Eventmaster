import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getEventosAdmin,
  getRecintos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} from '../services/api';

const EMPTY_FORM = { nombre: '', fecha: '', recinto_id: '' };

function fmtFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminEventos() {
  const [tab, setTab] = useState('lista'); // 'lista' | 'crear' | 'editar'
  const [eventos, setEventos] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [crearForm, setCrearForm] = useState(EMPTY_FORM);

  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    Promise.all([getEventosAdmin(), getRecintos()])
      .then(([evs, recs]) => { setEventos(evs); setRecintos(recs); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Crear ──────────────────────────────────────────────
  const handleCrear = async (e) => {
    e.preventDefault();
    if (!crearForm.nombre.trim() || !crearForm.fecha) {
      setError('Nombre y fecha son obligatorios'); return;
    }
    setSaving(true); setError(null);
    try {
      const nuevo = await crearEvento({
        nombre: crearForm.nombre,
        fecha: crearForm.fecha,
        recinto_id: crearForm.recinto_id ? Number(crearForm.recinto_id) : null,
      });
      setEventos((prev) => [...prev, nuevo]);
      setCrearForm(EMPTY_FORM);
      setTab('lista');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── Editar ─────────────────────────────────────────────
  const abrirEditar = (ev) => {
    setEditandoId(ev.id);
    setEditForm({
      nombre: ev.nombre,
      fecha: toDatetimeLocal(ev.fecha),
      recinto_id: ev.recinto_id ?? '',
      estado: ev.estado ?? 'publicado',
    });
    setError(null);
    setTab('editar');
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!editForm.nombre.trim() || !editForm.fecha) {
      setError('Nombre y fecha son obligatorios'); return;
    }
    setSaving(true); setError(null);
    try {
      const actualizado = await actualizarEvento(editandoId, {
        nombre: editForm.nombre,
        fecha: editForm.fecha,
        recinto_id: editForm.recinto_id ? Number(editForm.recinto_id) : null,
        estado: editForm.estado,
      });
      setEventos((prev) => prev.map((ev) => ev.id === editandoId ? actualizado : ev));
      setTab('lista');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── Toggle publicado/oculto ────────────────────────────
  const toggleEstado = async (ev) => {
    const nuevoEstado = ev.estado === 'publicado' ? 'oculto' : 'publicado';
    try {
      const actualizado = await actualizarEvento(ev.id, { estado: nuevoEstado });
      setEventos((prev) => prev.map((e) => e.id === ev.id ? actualizado : e));
    } catch (err) { alert('Error: ' + err.message); }
  };

  // ── Eliminar ───────────────────────────────────────────
  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar el evento "${nombre}"?`)) return;
    try {
      await eliminarEvento(id);
      setEventos((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { alert('Error: ' + err.message); }
  };

  const btnTab = (t) => ({
    padding: '10px 20px',
    background: tab === t ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
    color: 'white',
    border: '1px solid var(--border-soft)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: tab === t ? 700 : 400,
  });

  const badge = (estado) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: '0.8rem',
    fontWeight: 700,
    background: estado === 'publicado' ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.15)',
    color: estado === 'publicado' ? '#22c55e' : '#94a3b8',
    border: `1px solid ${estado === 'publicado' ? 'rgba(34,197,94,0.4)' : 'rgba(148,163,184,0.3)'}`,
  });

  const SelectRecinto = ({ value, onChange }) => (
    <select
      value={value}
      onChange={onChange}
      style={{ padding: '13px 14px', background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(148,163,184,0.22)', color: 'white', borderRadius: 12, fontSize: '1rem', width: '100%' }}
    >
      <option value="">— Sin recinto —</option>
      {recintos.map((r) => (
        <option key={r.id} value={r.id}>{r.nombre} ({r.capacidad} asientos)</option>
      ))}
    </select>
  );

  return (
    <div className="page-container">
      <div className="brand-bar">
        <div className="brand-block">
          <h1>Gestión de <span className="brand-highlight">eventos</span></h1>
        </div>
        <Link to="/admin" className="main-button ghost">← Panel</Link>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button style={btnTab('lista')} onClick={() => { setTab('lista'); setError(null); }}>Lista de eventos</button>
        <button style={btnTab('crear')} onClick={() => { setTab('crear'); setError(null); }}>+ Crear evento</button>
        {tab === 'editar' && <button style={btnTab('editar')}>Editando evento</button>}
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}

      {/* ── LISTA ── */}
      {tab === 'lista' && (
        <div className="section-card">
          {loading && <p className="empty-state">Cargando...</p>}
          {!loading && eventos.length === 0 && (
            <p className="empty-state">No hay eventos registrados todavía.</p>
          )}
          {eventos.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Nombre</th>
                  <th style={{ padding: '10px 12px' }}>Fecha</th>
                  <th style={{ padding: '10px 12px' }}>Recinto</th>
                  <th style={{ padding: '10px 12px' }}>Estado</th>
                  <th style={{ padding: '10px 12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ev.nombre}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-soft)' }}>{fmtFecha(ev.fecha)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {ev.recintos
                        ? ev.recintos.nombre
                        : <span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>⚠ Sin recinto</span>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={badge(ev.estado ?? 'publicado')}>
                        {ev.estado === 'oculto' ? 'Oculto' : 'Publicado'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => abrirEditar(ev)}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleEstado(ev)}
                          style={{ background: ev.estado === 'publicado' ? '#64748b' : '#22c55e', color: 'white', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          {ev.estado === 'publicado' ? 'Ocultar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => handleEliminar(ev.id, ev.nombre)}
                          style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── CREAR ── */}
      {tab === 'crear' && (
        <div className="form-card">
          <h2 className="section-title">Nuevo evento</h2>
          <form onSubmit={handleCrear}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre del evento</label>
                <input
                  type="text"
                  value={crearForm.nombre}
                  onChange={(e) => setCrearForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Congreso de Ingeniería 2025"
                />
              </div>
              <div className="form-group">
                <label>Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={crearForm.fecha}
                  onChange={(e) => setCrearForm((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Recinto</label>
              <SelectRecinto
                value={crearForm.recinto_id}
                onChange={(e) => setCrearForm((f) => ({ ...f, recinto_id: e.target.value }))}
              />
            </div>
            <button type="submit" className="main-button" disabled={saving}>
              {saving ? 'Creando...' : 'Crear evento'}
            </button>
          </form>
        </div>
      )}

      {/* ── EDITAR ── */}
      {tab === 'editar' && (
        <div className="form-card">
          <h2 className="section-title">Editar evento</h2>
          <form onSubmit={handleEditar}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre del evento</label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={editForm.fecha}
                  onChange={(e) => setEditForm((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Recinto</label>
                <SelectRecinto
                  value={editForm.recinto_id}
                  onChange={(e) => setEditForm((f) => ({ ...f, recinto_id: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Estado de visibilidad</label>
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm((f) => ({ ...f, estado: e.target.value }))}
                  style={{ padding: '13px 14px', background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(148,163,184,0.22)', color: 'white', borderRadius: 12, fontSize: '1rem', width: '100%' }}
                >
                  <option value="publicado">Publicado (visible para usuarios)</option>
                  <option value="oculto">Oculto (solo admin)</option>
                </select>
              </div>
            </div>
            <div className="button-group">
              <button type="submit" className="main-button" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" className="main-button ghost" onClick={() => setTab('lista')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminEventos;
