const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
    console.log("Starting Backend Verification...");

    // 1. Test Login
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'Water2026' })
        });
        const loginData = await loginRes.json();
        console.log("Login Test:", loginData.success ? "PASSED" : "FAILED", loginData);
    } catch (e) {
        console.error("Login Test Error:", e.message);
    }

    // 2. Upload Data
    const dummyData = [
        { id: 'TEST_001', data: { score: 100 }, annotations: { flagged: false } },
        { id: 'TEST_DELETE_ME', data: { score: 0 }, annotations: { flagged: true } }
    ];
    try {
        const uploadRes = await fetch(`${BASE_URL}/assessments/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dummyData)
        });
        const uploadData = await uploadRes.json();
        console.log("Upload Test:", uploadData.success ? "PASSED" : "FAILED", uploadData);
    } catch (e) {
        console.error("Upload Test Error:", e.message);
    }

    // 3. Test Delete
    try {
        const delRes = await fetch(`${BASE_URL}/assessments/TEST_DELETE_ME`, {
            method: 'DELETE'
        });
        const delData = await delRes.json();
        console.log("Delete Test:", delData.success ? "PASSED" : "FAILED", delData);
    } catch (e) {
        console.error("Delete Test Error:", e.message);
    }

    // 4. Verify Deletion
    try {
        const getRes = await fetch(`${BASE_URL}/assessments`);
        const getData = await getRes.json();
        const deletedItem = getData.find(i => i.id === 'TEST_DELETE_ME');
        console.log("Verify Deletion:", !deletedItem && getData.length === 1 ? "PASSED" : "FAILED", `Count: ${getData.length}`);
    } catch (e) {
        console.error("Verify Deletion Error:", e.message);
    }
}

testBackend();
