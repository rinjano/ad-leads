// Test script to verify advertiser role permissions
const { rolePermissions } = require('./src/contexts/AuthContext.tsx');

// Test advertiser permissions
console.log('Advertiser Role Permissions:');
console.log('Menus:', rolePermissions.advertiser.menus);
console.log('Can access laporan:', rolePermissions.advertiser.menus.includes('laporan'));

// Test other roles for comparison
console.log('\nComparison with other roles:');
console.log('CS Representative menus:', rolePermissions.cs_representative.menus);
console.log('Retention menus:', rolePermissions.retention.menus);
console.log('Super Admin menus:', rolePermissions.super_admin.menus);