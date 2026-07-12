export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'A user with this email already exists',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to access this resource',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact an administrator.',
  ACCOUNT_PENDING_APPROVAL: 'Your account is awaiting administrator approval.',
  ACCOUNT_REJECTED: 'Your registration request was rejected. Please contact your administrator.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Contact your administrator.',
  GOOGLE_AUTH_DISABLED: 'Google authentication is not configured on this server.',

  // Assets
  ASSET_NOT_FOUND: 'Asset not found',
  ASSET_TAG_EXISTS: 'Asset tag already exists',
  ASSET_NOT_AVAILABLE: 'Asset is not available for allocation',
  ASSET_ALREADY_ALLOCATED: 'Asset is already allocated',

  // Allocations
  ALLOCATION_NOT_FOUND: 'Allocation not found',
  ACTIVE_ALLOCATION_EXISTS: 'An active allocation already exists for this asset',
  NO_ACTIVE_ALLOCATION: 'No active allocation found for this asset',

  // Bookings
  BOOKING_NOT_FOUND: 'Booking not found',
  BOOKING_OVERLAP: 'Resource is already booked for the selected time slot',
  BOOKING_INVALID_DATES: 'End time must be after start time',
  RESOURCE_NOT_ACTIVE: 'Resource is not available for booking',

  // Maintenance
  MAINTENANCE_NOT_FOUND: 'Maintenance request not found',
  MAINTENANCE_NOT_PENDING: 'Maintenance request is not in pending status',
  MAINTENANCE_NOT_APPROVED: 'Maintenance request has not been approved',

  // Transfer
  TRANSFER_NOT_FOUND: 'Transfer request not found',
  TRANSFER_NOT_PENDING: 'Transfer request is not in pending status',

  // Departments
  DEPARTMENT_NOT_FOUND: 'Department not found',
  DEPARTMENT_CODE_EXISTS: 'Department with this code already exists',

  // Categories
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_CODE_EXISTS: 'Category with this code already exists',

  // Resources
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_CODE_EXISTS: 'Resource with this code already exists',

  // Audit
  AUDIT_NOT_FOUND: 'Audit cycle not found',
  AUDIT_ITEM_NOT_FOUND: 'Audit item not found',
  AUDIT_ALREADY_COMPLETED: 'Audit cycle is already completed',

  // General
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'An internal server error occurred',
  NOT_FOUND: 'Resource not found',
  DUPLICATE_ENTRY: 'A record with this value already exists',
} as const;

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration submitted. Awaiting administrator approval.',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_REFRESHED: 'Access token refreshed successfully',
  USER_FETCHED: 'User fetched successfully',
  USER_APPROVED: 'User approved successfully',
  USER_REJECTED: 'User rejected successfully',
  USER_SUSPENDED: 'User suspended successfully',
  USER_ACTIVATED: 'User activated successfully',
  ROLE_UPDATED: 'User role updated successfully',
  USER_DEPARTMENT_UPDATED: 'User department updated successfully',

  // Assets
  ASSET_CREATED: 'Asset created successfully',
  ASSET_UPDATED: 'Asset updated successfully',
  ASSET_DELETED: 'Asset deleted successfully',
  ASSETS_FETCHED: 'Assets fetched successfully',
  ASSET_FETCHED: 'Asset fetched successfully',
  ASSET_HISTORY_FETCHED: 'Asset history fetched successfully',

  // Allocations
  ALLOCATION_CREATED: 'Asset allocated successfully',
  ALLOCATION_RETURNED: 'Asset returned successfully',
  ALLOCATIONS_FETCHED: 'Allocations fetched successfully',
  ALLOCATION_FETCHED: 'Allocation fetched successfully',

  // Bookings
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  BOOKINGS_FETCHED: 'Bookings fetched successfully',
  BOOKING_FETCHED: 'Booking fetched successfully',

  // Maintenance
  MAINTENANCE_CREATED: 'Maintenance request created successfully',
  MAINTENANCE_UPDATED: 'Maintenance request updated successfully',
  MAINTENANCE_APPROVED: 'Maintenance request approved successfully',
  MAINTENANCE_REJECTED: 'Maintenance request rejected successfully',
  MAINTENANCE_STARTED: 'Maintenance started, asset status updated',
  MAINTENANCE_COMPLETED: 'Maintenance completed, asset status updated',
  MAINTENANCE_FETCHED: 'Maintenance request fetched successfully',
  MAINTENANCES_FETCHED: 'Maintenance requests fetched successfully',

  // Transfer
  TRANSFER_CREATED: 'Transfer request created successfully',
  TRANSFER_APPROVED: 'Transfer request approved successfully',
  TRANSFER_REJECTED: 'Transfer request rejected successfully',
  TRANSFERS_FETCHED: 'Transfer requests fetched successfully',
  TRANSFER_FETCHED: 'Transfer request fetched successfully',

  // Departments
  DEPARTMENT_CREATED: 'Department created successfully',
  DEPARTMENT_UPDATED: 'Department updated successfully',
  DEPARTMENT_DELETED: 'Department deleted successfully',
  DEPARTMENTS_FETCHED: 'Departments fetched successfully',
  DEPARTMENT_FETCHED: 'Department fetched successfully',

  // Categories
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  CATEGORIES_FETCHED: 'Categories fetched successfully',
  CATEGORY_FETCHED: 'Category fetched successfully',

  // Resources
  RESOURCE_CREATED: 'Resource created successfully',
  RESOURCE_UPDATED: 'Resource updated successfully',
  RESOURCE_DELETED: 'Resource deleted successfully',
  RESOURCES_FETCHED: 'Resources fetched successfully',
  RESOURCE_FETCHED: 'Resource fetched successfully',

  // Audit
  AUDIT_CREATED: 'Audit cycle created successfully',
  AUDIT_UPDATED: 'Audit cycle updated successfully',
  AUDIT_COMPLETED: 'Audit cycle completed successfully',
  AUDITS_FETCHED: 'Audit cycles fetched successfully',
  AUDIT_FETCHED: 'Audit cycle fetched successfully',
  AUDIT_ITEM_UPDATED: 'Audit item updated successfully',
  AUDIT_REPORT_FETCHED: 'Audit discrepancy report fetched successfully',

  // Notifications
  NOTIFICATIONS_FETCHED: 'Notifications fetched successfully',
  NOTIFICATION_READ: 'Notification marked as read',
  ALL_NOTIFICATIONS_READ: 'All notifications marked as read',
  NOTIFICATION_DELETED: 'Notification deleted successfully',

  // Dashboard
  STATS_FETCHED: 'Dashboard statistics fetched successfully',
  CHARTS_FETCHED: 'Dashboard charts fetched successfully',
} as const;

export const ASSET_TAG_PREFIX = 'AF';
export const EMPLOYEE_ID_PREFIX = 'EMP';
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
