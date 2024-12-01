const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());

// Global error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', req.body);
    return res.status(400).send({ 
      error: 'Invalid JSON', 
      details: err.message 
    });
  }
  next(err);
});

// Routes
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const queueRoutes = require("./routes/queue");
const paymentRoutes = require("./routes/payment");
const doctorRoutes = require("./routes/doctors");
const typesRoutes = require("./routes/types");
const specialtiesRoutes = require("./routes/specialties");

app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/queue", queueRoutes);
app.use("/payments", paymentRoutes);
app.use("/doctors", doctorRoutes);
app.use("/types", typesRoutes);
app.use("/specialties", specialtiesRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error("Error starting the server:", err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});