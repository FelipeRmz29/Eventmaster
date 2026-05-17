import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventoPorId, getAsientosPorRecinto, confirmarCompra } from '../services/api';
import SeatGrid from '../components/SeatGrid';

const MAX_SEATS = 2;

function buildGrid(seats, selectedIds, precioVip, precioGeneral) {
  const selectedSet = new Set(selectedIds);
  const rows = {};
  seats.forEach((seat) => {
    if (!rows[seat.fila]) rows[seat.fila] = [];
    let status = 'available';
    if (selectedSet.has(seat.id)) {
      status = 'selected';
    } else if (seat.estado !== 'disponible') {
      status = 'occupied';
    }
    const precio = seat.zona === 'VIP' ? precioVip : precioGeneral;
    rows[seat.fila].push({ id: seat.id, label: `${seat.fila}${seat.numero}`, status, zona: seat.zona, precio });
  });
  return Object.keys(rows)
    .sort()
    .map((row) => rows[row].sort((a, b) => parseInt(a.label.slice(1)) - parseInt(b.label.slice(1))));
}

function EventDetail() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // array de { id, label, zona, precio }
  const [form, setForm] = useState({ nombre: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState(''); // 'verificando' | 'pagando'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // { ticketIds, referenciaPago, _msg? }

  useEffect(() => {
    const load = async () => {
      try {
        const ev = await getEventoPorId(id);
        if (!ev) { setError('Evento no encontrado'); return; }
        setEvento(ev);
        const seatList = await getAsientosPorRecinto(ev.recinto_id);
        setSeats(seatList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const precioVip = evento?.recintos?.precio_vip ?? 300;
  const precioGeneral = evento?.recintos?.precio_general ?? 150;

  const handleSeatClick = (seat) => {
    if (seat.status === 'occupied') return;
    setSelectedSeats((prev) => {
      const ya = prev.find((s) => s.id === seat.id);
      if (ya) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, seat];
    });
  };

  const handleComprar = async () => {
    if (selectedSeats.length === 0 || !form.nombre.trim() || !form.email.trim()) return;
    setPurchasing(true);
    setError(null);
    try {
      setPurchaseStep('verificando');
      await new Promise(r => setTimeout(r, 300));
      setPurchaseStep('pagando');

      const asientos = selectedSeats.map((s) => ({ asiento_id: s.id, precio: s.precio }));
      const { blob, ticketIds, referenciaPago } = await confirmarCompra({
        nombre: form.nombre,
        email: form.email,
        evento_id: Number(id),
        asientos,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-eventmaster.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const compradosIds = new Set(selectedSeats.map((s) => s.id));
      setSeats((prev) => prev.map((s) => compradosIds.has(s.id) ? { ...s, estado: 'ocupado' } : s));
      setSelectedSeats([]);
      setForm({ nombre: '', email: '' });
      setSuccess({ ticketIds, referenciaPago });
      setTimeout(() => setSuccess(null), 8000);
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing(false);
      setPurchaseStep('');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: evento?.nombre,
      text: `${evento?.nombre} — EventMaster`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setSuccess({ referenciaPago: null, _msg: 'Link copiado al portapapeles' });
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (loading) return <div className="page-container"><p className="empty-state">Cargando evento...</p></div>;
  if (error && !evento) return (
    <div className="page-container">
      <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>
      <Link to="/events" className="main-button ghost">← Eventos</Link>
    </div>
  );

  const grid = buildGrid(seats, selectedSeats.map((s) => s.id), precioVip, precioGeneral);
  const fecha = evento?.fecha
    ? new Date(evento.fecha).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })
    : '';
  const total = selectedSeats.reduce((sum, s) => sum + s.precio, 0);

  const purchaseLabel = purchaseStep === 'verificando'
    ? 'Verificando disponibilidad...'
    : purchaseStep === 'pagando'
    ? 'Procesando pago...'
    : `Confirmar compra y descargar PDF${selectedSeats.length > 1 ? 's' : ''}`;

  return (
    <div className="page-container">
      <div className="brand-bar">
        <div className="brand-block">
          <h1>{evento?.nombre}</h1>
          <p>{fecha} · {evento?.recintos?.nombre}</p>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{evento?.recintos?.direccion}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="main-button ghost" onClick={handleShare}>Compartir</button>
          <Link to="/events" className="main-button ghost">← Eventos</Link>
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: 20 }}>
        <h2 className="section-title">Selecciona tu asiento</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ background: '#16a34a', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem' }}>General</span>
          <span style={{ background: '#7c3aed', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem' }}>VIP</span>
          <span style={{ background: '#eab308', color: '#111', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem' }}>Reservado</span>
          <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem' }}>Ocupado</span>
          <span style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem', border: '1px solid rgba(148,163,184,0.2)' }}>
            General ${precioGeneral} · VIP ${precioVip}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8', padding: '4px 12px', borderRadius: 999, fontSize: '0.82rem', border: '1px solid rgba(148,163,184,0.2)' }}>
            {selectedSeats.length}/{MAX_SEATS} seleccionados
          </span>
        </div>
        <div className="venue-layout">
          <div className="stage-banner">ESCENARIO</div>
          {seats.length === 0
            ? <p className="empty-state">Este recinto no tiene asientos configurados.</p>
            : <SeatGrid grid={grid} onSeatClick={handleSeatClick} />
          }
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="form-card">
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            {selectedSeats.length === 1 ? 'Asiento seleccionado' : 'Asientos seleccionados'}
          </h2>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            {selectedSeats.map((s) => (
              <span key={s.id} style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#fbbf24', padding: '6px 14px', borderRadius: 999, fontSize: '0.9rem', fontWeight: 700 }}>
                {s.label} · {s.zona} · ${s.precio}
              </span>
            ))}
            {selectedSeats.length > 1 && (
              <span style={{ color: 'var(--text-soft)', padding: '6px 0', fontSize: '0.9rem' }}>
                Total: <strong style={{ color: 'var(--text-main)' }}>${total}</strong>
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" placeholder="Juan Pérez" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" placeholder="juan@universidad.edu" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}

          <div className="button-group">
            <button
              className="main-button"
              onClick={handleComprar}
              disabled={purchasing || !form.nombre.trim() || !form.email.trim()}
              style={(purchasing || !form.nombre.trim() || !form.email.trim()) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {purchaseLabel}
            </button>
            <button className="main-button ghost" onClick={() => setSelectedSeats([])} disabled={purchasing}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {success && (
        <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 16, padding: '18px 22px', color: 'var(--success)', fontWeight: 600 }}>
          {success._msg ?? '¡Compra exitosa! Tu PDF fue descargado automáticamente.'}
          {success.referenciaPago && (
            <span style={{ display: 'block', marginTop: 6, fontSize: '0.88rem', fontWeight: 400, color: 'var(--text-soft)' }}>
              Referencia de pago: {success.referenciaPago}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default EventDetail;
