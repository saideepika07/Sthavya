import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// In-memory mocks for unit/integration testing with zero DB latency
const mockUsers = new Map();
const mockPlans = [];
const mockBookings = [];
let authToken = "";

const getTestJwtSecret = () => process.env.JWT_SECRET || "sthavyaspaces_jwt_dev_secret_fallback_key";

jest.unstable_mockModule("../config/db.js", () => ({
  connectDB: jest.fn().mockResolvedValue(true),
  getGridFSBucket: jest.fn().mockReturnValue(null),
  isDbConnected: jest.fn().mockReturnValue(true),
  default: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule("../models/User.js", () => {
  const MockUser = function (data) {
    Object.assign(this, data);
  };

  MockUser.findOne = jest.fn().mockImplementation((query) => {
    let found = null;
    if (query?.email) {
      found = mockUsers.get(query.email.toLowerCase());
    } else if (query?.mobile) {
      found = Array.from(mockUsers.values()).find((u) => u.mobile === query.mobile);
    } else if (query?.$or) {
      for (const cond of query.$or) {
        if (cond.mobile) {
          found = Array.from(mockUsers.values()).find((u) => u.mobile === cond.mobile);
          if (found) break;
        }
        if (cond.phone) {
          found = Array.from(mockUsers.values()).find((u) => u.phone === cond.phone || u.mobile === cond.phone);
          if (found) break;
        }
        if (cond.email) {
          found = mockUsers.get(cond.email.toLowerCase());
          if (found) break;
        }
      }
    }
    const mockUserInstance = found
      ? {
          ...found,
          matchPassword: async (pwd) => pwd === "SecurePassword123!",
          generateAuthToken: () =>
            jwt.sign({ id: found._id || "usr-test-1", email: found.email, role: found.role || "client" }, getTestJwtSecret(), { expiresIn: "7d" }),
          toObject: () => ({ ...found }),
        }
      : null;

    const promise = Promise.resolve(mockUserInstance);
    promise.select = () => Promise.resolve(mockUserInstance);
    return promise;
  });

  MockUser.findById = jest.fn().mockImplementation((id) => ({
    select: () =>
      Promise.resolve({
        _id: id || "usr-test-1",
        name: "Test Architect",
        email: "architect@test.example",
        role: "architect",
        city: "Bangalore",
      }),
  }));

  MockUser.create = jest.fn().mockImplementation((data) => {
    const created = {
      _id: "usr-test-1",
      ...data,
      generateAuthToken: () =>
        jwt.sign({ id: "usr-test-1", email: data.email, role: data.role || "client" }, getTestJwtSecret(), { expiresIn: "7d" }),
      toObject: () => ({ _id: "usr-test-1", ...data }),
    };
    mockUsers.set(data.email?.toLowerCase(), created);
    return Promise.resolve(created);
  });

  MockUser.findByIdAndUpdate = jest.fn().mockImplementation((id, update) => ({
    select: () =>
      Promise.resolve({
        _id: id,
        name: "Test Architect",
        email: "architect@test.example",
        ...update.$set,
      }),
  }));

  return {
    default: MockUser,
    User: MockUser,
  };
});

jest.unstable_mockModule("../models/HousePlan.js", () => {
  const MockHousePlan = function (data) {
    Object.assign(this, data);
  };

  MockHousePlan.create = jest.fn().mockImplementation((data) => {
    const plan = { _id: "plan-test-101", ...data };
    mockPlans.push(plan);
    return Promise.resolve(plan);
  });

  MockHousePlan.find = jest.fn().mockImplementation(() => ({
    sort: () => ({
      limit: () => Promise.resolve(mockPlans),
    }),
  }));

  MockHousePlan.findById = jest.fn().mockImplementation((id) =>
    Promise.resolve({
      _id: id,
      title: "Test Suite Modern Villa",
      isPublic: true,
      deleteOne: () => Promise.resolve(),
    })
  );

  MockHousePlan.findOne = jest.fn().mockImplementation(() =>
    Promise.resolve({
      _id: "plan-test-101",
      title: "Test Suite Modern Villa",
      isPublic: true,
    })
  );

  return {
    default: MockHousePlan,
    HousePlan: MockHousePlan,
  };
});

jest.unstable_mockModule("../models/Booking.js", () => {
  const MockBooking = function (data) {
    Object.assign(this, data);
  };

  MockBooking.create = jest.fn().mockImplementation((data) => {
    const booking = { _id: "book-test-201", ...data };
    mockBookings.push(booking);
    return Promise.resolve(booking);
  });

  MockBooking.find = jest.fn().mockImplementation(() => ({
    sort: () => ({
      limit: () => Promise.resolve(mockBookings),
    }),
  }));

  MockBooking.findById = jest.fn().mockImplementation((id) =>
    Promise.resolve({
      _id: id,
      bookingRef: "STHAVYA-IN-700101",
      status: "Confirmed",
      userId: "test-user-1",
      save: () => Promise.resolve(),
    })
  );

  MockBooking.findOne = jest.fn().mockImplementation(() =>
    Promise.resolve({
      _id: "book-test-201",
      bookingRef: "STHAVYA-IN-700101",
      status: "Confirmed",
    })
  );

  return {
    default: MockBooking,
    Booking: MockBooking,
  };
});

// Dynamic import after registering ESM mocks
const { default: app } = await import("../server.js");
const { generateMultiFloorLayout, parseFloorsCount, parseBhkNum } = await import("../utils/multiFloorGenerator.js");

beforeAll(() => {
  if (!authToken) {
    authToken = jwt.sign(
      { userId: "usr-test-101", id: "usr-test-101", _id: "usr-test-101", email: "architect@test.example", role: "architect" },
      getTestJwtSecret(),
      { expiresIn: "1d" }
    );
  }
});

describe("1. Health Check Endpoint", () => {
  it("GET /api/health returns operational status and gateway endpoints", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("operational");
    expect(res.body.endpoints).toHaveProperty("auth");
    expect(res.body.endpoints).toHaveProperty("housePlans");
    expect(res.body.endpoints).toHaveProperty("bookings");
  });
});

describe("2. Pure MERN Auth Workflow (/api/auth)", () => {
  const testEmail = "architect@test.example";

  it("POST /api/auth/register creates user with hashed password and returns JWT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Architect",
        email: testEmail,
        mobile: "9876543210",
        password: "SecurePassword123!",
        role: "architect",
        city: "Bangalore",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user).not.toHaveProperty("password");
    authToken = res.body.token;
  });

  it("POST /api/auth/register rejects duplicate registration by email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Duplicate User",
        email: testEmail,
        mobile: "9123456789",
        password: "AnotherPassword123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/register rejects duplicate registration by mobile", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Duplicate Mobile User",
        email: "different@test.example",
        mobile: "9876543210",
        password: "AnotherPassword123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login authenticates valid credentials via email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "SecurePassword123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
  });

  it("POST /api/auth/login authenticates valid credentials via mobile number", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        identifier: "9876543210",
        password: "SecurePassword123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
  });

  it("POST /api/auth/login rejects invalid password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "WrongPassword999!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/auth/me rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/logout clears session", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("3. House Plans API (/api/plans)", () => {
  let createdPlanId = "plan-test-101";

  it("POST /api/plans saves a floor plan layout", async () => {
    const res = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Suite Modern Villa",
        inputs: { width: "30", depth: "40", bhk: "3 BHK", style: "Modern" },
        rooms: [
          { id: "r1", label: "Great Room", x: 20, y: 20, w: 200, h: 140, sqFt: 280 },
          { id: "r2", label: "Master Suite", x: 20, y: 170, w: 180, h: 130, sqFt: 234 },
        ],
        isPublic: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.plan).toHaveProperty("_id");
    expect(res.body).toHaveProperty("shareUrl");
    createdPlanId = res.body.plan._id;
  });

  it("GET /api/plans returns catalog of public plans", async () => {
    const res = await request(app).get("/api/plans");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.plans)).toBe(true);
  });

  it("GET /api/plans/:id retrieves plan by id", async () => {
    const res = await request(app).get(`/api/plans/${createdPlanId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.plan.title).toContain("Test Suite");
  });
});

describe("4. Consultation Bookings API (/api/bookings)", () => {
  it("POST /api/bookings validates schema and creates consultation booking", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({
        clientName: "Deepika Tester",
        clientPhone: "+91 98765 11111",
        clientEmail: "deepika@test.example",
        workerId: "w2",
        workerName: "Ar. Elena Rostova",
        workerCategory: "Architect",
        days: 5,
        dayRate: 5500,
        scopeContext: "Structural CAD Feasibility Audit",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingRef).toMatch(/^STHAVYA-IN-/);
    expect(res.body.booking.totalCost).toBe(27500);
  });

  it("POST /api/bookings rejects payload failing Zod validation", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({
        clientName: "A", // min 2 chars
        clientPhone: "123", // min 7 digits
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/bookings returns list of bookings", async () => {
    const res = await request(app).get("/api/bookings");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });
});

describe("5. Multer File Upload API (/api/upload)", () => {
  it("POST /api/upload/blueprint uploads blueprint file buffer and returns URL", async () => {
    const fakeBlueprintBuffer = Buffer.from("<svg><rect width='100' height='100'/></svg>", "utf-8");
    const res = await request(app)
      .post("/api/upload/blueprint")
      .attach("file", fakeBlueprintBuffer, "test-blueprint.svg");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toBeDefined();
    expect(typeof res.body.url).toBe("string");
  });

  it("POST /api/upload/interior uploads interior image buffer and returns URL", async () => {
    const fakeImageBuffer = Buffer.from("fake-png-binary-content", "utf-8");
    const res = await request(app)
      .post("/api/upload/interior")
      .attach("file", fakeImageBuffer, "test-room.png");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toBeDefined();
    expect(typeof res.body.url).toBe("string");
  });

  it("POST /api/upload/blueprint returns 400 when no file attached", async () => {
    const res = await request(app).post("/api/upload/blueprint");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("6. Multi-Floor Architectural Blueprint Engine & API", () => {
  describe("Structural Multi-Floor Generator Invariants", () => {
    it("generates G+1 layout without penthouse (2 floors)", () => {
      const plan = generateMultiFloorLayout({
        width: 30,
        depth: 45,
        bhk: "2 BHK",
        floors: "G+1",
        hasPenthouse: false,
      });

      expect(plan.floorsCount).toBe(2);
      expect(plan.hasPenthouse).toBe(false);
      expect(plan.floors).toHaveLength(2);
      expect(plan.floors[0].label).toBe("Ground Floor");
      expect(plan.floors[1].label).toBe("1st Floor");

      // Verify identical staircase coordinates
      expect(plan.floors[0].staircase).toEqual(plan.floors[1].staircase);
      expect(plan.floors[0].staircase.x).toBe(48);
      expect(plan.floors[0].staircase.y).toBe(50);
    });

    it("generates G+1 layout with penthouse (3 floors)", () => {
      const plan = generateMultiFloorLayout({
        width: 30,
        depth: 50,
        bhk: "3 BHK",
        floors: "G+1",
        hasPenthouse: true,
      });

      expect(plan.floorsCount).toBe(3);
      expect(plan.hasPenthouse).toBe(true);
      expect(plan.floors).toHaveLength(3);
      expect(plan.floors[2].label).toBe("Penthouse");

      // Penthouse components
      const phRooms = plan.floors[2].rooms.map((r) => r.name);
      expect(phRooms.some((n) => n.includes("Penthouse") || n.includes("Master"))).toBe(true);
      expect(phRooms.some((n) => n.includes("Terrace"))).toBe(true);
    });

    it("generates G+2 layout without and with penthouse", () => {
      const planWithout = generateMultiFloorLayout({
        width: 35,
        depth: 50,
        bhk: "3 BHK",
        floors: "G+2",
        hasPenthouse: false,
      });
      expect(planWithout.floorsCount).toBe(3);
      expect(planWithout.floors).toHaveLength(3);

      const planWith = generateMultiFloorLayout({
        width: 35,
        depth: 50,
        bhk: "3 BHK",
        floors: "G+2",
        hasPenthouse: true,
      });
      expect(planWith.floorsCount).toBe(4);
      expect(planWith.floors).toHaveLength(4);
      expect(planWith.floors[3].label).toBe("Penthouse");
    });

    it("generates G+3 layout without penthouse (4 floors)", () => {
      const plan = generateMultiFloorLayout({
        width: 40,
        depth: 60,
        bhk: "3 BHK",
        floors: "G+3",
        hasPenthouse: false,
      });
      expect(plan.floorsCount).toBe(4);
      expect(plan.floors).toHaveLength(4);
      expect(plan.floors[0].label).toBe("Ground Floor");
      expect(plan.floors[3].label).toBe("3rd Floor");
    });

    it("generates G+4 layout without and with penthouse", () => {
      const planG4 = generateMultiFloorLayout({
        width: 40,
        depth: 60,
        bhk: "4 BHK",
        floors: "G+4",
        hasPenthouse: false,
      });
      expect(planG4.floorsCount).toBe(5);
      expect(planG4.floors).toHaveLength(5);
      expect(planG4.floors[4].label).toBe("4th Floor");

      const planG4Ph = generateMultiFloorLayout({
        width: 40,
        depth: 60,
        bhk: "4 BHK",
        floors: "G+4",
        hasPenthouse: true,
      });
      expect(planG4Ph.floorsCount).toBe(6);
      expect(planG4Ph.floors).toHaveLength(6);
      expect(planG4Ph.floors[5].label).toBe("Penthouse");

      // Verify all 6 floors share identical vertical circulation core
      const core = planG4Ph.floors[0].staircase;
      planG4Ph.floors.forEach((fl) => {
        expect(fl.staircase.x).toBe(core.x);
        expect(fl.staircase.y).toBe(core.y);
        expect(fl.staircase.w).toBe(core.w);
        expect(fl.staircase.h).toBe(core.h);
      });
    });

    it("verifies 1 BHK, 2 BHK, 3 BHK bedroom en-suite bathroom guarantee", () => {
      const configurations = ["1 BHK", "2 BHK", "3 BHK", "4 BHK"];
      configurations.forEach((bhk) => {
        const plan = generateMultiFloorLayout({
          width: 30,
          depth: 50,
          bhk,
          floors: "G+1",
        });

        // Check attached bathrooms for all bedrooms
        plan.floors.forEach((fl) => {
          const bedrooms = fl.rooms.filter((r) => r.type === "bedroom" || r.type === "master_bed");
          const baths = fl.rooms.filter((r) => r.type === "bath");
          if (bedrooms.length > 0) {
            expect(baths.length).toBeGreaterThanOrEqual(1);
            baths.forEach((b) => {
              expect(b.isEnSuite).toBe(true);
            });
          }
        });
      });
    });
  });

  describe("Multi-Floor AI Gateway API (/api/ai/generate-multifloor)", () => {
    it("POST /api/ai/generate-multifloor generates consistent multi-level plan", async () => {
      const res = await request(app)
        .post("/api/ai/generate-multifloor")
        .send({
          width: 30,
          depth: 45,
          bhk: "3 BHK",
          floors: "G+2",
          hasPenthouse: true,
          facing: "North",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("floors");
      expect(res.body.data.floorsCount).toBe(4); // G + 2 upper + Penthouse
      expect(res.body.data.hasPenthouse).toBe(true);
      expect(Array.isArray(res.body.data.floors)).toBe(true);
      expect(res.body.data.floors[3].label).toBe("Penthouse");
    });
  });

  describe("Multi-Floor Plan Model Persistence & Migration (/api/plans)", () => {
    it("POST /api/plans stores floorsCount, hasPenthouse, and multi-floor array", async () => {
      const multiFloorData = generateMultiFloorLayout({
        width: 30,
        depth: 45,
        bhk: "3 BHK",
        floors: "G+1",
        hasPenthouse: false,
      });

      const res = await request(app)
        .post("/api/plans")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Multi-Floor 3 BHK Luxury Villa",
          inputs: { width: "30", depth: "45", bhk: "3 BHK", floors: "G+1" },
          floorsCount: multiFloorData.floorsCount,
          hasPenthouse: multiFloorData.hasPenthouse,
          floors: multiFloorData.floors,
          rooms: multiFloorData.rooms,
          isPublic: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.plan).toHaveProperty("_id");
      expect(res.body.plan.floorsCount).toBe(2);
      expect(res.body.plan.floors).toHaveLength(2);
    });
  });
});

