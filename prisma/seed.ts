import {
  PrismaClient,
  Role,
  AssetStatus,
  AssetCondition,
  AllocationStatus,
  TransferStatus,
  BookingStatus,
  MaintenanceStatus,
  NotificationType,
  ActivityAction,
  ResourceType,
  AuditItemStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===================================
  // Clean existing data
  // ===================================
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('✅ Cleared existing data');

  // ===================================
  // Departments (5)
  // ===================================
  const departments = await Promise.all([
    prisma.department.create({
      data: { name: 'Information Technology', code: 'IT', description: 'IT Infrastructure and Software Development' },
    }),
    prisma.department.create({
      data: { name: 'Human Resources', code: 'HR', description: 'Human Resources and Talent Management' },
    }),
    prisma.department.create({
      data: { name: 'Finance', code: 'FIN', description: 'Finance and Accounting' },
    }),
    prisma.department.create({
      data: { name: 'Operations', code: 'OPS', description: 'Business Operations and Logistics' },
    }),
    prisma.department.create({
      data: { name: 'Marketing', code: 'MKT', description: 'Marketing and Brand Management' },
    }),
  ]);

  console.log('✅ Created 5 departments');

  // ===================================
  // Categories (6)
  // ===================================
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Computers & Laptops', code: 'COMP', description: 'Desktop PCs, Laptops, MacBooks' } }),
    prisma.category.create({ data: { name: 'Networking Equipment', code: 'NET', description: 'Routers, Switches, Access Points' } }),
    prisma.category.create({ data: { name: 'Mobile Devices', code: 'MOB', description: 'Smartphones, Tablets, iPads' } }),
    prisma.category.create({ data: { name: 'Peripherals', code: 'PERI', description: 'Keyboards, Mice, Monitors, Printers' } }),
    prisma.category.create({ data: { name: 'Audio Visual', code: 'AV', description: 'Projectors, Cameras, Microphones' } }),
    prisma.category.create({ data: { name: 'Furniture', code: 'FURN', description: 'Desks, Chairs, Cabinets' } }),
  ]);

  console.log('✅ Created 6 categories');

  // ===================================
  // Users: 1 Admin + 2 Managers + 10 Employees = 13 total
  // ===================================
  const passwordHash = await bcrypt.hash('Password@123', 12);

  const admin = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      email: 'admin@assetflow.com',
      password: passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      phone: '+1-555-0100',
      role: Role.ADMIN,
      departmentId: departments[0].id,
      isActive: true,
    },
  });

  const managers = await Promise.all([
    prisma.user.create({
      data: {
        employeeId: 'EMP-002',
        email: 'manager1@assetflow.com',
        password: passwordHash,
        firstName: 'Alex',
        lastName: 'Morgan',
        phone: '+1-555-0101',
        role: Role.ASSET_MANAGER,
        departmentId: departments[0].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        employeeId: 'EMP-003',
        email: 'manager2@assetflow.com',
        password: passwordHash,
        firstName: 'Jordan',
        lastName: 'Smith',
        phone: '+1-555-0102',
        role: Role.ASSET_MANAGER,
        departmentId: departments[1].id,
        isActive: true,
      },
    }),
  ]);

  const employeeData = [
    { id: 'EMP-004', email: 'emp1@assetflow.com', first: 'Emma', last: 'Johnson', dept: 0 },
    { id: 'EMP-005', email: 'emp2@assetflow.com', first: 'Liam', last: 'Williams', dept: 0 },
    { id: 'EMP-006', email: 'emp3@assetflow.com', first: 'Olivia', last: 'Brown', dept: 1 },
    { id: 'EMP-007', email: 'emp4@assetflow.com', first: 'Noah', last: 'Jones', dept: 1 },
    { id: 'EMP-008', email: 'emp5@assetflow.com', first: 'Ava', last: 'Garcia', dept: 2 },
    { id: 'EMP-009', email: 'emp6@assetflow.com', first: 'William', last: 'Miller', dept: 2 },
    { id: 'EMP-010', email: 'emp7@assetflow.com', first: 'Sophia', last: 'Davis', dept: 3 },
    { id: 'EMP-011', email: 'emp8@assetflow.com', first: 'James', last: 'Martinez', dept: 3 },
    { id: 'EMP-012', email: 'emp9@assetflow.com', first: 'Isabella', last: 'Wilson', dept: 4 },
    { id: 'EMP-013', email: 'emp10@assetflow.com', first: 'Oliver', last: 'Anderson', dept: 4 },
  ];

  const employees = await Promise.all(
    employeeData.map((e) =>
      prisma.user.create({
        data: {
          employeeId: e.id,
          email: e.email,
          password: passwordHash,
          firstName: e.first,
          lastName: e.last,
          role: Role.EMPLOYEE,
          departmentId: departments[e.dept].id,
          isActive: true,
        },
      })
    )
  );

  console.log('✅ Created 13 users (1 admin, 2 managers, 10 employees)');

  // ===================================
  // Resources (10)
  // ===================================
  const resources = await Promise.all([
    prisma.resource.create({ data: { name: 'Conference Room A', code: 'CR-A', type: ResourceType.MEETING_ROOM, location: 'Floor 1', capacity: 10 } }),
    prisma.resource.create({ data: { name: 'Conference Room B', code: 'CR-B', type: ResourceType.MEETING_ROOM, location: 'Floor 2', capacity: 20 } }),
    prisma.resource.create({ data: { name: 'Board Room', code: 'BR-1', type: ResourceType.MEETING_ROOM, location: 'Floor 3', capacity: 30 } }),
    prisma.resource.create({ data: { name: 'Projector A', code: 'PROJ-A', type: ResourceType.PROJECTOR, location: 'AV Store' } }),
    prisma.resource.create({ data: { name: 'Projector B', code: 'PROJ-B', type: ResourceType.PROJECTOR, location: 'AV Store' } }),
    prisma.resource.create({ data: { name: 'Company Van #1', code: 'VAN-01', type: ResourceType.VEHICLE, location: 'Parking Lot A' } }),
    prisma.resource.create({ data: { name: 'Company Car #1', code: 'CAR-01', type: ResourceType.VEHICLE, location: 'Parking Lot A' } }),
    prisma.resource.create({ data: { name: 'Portable Whiteboard', code: 'WB-01', type: ResourceType.SHARED_EQUIPMENT, location: 'Storage Room' } }),
    prisma.resource.create({ data: { name: 'Video Camera', code: 'CAM-01', type: ResourceType.SHARED_EQUIPMENT, location: 'AV Store' } }),
    prisma.resource.create({ data: { name: 'Podcast Mic Set', code: 'MIC-01', type: ResourceType.SHARED_EQUIPMENT, location: 'AV Store' } }),
  ]);

  console.log('✅ Created 10 resources');

  // ===================================
  // Assets (50) — auto-generated tags AF-00001 to AF-00050
  // ===================================
  const assetDataList = [
    // Computers (10)
    { name: 'Dell XPS 15 Laptop', cat: 0, dept: 0, cost: 1299.99, vendor: 'Dell', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'MacBook Pro 14"', cat: 0, dept: 0, cost: 1999.99, vendor: 'Apple', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'HP EliteBook 840', cat: 0, dept: 1, cost: 1099.99, vendor: 'HP', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Lenovo ThinkPad X1', cat: 0, dept: 1, cost: 1399.99, vendor: 'Lenovo', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Dell Desktop Workstation', cat: 0, dept: 2, cost: 899.99, vendor: 'Dell', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'iMac 27"', cat: 0, dept: 4, cost: 1799.99, vendor: 'Apple', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'HP Desktop i7', cat: 0, dept: 2, cost: 799.99, vendor: 'HP', condition: AssetCondition.FAIR, status: AssetStatus.AVAILABLE },
    { name: 'Surface Laptop Studio', cat: 0, dept: 3, cost: 1599.99, vendor: 'Microsoft', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Asus ROG Gaming Laptop', cat: 0, dept: 0, cost: 1999.99, vendor: 'Asus', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Acer Aspire 5', cat: 0, dept: 3, cost: 599.99, vendor: 'Acer', condition: AssetCondition.FAIR, status: AssetStatus.AVAILABLE },

    // Networking (8)
    { name: 'Cisco Catalyst Switch 24-port', cat: 1, dept: 0, cost: 1500.00, vendor: 'Cisco', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'TP-Link Access Point EAP670', cat: 1, dept: 0, cost: 299.99, vendor: 'TP-Link', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Netgear Managed Switch', cat: 1, dept: 0, cost: 799.99, vendor: 'Netgear', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Cisco Router ISR 4331', cat: 1, dept: 0, cost: 2200.00, vendor: 'Cisco', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Ubiquiti Dream Machine Pro', cat: 1, dept: 0, cost: 499.99, vendor: 'Ubiquiti', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'FortiGate Firewall 60F', cat: 1, dept: 0, cost: 1800.00, vendor: 'Fortinet', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Aruba Access Point', cat: 1, dept: 1, cost: 349.99, vendor: 'Aruba', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'D-Link Gigabit Switch 8-port', cat: 1, dept: 3, cost: 89.99, vendor: 'D-Link', condition: AssetCondition.FAIR, status: AssetStatus.AVAILABLE },

    // Mobile Devices (7)
    { name: 'iPhone 15 Pro', cat: 2, dept: 4, cost: 999.99, vendor: 'Apple', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Samsung Galaxy S24', cat: 2, dept: 3, cost: 899.99, vendor: 'Samsung', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'iPad Pro 12.9"', cat: 2, dept: 4, cost: 1099.99, vendor: 'Apple', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Samsung Galaxy Tab S9', cat: 2, dept: 1, cost: 799.99, vendor: 'Samsung', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Google Pixel 8 Pro', cat: 2, dept: 0, cost: 899.99, vendor: 'Google', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Microsoft Surface Pro 9', cat: 2, dept: 2, cost: 1299.99, vendor: 'Microsoft', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'OnePlus 12', cat: 2, dept: 0, cost: 699.99, vendor: 'OnePlus', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },

    // Peripherals (10)
    { name: 'LG 27" 4K Monitor', cat: 3, dept: 0, cost: 399.99, vendor: 'LG', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Dell 24" Monitor P2423', cat: 3, dept: 1, cost: 299.99, vendor: 'Dell', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Logitech MX Keys Keyboard', cat: 3, dept: 0, cost: 119.99, vendor: 'Logitech', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'HP Color LaserJet Printer', cat: 3, dept: 2, cost: 499.99, vendor: 'HP', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Canon PIXMA Printer', cat: 3, dept: 1, cost: 199.99, vendor: 'Canon', condition: AssetCondition.FAIR, status: AssetStatus.AVAILABLE },
    { name: 'Logitech MX Master 3 Mouse', cat: 3, dept: 0, cost: 99.99, vendor: 'Logitech', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Samsung 32" Curved Monitor', cat: 3, dept: 4, cost: 449.99, vendor: 'Samsung', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Epson Document Scanner', cat: 3, dept: 2, cost: 249.99, vendor: 'Epson', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'BenQ 27" Designer Monitor', cat: 3, dept: 4, cost: 599.99, vendor: 'BenQ', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Razer Huntsman Keyboard', cat: 3, dept: 3, cost: 149.99, vendor: 'Razer', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },

    // Audio Visual (8)
    { name: 'Epson 4K Projector', cat: 4, dept: 0, cost: 1499.99, vendor: 'Epson', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Sony A7 IV Camera', cat: 4, dept: 4, cost: 2499.99, vendor: 'Sony', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Rode Podcast Microphone', cat: 4, dept: 4, cost: 299.99, vendor: 'Rode', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Logitech Brio 4K Webcam', cat: 4, dept: 0, cost: 199.99, vendor: 'Logitech', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Jabra Speak 510 Speaker', cat: 4, dept: 1, cost: 149.99, vendor: 'Jabra', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'ViewSonic Projector PA503S', cat: 4, dept: 2, cost: 449.99, vendor: 'ViewSonic', condition: AssetCondition.FAIR, status: AssetStatus.AVAILABLE },
    { name: 'Sony HT-A7000 Soundbar', cat: 4, dept: 3, cost: 1299.99, vendor: 'Sony', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Sennheiser HD 560S Headphones', cat: 4, dept: 0, cost: 199.99, vendor: 'Sennheiser', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },

    // Furniture (7)
    { name: 'Ergonomic Office Chair', cat: 5, dept: 0, cost: 599.99, vendor: 'Herman Miller', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Standing Desk 60"', cat: 5, dept: 0, cost: 799.99, vendor: 'FlexiSpot', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Filing Cabinet 4-drawer', cat: 5, dept: 2, cost: 299.99, vendor: 'Steelcase', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Whiteboard 6x4 ft', cat: 5, dept: 1, cost: 249.99, vendor: 'Quartet', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Conference Table 12-seater', cat: 5, dept: 0, cost: 2999.99, vendor: 'Knoll', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
    { name: 'Reception Desk', cat: 5, dept: 1, cost: 1499.99, vendor: 'Bush Business', condition: AssetCondition.GOOD, status: AssetStatus.AVAILABLE },
    { name: 'Server Rack 42U', cat: 5, dept: 0, cost: 899.99, vendor: 'APC', condition: AssetCondition.EXCELLENT, status: AssetStatus.AVAILABLE },
  ];

  const assets: any[] = [];
  for (let i = 0; i < assetDataList.length; i++) {
    const d = assetDataList[i];
    const tagNum = String(i + 1).padStart(5, '0');
    const asset = await prisma.asset.create({
      data: {
        assetTag: `AF-${tagNum}`,
        serialNumber: `SN-${Date.now()}-${i + 1}`,
        name: d.name,
        categoryId: categories[d.cat].id,
        departmentId: departments[d.dept].id,
        purchaseDate: new Date(Date.now() - Math.random() * 365 * 2 * 24 * 60 * 60 * 1000),
        purchaseCost: d.cost,
        vendor: d.vendor,
        invoiceNumber: `INV-${2023}-${String(i + 1).padStart(4, '0')}`,
        warrantyExpiry: new Date(Date.now() + (365 + Math.floor(Math.random() * 730)) * 24 * 60 * 60 * 1000),
        location: `Building A, Floor ${(i % 4) + 1}`,
        condition: d.condition,
        status: d.status,
        createdById: admin.id,
      },
    });
    assets.push(asset);
  }

  console.log('✅ Created 50 assets with tags AF-00001 to AF-00050');

  // ===================================
  // Allocations (20) — allocate first 20 assets
  // ===================================
  const allUsers = [...employees, ...managers];
  const allocations: any[] = [];

  for (let i = 0; i < 20; i++) {
    const asset = assets[i];
    const user = allUsers[i % allUsers.length];

    const allocation = await prisma.allocation.create({
      data: {
        assetId: asset.id,
        allocatedToId: user.id,
        allocatedById: managers[0].id,
        allocationDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        expectedReturn: new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000),
        status: AllocationStatus.ACTIVE,
        notes: `Allocated for project work - Asset ${asset.assetTag}`,
      },
    });

    await prisma.asset.update({
      where: { id: asset.id },
      data: { status: AssetStatus.ALLOCATED },
    });

    allocations.push(allocation);
  }

  console.log('✅ Created 20 allocations');

  // ===================================
  // Bookings (20)
  // ===================================
  const now = new Date();
  const bookingData = [
    { res: 0, start: 1, dur: 2, title: 'Sprint Planning Meeting' },
    { res: 0, start: 4, dur: 1, title: 'HR Onboarding Session' },
    { res: 1, start: 2, dur: 3, title: 'Quarterly Review' },
    { res: 1, start: 8, dur: 2, title: 'Product Demo' },
    { res: 2, start: 3, dur: 4, title: 'Board Meeting' },
    { res: 0, start: -2, dur: 1, title: 'Team Standup' },
    { res: 3, start: 1, dur: 2, title: 'Presentation Prep' },
    { res: 4, start: 5, dur: 3, title: 'Client Pitch' },
    { res: 5, start: 2, dur: 8, title: 'Off-site Visit' },
    { res: 6, start: 1, dur: 4, title: 'Airport Transfer' },
    { res: 1, start: -5, dur: 2, title: 'Training Session' },
    { res: 2, start: 10, dur: 6, title: 'Leadership Summit' },
    { res: 0, start: 6, dur: 1, title: 'Department Sync' },
    { res: 7, start: 1, dur: 3, title: 'Brainstorming Session' },
    { res: 8, start: 2, dur: 4, title: 'Marketing Video Shoot' },
    { res: 9, start: 1, dur: 2, title: 'Podcast Recording' },
    { res: 1, start: 15, dur: 2, title: 'Vendor Meeting' },
    { res: 3, start: 3, dur: 1, title: 'Sales Pitch' },
    { res: 0, start: -1, dur: 2, title: 'All Hands Meeting' },
    { res: 5, start: 7, dur: 6, title: 'Site Inspection' },
  ];

  for (let i = 0; i < bookingData.length; i++) {
    const b = bookingData[i];
    const startTime = new Date(now.getTime() + b.start * 24 * 60 * 60 * 1000);
    startTime.setHours(9 + (i % 8), 0, 0, 0);
    const endTime = new Date(startTime.getTime() + b.dur * 60 * 60 * 1000);

    await prisma.booking.create({
      data: {
        resourceId: resources[b.res].id,
        bookedById: allUsers[i % allUsers.length].id,
        title: b.title,
        description: `Booking for ${b.title}`,
        startTime,
        endTime,
        attendees: Math.floor(Math.random() * 10) + 2,
        status: b.start < 0 ? BookingStatus.COMPLETED : BookingStatus.CONFIRMED,
      },
    });
  }

  console.log('✅ Created 20 bookings');

  // ===================================
  // Maintenance Requests (10)
  // ===================================
  const maintenanceStatuses = [
    MaintenanceStatus.PENDING,
    MaintenanceStatus.APPROVED,
    MaintenanceStatus.IN_PROGRESS,
    MaintenanceStatus.COMPLETED,
    MaintenanceStatus.REJECTED,
  ];

  const maintenanceData = [
    { asset: 20, title: 'Screen Flickering Issue', desc: 'Laptop screen intermittently flickers during use', priority: 'HIGH' },
    { asset: 21, title: 'Battery Replacement', desc: 'Battery life dropped significantly, needs replacement', priority: 'MEDIUM' },
    { asset: 22, title: 'Keyboard Keys Stuck', desc: 'Several keys are unresponsive', priority: 'LOW' },
    { asset: 23, title: 'Network Port Failure', desc: 'Ethernet port not functioning properly', priority: 'HIGH' },
    { asset: 24, title: 'Overheating Issue', desc: 'Device gets very hot during operation', priority: 'CRITICAL' },
    { asset: 25, title: 'Printer Paper Jam', desc: 'Printer frequently jams at paper feed', priority: 'MEDIUM' },
    { asset: 26, title: 'Projector Lamp Replacement', desc: 'Lamp dim, needs replacement', priority: 'MEDIUM' },
    { asset: 27, title: 'Mouse Scroll Wheel Broken', desc: 'Scroll wheel does not respond', priority: 'LOW' },
    { asset: 28, title: 'Chair Wheel Replacement', desc: 'Two chair wheels broken', priority: 'LOW' },
    { asset: 29, title: 'Monitor Dead Pixels', desc: 'Multiple dead pixels visible on display', priority: 'MEDIUM' },
  ];

  for (let i = 0; i < maintenanceData.length; i++) {
    const m = maintenanceData[i];
    const status = maintenanceStatuses[i % maintenanceStatuses.length];
    const assetToMaintain = assets[m.asset];

    if (status === MaintenanceStatus.IN_PROGRESS) {
      await prisma.asset.update({
        where: { id: assetToMaintain.id },
        data: { status: AssetStatus.UNDER_MAINTENANCE },
      });
    }

    await prisma.maintenanceRequest.create({
      data: {
        assetId: assetToMaintain.id,
        requestedById: allUsers[i % allUsers.length].id,
        approvedById: status !== MaintenanceStatus.PENDING ? managers[0].id : null,
        assignedToId: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.COMPLETED].includes(status) ? managers[1].id : null,
        title: m.title,
        description: m.desc,
        priority: m.priority,
        status,
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startedAt: status === MaintenanceStatus.IN_PROGRESS || status === MaintenanceStatus.COMPLETED ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
        completedAt: status === MaintenanceStatus.COMPLETED ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : null,
        resolution: status === MaintenanceStatus.COMPLETED ? 'Issue resolved, component replaced successfully' : null,
        rejectionNote: status === MaintenanceStatus.REJECTED ? 'Asset still functional, monitor for further issues' : null,
      },
    });
  }

  console.log('✅ Created 10 maintenance requests');

  // ===================================
  // Transfer Requests (some)
  // ===================================
  await prisma.transferRequest.create({
    data: {
      assetId: assets[5].id,
      requestedById: employees[0].id,
      toUserId: employees[3].id,
      fromDeptId: departments[0].id,
      toDeptId: departments[2].id,
      reason: 'Employee transferred to Finance department',
      status: TransferStatus.PENDING,
    },
  });

  await prisma.transferRequest.create({
    data: {
      assetId: assets[6].id,
      requestedById: employees[1].id,
      approvedById: managers[0].id,
      toUserId: employees[5].id,
      fromDeptId: departments[0].id,
      toDeptId: departments[1].id,
      reason: 'Better utilization in HR department',
      status: TransferStatus.APPROVED,
      resolvedAt: new Date(),
    },
  });

  console.log('✅ Created transfer requests');

  // ===================================
  // Audit Cycles (2)
  // ===================================
  const auditCycle1 = await prisma.auditCycle.create({
    data: {
      title: 'Q1 2024 IT Department Audit',
      description: 'Quarterly asset audit for Information Technology department',
      departmentId: departments[0].id,
      conductedById: admin.id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      isCompleted: true,
    },
  });

  const auditCycle2 = await prisma.auditCycle.create({
    data: {
      title: 'Q2 2024 Full Company Audit',
      description: 'Comprehensive asset audit covering all departments',
      conductedById: managers[0].id,
      startDate: new Date(),
      isCompleted: false,
    },
  });

  // Audit Items for cycle 1
  const itAssets = assets.filter((a) => {
    const deptIdx = assetDataList[assets.indexOf(a)]?.dept;
    return deptIdx === 0;
  }).slice(0, 10);

  for (const asset of itAssets) {
    const statuses = [AuditItemStatus.VERIFIED, AuditItemStatus.VERIFIED, AuditItemStatus.MISSING, AuditItemStatus.DAMAGED];
    await prisma.auditItem.create({
      data: {
        auditCycleId: auditCycle1.id,
        assetId: asset.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: 'Physically verified during audit',
        verifiedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Audit Items for cycle 2
  for (let i = 0; i < 8; i++) {
    await prisma.auditItem.create({
      data: {
        auditCycleId: auditCycle2.id,
        assetId: assets[i + 10].id,
        status: AuditItemStatus.PENDING,
        notes: null,
      },
    }).catch(() => {}); // ignore duplicates
  }

  console.log('✅ Created 2 audit cycles with items');

  // ===================================
  // Notifications (30)
  // ===================================
  const notifData = [
    { user: admin, title: 'System Started', msg: 'AssetFlow backend initialized successfully', type: NotificationType.SUCCESS },
    { user: managers[0], title: 'New Asset Added', msg: '50 assets have been seeded into the system', type: NotificationType.INFO },
    { user: managers[1], title: 'Maintenance Pending', msg: 'You have 5 pending maintenance requests', type: NotificationType.WARNING },
    { user: employees[0], title: 'Asset Allocated', msg: 'Asset AF-00001 has been allocated to you', type: NotificationType.SUCCESS },
    { user: employees[1], title: 'Asset Allocated', msg: 'Asset AF-00002 has been allocated to you', type: NotificationType.SUCCESS },
    { user: employees[2], title: 'Booking Confirmed', msg: 'Your booking for Conference Room A is confirmed', type: NotificationType.SUCCESS },
    { user: employees[3], title: 'Transfer Approved', msg: 'Your transfer request has been approved', type: NotificationType.SUCCESS },
    { user: employees[4], title: 'Warranty Expiring', msg: 'Asset AF-00005 warranty expires in 30 days', type: NotificationType.WARNING },
    { user: admin, title: 'Audit Due', msg: 'Q2 Audit cycle has started — assign items', type: NotificationType.WARNING },
    { user: managers[0], title: 'Overdue Return', msg: 'Asset AF-00010 is overdue for return', type: NotificationType.ERROR },
  ];

  const allNotifUsers = [admin, ...managers, ...employees];
  for (let i = 0; i < 30; i++) {
    const baseNotif = notifData[i % notifData.length];
    const user = allNotifUsers[i % allNotifUsers.length];
    const types = [NotificationType.INFO, NotificationType.SUCCESS, NotificationType.WARNING, NotificationType.ERROR];

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: i < notifData.length ? baseNotif.title : `Notification ${i + 1}`,
        message: i < notifData.length ? baseNotif.msg : `System notification ${i + 1} — please review`,
        type: i < notifData.length ? baseNotif.type : types[i % 4],
        isRead: i % 3 === 0,
      },
    });
  }

  console.log('✅ Created 30 notifications');

  // ===================================
  // Activity Logs (100)
  // ===================================
  const actions = Object.values(ActivityAction);
  const entityTypes = ['Asset', 'Allocation', 'Booking', 'MaintenanceRequest', 'TransferRequest', 'User', 'Department'];

  for (let i = 0; i < 100; i++) {
    const user = allNotifUsers[i % allNotifUsers.length];
    const action = actions[i % actions.length];
    const entityType = entityTypes[i % entityTypes.length];

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action,
        entityType,
        entityId: assets[i % assets.length]?.id,
        details: {
          description: `${action} performed on ${entityType}`,
          timestamp: new Date().toISOString(),
          metadata: { index: i, automated: true },
        },
        ipAddress: `192.168.1.${(i % 254) + 1}`,
        userAgent: 'AssetFlow-Seed/1.0',
      },
    });
  }

  console.log('✅ Created 100 activity logs');

  // ===================================
  // Summary
  // ===================================
  console.log('\n🎉 Seed completed successfully!');
  console.log('================================');
  console.log('📊 Seed Summary:');
  console.log(`  👥 Users: 13 (1 admin, 2 managers, 10 employees)`);
  console.log(`  🏢 Departments: 5`);
  console.log(`  📁 Categories: 6`);
  console.log(`  🖥️  Assets: 50 (AF-00001 to AF-00050)`);
  console.log(`  🔗 Allocations: 20`);
  console.log(`  📦 Resources: 10`);
  console.log(`  📅 Bookings: 20`);
  console.log(`  🔧 Maintenance Requests: 10`);
  console.log(`  🔍 Audit Cycles: 2`);
  console.log(`  🔔 Notifications: 30`);
  console.log(`  📝 Activity Logs: 100`);
  console.log('================================');
  console.log('\n🔑 Login Credentials:');
  console.log('  Admin:   admin@assetflow.com    / Password@123');
  console.log('  Manager: manager1@assetflow.com / Password@123');
  console.log('  Manager: manager2@assetflow.com / Password@123');
  console.log('  Employee: emp1@assetflow.com    / Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
