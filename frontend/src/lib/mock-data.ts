// Realistic demo data for AssetFlow

export type AssetStatus = "Available" | "Allocated" | "Maintenance" | "Retired";
export type Condition = "Excellent" | "Good" | "Fair" | "Poor";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export const categories = [
  { id: "cat-1", name: "Laptops", count: 128, icon: "Laptop", color: "hsl(217 91% 60%)" },
  { id: "cat-2", name: "Monitors", count: 96, icon: "Monitor", color: "hsl(160 84% 39%)" },
  { id: "cat-3", name: "Mobile Devices", count: 74, icon: "Smartphone", color: "hsl(38 92% 50%)" },
  { id: "cat-4", name: "Peripherals", count: 210, icon: "Keyboard", color: "hsl(280 65% 60%)" },
  { id: "cat-5", name: "Networking", count: 42, icon: "Router", color: "hsl(0 84% 60%)" },
  { id: "cat-6", name: "Vehicles", count: 18, icon: "Car", color: "hsl(200 80% 45%)" },
  { id: "cat-7", name: "Furniture", count: 156, icon: "Armchair", color: "hsl(30 60% 45%)" },
  { id: "cat-8", name: "Software Licenses", count: 312, icon: "KeyRound", color: "hsl(260 70% 55%)" },
];

export const departments = [
  { id: "dep-1", name: "Engineering", head: "Priya Raghavan", assets: 264, members: 82 },
  { id: "dep-2", name: "Product Design", head: "Marcus Chen", assets: 88, members: 24 },
  { id: "dep-3", name: "Sales", head: "Amelia Torres", assets: 142, members: 46 },
  { id: "dep-4", name: "Marketing", head: "Jonas Weber", assets: 76, members: 21 },
  { id: "dep-5", name: "Finance", head: "Rhea Kapoor", assets: 54, members: 15 },
  { id: "dep-6", name: "Operations", head: "Diego Alvarez", assets: 118, members: 34 },
  { id: "dep-7", name: "Human Resources", head: "Sara Lindqvist", assets: 38, members: 12 },
  { id: "dep-8", name: "Customer Success", head: "Kai Nakamura", assets: 96, members: 38 },
];

export const employees = [
  { id: "emp-1", name: "Priya Raghavan", email: "priya.r@assetflow.io", role: "Engineering Lead", department: "Engineering", assets: 4, avatar: "PR" },
  { id: "emp-2", name: "Marcus Chen", email: "marcus.c@assetflow.io", role: "Design Director", department: "Product Design", assets: 3, avatar: "MC" },
  { id: "emp-3", name: "Amelia Torres", email: "amelia.t@assetflow.io", role: "VP Sales", department: "Sales", assets: 5, avatar: "AT" },
  { id: "emp-4", name: "Jonas Weber", email: "jonas.w@assetflow.io", role: "Marketing Manager", department: "Marketing", assets: 2, avatar: "JW" },
  { id: "emp-5", name: "Rhea Kapoor", email: "rhea.k@assetflow.io", role: "Finance Controller", department: "Finance", assets: 3, avatar: "RK" },
  { id: "emp-6", name: "Diego Alvarez", email: "diego.a@assetflow.io", role: "Ops Manager", department: "Operations", assets: 4, avatar: "DA" },
  { id: "emp-7", name: "Sara Lindqvist", email: "sara.l@assetflow.io", role: "HR Business Partner", department: "Human Resources", assets: 2, avatar: "SL" },
  { id: "emp-8", name: "Kai Nakamura", email: "kai.n@assetflow.io", role: "Customer Success Lead", department: "Customer Success", assets: 3, avatar: "KN" },
  { id: "emp-9", name: "Nadia Okafor", email: "nadia.o@assetflow.io", role: "Senior Engineer", department: "Engineering", assets: 3, avatar: "NO" },
  { id: "emp-10", name: "Lucas Silva", email: "lucas.s@assetflow.io", role: "Account Executive", department: "Sales", assets: 2, avatar: "LS" },
];

export type Asset = {
  id: string;
  tag: string;
  name: string;
  category: string;
  department: string;
  assignedTo: string | null;
  condition: Condition;
  status: AssetStatus;
  location: string;
  serial: string;
  purchaseDate: string;
  warrantyUntil: string;
  vendor: string;
};

