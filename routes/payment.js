const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
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
      },
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// GET all payments for a specific patient by patient ID
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch payments for the patient by patientId
    const payments = await prisma.payment.findMany({
      where: {
        patientId: parseInt(id),
      },
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
            status: true, // Include payment status
          },
        },
      },
    });

    if (!payments.length) {
      return res
        .status(404)
        .json({ error: "No payments found for this patient" });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// GET payment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch payment by ID
    const payment = await prisma.payment.findUnique({
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
        status: {
          select: {
            status: true, // Include payment status
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// POST create a new payment
router.post("/", async (req, res) => {
  try {
    const { patientId, description, amount, doctorId, date, time, status } = req.body;

    // Validate required fields
    if (!patientId || !amount || !doctorId || !date || !time || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the status ID based on PaymentStatusEnum
    const paymentStatus = await prisma.paymentStatus.findUnique({
      where: { status: status }, // status should be one of: PENDING, PAID, OVERDUE
    });

    if (!paymentStatus) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // Create the payment
    const newPayment = await prisma.payment.create({
      data: {
        patientId: parseInt(patientId),
        description,
        amount: parseFloat(amount),
        doctorId: parseInt(doctorId),
        date: new Date(date),
        time: new Date(time),
        statusId: paymentStatus.id,
      },
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// PUT update payment by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, status } = req.body;

    // Find the status ID based on the status string (paid or pending)
    const paymentStatus = await prisma.paymentStatus.findUnique({
      where: { status },
    });

    if (!paymentStatus) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // Update the payment
    const updatedPayment = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: {
        description,
        amount,
        statusId: paymentStatus.id,
      },
    });

    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      // Prisma error code when the payment is not found
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(500).json({ error: "Failed to update payment" });
  }
});

// DELETE payment by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the payment
    const deletedPayment = await prisma.payment.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json(deletedPayment);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      // Prisma error code when the payment is not found
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

module.exports = router;
