
// import { User, UserRole } from '@/types/user';

// export const canManageUser = (currentUser: User | null, targetUser: User): boolean => {
//   if (!currentUser) return false;
  
//   // Cannot manage yourself
//   if (targetUser.id === currentUser.id) return false;
  
//   // Super admin can manage anyone
//   if (currentUser.role === 'super_admin') return true;
  
//   // Store admin cannot manage other store admins or super admins
//   if (currentUser.role === 'store_admin') {
//     return targetUser.role !== 'super_admin' && targetUser.role !== 'store_admin';
//   }
  
//   // Role hierarchy for permission checking
//   const roleHierarchy: UserRole[] = [
//     'super_admin',
//     'store_admin', 
//     'manager',
//     'receptionist',
//     'staff'
//   ];
  
//   const currentUserIndex = roleHierarchy.indexOf(currentUser.role);
//   const targetUserIndex = roleHierarchy.indexOf(targetUser.role);
  
//   return targetUserIndex > currentUserIndex;
// };

// export const getUserRoleOptions = (currentUser: User | null): UserRole[] => {
//   const baseRoles: UserRole[] = ['staff', 'receptionist', 'manager'];
  
//   if (!currentUser) return baseRoles;
  
//   switch (currentUser.role) {
//     case 'super_admin':
//       return [...baseRoles, 'store_admin', 'super_admin'];
//     case 'store_admin':
//       return [...baseRoles, 'store_admin'];
//     case 'manager':
//       return baseRoles;
//     default:
//       return ['staff'];
//   }
// };

// export const validateUserForm = (formData: UserFormData, isEdit: boolean = false): string[] => {
//   const errors: string[] = [];

//   if (!formData.username.trim()) {
//     errors.push('Username is required');
//   }

//   if (!isEdit && !formData.password) {
//     errors.push('Password is required for new users');
//   }

//   if (formData.password && formData.password.length < 6) {
//     errors.push('Password must be at least 6 characters');
//   }

//   if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//     errors.push('Invalid email format');
//   }

//   return errors;
// };