import { ButtonLink, Card, EmptyState, SectionHeader, StatCard } from "../components/ui.jsx";
import { loadMapFromLocalStorage } from "../data/storage";

function VenueList() {
  const map = loadMapFromLocalStorage();
  const rows = map?.length || 0;
  const cols = map?.[0]?.length || 0;
  const seats = rows * cols;

  return (
    <main className="page-container admin-page">
      <SectionHeader
        eyebrow="Inventario"
        title="Recintos guardados"
        description="Resumen del mapa de asientos actualmente almacenado para la demo."
        actions={<ButtonLink to="/admin/create">Crear o editar</ButtonLink>}
      />

      {map ? (
        <div className="metrics-grid">
          <StatCard label="Filas" value={rows} helper="Configuradas" />
          <StatCard label="Columnas" value={cols} helper="Por fila" />
          <StatCard label="Asientos" value={seats} helper="Capacidad total" tone="success" />
          <StatCard label="Estado" value="Local" helper="Guardado en este navegador" tone="warning" />
        </div>
      ) : (
        <EmptyState
          title="No hay recintos guardados todavía."
          description="Crea un mapa de asientos para activar la seleccion visual del comprador."
          action={<ButtonLink to="/admin/create">Crear recinto</ButtonLink>}
        />
      )}

      <Card className="venue-note">
        <h2>Siguiente paso recomendado</h2>
        <p>
          Conectar estos layouts a Supabase para que los recintos, eventos y asientos
          queden persistidos entre dispositivos.
        </p>
        <ButtonLink to="/admin" variant="ghost">Volver al panel</ButtonLink>
      </Card>
    </main>
  );
}

export default VenueList;
