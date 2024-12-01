const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        type: {
          select: {
            type: true,
          },
        },
        status: {
          select: {
            status: true,
          },
        },
      },
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// GET appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        type: {
          select: {
            type: true,
          },
        },
        status: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// POST create a new appointment
router.post("/", async (req, res) => {
  try {
    const { patientId, doctorId, typeId, date, time, additionalNotes, status } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !typeId || !date || !time || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the status ID based on the AppointmentStatusEnum
    const appointmentStatus = await prisma.appointmentStatus.findUnique({
      where: { status: status }, // status should be one of: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, MISSED
    });

    if (!appointmentStatus) {
      return res.status(400).json({ error: "Invalid appointment status" });
    }

    // Create the appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        typeId: parseInt(typeId),
        date: new Date(date),
        time: new Date(time),
        additionalNotes,
        statusId: appointmentStatus.id,
      },
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// PUT update appointment by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, additionalNotes, status } = req.body;

    // Find the status ID based on the status string (upcoming, completed, cancelled)
    const appointmentStatus = await prisma.appointmentStatus.findUnique({
      where: { status },
    });

    if (!appointmentStatus) {
      return res.status(400).json({ error: "Invalid appointment status" });
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        date,
        time,
        additionalNotes,
        statusId: appointmentStatus.id,
      },
    });

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {  // Prisma error code when the appointment is not found
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// DELETE appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the appointment
    const deletedAppointment = await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json(deletedAppointment);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {  // Prisma error code when the appointment is not found
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

// GET appointments for a specific patient by patientId
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find all appointments for the given patientId
    const appointments = await prisma.appointment.findMany({
      where: { patientId: parseInt(patientId) },  // Filter by patientId
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        type: {
          select: {
            type: true,
          },
        },
        status: {
          select: {
            status: true,
          },
        },
      },
    });

    if (appointments.length === 0) {
      return res.status(404).json({ error: "No appointments found for this patient" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments for the patient" });
  }
});

module.exports = router;
