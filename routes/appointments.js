const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get pagination parameters from query (default to 1 page, 10 items per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const appointments = await prisma.appointment.findMany({
      skip,
      take: limit,
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
        status: {
          select: {
            status: true,
          },
        },
        type: {
          select: {
            type: true,
          },
        },
      },
    });

    // Optionally, you can also fetch the total count of appointments for pagination info
    const totalAppointments = await prisma.appointment.count();

    res.status(200).json({
      appointments,
      page,
      totalAppointments,
      totalPages: Math.ceil(totalAppointments / limit),
    });
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
        appointmentType: {
          select: {
            type: true,
          },
        },
        status: {
          select: {
            status: true, // Include the appointment status
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
    const { patientId, doctorId, typeId, date, time, additionalNotes, status } =
      req.body;

    // Ensure date is parsed correctly (set time to 00:00:00 if date is just 'YYYY-MM-DD')
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0); // Reset the time to midnight

    // Validate required fields
    if (!patientId || !doctorId || !typeId || !date || !time || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the status ID based on the status string (upcoming, completed, cancelled)
    const appointmentStatus = await prisma.appointmentStatus.findUnique({
      where: { status },
    });

    if (!appointmentStatus) {
      return res.status(400).json({ error: "Invalid appointment status" });
    }

    // If time is provided, create a new Date object for the time (optional)
    let appointmentTime = new Date(appointmentDate);
    const [hours, minutes] = time.split(":"); // Assuming time is in "HH:mm" format
    appointmentTime.setHours(hours, minutes, 0, 0);

    // Create the appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        typeId,
        date: appointmentDate, // Store the date with reset time
        time: appointmentTime, // Store the complete DateTime if time is provided
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
    if (error.code === "P2025") {
      // Prisma error code when the appointment is not found
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
    if (error.code === "P2025") {
      // Prisma error code when the appointment is not found
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
      where: { patientId: parseInt(patientId) }, // Filter by patientId
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
        appointmentType: {
          select: {
            type: true,
          },
        },
        status: {
          select: {
            status: true, // Include the appointment status
          },
        },
      },
    });

    if (appointments.length === 0) {
      return res
        .status(404)
        .json({ error: "No appointments found for this patient" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch appointments for the patient" });
  }
});

module.exports = router;
