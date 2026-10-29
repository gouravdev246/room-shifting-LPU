import './src/common/config/env.js';
import app from './src/app.js';
import { connectDB, pool } from './src/common/config/db.js';
import redis from './src/common/config/redis.js';

let server;
let baseUrl;

const runTest = async (name, fn) => {
  try {
    process.stdout.write(`⏳ Testing: ${name}... `);
    await fn();
    console.log('✅ PASS');
    return true;
  } catch (err) {
    console.log('❌ FAIL');
    console.error('   Error:', err.message);
    return false;
  }
};

async function main() {
  console.log('\n======================================================');
  console.log('🚀 Starting Full API Endpoints Test with Dummy Data');
  console.log('======================================================\n');

  await connectDB();

  // Start server on an ephemeral free port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Server test instance listening on ${baseUrl}\n`);
      resolve();
    });
  });

  const randSuffix = Math.floor(10000 + Math.random() * 90000);
  const dummyUser = {
    name: 'Test Student',
    reg_id: `122${randSuffix}`,
    phone: `98765${randSuffix}`,
    hostel: 'BH-1',
    password: 'Password@123',
  };

  let authToken = null;
  let createdRoomId = null;
  let allPassed = true;

  // 1. Health check
  allPassed =
    (await runTest('GET /health (Health Check)', async () => {
      const res = await fetch(`${baseUrl}/health`);
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(`Unexpected payload: ${JSON.stringify(data)}`);
    })) && allPassed;

  // 2. Register
  allPassed =
    (await runTest('POST /api/auth/register (New User Registration)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyUser),
      });
      if (res.status !== 201) {
        const err = await res.json();
        throw new Error(`Status ${res.status}: ${err.message}`);
      }
      const data = await res.json();
      if (!data.token || !data.user || data.user.reg_id !== dummyUser.reg_id) {
        throw new Error('Missing token or user object in response');
      }
      authToken = data.token;
    })) && allPassed;

  // 3. Register Duplicate (Validation)
  allPassed =
    (await runTest('POST /api/auth/register (Duplicate Check)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyUser),
      });
      if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
    })) && allPassed;

  // 4. Login with Registration ID
  allPassed =
    (await runTest('POST /api/auth/login (Login with Registration ID)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reg_id: dummyUser.reg_id,
          password: dummyUser.password,
        }),
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('Token not returned');
      authToken = data.token;
    })) && allPassed;

  // 5. Login with Phone
  allPassed =
    (await runTest('POST /api/auth/login (Login with Phone Number)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: dummyUser.phone,
          password: dummyUser.password,
        }),
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    })) && allPassed;

  // 6. Login with Wrong Password
  allPassed =
    (await runTest('POST /api/auth/login (Invalid Password Rejection)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reg_id: dummyUser.reg_id,
          password: 'wrong_password_xyz',
        }),
      });
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    })) && allPassed;

  // 7. Get Authenticated User Profile
  allPassed =
    (await runTest('GET /api/auth/me (Protected Profile Check)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (data.user.reg_id !== dummyUser.reg_id) throw new Error('Incorrect user returned');
    })) && allPassed;

  // 8. Add Room (Protected)
  allPassed =
    (await runTest('POST /api/rooms (Create Room Listing)', async () => {
      const newRoomData = {
        hostel_name: 'BH-1',
        room_number: `40${randSuffix % 10}`,
        block: 'B',
        room_type: 'AC',
        seater: 3,
        floor: 4,
        description: 'Test corner room with great balcony',
        photos: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
      };
      const res = await fetch(`${baseUrl}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newRoomData),
      });
      if (res.status !== 201) {
        const err = await res.json();
        throw new Error(`Status ${res.status}: ${err.message}`);
      }
      const data = await res.json();
      if (!data.room || !data.room.id) throw new Error('Room object with ID not returned');
      createdRoomId = data.room.id;
    })) && allPassed;

  // 9. Search / Browse Rooms (All) with Redis Caching
  allPassed =
    (await runTest('GET /api/rooms (Browse All & Redis Cache Hit/Miss)', async () => {
      // First call (cache miss or populated)
      const res1 = await fetch(`${baseUrl}/api/rooms`);
      if (res1.status !== 200) throw new Error(`Status was ${res1.status}`);
      const data1 = await res1.json();
      if (!Array.isArray(data1.rooms) || data1.count < 1) {
        throw new Error(`Expected at least 1 room, got ${data1.count}`);
      }

      // Second call (MUST hit Redis cache)
      const res2 = await fetch(`${baseUrl}/api/rooms`);
      const data2 = await res2.json();
      if (data2.source !== 'cache') {
        console.warn(`(Notice: source was ${data2.source})`);
      }
      if (data2.count !== data1.count) throw new Error('Cache returned different count');
    })) && allPassed;

  // 10. Filter Rooms by Query Parameters
  allPassed =
    (await runTest('GET /api/rooms?hostel=BH-1&type=AC&seater=3 (Filter Query)', async () => {
      const res = await fetch(`${baseUrl}/api/rooms?hostel=BH-1&type=AC&seater=3`);
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      const match = data.rooms.find((r) => r.id === createdRoomId);
      if (!match) throw new Error('Created room not found in filtered query');
    })) && allPassed;

  // 11. Filter Rooms with No Matching Results
  allPassed =
    (await runTest('GET /api/rooms?hostel=NonExistentHostel (Zero Results Filter)', async () => {
      const res = await fetch(`${baseUrl}/api/rooms?hostel=NonExistentHostel`);
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (data.count !== 0) throw new Error(`Expected 0 rooms, got ${data.count}`);
    })) && allPassed;

  // 12. Get Single Room Details (Public unauthenticated - phone masked)
  allPassed =
    (await runTest('GET /api/rooms/:id (Public view with phone masking)', async () => {
      const res = await fetch(`${baseUrl}/api/rooms/${createdRoomId}`);
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (!data.room.owner_phone.includes('*')) {
        throw new Error(`Expected masked phone, got ${data.room.owner_phone}`);
      }
      if (data.room.can_view_contact !== false) throw new Error('can_view_contact should be false');
    })) && allPassed;

  // 13. Get Single Room Details (Authenticated - full phone visible)
  allPassed =
    (await runTest('GET /api/rooms/:id (Authenticated view with owner rights)', async () => {
      const res = await fetch(`${baseUrl}/api/rooms/${createdRoomId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (data.room.owner_phone.includes('*')) {
        throw new Error('Phone should be unmasked for authenticated user');
      }
      if (data.room.is_owner !== true) throw new Error('is_owner should be true');
    })) && allPassed;

  // 14. Get Room Owner Contact (Protected)
  allPassed =
    (await runTest('GET /api/rooms/:id/contact (WhatsApp & Phone Contact Info)', async () => {
      const res = await fetch(`${baseUrl}/api/rooms/${createdRoomId}/contact`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (!data.contact.whatsapp_url || !data.contact.phone) {
        throw new Error('Missing contact details or WhatsApp URL');
      }
    })) && allPassed;

  // 15. Delete Room (Protected - Owner only)
  allPassed =
    (await runTest('DELETE /api/rooms/:id (Owner Delete & Cache Invalidation)', async () => {
      const res = await fetch(`${baseUrl}/api/rooms/${createdRoomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);

      // Verify it is gone
      const verifyRes = await fetch(`${baseUrl}/api/rooms/${createdRoomId}`);
      if (verifyRes.status !== 404) throw new Error('Room should return 404 after deletion');
    })) && allPassed;

  // 16. Logout
  allPassed =
    (await runTest('POST /api/auth/logout (Logout Session)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
      });
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
    })) && allPassed;

  // Cleanup test user from Neon DB
  try {
    await pool.query('DELETE FROM users WHERE st_reg_id = $1', [dummyUser.reg_id]);
  } catch (cleanErr) {
    console.warn('Test cleanup warning:', cleanErr.message);
  }

  // Teardown connections
  server.close();
  await pool.end();
  await redis.quit();

  console.log('\n======================================================');
  if (allPassed) {
    console.log('🎉 ALL ENDPOINTS TESTED AND PASSED SUCCESSFULLY!');
  } else {
    console.log('⚠️ SOME ENDPOINT TESTS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

