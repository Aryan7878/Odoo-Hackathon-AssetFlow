import { PrismaClient, Role, AssetStatus, AssetCondition, MaintenanceStatus, TransferStatus, BookingStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // 1. Clean up existing database tables in reverse order of dependencies
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.category.deleteMany();
  
  // Set department headIds to null first to allow deletion of users without Restrict error
  await prisma.department.updateMany({ data: { headId: null } });
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('Database cleaned. Starting seed data generation...');

  // Common password hash for seed users
  const passwordHash = bcrypt.hashSync('Admin123', 10);
  const managerPasswordHash = bcrypt.hashSync('Manager123', 10);
  const employeePasswordHash = bcrypt.hashSync('Employee123', 10);

  // 2. Seed Departments (Initially with headId as null to avoid circular dependency)
  const departmentNames = ['Engineering', 'HR', 'Finance', 'Operations', 'IT'];
  const departments: any[] = [];
  
  for (const name of departmentNames) {
    const dept = await prisma.department.create({
      data: {
        name,
        description: `The ${name} Department of AssetFlow Enterprise`,
        status: 'ACTIVE'
      }
    });
    departments.push(dept);
  }
  console.log(`Seeded ${departments.length} departments.`);

  // 3. Seed Users (Admin, 2 Asset Managers, 10 Employees)
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@assetflow.com',
      password: passwordHash,
      role: Role.ADMIN,
      status: 'ACTIVE',
      phone: '+15550100',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
    }
  });

  // 2 Asset Managers
  const managers: any[] = [];
  for (let i = 1; i <= 2; i++) {
    const manager = await prisma.user.create({
      data: {
        name: `Asset Manager ${i}`,
        email: `manager${i}@assetflow.com`,
        password: managerPasswordHash,
        role: Role.ASSET_MANAGER,
        departmentId: departments[i % departments.length].id, // Assign to some departments
        status: 'ACTIVE',
        phone: `+1555020${i}`,
        profileImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d`
      }
    });
    managers.push(manager);
  }

  // 10 Employees
  const employees: any[] = [];
  const employeeNames = [
    'John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 
    'Charlie Davis', 'Eva Wilson', 'Frank Thomas', 'Grace Miller',
    'Henry Wilson', 'Ivy Martin'
  ];

  for (let i = 0; i < 10; i++) {
    const emp = await prisma.user.create({
      data: {
        name: employeeNames[i],
        email: `employee${i + 1}@assetflow.com`,
        password: employeePasswordHash,
        role: Role.EMPLOYEE,
        departmentId: departments[i % departments.length].id, // Even distribution
        status: 'ACTIVE',
        phone: `+1555030${i}`,
        profileImage: `https://images.unsplash.com/photo-1494790108377-be9c29b29330`
      }
    });
    employees.push(emp);
  }
  console.log(`Seeded 1 Admin, ${managers.length} Asset Managers, and ${employees.length} Employees.`);

  // 4. Resolve circular dependency: update department heads
  // Let's set the first manager as head of Engineering and IT, second manager as head of Operations
  // and some senior employees as heads of HR and Finance
  await prisma.department.update({
    where: { id: departments[0].id }, // Engineering
    data: { headId: managers[0].id }
  });
  await prisma.department.update({
    where: { id: departments[1].id }, // HR
    data: { headId: employees[0].id }
  });
  await prisma.department.update({
    where: { id: departments[2].id }, // Finance
    data: { headId: employees[1].id }
  });
  await prisma.department.update({
    where: { id: departments[3].id }, // Operations
    data: { headId: managers[1].id }
  });
  await prisma.department.update({
    where: { id: departments[4].id }, // IT
    data: { headId: managers[0].id }
  });
  console.log('Assigned heads to all departments.');

  // 5. Seed 6 Categories
  const categoryData = [
    { name: 'Laptop', description: 'Portable computer systems', warranty: 36 },
    { name: 'Desktop', description: 'Workstations and desktop systems', warranty: 36 },
    { name: 'Furniture', description: 'Office desks, chairs, and cabinets', warranty: 60 },
    { name: 'Vehicle', description: 'Company vehicles and transport assets', warranty: 48 },
    { name: 'Networking', description: 'Routers, switches, and access points', warranty: 24 },
    { name: 'Projector', description: 'Conference room display and projection equipment', warranty: 24 }
  ];
  const categories: any[] = [];
  for (const cat of categoryData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        description: cat.description,
        defaultWarrantyMonths: cat.warranty
      }
    });
    categories.push(category);
  }
  console.log(`Seeded ${categories.length} asset categories.`);

  // 6. Seed 50 Assets
  // We'll generate realistic asset names depending on category
  const assets: any[] = [];
  const vendors = ['Dell Inc.', 'Apple', 'Herman Miller', 'Ford Motor Co.', 'Cisco Systems', 'Epson'];
  const locations = ['HQ - Floor 1', 'HQ - Floor 2', 'Warehouse A', 'Remote', 'Server Room 3B'];

  for (let i = 1; i <= 50; i++) {
    const categoryIndex = (i - 1) % categories.length;
    const category = categories[categoryIndex];
    const department = departments[i % departments.length];
    
    let assetName = `${category.name} Asset #${i}`;
    if (category.name === 'Laptop') {
      assetName = i % 2 === 0 ? `MacBook Pro M3 16"` : `Dell Latitude 7440`;
    } else if (category.name === 'Desktop') {
      assetName = `Dell Precision 3660 Tower`;
    } else if (category.name === 'Furniture') {
      assetName = i % 2 === 0 ? `Aeron Ergonomic Chair` : `Height-Adjustable Desk`;
    } else if (category.name === 'Vehicle') {
      assetName = `Ford Transit Custom Cargo Van`;
    } else if (category.name === 'Networking') {
      assetName = `Cisco Catalyst 9300 Switch`;
    } else if (category.name === 'Projector') {
      assetName = `Epson PowerLite L520U`;
    }

    const purchaseDate = new Date();
    purchaseDate.setMonth(purchaseDate.getMonth() - Math.floor(Math.random() * 24)); // purchased in last 2 years
    const warrantyExpiry = new Date(purchaseDate);
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + category.defaultWarrantyMonths);

    const asset = await prisma.asset.create({
      data: {
        serialNumber: `SN-FLOW-${10000 + i}`,
        name: assetName,
        description: `High-quality enterprise asset for ${department.name}`,
        categoryId: category.id,
        departmentId: department.id,
        purchaseDate,
        purchaseCost: 800 + (i * 45.5), // Varied costs
        vendor: vendors[categoryIndex],
        invoiceNumber: `INV-2026-${5000 + i}`,
        warrantyExpiry,
        location: locations[i % locations.length],
        condition: i % 10 === 0 ? AssetCondition.DAMAGED : (i % 7 === 0 ? AssetCondition.FAIR : (i % 4 === 0 ? AssetCondition.GOOD : AssetCondition.EXCELLENT)),
        status: AssetStatus.AVAILABLE, // Initialized as AVAILABLE. Triggers will update it.
        imageUrl: `https://images.unsplash.com/photo-1588872657578-7efd1f1555ed`,
        createdById: admin.id
      }
    });
    assets.push(asset);
  }
  console.log(`Seeded ${assets.length} assets.`);

  // 7. Seed 20 Allocations
  // 10 Active Allocations (status = 'ACTIVE', returnedDate = null)
  // 10 Returned Allocations (status = 'RETURNED', returnedDate = set)
  // Need to make sure we don't have multiple active allocations on the same asset.
  const allocations: any[] = [];
  for (let i = 0; i < 20; i++) {
    const asset = assets[i]; // Pick first 20 assets for allocations
    const employee = employees[i % employees.length];
    const isActive = i < 10; // First 10 are active, next 10 are returned

    const allocatedDate = new Date();
    allocatedDate.setDate(allocatedDate.getDate() - 30);
    const expectedReturnDate = new Date(allocatedDate);
    expectedReturnDate.setDate(expectedReturnDate.getDate() + 90);

    const allocation = await prisma.allocation.create({
      data: {
        assetId: asset.id,
        employeeId: employee.id,
        allocatedDate,
        expectedReturnDate,
        returnedDate: isActive ? null : new Date(),
        remarks: isActive ? 'Allocated for standard remote working.' : 'Returned in good condition after project end.',
        status: isActive ? 'ACTIVE' : 'RETURNED'
      }
    });
    allocations.push(allocation);
  }
  console.log(`Seeded ${allocations.length} allocations (10 Active, 10 Returned).`);

  // 8. Seed 10 Resources
  const resourceNames = [
    { name: 'Conference Room A (Large)', type: 'ROOM', capacity: 16, location: 'HQ - Floor 1' },
    { name: 'Conference Room B (Medium)', type: 'ROOM', capacity: 8, location: 'HQ - Floor 1' },
    { name: 'Meeting Room C (Small)', type: 'ROOM', capacity: 4, location: 'HQ - Floor 2' },
    { name: 'Training Hall', type: 'ROOM', capacity: 40, location: 'HQ - Basement' },
    { name: 'Company Vehicle - Ford Transit', type: 'VEHICLE', capacity: 3, location: 'HQ Garage' },
    { name: 'Company Vehicle - Tesla Model 3', type: 'VEHICLE', capacity: 5, location: 'HQ Garage' },
    { name: 'High-Res Epson Projector A', type: 'EQUIPMENT', capacity: null, location: 'IT Inventory Room' },
    { name: 'High-Res Epson Projector B', type: 'EQUIPMENT', capacity: null, location: 'IT Inventory Room' },
    { name: 'Laptop Pool - Back-up Node', type: 'EQUIPMENT', capacity: null, location: 'IT Desk A' },
    { name: 'Network Router Backup', type: 'EQUIPMENT', capacity: null, location: 'Server Room' }
  ];

  const resources: any[] = [];
  for (const res of resourceNames) {
    const resource = await prisma.resource.create({
      data: {
        name: res.name,
        type: res.type,
        location: res.location,
        capacity: res.capacity,
        status: 'AVAILABLE'
      }
    });
    resources.push(resource);
  }
  console.log(`Seeded ${resources.length} resources.`);

  // 9. Seed 20 Bookings
  // Ensure no overlapping bookings for the same resource to avoid exclusion constraint violation.
  // We'll create exactly 2 bookings per resource, scheduled on consecutive days.
  const bookings: any[] = [];
  for (let i = 0; i < 10; i++) {
    const resource = resources[i];
    const employee = employees[i % employees.length];

    // Booking 1: Day 1 (14:00 - 16:00)
    const startTime1 = new Date();
    startTime1.setDate(startTime1.getDate() + 1);
    startTime1.setHours(14, 0, 0, 0);
    const endTime1 = new Date(startTime1);
    endTime1.setHours(16, 0, 0, 0);

    const booking1 = await prisma.booking.create({
      data: {
        resourceId: resource.id,
        employeeId: employee.id,
        purpose: 'Cross-functional project alignment meeting',
        startTime: startTime1,
        endTime: endTime1,
        status: BookingStatus.BOOKED
      }
    });
    bookings.push(booking1);

    // Booking 2: Day 2 (10:00 - 12:00)
    const startTime2 = new Date();
    startTime2.setDate(startTime2.getDate() + 2);
    startTime2.setHours(10, 0, 0, 0);
    const endTime2 = new Date(startTime2);
    endTime2.setHours(12, 0, 0, 0);

    const booking2 = await prisma.booking.create({
      data: {
        resourceId: resource.id,
        employeeId: employee.id,
        purpose: 'Client demonstration and feedback collection',
        startTime: startTime2,
        endTime: endTime2,
        status: BookingStatus.BOOKED
      }
    });
    bookings.push(booking2);
  }
  console.log(`Seeded ${bookings.length} non-overlapping bookings.`);

  // 10. Seed 10 Maintenance Requests
  // Choose assets that are NOT currently allocated (e.g. assets 21 to 30)
  // 3 PENDING, 3 IN_PROGRESS, 2 COMPLETED, 2 REJECTED
  const maintenanceRequests: any[] = [];
  const maintenanceStatuses = [
    MaintenanceStatus.PENDING, MaintenanceStatus.PENDING, MaintenanceStatus.PENDING,
    MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.IN_PROGRESS,
    MaintenanceStatus.COMPLETED, MaintenanceStatus.COMPLETED,
    MaintenanceStatus.REJECTED, MaintenanceStatus.REJECTED
  ];

  for (let i = 0; i < 10; i++) {
    const asset = assets[20 + i]; // Assets 20-29
    const status = maintenanceStatuses[i];
    const employee = employees[i % employees.length];
    const manager = managers[i % managers.length];

    const maintenance = await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        raisedById: employee.id,
        assignedToId: status !== MaintenanceStatus.PENDING ? manager.id : null,
        priority: i % 3 === 0 ? 'CRITICAL' : (i % 2 === 0 ? 'HIGH' : 'MEDIUM'),
        description: `Routine check reveals issue with performance/integrity. Diagnostics required.`,
        status,
        resolutionNotes: status === MaintenanceStatus.COMPLETED ? 'Cleaned internal fans and replaced damaged power cable. Tested successfully.' : (status === MaintenanceStatus.REJECTED ? 'No defect found upon investigation. Closed.' : null)
      }
    });
    maintenanceRequests.push(maintenance);
  }
  console.log(`Seeded ${maintenanceRequests.length} maintenance requests (with automatic asset status updates via triggers).`);

  // 11. Seed 2 Audit Cycles (Engineering and IT)
  const auditCycles: any[] = [];
  
  // Engineering Audit Cycle
  const engCycle = await prisma.auditCycle.create({
    data: {
      departmentId: departments[0].id, // Engineering
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'IN_PROGRESS',
      createdById: managers[0].id
    }
  });
  auditCycles.push(engCycle);

  // IT Audit Cycle
  const itCycle = await prisma.auditCycle.create({
    data: {
      departmentId: departments[4].id, // IT
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      createdById: managers[1].id
    }
  });
  auditCycles.push(itCycle);

  console.log(`Seeded ${auditCycles.length} audit cycles.`);

  // 12. Seed 30 Audit Items (15 for Engineering Cycle, 15 for IT Cycle)
  // Let's pick assets assigned to Engineering (dept 0) and IT (dept 4)
  const engAssets = assets.filter(a => a.departmentId === departments[0].id);
  const itAssets = assets.filter(a => a.departmentId === departments[4].id);
  
  const auditItems: any[] = [];
  // 15 items for Engineering Cycle
  for (let i = 0; i < 15; i++) {
    const asset = engAssets[i % engAssets.length];
    const item = await prisma.auditItem.create({
      data: {
        auditCycleId: engCycle.id,
        assetId: asset.id,
        expectedLocation: asset.location,
        actualLocation: i % 5 === 0 ? `${asset.location} - Desk ${i}` : asset.location,
        verificationStatus: i % 4 === 0 ? 'VERIFIED' : 'PENDING',
        remarks: i % 4 === 0 ? 'Verified visually during physical walkthrough.' : null,
        verifiedById: i % 4 === 0 ? managers[0].id : null,
        verifiedAt: i % 4 === 0 ? new Date() : null
      }
    });
    auditItems.push(item);
  }

  // 15 items for IT Cycle
  for (let i = 0; i < 15; i++) {
    const asset = itAssets[i % itAssets.length];
    const item = await prisma.auditItem.create({
      data: {
        auditCycleId: itCycle.id,
        assetId: asset.id,
        expectedLocation: asset.location,
        actualLocation: null,
        verificationStatus: 'PENDING',
        remarks: null,
        verifiedById: null,
        verifiedAt: null
      }
    });
    auditItems.push(item);
  }
  console.log(`Seeded ${auditItems.length} audit items.`);

  // 13. Seed 30 Notifications
  const notifications: any[] = [];
  const notificationTitles = [
    'Asset Allocated', 'Maintenance Request Approved', 'Audit Scheduled', 
    'Transfer Request Pending', 'Urgent Action Required', 'Policy Update'
  ];
  
  for (let i = 1; i <= 30; i++) {
    const randomUser = employees[i % employees.length];
    const type = i % 4 === 0 ? NotificationType.ERROR : (i % 3 === 0 ? NotificationType.WARNING : (i % 2 === 0 ? NotificationType.SUCCESS : NotificationType.INFO));
    const notification = await prisma.notification.create({
      data: {
        userId: randomUser.id,
        title: notificationTitles[i % notificationTitles.length],
        message: `Hello ${randomUser.name}, this is system notification #${i} notifying you of changes.`,
        type,
        isRead: i % 3 === 0,
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000) // increment hours in past
      }
    });
    notifications.push(notification);
  }
  console.log(`Seeded ${notifications.length} notifications.`);

  // 14. Seed 100 Activity Logs
  const activityLogs: any[] = [];
  const entities = ['Asset', 'User', 'Department', 'Allocation', 'Booking', 'MaintenanceRequest'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'];
  
  for (let i = 1; i <= 100; i++) {
    const randomUser = i % 10 === 0 ? null : employees[i % employees.length]; // Some system logs (null user)
    const entity = entities[i % entities.length];
    const action = actions[i % actions.length];

    const log = await prisma.activityLog.create({
      data: {
        userId: randomUser ? randomUser.id : null,
        entity,
        entityId: null, // nullable UUID
        action,
        oldValue: { status: 'OLD_VALUE' },
        newValue: { status: 'NEW_VALUE' },
        createdAt: new Date(Date.now() - i * 15 * 60 * 1000) // incremental minutes in past
      }
    });
    activityLogs.push(log);
  }
  console.log(`Seeded ${activityLogs.length} activity logs.`);

  console.log('Seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
