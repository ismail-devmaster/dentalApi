const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// GET all specialties
router.get("/", async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany({
      include: {
        doctors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    res.status(200).json(specialties);
  } catch (error) {
    console.error("Error fetching specialties:", error);
    res.status(500).json({ error: "Failed to fetch specialties" });
  }
});

// GET specialty by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await prisma.specialty.findUnique({
      where: { id: parseInt(id) },
      include: {
        doctors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!specialty) {
      return res.status(404).json({ error: "Specialty not found" });
    }

    res.status(200).json(specialty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch specialty" });
  }
});

// POST create new specialty
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Specialty name is required" });
    }

    const specialty = await prisma.specialty.create({
      data: { name },
    });

    res.status(201).json(specialty);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Specialty already exists" });
    }
    res.status(500).json({ error: "Failed to create specialty" });
  }
});

// PUT update specialty
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Specialty name is required" });
    }

    const specialty = await prisma.specialty.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json(specialty);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Specialty not found" });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Specialty name already exists" });
    }
    res.status(500).json({ error: "Failed to update specialty" });
  }
});

// DELETE specialty
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const specialty = await prisma.specialty.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json(specialty);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Specialty not found" });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: "Cannot delete specialty with associated doctors" 
      });
    }
    res.status(500).json({ error: "Failed to delete specialty" });
  }
});

module.exports = router;