export const assets: Asset[] = [
  { id: "a1", tag: "AF-LT-00214", name: 'MacBook Pro 16" M3 Max', category: "Laptops", department: "Engineering", assignedTo: "Priya Raghavan", condition: "Excellent", status: "Allocated", location: "HQ · Floor 4", serial: "C02XL0AAJGH5", purchaseDate: "2025-03-12", warrantyUntil: "2028-03-12", vendor: "Apple Inc." },
  { id: "a2", tag: "AF-LT-00215", name: "Dell XPS 15 (2025)", category: "Laptops", department: "Product Design", assignedTo: "Marcus Chen", condition: "Excellent", status: "Allocated", location: "HQ · Floor 3", serial: "DXP15-9821K", purchaseDate: "2025-04-02", warrantyUntil: "2028-04-02", vendor: "Dell Technologies" },
  { id: "a3", tag: "AF-MN-01042", name: 'LG UltraFine 32" 4K', category: "Monitors", department: "Engineering", assignedTo: "Nadia Okafor", condition: "Good", status: "Allocated", location: "HQ · Floor 4", serial: "LG-UF32-77213", purchaseDate: "2024-11-20", warrantyUntil: "2026-11-20", vendor: "LG Electronics" },
  { id: "a4", tag: "AF-MB-00318", name: "iPhone 16 Pro 256GB", category: "Mobile Devices", department: "Sales", assignedTo: "Amelia Torres", condition: "Excellent", status: "Allocated", location: "Remote · London", serial: "F2LMK80PXQ", purchaseDate: "2025-06-15", warrantyUntil: "2026-06-15", vendor: "Apple Inc." },
  { id: "a5", tag: "AF-LT-00301", name: "ThinkPad X1 Carbon Gen 12", category: "Laptops", department: "Finance", assignedTo: null, condition: "Excellent", status: "Available", location: "IT Store · HQ", serial: "TPX1-CG12-4402", purchaseDate: "2026-01-08", warrantyUntil: "2029-01-08", vendor: "Lenovo" },
  { id: "a6", tag: "AF-PR-04521", name: "Logitech MX Master 3S", category: "Peripherals", department: "Engineering", assignedTo: null, condition: "Good", status: "Available", location: "IT Store · HQ", serial: "LOG-MXM3S-8821", purchaseDate: "2025-02-01", warrantyUntil: "2027-02-01", vendor: "Logitech" },
  { id: "a7", tag: "AF-NW-00088", name: "Cisco Meraki MR46 AP", category: "Networking", department: "Operations", assignedTo: null, condition: "Good", status: "Maintenance", location: "Server Room B", serial: "CSC-MR46-0912", purchaseDate: "2023-08-14", warrantyUntil: "2026-08-14", vendor: "Cisco Systems" },
  { id: "a8", tag: "AF-VH-00007", name: "Tesla Model 3 (Fleet)", category: "Vehicles", department: "Operations", assignedTo: "Diego Alvarez", condition: "Excellent", status: "Allocated", location: "Parking · Bay 12", serial: "5YJ3E1EA9PF123456", purchaseDate: "2024-09-01", warrantyUntil: "2028-09-01", vendor: "Tesla Motors" },
  { id: "a9", tag: "AF-MB-00402", name: "iPad Pro 13 M4", category: "Mobile Devices", department: "Product Design", assignedTo: null, condition: "Excellent", status: "Available", location: "IT Store · HQ", serial: "IPP13-M4-1290", purchaseDate: "2025-05-20", warrantyUntil: "2026-05-20", vendor: "Apple Inc." },
  { id: "a10", tag: "AF-LT-00189", name: "MacBook Air M2", category: "Laptops", department: "Marketing", assignedTo: "Jonas Weber", condition: "Good", status: "Allocated", location: "Remote · Berlin", serial: "MBA-M2-77821", purchaseDate: "2024-04-11", warrantyUntil: "2027-04-11", vendor: "Apple Inc." },
  { id: "a11", tag: "AF-MN-01120", name: 'Dell U2723QE 27" 4K', category: "Monitors", department: "Sales", assignedTo: "Lucas Silva", condition: "Good", status: "Allocated", location: "HQ · Floor 2", serial: "DELL-U2723-8812", purchaseDate: "2024-10-01", warrantyUntil: "2027-10-01", vendor: "Dell Technologies" },
  { id: "a12", tag: "AF-PR-04780", name: "Keychron K8 Pro", category: "Peripherals", department: "Engineering", assignedTo: null, condition: "Fair", status: "Maintenance", location: "IT Repair Bench", serial: "KC-K8P-5511", purchaseDate: "2023-11-22", warrantyUntil: "2025-11-22", vendor: "Keychron" },
  { id: "a13", tag: "AF-LT-00099", name: 'MacBook Pro 14" M1', category: "Laptops", department: "Customer Success", assignedTo: "Kai Nakamura", condition: "Fair", status: "Allocated", location: "Remote · Tokyo", serial: "MBP14-M1-2201", purchaseDate: "2022-06-30", warrantyUntil: "2025-06-30", vendor: "Apple Inc." },
  { id: "a14", tag: "AF-NW-00102", name: "Ubiquiti UDM Pro", category: "Networking", department: "Operations", assignedTo: null, condition: "Excellent", status: "Available", location: "Server Room A", serial: "UBI-UDMP-3320", purchaseDate: "2025-07-01", warrantyUntil: "2028-07-01", vendor: "Ubiquiti" },
  { id: "a15", tag: "AF-FN-02201", name: "Herman Miller Aeron", category: "Furniture", department: "Engineering", assignedTo: "Nadia Okafor", condition: "Excellent", status: "Allocated", location: "HQ · Floor 4", serial: "HM-AER-99812", purchaseDate: "2024-01-15", warrantyUntil: "2036-01-15", vendor: "Herman Miller" },
  { id: "a16", tag: "AF-MB-00415", name: "Google Pixel 9 Pro", category: "Mobile Devices", department: "Marketing", assignedTo: null, condition: "Excellent", status: "Available", location: "IT Store · HQ", serial: "GPX9P-4488", purchaseDate: "2025-09-10", warrantyUntil: "2026-09-10", vendor: "Google" },
];

