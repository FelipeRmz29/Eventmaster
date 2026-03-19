import WebSocketPanel from "./components/WebSocketPanel";

function App() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        
        {/* HEADER */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              🎟️ EventMaster
            </h1>
            <p className="text-sm text-slate-400">
              Plataforma de gestión y venta de eventos
            </p>
          </div>

          <button className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium hover:bg-blue-700 transition">
            Explorar eventos
          </button>
        </header>

        {/* HERO */}
        <section className="mb-10 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-2">
            Vive los mejores eventos 🎶
          </h2>
          <p className="text-white/80">
            Compra boletos, descubre experiencias y mantente conectado en tiempo real.
          </p>
        </section>

        {/* GRID */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* EVENTOS */}
          <section className="lg:col-span-2 rounded-2xl bg-slate-900 p-6 shadow-xl border border-slate-800">
            <h3 className="text-lg font-semibold mb-4">Eventos Destacados</h3>

            <div className="grid gap-4 md:grid-cols-2">
              
              <div className="rounded-xl bg-slate-800 p-4 hover:scale-[1.02] transition">
                <p className="text-sm text-slate-400">Concierto</p>
                <h4 className="font-bold">Bad Bunny Tour</h4>
                <p className="text-xs text-slate-500">Guadalajara</p>
              </div>

              <div className="rounded-xl bg-slate-800 p-4 hover:scale-[1.02] transition">
                <p className="text-sm text-slate-400">Festival</p>
                <h4 className="font-bold">EDC México</h4>
                <p className="text-xs text-slate-500">CDMX</p>
              </div>

            </div>
          </section>

          {/* WEBSOCKET PANEL */}
          <div className="lg:col-span-1">
            <WebSocketPanel />
          </div>

        </div>
      </div>
    </main>
  );
}

export default App;
