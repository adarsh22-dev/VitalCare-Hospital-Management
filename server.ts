import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("hospital.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    doctor_id INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    symptoms TEXT,
    priority TEXT DEFAULT 'Normal',
    internal_notes TEXT
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    experience TEXT DEFAULT '10 years',
    availability TEXT DEFAULT 'Available',
    image TEXT,
    patients_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transport_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'Ambulance' or 'Air Ambulance'
    patient_name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'Dispatched',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS beds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ICU', 'General', 'Private'
    status TEXT DEFAULT 'Available', -- 'Available', 'Occupied', 'Cleaning'
    patient_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    price REAL,
    expiry_date TEXT
  );

  CREATE TABLE IF NOT EXISTS lab_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    test_name TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS billing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Unpaid', -- 'Unpaid', 'Paid', 'Partial'
    type TEXT, -- 'OPD', 'IPD', 'Pharmacy', 'Lab'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec("ALTER TABLE appointments ADD COLUMN internal_notes TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE appointments ADD COLUMN age INTEGER");
} catch (e) {}

try {
  db.exec("ALTER TABLE appointments ADD COLUMN gender TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE appointments ADD COLUMN blood_group TEXT");
} catch (e) {}

// Seed Initial Data
const bedCount = db.prepare("SELECT COUNT(*) as count FROM beds").get() as { count: number };
if (bedCount.count === 0) {
  const insertBed = db.prepare("INSERT INTO beds (room_number, type, status) VALUES (?, ?, ?)");
  insertBed.run("ICU-101", "ICU", "Available");
  insertBed.run("ICU-102", "ICU", "Occupied");
  insertBed.run("GEN-201", "General", "Available");
  insertBed.run("GEN-202", "General", "Cleaning");
  insertBed.run("PRI-301", "Private", "Available");
}

const pharmacyCount = db.prepare("SELECT COUNT(*) as count FROM pharmacy_inventory").get() as { count: number };
if (pharmacyCount.count === 0) {
  const insertMed = db.prepare("INSERT INTO pharmacy_inventory (name, category, stock, price, expiry_date) VALUES (?, ?, ?, ?, ?)");
  insertMed.run("Paracetamol", "Analgesic", 500, 5.50, "2025-12-01");
  insertMed.run("Amoxicillin", "Antibiotic", 200, 15.00, "2025-06-15");
  insertMed.run("Insulin", "Diabetes", 50, 45.00, "2024-11-20");
}

const labCount = db.prepare("SELECT COUNT(*) as count FROM lab_tests").get() as { count: number };
if (labCount.count === 0) {
  const insertLab = db.prepare("INSERT INTO lab_tests (patient_name, test_name, status, result) VALUES (?, ?, ?, ?)");
  insertLab.run("John Doe", "Blood Count", "Completed", "Normal");
  insertLab.run("Jane Smith", "Lipid Profile", "In Progress", null);
  insertLab.run("Robert Brown", "COVID-19 PCR", "Pending", null);
}

const billingCount = db.prepare("SELECT COUNT(*) as count FROM billing").get() as { count: number };
if (billingCount.count === 0) {
  const insertBill = db.prepare("INSERT INTO billing (patient_name, amount, status, type) VALUES (?, ?, ?, ?)");
  insertBill.run("John Doe", 150.00, "Paid", "OPD");
  insertBill.run("Jane Smith", 1200.00, "Unpaid", "IPD");
  insertBill.run("Robert Brown", 45.50, "Paid", "Pharmacy");
}

try {
  db.exec("ALTER TABLE doctors ADD COLUMN experience TEXT DEFAULT '10 years'");
} catch (e) {}

try {
  db.exec("ALTER TABLE doctors ADD COLUMN image TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE doctors ADD COLUMN patients_count INTEGER DEFAULT 0");
} catch (e) {}