export const allocations = [
  { id: "al-1", asset: 'MacBook Pro 16" M3 Max', tag: "AF-LT-00214", employee: "Priya Raghavan", department: "Engineering", allocatedDate: "2025-03-14", expectedReturn: "—", status: "Active" as const },
  { id: "al-2", asset: "Dell XPS 15 (2025)", tag: "AF-LT-00215", employee: "Marcus Chen", department: "Product Design", allocatedDate: "2025-04-04", expectedReturn: "—", status: "Active" as const },
  { id: "al-3", asset: "iPhone 16 Pro 256GB", tag: "AF-MB-00318", employee: "Amelia Torres", department: "Sales", allocatedDate: "2025-06-16", expectedReturn: "—", status: "Active" as const },
  { id: "al-4", asset: "Tesla Model 3 (Fleet)", tag: "AF-VH-00007", employee: "Diego Alvarez", department: "Operations", allocatedDate: "2026-06-01", expectedReturn: "2026-07-14", status: "Due Soon" as const },
  { id: "al-5", asset: "MacBook Air M2", tag: "AF-LT-00189", employee: "Jonas Weber", department: "Marketing", allocatedDate: "2024-04-12", expectedReturn: "2026-06-30", status: "Overdue" as const },
  { id: "al-6", asset: 'LG UltraFine 32" 4K', tag: "AF-MN-01042", employee: "Nadia Okafor", department: "Engineering", allocatedDate: "2024-11-22", expectedReturn: "—", status: "Active" as const },
  { id: "al-7", asset: 'MacBook Pro 14" M1', tag: "AF-LT-00099", employee: "Kai Nakamura", department: "Customer Success", allocatedDate: "2022-07-05", expectedReturn: "2026-07-05", status: "Due Soon" as const },
  { id: "al-8", asset: "Herman Miller Aeron", tag: "AF-FN-02201", employee: "Nadia Okafor", department: "Engineering", allocatedDate: "2024-01-20", expectedReturn: "—", status: "Active" as const },
];

