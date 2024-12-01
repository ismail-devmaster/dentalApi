const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clear existing data (optional, remove if you want to keep existing data)
  await prisma.payment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.queue.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.sex.deleteMany({});
  await prisma.appointmentStatus.deleteMany({});
  await prisma.appointmentType.deleteMany({});
  await prisma.paymentStatus.deleteMany({});

  // Now seed the data
  console.log('Seeding fresh data...');

  // Seed Sex
  const sexData = [
    { gender: 'MALE' },
    { gender: 'FEMALE' },
    { gender: 'OTHER' }
  ]

  // Create sex records one by one to handle dependencies
  const sexRecords = [];
  for (const sex of sexData) {
    const record = await prisma.sex.upsert({
      where: { gender: sex.gender },
      update: {},
      create: sex
    });
    sexRecords.push(record);
  }

  // Seed Specialty
  const specialtyData = [
    { name: 'Cardiology' },
    { name: 'Dermatology' },
    { name: 'Pediatrics' },
    { name: 'Neurology' },
    { name: 'Orthopedics' }
  ]
  const specialtyRecords = await Promise.all(
    specialtyData.map(specialty => 
      prisma.specialty.upsert({
        where: { name: specialty.name },
        update: {},
        create: specialty
      })
    )
  )

  // Seed Doctors
  const doctorData = [
    { 
      firstName: 'John', 
      lastName: 'Smith', 
      specialtyId: specialtyRecords[0].id 
    },
    { 
      firstName: 'Emily', 
      lastName: 'Johnson', 
      specialtyId: specialtyRecords[1].id 
    },
    { 
      firstName: 'Michael', 
      lastName: 'Williams', 
      specialtyId: specialtyRecords[2].id 
    },
    { 
      firstName: 'Sarah', 
      lastName: 'Brown', 
      specialtyId: specialtyRecords[3].id 
    },
    { 
      firstName: 'David', 
      lastName: 'Miller', 
      specialtyId: specialtyRecords[4].id 
    }
  ]
  const doctorRecords = await Promise.all(
    doctorData.map(doctor => prisma.doctor.create({ data: doctor }))
  )

  // Seed Patients
  const patientData = [
    { 
      firstName: 'Alice', 
      lastName: 'Garcia', 
      age: 35, 
      sexId: sexRecords[1].id,
      phone: '555-1234',
      email: 'alice.garcia@example.com',
      medicalHistory: 'Seasonal allergies'
    },
    { 
      firstName: 'Bob', 
      lastName: 'Martinez', 
      age: 42, 
      sexId: sexRecords[0].id,
      phone: '555-5678',
      email: 'bob.martinez@example.com',
      medicalHistory: 'Hypertension'
    },
    { 
      firstName: 'Charlie', 
      lastName: 'Lee', 
      age: 28, 
      sexId: sexRecords[2].id,
      phone: '555-9012',
      email: 'charlie.lee@example.com',
      medicalHistory: 'Asthma'
    },
    { 
      firstName: 'Diana', 
      lastName: 'Wong', 
      age: 50, 
      sexId: sexRecords[1].id,
      phone: '555-3456',
      email: 'diana.wong@example.com',
      medicalHistory: 'Diabetes'
    },
    { 
      firstName: 'Ethan', 
      lastName: 'Kim', 
      age: 45, 
      sexId: sexRecords[0].id,
      phone: '555-7890',
      email: 'ethan.kim@example.com',
      medicalHistory: 'High cholesterol'
    }
  ]
  const patientRecords = await Promise.all(
    patientData.map(patient => prisma.patient.create({ data: patient }))
  )

  // Seed Appointment Status
  const appointmentStatusData = [
    { status: 'SCHEDULED' },
    { status: 'CONFIRMED' },
    { status: 'CHECKED_IN' },
    { status: 'IN_PROGRESS' },
    { status: 'COMPLETED' },
    { status: 'CANCELLED' },
    { status: 'MISSED' }
  ]
  const appointmentStatusRecords = await Promise.all(
    appointmentStatusData.map(status => prisma.appointmentStatus.create({ data: status }))
  )

  // Seed Appointment Types
  const appointmentTypeData = [
    { type: 'Regular Checkup' },
    { type: 'Follow-up' },
    { type: 'Emergency' },
    { type: 'Consultation' },
    { type: 'Specialist Referral' }
  ]
  const appointmentTypeRecords = await Promise.all(
    appointmentTypeData.map(type => prisma.appointmentType.create({ data: type }))
  )

  // Seed Appointments
  const appointmentData = [
    { 
      patientId: patientRecords[0].id,
      doctorId: doctorRecords[0].id,
      date: new Date('2024-06-15T10:00:00Z'),
      time: new Date('2024-06-15T10:00:00Z'),
      additionalNotes: 'Annual checkup',
      statusId: appointmentStatusRecords[0].id,
      typeId: appointmentTypeRecords[0].id
    },
    { 
      patientId: patientRecords[1].id,
      doctorId: doctorRecords[1].id,
      date: new Date('2024-06-16T14:30:00Z'),
      time: new Date('2024-06-16T14:30:00Z'),
      additionalNotes: 'Skin condition follow-up',
      statusId: appointmentStatusRecords[1].id,
      typeId: appointmentTypeRecords[1].id
    },
    { 
      patientId: patientRecords[2].id,
      doctorId: doctorRecords[2].id,
      date: new Date('2024-06-17T11:15:00Z'),
      time: new Date('2024-06-17T11:15:00Z'),
      additionalNotes: 'Pediatric consultation',
      statusId: appointmentStatusRecords[2].id,
      typeId: appointmentTypeRecords[2].id
    },
    { 
      patientId: patientRecords[3].id,
      doctorId: doctorRecords[3].id,
      date: new Date('2024-06-18T09:45:00Z'),
      time: new Date('2024-06-18T09:45:00Z'),
      additionalNotes: 'Neurological assessment',
      statusId: appointmentStatusRecords[3].id,
      typeId: appointmentTypeRecords[3].id
    },
    { 
      patientId: patientRecords[4].id,
      doctorId: doctorRecords[4].id,
      date: new Date('2024-06-19T15:00:00Z'),
      time: new Date('2024-06-19T15:00:00Z'),
      additionalNotes: 'Orthopedic consultation',
      statusId: appointmentStatusRecords[4].id,
      typeId: appointmentTypeRecords[4].id
    }
  ]
  const appointmentRecords = await Promise.all(
    appointmentData.map(appointment => prisma.appointment.create({ data: appointment }))
  )

  // Seed Payment Status
  const paymentStatusData = [
    { status: 'PENDING' },
    { status: 'PAID' },
    { status: 'PARTIALLY_PAID' },
    { status: 'OVERDUE' },
    { status: 'REFUNDED' },
    { status: 'CANCELLED' }
  ]
  const paymentStatusRecords = await Promise.all(
    paymentStatusData.map(status => prisma.paymentStatus.create({ data: status }))
  )

  // Seed Payments
  const paymentData = [
    { 
      patientId: patientRecords[0].id,
      doctorId: doctorRecords[0].id,
      description: 'Annual checkup consultation',
      amount: 250.00,
      date: new Date('2024-06-15T10:30:00Z'),
      time: new Date('2024-06-15T10:30:00Z'),
      statusId: paymentStatusRecords[1].id
    },
    { 
      patientId: patientRecords[1].id,
      doctorId: doctorRecords[1].id,
      description: 'Dermatology consultation',
      amount: 300.00,
      date: new Date('2024-06-16T15:00:00Z'),
      time: new Date('2024-06-16T15:00:00Z'),
      statusId: paymentStatusRecords[0].id
    },
    { 
      patientId: patientRecords[2].id,
      doctorId: doctorRecords[2].id,
      description: 'Pediatric consultation',
      amount: 200.00,
      date: new Date('2024-06-17T11:45:00Z'),
      time: new Date('2024-06-17T11:45:00Z'),
      statusId: paymentStatusRecords[2].id
    },
    { 
      patientId: patientRecords[3].id,
      doctorId: doctorRecords[3].id,
      description: 'Neurological assessment',
      amount: 350.00,
      date: new Date('2024-06-18T10:15:00Z'),
      time: new Date('2024-06-18T10:15:00Z'),
      statusId: paymentStatusRecords[3].id
    },
    { 
      patientId: patientRecords[4].id,
      doctorId: doctorRecords[4].id,
      description: 'Orthopedic consultation',
      amount: 275.00,
      date: new Date('2024-06-19T15:30:00Z'),
      time: new Date('2024-06-19T15:30:00Z'),
      statusId: paymentStatusRecords[4].id
    }
  ]
  const paymentRecords = await Promise.all(
    paymentData.map(payment => prisma.payment.create({ data: payment }))
  )

  // Seed Queue
  const queueData = [
    { 
      patientId: patientRecords[0].id,
      status: 'WAITING',
      estimatedWaitTime: 30,
      arrivalTime: new Date('2024-06-15T09:45:00'),
      timeWaited: 15,
      estimatedTimeToDoctor: 45
    },
    { 
      patientId: patientRecords[1].id,
      status: 'IN_PROGRESS',
      estimatedWaitTime: 20,
      arrivalTime: new Date('2024-06-16T14:10:00'),
      timeWaited: 20,
      estimatedTimeToDoctor: 0
    },
    { 
      patientId: patientRecords[2].id,
      status: 'COMPLETED',
      estimatedWaitTime: 15,
      arrivalTime: new Date('2024-06-17T11:00:00'),
      timeWaited: 15,
      estimatedTimeToDoctor: 0
    },
    { 
      patientId: patientRecords[3].id,
      status: 'SKIPPED',
      estimatedWaitTime: 40,
      arrivalTime: new Date('2024-06-18T09:30:00'),
      timeWaited: 15,
      estimatedTimeToDoctor: 25
    },
    { 
      patientId: patientRecords[4].id,
      status: 'CANCELLED',
      estimatedWaitTime: 25,
      arrivalTime: new Date('2024-06-19T14:45:00'),
      timeWaited: 0,
      estimatedTimeToDoctor: 0
    }
  ]
  const queueRecords = await Promise.all(
    queueData.map(queue => prisma.queue.create({ data: queue }))
  )

  console.log('Database has been seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })