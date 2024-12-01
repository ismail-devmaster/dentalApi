const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// Add a patient to the queue
router.post("/", async (req, res) => {
  try {
    const { patientId, status, estimatedWaitTime, timeWaited, estimatedTimeToDoctor } = req.body;

    // Validate required fields
    if (!patientId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create queue entry
    const newQueueEntry = await prisma.queue.create({
      data: {
        patientId: parseInt(patientId),
        status: status, // should be one of: WAITING, IN_PROGRESS, COMPLETED, SKIPPED
        estimatedWaitTime: parseInt(estimatedWaitTime),
        arrivalTime: new Date(),
        timeWaited: parseInt(timeWaited),
        estimatedTimeToDoctor: parseInt(estimatedTimeToDoctor),
      },
    });

    res.status(201).json(newQueueEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create queue entry" });
  }
});

// Update patient status in the queue
router.put("/:id", async (req, res) => {
  const { status, timeWaited, estimatedTimeToDoctor } = req.body;
  try {
    const updatedQueue = await prisma.queue.update({
      where: { id: req.params.id },
      data: { status, timeWaited, estimatedTimeToDoctor },
    });
    res.status(200).json(updatedQueue);
  } catch (error) {
    res.status(500).json({ message: "Error updating queue", error });
  }
});

// View queue entry for a patient
router.get("/:id", async (req, res) => {
  try {
    const queueEntry = await prisma.queue.findUnique({
      where: { id: req.params.id },
    });
    res.status(200).json(queueEntry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching queue entry", error });
  }
});

// View all queue
router.get("/", async (req, res) => {
  try {
    const queueEntry = await prisma.queue.findMany();
    res.status(200).json(queueEntry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching queue entry", error });
  }
});

// Delete a patient from the queue
router.delete("/:id", async (req, res) => {
  try {
    await prisma.queue.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting queue entry", error });
  }
});

module.exports = router;
