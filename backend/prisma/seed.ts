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
  // 8 Departments
  // ===================================
  const deptData = [
    { name: 'Engineering', code: 'ENG', description: 'Software and systems engineering development' },
    { name: 'Human Resources', code: 'HR', description: 'Talent acquisition and employee relations' },
    { name: 'Finance', code: 'FIN', description: 'Corporate accounting, billing, and budgeting' },
    { name: 'Operations', code: 'OPS', description: 'Facilities, logistics, and company operations' },
    { name: 'Sales', code: 'SLS', description: 'Enterprise sales, account management, and business development' },
    { name: 'Marketing', code: 'MKT', description: 'Brand marketing, digital advertising, and communications' },
    { name: 'IT Support', code: 'IT', description: 'Helpdesk, network administration, and systems support' },
    { name: 'Customer Success', code: 'CS', description: 'Post-sales onboarding and customer relations' },
  ];

  const departments = [];
  for (const dept of deptData) {
    const created = await prisma.department.create({ data: dept });
    departments.push(created);
  }
  console.log('✅ Created 8 departments');

  // ===================================
  // 8 Categories
  // ===================================
  const catData = [
    { name: 'Laptops', code: 'LPT', description: 'Portable workstations and MacBooks' },
    { name: 'Desktops', code: 'DSK', description: 'Desktop PCs, iMacs, and workstations' },
    { name: 'Monitors', code: 'MON', description: 'External displays and dual-screen set-ups' },
    { name: 'Mobile Devices', code: 'MOB', description: 'Company smartphones, tablets, and test devices' },
    { name: 'Networking Equipment', code: 'NET', description: 'Routers, network switches, and firewalls' },
    { name: 'Office Furniture', code: 'FRN', description: 'Ergonomic chairs, desks, and focus pods' },
    { name: 'Company Vehicles', code: 'VEH', description: 'Delivery vans and company-owned electric cars' },
    { name: 'Software Licenses', code: 'LIC', description: 'SaaS seats, developer tools, and operating systems' },
  ];

  const categories = [];
  for (const cat of catData) {
    const created = await prisma.category.create({ data: cat });
    categories.push(created);
  }
  console.log('✅ Created 8 categories');

  // ===================================
  // Users (1 Admin, 2 Managers, 20 Employees = 23 Users)
  // ===================================
  const passwordHash = await bcrypt.hash('Password@123', 12);

  // Admin User
  const admin = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      email: 'admin@assetflow.com',
      password: passwordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phone: '+1-555-0101',
      role: Role.ADMIN,
      departmentId: departments[6].id, // IT Support
      isActive: true,
    },
  });

  // Asset Managers
  const managers = [
    await prisma.user.create({
      data: {
        employeeId: 'EMP-002',
        email: 'manager1@assetflow.com',
        password: passwordHash,
        firstName: 'David',
        lastName: 'Miller',
        phone: '+1-555-0102',
        role: Role.ASSET_MANAGER,
        departmentId: departments[3].id, // Operations
        isActive: true,
      },
    }),
    await prisma.user.create({
      data: {
        employeeId: 'EMP-003',
        email: 'manager2@assetflow.com',
        password: passwordHash,
        firstName: 'Elena',
        lastName: 'Rostova',
        phone: '+1-555-0103',
        role: Role.ASSET_MANAGER,
        departmentId: departments[6].id, // IT Support
        isActive: true,
      },
    }),
  ];

  // Set managers inside department fields (if schemas allow or update them)
  await prisma.department.update({
    where: { id: departments[3].id },
    data: { managerId: managers[0].id },
  });
  await prisma.department.update({
    where: { id: departments[6].id },
    data: { managerId: managers[1].id },
  });

  // 20 Employees data
  const empNames = [
    { first: 'Alexander', last: 'Wright', title: 'Senior Software Engineer', deptIdx: 0 }, // ENG
    { first: 'Emily', last: 'Chen', title: 'QA Engineer', deptIdx: 0 },
    { first: 'Michael', last: 'Rodriguez', title: 'Lead Architect', deptIdx: 0 },
    { first: 'Sophia', last: 'Patel', title: 'Product Designer', deptIdx: 0 },
    { first: 'James', last: 'Johnson', title: 'HR Manager', deptIdx: 1 }, // HR
    { first: 'Olivia', last: 'Smith', title: 'Recruiting Specialist', deptIdx: 1 },
    { first: 'William', last: 'Brown', title: 'Financial Controller', deptIdx: 2 }, // FIN
    { first: 'Emma', last: 'Davis', title: 'Senior Auditor', deptIdx: 2 },
    { first: 'Oliver', last: 'Garcia', title: 'Operations Coordinator', deptIdx: 3 }, // OPS
    { first: 'Lucas', last: 'Martinez', title: 'Logistics Supervisor', deptIdx: 3 },
    { first: 'Mia', last: 'Robinson', title: 'Enterprise Account Executive', deptIdx: 4 }, // SLS
    { first: 'Benjamin', last: 'Clark', title: 'Sales Manager', deptIdx: 4 },
    { first: 'Charlotte', last: 'Rodriguez', title: 'Sales SDR', deptIdx: 4 },
    { first: 'Amelia', last: 'Lewis', title: 'Director of Marketing', deptIdx: 5 }, // MKT
    { first: 'Henry', last: 'Lee', title: 'Content strategist', deptIdx: 5 },
    { first: 'Elijah', last: 'Walker', title: 'IT Helpdesk Specialist', deptIdx: 6 }, // IT
    { first: 'Harper', last: 'Hall', title: 'Systems Administrator', deptIdx: 6 },
    { first: 'Daniel', last: 'Allen', title: 'Network Security Engineer', deptIdx: 6 },
    { first: 'Evelyn', last: 'Young', title: 'Customer Success Manager', deptIdx: 7 }, // CS
    { first: 'Jackson', last: 'King', title: 'Technical Support Account Manager', deptIdx: 7 },
  ];

  const employees = [];
  for (let i = 0; i < empNames.length; i++) {
    const details = empNames[i];
    const created = await prisma.user.create({
      data: {
        employeeId: `EMP-${(i + 4).toString().padStart(3, '0')}`,
        email: `emp${i + 1}@assetflow.com`,
        password: passwordHash,
        firstName: details.first,
        lastName: details.last,
        phone: `+1-555-01${i + 10}`,
        role: Role.EMPLOYEE,
        departmentId: departments[details.deptIdx].id,
        isActive: true,
      },
    });
    employees.push(created);
  }

  const allUsers = [admin, ...managers, ...employees];
  console.log('✅ Seeded 1 Admin, 2 Managers, and 20 Employees');

  // ===================================
  // 100 Assets
  // ===================================
  // Asset templates
  const assetSpecs = {
    LPT: [
      { name: 'MacBook Pro 16" M3 Max', vendor: 'Apple Inc.', cost: 3499.00 },
      { name: 'ThinkPad X1 Carbon Gen 12', vendor: 'Lenovo', cost: 1899.00 },
      { name: 'Dell XPS 15 9530', vendor: 'Dell Technologies', cost: 2199.00 },
      { name: 'HP EliteBook 840 G10', vendor: 'HP Inc.', cost: 1499.00 },
    ],
    DSK: [
      { name: 'iMac 24" M3 Octa-Core', vendor: 'Apple Inc.', cost: 1699.00 },
      { name: 'Dell OptiPlex 7090 Tower', vendor: 'Dell Technologies', cost: 1099.00 },
      { name: 'Mac Studio M2 Max', vendor: 'Apple Inc.', cost: 1999.00 },
    ],
    MON: [
      { name: 'Dell UltraSharp 27" U2723QE', vendor: 'Dell Technologies', cost: 599.00 },
      { name: 'LG UltraFine 32UL950 32"', vendor: 'LG Electronics', cost: 899.00 },
      { name: 'Samsung Odyssey G9 49"', vendor: 'Samsung', cost: 1299.00 },
    ],
    MOB: [
      { name: 'iPhone 16 Pro Max 256GB', vendor: 'Apple Inc.', cost: 1199.00 },
      { name: 'Samsung Galaxy S24 Ultra', vendor: 'Samsung', cost: 1299.00 },
      { name: 'iPad Pro 12.9" M2 Wi-Fi', vendor: 'Apple Inc.', cost: 1099.00 },
    ],
    NET: [
      { name: 'Cisco Meraki MX67 Firewall', vendor: 'Cisco Systems', cost: 799.00 },
      { name: 'Ubiquiti UniFi 24-Port Switch', vendor: 'Ubiquiti Networks', cost: 399.00 },
      { name: 'Cisco Catalyst 9300 Switch', vendor: 'Cisco Systems', cost: 2499.00 },
    ],
    FRN: [
      { name: 'Herman Miller Aeron Chair', vendor: 'Herman Miller', cost: 1450.00 },
      { name: 'Autonomous SmartDesk Pro', vendor: 'Autonomous', cost: 799.00 },
      { name: 'Steelcase Gesture Chair', vendor: 'Steelcase', cost: 1190.00 },
    ],
    VEH: [
      { name: 'Tesla Model 3 Long Range', vendor: 'Tesla Inc.', cost: 47990.00 },
      { name: 'Ford Transit Cargo Van', vendor: 'Ford Motor Co.', cost: 38990.00 },
      { name: 'Chevrolet Bolt EV Utility', vendor: 'General Motors', cost: 26500.00 },
    ],
    LIC: [
      { name: 'Adobe Creative Cloud Enterprise', vendor: 'Adobe Systems', cost: 950.00 },
      { name: 'JetBrains All Products Pack', vendor: 'JetBrains s.r.o.', cost: 650.00 },
      { name: 'Microsoft 365 E5 License', vendor: 'Microsoft Corp', cost: 480.00 },
    ],
  };

  const assets = [];
  const allocatedAssets = [];
  const availableAssets = [];
  const maintenanceAssets = [];

  for (let i = 1; i <= 100; i++) {
    // Determine category to cycle
    const category = categories[(i - 1) % 8];
    const catCode = category.code;
    const templates = assetSpecs[catCode as keyof typeof assetSpecs];
    const template = templates[(i - 1) % templates.length];

    // Status distribution
    let status = AssetStatus.AVAILABLE;
    if (i <= 60) {
      status = AssetStatus.ALLOCATED;
    } else if (i <= 90) {
      status = AssetStatus.AVAILABLE;
    } else {
      status = AssetStatus.UNDER_MAINTENANCE;
    }

    const purchaseDate = new Date(Date.now() - Math.floor(Math.random() * 500) * 24 * 60 * 60 * 1000 - 30 * 24 * 60 * 60 * 1000);
    const warrantyExpiry = new Date(purchaseDate.getTime() + 365 * 2 * 24 * 60 * 60 * 1000);

    const asset = await prisma.asset.create({
      data: {
        assetTag: `AF-${i.toString().padStart(5, '0')}`,
        serialNumber: `SN-${i.toString().padStart(5, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        name: template.name,
        description: `High performance corporate asset issued by corporate IT.`,
        categoryId: category.id,
        departmentId: departments[i % 8].id,
        purchaseDate,
        purchaseCost: template.cost,
        vendor: template.vendor,
        invoiceNumber: `INV-${purchaseDate.getFullYear()}-${10000 + i}`,
        warrantyExpiry,
        location: i % 10 === 0 ? 'Remote' : `HQ - Floor ${Math.floor(i / 20) + 1}`,
        condition: i % 15 === 0 ? AssetCondition.FAIR : i % 25 === 0 ? AssetCondition.EXCELLENT : AssetCondition.GOOD,
        status,
        createdById: admin.id,
      },
    });

    assets.push(asset);
    if (status === AssetStatus.ALLOCATED) {
      allocatedAssets.push(asset);
    } else if (status === AssetStatus.AVAILABLE) {
      availableAssets.push(asset);
    } else if (status === AssetStatus.UNDER_MAINTENANCE) {
      maintenanceAssets.push(asset);
    }
  }

  console.log(`✅ Created 100 assets (allocated: ${allocatedAssets.length}, available: ${availableAssets.length}, maintenance: ${maintenanceAssets.length})`);

  // ===================================
  // 60 Active Allocations
  // ===================================
  for (let i = 0; i < allocatedAssets.length; i++) {
    const asset = allocatedAssets[i];
    const employee = employees[i % employees.length];
    
    await prisma.allocation.create({
      data: {
        assetId: asset.id,
        allocatedToId: employee.id,
        allocatedById: managers[i % 2].id,
        allocationDate: new Date(Date.now() - (30 + i) * 24 * 60 * 60 * 1000),
        expectedReturn: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        status: AllocationStatus.ACTIVE,
        notes: 'Asset allocated for engineering/office productivity tasks.',
      },
    });
  }
  console.log('✅ Created 60 Active Allocations');

  // ===================================
  // 10 Resources
  // ===================================
  const resourceTemplates = [
    { name: 'Boardroom Delta', code: 'BRD-DLT', type: ResourceType.MEETING_ROOM, location: 'HQ - Floor 4', capacity: 16 },
    { name: 'Focus Studio 2', code: 'FCS-ST2', type: ResourceType.MEETING_ROOM, location: 'HQ - Floor 1', capacity: 2 },
    { name: 'Conference Pod Gamma', code: 'CNF-GMA', type: ResourceType.MEETING_ROOM, location: 'HQ - Floor 2', capacity: 8 },
    { name: 'Executive Suite', code: 'EXE-STE', type: ResourceType.MEETING_ROOM, location: 'HQ - Floor 5', capacity: 6 },
    { name: 'Epson Pro Projector', code: 'PRJ-EPS', type: ResourceType.SHARED_EQUIPMENT, location: 'IT Inventory Room', capacity: 1 },
    { name: 'Sony Camera Kit', code: 'CAM-SNY', type: ResourceType.SHARED_EQUIPMENT, location: 'Marketing Lab', capacity: 1 },
    { name: 'Tesla Model 3 Pool', code: 'CAR-TSL', type: ResourceType.VEHICLE, location: 'Parking Area B', capacity: 5 },
    { name: 'Ford Delivery Transit', code: 'VAN-FRD', type: ResourceType.VEHICLE, location: 'Dock Area 1', capacity: 3 },
    { name: 'Oculus Rift Test Kit', code: 'VR-OCL', type: ResourceType.SHARED_EQUIPMENT, location: 'Engineering Lab', capacity: 1 },
    { name: 'IT Calibration Kit', code: 'IT-CAL', type: ResourceType.SHARED_EQUIPMENT, location: 'IT Server Room', capacity: 1 },
  ];

  const resources = [];
  for (const res of resourceTemplates) {
    const created = await prisma.resource.create({ data: res });
    resources.push(created);
  }
  console.log('✅ Seeded 10 Resources');

  // ===================================
  // 30 Non-Overlapping Bookings
  // ===================================
  const bookingTitles = [
    'Weekly Standup Meeting',
    'Quarterly Strategy Alignment',
    'Employee Review Session',
    'Marketing Campaign Planning',
    'Product Launch Prep',
    'IT System Upgrades Review',
    'Client Pitch Presentation',
    'Onboarding Workshops',
  ];

  let bookingCount = 0;
  for (let rIdx = 0; rIdx < resources.length; rIdx++) {
    const res = resources[rIdx];
    
    // We generate exactly 3 non-overlapping bookings for each resource
    // Day 1 Booking
    const date1 = new Date();
    date1.setDate(date1.getDate() - 2);
    date1.setHours(9, 0, 0, 0);
    const end1 = new Date(date1);
    end1.setHours(11, 0, 0, 0);

    await prisma.booking.create({
      data: {
        resourceId: res.id,
        bookedById: employees[bookingCount % employees.length].id,
        title: bookingTitles[bookingCount % bookingTitles.length],
        description: 'Collaborative team working session.',
        startTime: date1,
        endTime: end1,
        status: BookingStatus.COMPLETED,
        attendees: res.capacity ? Math.floor(res.capacity * 0.7) : 1,
      },
    });
    bookingCount++;

    // Day 2 Booking
    const date2 = new Date();
    date2.setDate(date2.getDate() - 1);
    date2.setHours(13, 0, 0, 0);
    const end2 = new Date(date2);
    end2.setHours(15, 0, 0, 0);

    await prisma.booking.create({
      data: {
        resourceId: res.id,
        bookedById: employees[bookingCount % employees.length].id,
        title: bookingTitles[bookingCount % bookingTitles.length],
        description: 'Status review meeting.',
        startTime: date2,
        endTime: end2,
        status: BookingStatus.COMPLETED,
        attendees: res.capacity ? Math.floor(res.capacity * 0.5) : 1,
      },
    });
    bookingCount++;

    // Day 3 (Future) Booking
    const date3 = new Date();
    date3.setDate(date3.getDate() + 3);
    date3.setHours(10, 0, 0, 0);
    const end3 = new Date(date3);
    end3.setHours(12, 0, 0, 0);

    await prisma.booking.create({
      data: {
        resourceId: res.id,
        bookedById: employees[bookingCount % employees.length].id,
        title: bookingTitles[bookingCount % bookingTitles.length],
        description: 'Onboarding focus session.',
        startTime: date3,
        endTime: end3,
        status: BookingStatus.CONFIRMED,
        attendees: res.capacity ? Math.floor(res.capacity * 0.8) : 1,
      },
    });
    bookingCount++;
  }
  console.log(`✅ Seeded 30 Bookings (3 per resource, conflict-free)`);

  // ===================================
  // 20 Maintenance Requests (10 IN_PROGRESS for maintenanceAssets)
  // ===================================
  const maintenanceTitles = [
    { title: 'Broken Keyboard keys', desc: 'Spacebar and Shift key unresponsive after spill' },
    { title: 'Battery Degradation', desc: 'Battery capacity dropped below 60% and swell risk check needed' },
    { title: 'Unusual fan noise', desc: 'High pitched grinding noise from cooling fan under workload' },
    { title: 'OS corrupt crash', desc: 'Stuck in boot loop after automatic OS security patch update' },
    { title: 'Screen flicker lines', desc: 'Horizontal colored lines appearing across display' },
  ];

  // 10 active requests
  for (let i = 0; i < maintenanceAssets.length; i++) {
    const asset = maintenanceAssets[i];
    const m = maintenanceTitles[i % maintenanceTitles.length];

    await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        requestedById: employees[i % employees.length].id,
        approvedById: managers[0].id,
        assignedToId: managers[1].id,
        title: m.title,
        description: m.desc,
        priority: i % 3 === 0 ? 'HIGH' : 'MEDIUM',
        status: MaintenanceStatus.IN_PROGRESS,
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 10 historical/other requests
  for (let i = 0; i < 10; i++) {
    const asset = assets[i * 5]; // pick a spread of assets
    const m = maintenanceTitles[i % maintenanceTitles.length];
    
    // Choose status
    let status = MaintenanceStatus.COMPLETED;
    if (i < 5) status = MaintenanceStatus.COMPLETED;
    else if (i < 7) status = MaintenanceStatus.PENDING;
    else if (i < 9) status = MaintenanceStatus.APPROVED;
    else status = MaintenanceStatus.REJECTED;

    await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        requestedById: employees[i % employees.length].id,
        approvedById: status !== MaintenanceStatus.PENDING ? managers[0].id : null,
        assignedToId: status === MaintenanceStatus.COMPLETED ? managers[1].id : null,
        title: `${m.title} (Regular Check)`,
        description: `${m.desc} - general checkup.`,
        priority: i % 2 === 0 ? 'LOW' : 'MEDIUM',
        status,
        scheduledDate: new Date(Date.now() - (5 + i) * 24 * 60 * 60 * 1000),
        startedAt: status === MaintenanceStatus.COMPLETED ? new Date(Date.now() - (4 + i) * 24 * 60 * 60 * 1000) : null,
        completedAt: status === MaintenanceStatus.COMPLETED ? new Date(Date.now() - (3 + i) * 24 * 60 * 60 * 1000) : null,
        cost: status === MaintenanceStatus.COMPLETED ? 89.50 + (i * 20) : null,
        resolution: status === MaintenanceStatus.COMPLETED ? 'Component replaced and diagnostics passed.' : null,
        rejectionNote: status === MaintenanceStatus.REJECTED ? 'Asset is working within manufacturer tolerance limit.' : null,
      },
    });
  }
  console.log('✅ Seeded 20 Maintenance Requests (10 Active, 10 Closed/Other)');

  // ===================================
  // 10 Transfer Requests
  // ===================================
  for (let i = 0; i < 10; i++) {
    const asset = allocatedAssets[i];
    const fromEmp = employees[i % employees.length];
    const toEmp = employees[(i + 1) % employees.length];

    let status = TransferStatus.PENDING;
    if (i < 4) status = TransferStatus.PENDING;
    else if (i < 7) status = TransferStatus.APPROVED;
    else status = TransferStatus.REJECTED;

    await prisma.transferRequest.create({
      data: {
        assetId: asset.id,
        requestedById: fromEmp.id,
        fromUserId: fromEmp.id,
        toUserId: toEmp.id,
        fromDeptId: fromEmp.departmentId,
        toDeptId: toEmp.departmentId,
        reason: 'Staff relocation and inter-department project requirements.',
        status,
        approvedById: status !== TransferStatus.PENDING ? managers[0].id : null,
        rejectionNote: status === TransferStatus.REJECTED ? 'Upgraded model requested instead of transfer.' : null,
        resolvedAt: status !== TransferStatus.PENDING ? new Date() : null,
      },
    });
  }
  console.log('✅ Seeded 10 Transfer Requests');

  // ===================================
  // 50 Notifications
  // ===================================
  const notificationTemplates = [
    { title: 'New Asset Assigned', msg: 'A new laptop has been allocated to you. Verify serial number.', type: NotificationType.SUCCESS },
    { title: 'Maintenance Overdue', msg: 'Asset scheduled maintenance check is past scheduled date.', type: NotificationType.WARNING },
    { title: 'Booking Confirmed', msg: 'Conference Pod Gamma reservation has been successfully booked.', type: NotificationType.INFO },
    { title: 'Security Scan Failed', msg: 'Asset has missed the automated corporate security compliance check.', type: NotificationType.ERROR },
    { title: 'Transfer request submitted', msg: 'An asset transfer request is pending manager review.', type: NotificationType.INFO },
  ];

  for (let i = 0; i < 50; i++) {
    const template = notificationTemplates[i % notificationTemplates.length];
    const user = allUsers[i % allUsers.length];

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: template.title,
        message: template.msg,
        type: template.type,
        isRead: i % 3 === 0,
        createdAt: new Date(Date.now() - (i % 10) * 12 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Seeded 50 Notifications');

  // ===================================
  // 200 Activity Logs
  // ===================================
  const actions = [
    { action: ActivityAction.USER_LOGIN, type: 'User' },
    { action: ActivityAction.ASSET_CREATED, type: 'Asset' },
    { action: ActivityAction.ASSET_ALLOCATED, type: 'Allocation' },
    { action: ActivityAction.BOOKING_CREATED, type: 'Booking' },
    { action: ActivityAction.MAINTENANCE_STARTED, type: 'MaintenanceRequest' },
    { action: ActivityAction.MAINTENANCE_COMPLETED, type: 'MaintenanceRequest' },
    { action: ActivityAction.TRANSFER_REQUESTED, type: 'TransferRequest' },
  ];

  for (let i = 0; i < 200; i++) {
    const act = actions[i % actions.length];
    const user = allUsers[i % allUsers.length];
    const asset = assets[i % assets.length];

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: act.action,
        entityType: act.type,
        entityId: asset.id,
        details: {
          assetTag: asset.assetTag,
          name: asset.name,
          employee: `${user.firstName} ${user.lastName}`,
          ip: `192.168.1.${10 + (i % 200)}`,
        },
        ipAddress: `192.168.1.${10 + (i % 200)}`,
        userAgent: i % 2 === 0 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        createdAt: new Date(Date.now() - i * 4 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Seeded 200 Activity Logs');

  // ===================================
  // 2 Audit Cycles (to prevent blank dashboard pages)
  // ===================================
  const auditCycles = [
    await prisma.auditCycle.create({
      data: {
        title: 'Q2 2026 Engineering Laptops Audit',
        description: 'Bi-annual audit of engineering portable workstations.',
        departmentId: departments[0].id,
        conductedById: managers[0].id,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isCompleted: false,
      },
    }),
    await prisma.auditCycle.create({
      data: {
        title: 'Q1 2026 Corporate Hardware Audit',
        description: 'Complete audit of IT operations network equipment.',
        departmentId: departments[6].id,
        conductedById: managers[1].id,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        isCompleted: true,
      },
    }),
  ];

  // Seed some Audit Items
  for (let i = 0; i < 15; i++) {
    const asset = assets[i * 3]; // pick standard spread
    await prisma.auditItem.create({
      data: {
        auditCycleId: auditCycles[0].id,
        assetId: asset.id,
        status: i % 5 === 0 ? AuditItemStatus.PENDING : i % 8 === 0 ? AuditItemStatus.DAMAGED : AuditItemStatus.VERIFIED,
        notes: i % 8 === 0 ? 'Slight casing damage but operational.' : 'Verified at desk location.',
        verifiedAt: i % 5 !== 0 ? new Date() : null,
      },
    });
  }

  for (let i = 0; i < 15; i++) {
    const asset = assets[i * 4];
    await prisma.auditItem.create({
      data: {
        auditCycleId: auditCycles[1].id,
        assetId: asset.id,
        status: AuditItemStatus.VERIFIED,
        notes: 'Equipment matches description and serial number in server cabinet.',
        verifiedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Seeded 2 Audit Cycles with Audit Items');

  console.log('🎉 Seed completed successfully!');
  console.log('================================');
  console.log('📊 Seeding statistics:');
  console.log(`  👥 Users: 23 (1 admin, 2 managers, 20 employees)`);
  console.log(`  🏢 Departments: 8`);
  console.log(`  📁 Categories: 8`);
  console.log(`  🖥️  Assets: 100 (Allocated: 60, Available: 30, Maintenance: 10)`);
  console.log(`  🔗 Allocations: 60`);
  console.log(`  📅 Bookings: 30 (All conflict-free)`);
  console.log(`  🔧 Maintenance Requests: 20`);
  console.log(`  🔄 Transfer Requests: 10`);
  console.log(`  🔔 Notifications: 50`);
  console.log(`  📝 Activity Logs: 200`);
  console.log('================================');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