export const resources = [
  { id: "r-1", name: "Aurora Boardroom", type: "Meeting Room", capacity: 14, location: "HQ · Floor 5", nextBooking: "Today · 14:00" },
  { id: "r-2", name: "Nimbus Huddle Space", type: "Meeting Room", capacity: 6, location: "HQ · Floor 3", nextBooking: "Tomorrow · 09:30" },
  { id: "r-3", name: "Orion Focus Room", type: "Meeting Room", capacity: 4, location: "HQ · Floor 2", nextBooking: "Today · 16:00" },
  { id: "r-4", name: "Tesla Model 3 · Bay 12", type: "Vehicle", capacity: 4, location: "Parking Level B", nextBooking: "Fri · 08:00" },
  { id: "r-5", name: "Sony FX3 Camera Kit", type: "Shared Equipment", capacity: 1, location: "Creative Studio", nextBooking: "Wed · 10:00" },
  { id: "r-6", name: "DJI Mavic 3 Drone", type: "Shared Equipment", capacity: 1, location: "Creative Studio", nextBooking: "Next Mon · 09:00" },
];

export const bookings = [
  { id: "b-1", resource: "Aurora Boardroom", user: "Amelia Torres", date: "2026-07-12", start: "14:00", end: "15:30", purpose: "Q3 Sales pipeline review", status: "Confirmed" as const },
  { id: "b-2", resource: "Nimbus Huddle Space", user: "Marcus Chen", date: "2026-07-13", start: "09:30", end: "10:30", purpose: "Design critique · Mobile onboarding", status: "Confirmed" as const },
  { id: "b-3", resource: "Tesla Model 3 · Bay 12", user: "Diego Alvarez", date: "2026-07-14", start: "08:00", end: "18:00", purpose: "Client site visit · Manchester", status: "Confirmed" as const },
  { id: "b-4", resource: "Sony FX3 Camera Kit", user: "Jonas Weber", date: "2026-07-15", start: "10:00", end: "16:00", purpose: "Product launch shoot", status: "Pending" as const },
  { id: "b-5", resource: "Orion Focus Room", user: "Rhea Kapoor", date: "2026-07-12", start: "16:00", end: "17:00", purpose: "Board pre-read walkthrough", status: "Confirmed" as const },
];

export const maintenance = [
  { id: "m-1", asset: "Cisco Meraki MR46 AP", tag: "AF-NW-00088", reporter: "Diego Alvarez", priority: "High" as Priority, description: "Intermittent Wi-Fi drops on Floor 4 during peak hours.", status: "In Progress" as const, updated: "2h ago" },
  { id: "m-2", asset: "Keychron K8 Pro", tag: "AF-PR-04780", reporter: "Nadia Okafor", priority: "Low" as Priority, description: "Two keys unresponsive after coffee spill. Requesting cleaning + replacement switches.", status: "Approved" as const, updated: "Yesterday" },
  { id: "m-3", asset: 'MacBook Pro 14" M1', tag: "AF-LT-00099", reporter: "Kai Nakamura", priority: "Medium" as Priority, description: "Battery health at 71%. Requesting battery replacement before Q4 travel.", status: "Pending" as const, updated: "3h ago" },
  { id: "m-4", asset: "Dell XPS 15 (2025)", tag: "AF-LT-00215", reporter: "Marcus Chen", priority: "Medium" as Priority, description: "Trackpad occasional ghost taps. Firmware reset attempted, issue persists.", status: "Pending" as const, updated: "6h ago" },
  { id: "m-5", asset: "Tesla Model 3 (Fleet)", tag: "AF-VH-00007", reporter: "Diego Alvarez", priority: "Critical" as Priority, description: "Scheduled 20,000 mi service + tire rotation. Booked with certified center.", status: "Approved" as const, updated: "Today" },
  { id: "m-6", asset: 'LG UltraFine 32" 4K', tag: "AF-MN-01042", reporter: "Nadia Okafor", priority: "Low" as Priority, description: "Stuck pixel cluster near top right. Warranty check requested.", status: "In Progress" as const, updated: "1d ago" },
  { id: "m-7", asset: "Herman Miller Aeron", tag: "AF-FN-02201", reporter: "Nadia Okafor", priority: "Low" as Priority, description: "Armrest tilt lock loose. Requesting on-site replacement.", status: "Resolved" as const, updated: "3d ago" },
  { id: "m-8", asset: "MacBook Air M2", tag: "AF-LT-00189", reporter: "Jonas Weber", priority: "High" as Priority, description: "Overheating during video editing. Repeated shutdowns.", status: "Resolved" as const, updated: "5d ago" },
];

