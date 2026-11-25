const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Sedan' }, update: {}, create: { name: 'Sedan', description: 'Mobil sedan nyaman untuk perjalanan bisnis', icon: 'Car' } }),
    prisma.category.upsert({ where: { name: 'SUV' }, update: {}, create: { name: 'SUV', description: 'Sport Utility Vehicle cocok untuk segala medan', icon: 'Truck' } }),
    prisma.category.upsert({ where: { name: 'MPV' }, update: {}, create: { name: 'MPV', description: 'Multi Purpose Vehicle untuk keluarga besar', icon: 'Users' } }),
    prisma.category.upsert({ where: { name: 'Hatchback' }, update: {}, create: { name: 'Hatchback', description: 'Kompak dan ekonomis untuk dalam kota', icon: 'Car' } }),
    prisma.category.upsert({ where: { name: 'Pickup' }, update: {}, create: { name: 'Pickup', description: 'Kendaraan niaga untuk pengangkutan barang', icon: 'Truck' } }),
  ]);

  // Admin
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@veloxrental.com' },
    update: {},
    create: { name: 'Administrator', email: 'admin@veloxrental.com', phone: '081234567890', password: adminPass, role: 'ADMIN' }
  });

  // Customers
  const custPass = await bcrypt.hash('customer123', 12);
  const customers = await Promise.all([
    prisma.user.upsert({ where: { email: 'budi.santoso@email.com' }, update: {}, create: { name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '081111111111', password: custPass, role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'siti.rahayu@email.com' }, update: {}, create: { name: 'Siti Rahayu', email: 'siti.rahayu@email.com', phone: '082222222222', password: custPass, role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'ahmad.fauzi@email.com' }, update: {}, create: { name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', phone: '083333333333', password: custPass, role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'dewi.anggraini@email.com' }, update: {}, create: { name: 'Dewi Anggraini', email: 'dewi.anggraini@email.com', phone: '084444444444', password: custPass, role: 'CUSTOMER' } }),
    prisma.user.upsert({ where: { email: 'rizky.pratama@email.com' }, update: {}, create: { name: 'Rizky Pratama', email: 'rizky.pratama@email.com', phone: '085555555555', password: custPass, role: 'CUSTOMER' } }),
  ]);

  // Vehicles
  const vehicles = [
    { name: 'Toyota Camry 2023', brand: 'Toyota', model: 'Camry', year: 2023, color: 'Hitam', licensePlate: 'B 1234 KAM', pricePerDay: 650000, transmission: 'AUTOMATIC', fuelType: 'BENSIN', capacity: 5, location: 'Jakarta Pusat', categoryId: categories[0].id, description: 'Toyota Camry 2023 adalah sedan premium dengan interior mewah dan teknologi canggih.', features: 'AC, GPS, Bluetooth, Sunroof, Kursi Kulit, Parkir Sensor' },
    { name: 'Honda Civic 2022', brand: 'Honda', model: 'Civic', year: 2022, color: 'Putih', licensePlate: 'B 5678 CIV', pricePerDay: 500000, transmission: 'CVT', fuelType: 'BENSIN', capacity: 5, location: 'Jakarta Selatan', categoryId: categories[0].id, description: 'Honda Civic generasi terbaru dengan desain sporty dan konsumsi BBM efisien.', features: 'AC, Android Auto, Apple CarPlay, Honda Sensing' },
    { name: 'Toyota Fortuner 2023', brand: 'Toyota', model: 'Fortuner', year: 2023, color: 'Silver', licensePlate: 'B 9012 FOR', pricePerDay: 850000, transmission: 'AUTOMATIC', fuelType: 'DIESEL', capacity: 7, location: 'Jakarta Timur', categoryId: categories[1].id, description: 'Toyota Fortuner SUV tangguh cocok untuk perjalanan di segala medan.', features: 'AC Double, 4WD, GPS, Kamera 360, 7 Kursi' },
    { name: 'Mitsubishi Pajero Sport 2022', brand: 'Mitsubishi', model: 'Pajero Sport', year: 2022, color: 'Biru', licensePlate: 'B 3456 PAJ', pricePerDay: 800000, transmission: 'AUTOMATIC', fuelType: 'DIESEL', capacity: 7, location: 'Jakarta Barat', categoryId: categories[1].id, description: 'Pajero Sport SUV premium dengan Super Select 4WD.', features: 'AC Double, Super Select 4WD, Sunroof, 360 Camera' },
    { name: 'Toyota Innova 2023', brand: 'Toyota', model: 'Kijang Innova', year: 2023, color: 'Abu-abu', licensePlate: 'B 7890 INN', pricePerDay: 600000, transmission: 'AUTOMATIC', fuelType: 'BENSIN', capacity: 7, location: 'Jakarta Utara', categoryId: categories[2].id, description: 'Toyota Innova MPV keluarga terpopuler di Indonesia.', features: 'AC Double, 7 Kursi, DVD Player, Remote Starter' },
    { name: 'Honda BR-V 2022', brand: 'Honda', model: 'BR-V', year: 2022, color: 'Merah', licensePlate: 'B 2345 BRV', pricePerDay: 450000, transmission: 'CVT', fuelType: 'BENSIN', capacity: 7, location: 'Tangerang', categoryId: categories[2].id, description: 'Honda BR-V crossover MPV dengan desain modern dan interior luas.', features: 'AC, 7 Kursi, Honda Sensing, Remote Engine Starter' },
    { name: 'Toyota Yaris 2023', brand: 'Toyota', model: 'Yaris', year: 2023, color: 'Kuning', licensePlate: 'B 6789 YRS', pricePerDay: 350000, transmission: 'CVT', fuelType: 'BENSIN', capacity: 5, location: 'Depok', categoryId: categories[3].id, description: 'Toyota Yaris hatchback kompak dan lincah untuk mobilitas kota.', features: 'AC, Android Auto, Toyota Safety Sense' },
    { name: 'Honda Jazz 2022', brand: 'Honda', model: 'Jazz', year: 2022, color: 'Putih', licensePlate: 'B 1357 JAZ', pricePerDay: 380000, transmission: 'CVT', fuelType: 'BENSIN', capacity: 5, location: 'Bekasi', categoryId: categories[3].id, description: 'Honda Jazz hatchback populer dengan Magic Seat System.', features: 'AC, Magic Seat, Touchscreen Audio, Honda Sensing' },
    { name: 'Daihatsu Rocky 2023', brand: 'Daihatsu', model: 'Rocky', year: 2023, color: 'Hitam', licensePlate: 'B 2468 ROK', pricePerDay: 420000, transmission: 'CVT', fuelType: 'BENSIN', capacity: 5, location: 'Bogor', categoryId: categories[1].id, description: 'Daihatsu Rocky compact SUV dengan fitur modern harga terjangkau.', features: 'AC, 360 Camera, Adaptive Cruise Control' },
    { name: 'Mitsubishi Xpander 2023', brand: 'Mitsubishi', model: 'Xpander', year: 2023, color: 'Putih', licensePlate: 'B 1122 XPN', pricePerDay: 520000, transmission: 'AUTOMATIC', fuelType: 'BENSIN', capacity: 7, location: 'Jakarta Selatan', categoryId: categories[2].id, description: 'Mitsubishi Xpander MPV sporty dengan desain agresif.', features: 'AC Double, 7 Kursi, Android Auto, Apple CarPlay' },
    { name: 'Toyota Avanza 2023', brand: 'Toyota', model: 'Avanza', year: 2023, color: 'Silver', licensePlate: 'B 3344 AVZ', pricePerDay: 400000, transmission: 'CVT', fuelType: 'BENSIN', capacity: 7, location: 'Jakarta Pusat', categoryId: categories[2].id, description: 'Toyota Avanza MPV terlaris di Indonesia yang terpercaya.', features: 'AC Double, 7 Kursi, Toyota Safety Sense' },
    { name: 'Suzuki Carry 2022', brand: 'Suzuki', model: 'Carry', year: 2022, color: 'Putih', licensePlate: 'B 5566 CAR', pricePerDay: 300000, transmission: 'MANUAL', fuelType: 'BENSIN', capacity: 3, location: 'Jakarta Timur', categoryId: categories[4].id, description: 'Suzuki Carry pickup untuk kebutuhan angkutan barang ringan.', features: 'AC, Kapasitas Angkut 1000kg' },
  ];

  for (const v of vehicles) {
    const existing = await prisma.vehicle.findUnique({ where: { licensePlate: v.licensePlate } });
    if (!existing) {
      const vehicle = await prisma.vehicle.create({ data: v });
      // Add placeholder image
      await prisma.vehicleImage.create({
        data: {
          vehicleId: vehicle.id,
          url: `https://placehold.co/800x500/1a1a2e/ffffff?text=${encodeURIComponent(vehicle.name)}`,
          isPrimary: true
        }
      });
    }
  }

  // Sample bookings & payments
  const allVehicles = await prisma.vehicle.findMany({ take: 3 });
  const sampleBookings = [
    { userId: customers[0].id, vehicleId: allVehicles[0].id, startDate: new Date('2024-12-01'), endDate: new Date('2024-12-04'), totalDays: 3, pricePerDay: allVehicles[0].pricePerDay, subtotal: parseFloat(allVehicles[0].pricePerDay) * 3, additionalFee: 0, totalPrice: parseFloat(allVehicles[0].pricePerDay) * 3, status: 'COMPLETED', pickupLocation: 'Jakarta Pusat', pickedUpAt: new Date('2024-12-01'), returnedAt: new Date('2024-12-04') },
    { userId: customers[1].id, vehicleId: allVehicles[1].id, startDate: new Date('2024-12-10'), endDate: new Date('2024-12-13'), totalDays: 3, pricePerDay: allVehicles[1].pricePerDay, subtotal: parseFloat(allVehicles[1].pricePerDay) * 3, additionalFee: 0, totalPrice: parseFloat(allVehicles[1].pricePerDay) * 3, status: 'CONFIRMED', pickupLocation: 'Jakarta Selatan' },
    { userId: customers[2].id, vehicleId: allVehicles[2].id, startDate: new Date('2024-12-20'), endDate: new Date('2024-12-22'), totalDays: 2, pricePerDay: allVehicles[2].pricePerDay, subtotal: parseFloat(allVehicles[2].pricePerDay) * 2, additionalFee: 0, totalPrice: parseFloat(allVehicles[2].pricePerDay) * 2, status: 'PENDING', pickupLocation: 'Jakarta Timur' },
  ];

  for (const b of sampleBookings) {
    b.bookingCode = 'VLX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const booking = await prisma.booking.create({ data: b });
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: b.totalPrice,
        method: 'BANK_TRANSFER',
        status: b.status === 'COMPLETED' ? 'PAID' : b.status === 'CONFIRMED' ? 'PAID' : 'PENDING',
        paidAt: b.status === 'COMPLETED' || b.status === 'CONFIRMED' ? new Date() : null
      }
    });
  }

  console.log('Seeding complete!');
  console.log('Admin: admin@veloxrental.com / admin123');
  console.log('Customer: budi.santoso@email.com / customer123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
