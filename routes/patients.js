const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// GET all patients
router.get("/", async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        sex: true, // Include sex details in the response
      },
    });
    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// GET patient by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        sex: true, // Include sex details in the response
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// POST create a new patient
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, age, gender, phone, email, medicalHistory } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !age || !gender) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the sex ID based on the gender
    const sex = await prisma.sex.findFirst({
      where: { gender: gender }, // gender should be one of: MALE, FEMALE
    });

    if (!sex) {
      return res.status(400).json({ error: "Invalid gender" });
    }

    // Create the patient
    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        age: parseInt(age),
        sexId: sex.id,
        phone,
        email,
        medicalHistory,
      },
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error); // Log error for more details
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// PUT update patient by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, age, gender, phone, email, medicalHistory } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !age || !gender || !phone || !email || !medicalHistory) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the sex ID based on the gender enum
    const sex = await prisma.sex.findUnique({
      where: { gender: gender },
    });

    if (!sex) {
      return res.status(400).json({ error: "Invalid gender" });
    }

    // Update the patient
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`, // Update fullName when first or last name changes
        age: parseInt(age),
        sexId: sex.id,
        phone,
        email,
        medicalHistory,
      },
    });

    res.status(200).json({ message: "Patient updated successfully", patient: updatedPatient });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// DELETE patient by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the patient
    const deletedPatient = await prisma.patient.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Patient deleted successfully", patient: deletedPatient });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      // Prisma error code when the patient is not found
      return res.status(404).json({ error: "Patient not found" });
    }
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

// GET all sexes
router.get("/sexes", async (req, res) => {
  try {
    const sexes = await prisma.sex.findMany();
    res.status(200).json(sexes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sexes" });
  }
});

module.exports = router;
