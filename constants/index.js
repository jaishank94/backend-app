export const ROLES = {
  superadmin: 'superadmin',
  admin: 'admin',
  user: 'user'
};

export const ORDER_STATUS = {
  created: "created",
  executed: "executed",
  cancelled: "cancelled"
}

export const roleHierarchy = {
  superadmin: ['superadmin'],
  admin: ['admin', 'superadmin'],
  user: ['user', 'admin', 'superadmin']
};