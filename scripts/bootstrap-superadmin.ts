import { provisionSuperAdmin } from '../src/lib/server/superadminProvisioning';

async function runBootstrap() {
  console.log('====================================================');
  console.log('HARD GROUP CMS - SUPERADMIN PROVISIONING SCRIPT');
  console.log('====================================================\n');

  const targetEmail = process.env.SUPERADMIN_BOOTSTRAP_EMAIL || process.argv[2] || 'azeco44@gmail.com';
  const targetUid = process.env.SUPERADMIN_BOOTSTRAP_UID || process.argv[3] || 'superadmin_hard_master';
  const displayName = process.env.SUPERADMIN_DISPLAY_NAME || 'HARD Executive Board Superadmin';

  console.log(`Target Email: ${targetEmail}`);
  console.log(`Target UID  : ${targetUid}`);
  console.log(`Display Name: ${displayName}\n`);

  try {
    const result = await provisionSuperAdmin(targetUid, targetEmail, displayName);
    console.log('✅ PROVISIONING COMPLETED SUCCESSFULLY:');
    console.log(`   - Status : ${result.status}`);
    console.log(`   - Email  : ${result.email}`);
    console.log(`   - UID    : ${result.uid}`);
    console.log(`   - Info   : ${result.message}\n`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ PROVISIONING FAILED:');
    console.error(`   - Error: ${error?.message || error}\n`);
    process.exit(1);
  }
}

runBootstrap();