export const audits = [
  { id: "au-1", department: "Engineering", total: 264, completed: 241, pending: 23 },
  { id: "au-2", department: "Product Design", total: 88, completed: 88, pending: 0 },
  { id: "au-3", department: "Sales", total: 142, completed: 96, pending: 46 },
  { id: "au-4", department: "Marketing", total: 76, completed: 60, pending: 16 },
  { id: "au-5", department: "Finance", total: 54, completed: 54, pending: 0 },
  { id: "au-6", department: "Operations", total: 118, completed: 74, pending: 44 },
  { id: "au-7", department: "Human Resources", total: 38, completed: 31, pending: 7 },
  { id: "au-8", department: "Customer Success", total: 96, completed: 82, pending: 14 },
];

export const notifications = [
  { id: "n-1", title: "Allocation overdue", body: "MacBook Air M2 (AF-LT-00189) assigned to Jonas Weber is 12 days overdue.", time: "10m ago", unread: true, type: "danger" as const },
  { id: "n-2", title: "Maintenance approved", body: "Tesla Model 3 20,000 mi service approved by Ops Manager.", time: "45m ago", unread: true, type: "success" as const },
  { id: "n-3", title: "New booking request", body: "Jonas Weber requested Sony FX3 Camera Kit for Jul 15.", time: "2h ago", unread: true, type: "info" as const },
  { id: "n-4", title: "Warranty expiring soon", body: "8 assets have warranty expiring in the next 30 days.", time: "5h ago", unread: false, type: "warning" as const },
  { id: "n-5", title: "Audit progress", body: "Engineering department audit is 91% complete.", time: "Yesterday", unread: false, type: "info" as const },
  { id: "n-6", title: "Asset registered", body: "16 new peripherals added to inventory by Sara Lindqvist.", time: "2d ago", unread: false, type: "success" as const },
];

export const recentActivity = [
  { id: "act-1", who: "Priya Raghavan", action: "allocated", target: "MacBook Pro 16\" M3 Max", time: "12m ago", type: "allocation" as const },
  { id: "act-2", who: "Diego Alvarez", action: "approved maintenance for", target: "Tesla Model 3", time: "1h ago", type: "maintenance" as const },
  { id: "act-3", who: "Sara Lindqvist", action: "registered", target: "16 Logitech peripherals", time: "3h ago", type: "register" as const },
  { id: "act-4", who: "Amelia Torres", action: "booked", target: "Aurora Boardroom", time: "5h ago", type: "booking" as const },
  { id: "act-5", who: "Kai Nakamura", action: "requested maintenance for", target: "MacBook Pro 14\" M1", time: "8h ago", type: "maintenance" as const },
  { id: "act-6", who: "Nadia Okafor", action: "returned", target: 'Dell U2723QE 27" 4K', time: "Yesterday", type: "return" as const },
];

export const assetsByCategoryChart = categories.map((c) => ({ name: c.name, value: c.count }));
export const assetsByDepartmentChart = departments.map((d) => ({ name: d.name, value: d.assets }));
export const statusChart = [
  { name: "Allocated", value: 812, color: "hsl(217 91% 60%)" },
  { name: "Available", value: 264, color: "hsl(160 84% 39%)" },
  { name: "Maintenance", value: 38, color: "hsl(38 92% 50%)" },
  { name: "Retired", value: 22, color: "hsl(0 0% 60%)" },
];

export const trendChart = [
  { month: "Jan", allocated: 640, available: 220 },
  { month: "Feb", allocated: 668, available: 232 },
  { month: "Mar", allocated: 702, available: 248 },
  { month: "Apr", allocated: 741, available: 251 },
  { month: "May", allocated: 768, available: 259 },
  { month: "Jun", allocated: 796, available: 262 },
  { month: "Jul", allocated: 812, available: 264 },
];
