const request = require("supertest");
const app = require("../backend/app");

jest.mock("../backend/src/services/supabase", () => ({
  from: jest.fn(),
}));

const supabase = require("../backend/src/services/supabase");

// Chain que soporta dos .order() y es awaitable
const mockSupabase = (data) => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    // Hace que await funcione sobre el chain directamente
    then: (resolve) => resolve({ data, error: null }),
  };
  supabase.from.mockReturnValue(chain);
};

describe("GET /asientos/:recintoId", () => {

  test("asiento disponible retorna estado 'disponible'", async () => {
    mockSupabase([
      { id: 1, recinto_id: 1, fila: "A", numero: 1, estado: "disponible" },
    ]);

    const res = await request(app).get("/asientos/1");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].estado).toBe("disponible");
  });

  test("asiento ocupado retorna estado 'ocupado'", async () => {
    mockSupabase([
      { id: 2, recinto_id: 1, fila: "B", numero: 1, estado: "ocupado" },
    ]);

    const res = await request(app).get("/asientos/1");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].estado).toBe("ocupado");
  });

  test("recinto inexistente retorna 200", async () => {
    mockSupabase([]); // Supabase devuelve vacío

    const res = await request(app).get("/asientos/99999");

    expect(res.statusCode).toBe(200);
    
  });

});