// Seed Doctors if empty
const doctorCount = db.prepare("SELECT COUNT(*) as count FROM doctors").get() as { count: number };
if (doctorCount.count === 0) {
  const insertDoctor = db.prepare("INSERT INTO doctors (name, specialty, experience, image, patients_count) VALUES (?, ?, ?, ?, ?)");
  insertDoctor.run("Dr. Sarah Smith", "Cardiology", "12 years", "https://picsum.photos/seed/doc1/200/200", 124);
  insertDoctor.run("Dr. Mike Ross", "Neurology", "8 years", "https://picsum.photos/seed/doc2/200/200", 89);
  insertDoctor.run("Dr. Lisa Wong", "Orthopedics", "15 years", "https://picsum.photos/seed/doc3/200/200", 210);
  insertDoctor.run("Dr. James Wilson", "Pediatrics", "10 years", "https://picsum.photos/seed/doc4/200/200", 156);
  insertDoctor.run("Dr. Anna Baker", "Dermatology", "6 years", "https://picsum.photos/seed/doc5/200/200", 45);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/doctors", (req, res) => {
    const doctors = db.prepare("SELECT * FROM doctors").all();
    res.json(doctors);
  });

  app.post("/api/doctors", (req, res) => {
    const { name, specialty, experience, image } = req.body;
    const info = db.prepare(`
      INSERT INTO doctors (name, specialty, experience, image, availability)
      VALUES (?, ?, ?, ?, 'Available')
    `).run(name, specialty, experience || '10 years', image || `https://picsum.photos/seed/${name}/200/200`);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/patients", (req, res) => {
    const patients = db.prepare(`
      SELECT DISTINCT patient_name as name, patient_email as email, symptoms as condition, date as lastVisit
      FROM appointments 
      GROUP BY patient_name
      ORDER BY date DESC
    `).all();
    res.json(patients);
  });

  app.get("/api/stats", (req, res) => {
    const totalPatients = db.prepare("SELECT COUNT(DISTINCT patient_name) as count FROM appointments").get() as any;
    const totalAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments").get() as any;
    const availableDoctors = db.prepare("SELECT COUNT(*) as count FROM doctors WHERE availability = 'Available'").get() as any;
    const totalTransport = db.prepare("SELECT COUNT(*) as count FROM transport_bookings").get() as any;

    res.json({
      totalPatients: totalPatients.count,
      totalAppointments: totalAppointments.count,
      availableDoctors: availableDoctors.count,
      totalTransport: totalTransport.count
    });
  });

  app.get("/api/activities", (req, res) => {
    const appts = db.prepare("SELECT patient_name as user, 'Booked an appointment' as action, date as time, 'bg-indigo-500' as color FROM appointments ORDER BY id DESC LIMIT 5").all();
    const transports = db.prepare("SELECT patient_name as user, 'Requested ' || type as action, timestamp as time, 'bg-rose-500' as color FROM transport_bookings ORDER BY id DESC LIMIT 5").all();
    
    const activities = [...appts, ...transports].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
    res.json(activities);
  });

  app.get("/api/appointments", (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, d.name as doctor_name 
      FROM appointments a 
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date DESC, a.time DESC
    `).all();
    res.json(appointments);
  });

  app.post("/api/appointments", (req, res) => {
    const { patient_name, patient_email, doctor_id, date, time, type, symptoms, priority } = req.body;
    const info = db.prepare(`
      INSERT INTO appointments (patient_name, patient_email, doctor_id, date, time, type, symptoms, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patient_name, patient_email, doctor_id, date, time, type, symptoms, priority || 'Normal');
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/appointments/:id", (req, res) => {
    const { id } = req.params;
    const { status, doctor_id, priority, internal_notes } = req.body;
    
    const updates: string[] = [];
    const params: any[] = [];

    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
    }
    if (doctor_id !== undefined) {
      updates.push("doctor_id = ?");
      params.push(doctor_id);
    }
    if (priority !== undefined) {
      updates.push("priority = ?");
      params.push(priority);
    }
    if (internal_notes !== undefined) {
      updates.push("internal_notes = ?");
      params.push(internal_notes);
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE appointments SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    res.json({ success: true });
  });

  app.get("/api/transport", (req, res) => {
    const bookings = db.prepare("SELECT * FROM transport_bookings ORDER BY timestamp DESC").all();
    res.json(bookings);
  });

  app.post("/api/transport", (req, res) => {
    const { type, patient_name, location } = req.body;
    const info = db.prepare(`
      INSERT INTO transport_bookings (type, patient_name, location)
      VALUES (?, ?, ?)
    `).run(type, patient_name, location);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/chart-data", (req, res) => {
    const data = db.prepare(`
      SELECT 
        strftime('%w', date) as day_num,
        CASE strftime('%w', date)
          WHEN '0' THEN 'Sun'
          WHEN '1' THEN 'Mon'
          WHEN '2' THEN 'Tue'
          WHEN '3' THEN 'Wed'
          WHEN '4' THEN 'Thu'
          WHEN '5' THEN 'Fri'
          WHEN '6' THEN 'Sat'
        END as name,
        COUNT(*) as patients
      FROM appointments
      WHERE date >= date('now', '-7 days')
      GROUP BY day_num
      ORDER BY day_num ASC
    `).all();
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullData = days.map(day => {
      const found = data.find(d => d.name === day);
      return found || { name: day, patients: Math.floor(Math.random() * 20) + 10 };
    });

    res.json(fullData);
  });

  // Bed Management
  app.get("/api/beds", (req, res) => {
    const beds = db.prepare("SELECT * FROM beds").all();
    res.json(beds);
  });

  app.patch("/api/beds/:id", (req, res) => {
    const { id } = req.params;
    const { status, patient_id } = req.body;
    db.prepare("UPDATE beds SET status = ?, patient_id = ? WHERE id = ?").run(status, patient_id, id);
    res.json({ success: true });
  });

  // Pharmacy
  app.get("/api/pharmacy", (req, res) => {
    const items = db.prepare("SELECT * FROM pharmacy_inventory").all();
    res.json(items);
  });

  app.post("/api/pharmacy", (req, res) => {
    const { name, category, stock, price, expiry_date } = req.body;
    db.prepare("INSERT INTO pharmacy_inventory (name, category, stock, price, expiry_date) VALUES (?, ?, ?, ?, ?)").run(name, category, stock, price, expiry_date);
    res.json({ success: true });
  });

  // Lab Tests
  app.get("/api/lab-tests", (req, res) => {
    const tests = db.prepare("SELECT * FROM lab_tests ORDER BY timestamp DESC").all();
    res.json(tests);
  });

  app.post("/api/lab-tests", (req, res) => {
    const { patient_name, test_name } = req.body;
    db.prepare("INSERT INTO lab_tests (patient_name, test_name) VALUES (?, ?)").run(patient_name, test_name);
    res.json({ success: true });
  });

  // Billing
  app.get("/api/billing", (req, res) => {
    const bills = db.prepare("SELECT * FROM billing ORDER BY timestamp DESC").all();
    res.json(bills);
  });

  app.post("/api/billing", (req, res) => {
    const { patient_name, amount, type } = req.body;
    db.prepare("INSERT INTO billing (patient_name, amount, type) VALUES (?, ?, ?)").run(patient_name, amount, type);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
