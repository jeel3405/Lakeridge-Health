// ==========================================
// Lakeridge Health Hospital - API Helper
// ==========================================
// This file handles communication with the backend server

const API_BASE_URL = '/api';

// Check if server is available
let isServerConnected = false;

// Toast notification helper (fallback if app.js not loaded yet)
function showToastMessage(message, type = 'success') {
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/patients`, { method: 'HEAD' });
        isServerConnected = response.ok;
        return isServerConnected;
    } catch (err) {
        isServerConnected = false;
        return false;
    }
}

// Generic API functions
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        return null;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (err) {
        console.error(`Error posting to ${endpoint}:`, err);
        return { error: err.message };
    }
}

async function apiPut(endpoint, id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (err) {
        console.error(`Error updating ${endpoint}:`, err);
        return { error: err.message };
    }
}

async function apiDelete(endpoint, id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (err) {
        console.error(`Error deleting from ${endpoint}:`, err);
        return { error: err.message };
    }
}

// ==========================================
// Database Sync Functions
// ==========================================

// Load all data from database
async function loadAllDataFromDatabase() {
    const connected = await checkServerConnection();
    
    if (!connected) {
        console.log('⚠️ Server not connected. Using local data.');
        showToast('Server not connected. Data will not be saved to database.', 'error');
        return false;
    }
    
    console.log('✅ Connected to database server');
    
    try {
        // Load all data from API
        const [patients, physicians, appointments, admissions, rooms, billing, insurance, records, claims, beds] = await Promise.all([
            apiGet('patients'),
            apiGet('physicians'),
            apiGet('appointments'),
            apiGet('admissions'),
            apiGet('rooms'),
            apiGet('billing'),
            apiGet('insurance'),
            apiGet('records'),
            apiGet('claims'),
            apiGet('beds')
        ]);
        
        // Update local data arrays if data was fetched
        if (patients) patientsData.length = 0, patientsData.push(...patients.map(p => ({
            PatientID: p.PatientID,
            FirstName: p.FirstName,
            LastName: p.LastName,
            DOB: p.DOB ? p.DOB.split('T')[0] : p.DOB,
            Address: p.Address,
            Gender: p.Gender,
            InsuranceID: p.InsuranceID
        })));
        
        if (physicians) physiciansData.length = 0, physiciansData.push(...physicians.map(p => ({
            PhysicianID: p.PhysicianID,
            FirstName: p.FirstName,
            LastName: p.LastName,
            Specialization: p.Specialization,
            Email: p.Email
        })));
        
        if (appointments) appointmentsData.length = 0, appointmentsData.push(...appointments.map(a => ({
            AppointmentID: a.AppointmentID,
            PatientID: a.PatientID,
            PhysicianID: a.PhysicianID,
            Date: a.Date ? a.Date.split('T')[0] : a.Date,
            Time: a.Time,
            Status: a.Status,
            ReasonForVisit: a.ReasonForVisit
        })));
        
        if (admissions) admissionsData.length = 0, admissionsData.push(...admissions.map(a => ({
            AdmissionID: a.AdmissionID,
            PatientID: a.PatientID,
            RoomID: a.RoomID,
            AdmissionDate: a.AdmissionDate ? a.AdmissionDate.split('T')[0] : a.AdmissionDate,
            InsuranceVerified: a.InsuranceVerified,
            TreatmentPlan: a.TreatmentPlan
        })));
        
        if (rooms) roomsData.length = 0, roomsData.push(...rooms);
        
        if (billing) billingData.length = 0, billingData.push(...billing.map(b => ({
            BillingID: b.BillingID,
            PatientID: b.PatientID,
            TotalAmount: parseFloat(b.TotalAmount),
            InvoiceDate: b.InvoiceDate ? b.InvoiceDate.split('T')[0] : b.InvoiceDate,
            DueDate: b.DueDate ? b.DueDate.split('T')[0] : b.DueDate,
            PaymentStatus: b.PaymentStatus
        })));
        
        if (insurance) insuranceData.length = 0, insuranceData.push(...insurance);
        
        if (records) patientRecordsData.length = 0, patientRecordsData.push(...records.map(r => ({
            RecordID: r.RecordID,
            PatientID: r.PatientID,
            VisitDate: r.VisitDate ? r.VisitDate.split('T')[0] : r.VisitDate,
            Treatment: r.Treatment,
            FollowUpDate: r.FollowUpDate ? r.FollowUpDate.split('T')[0] : null
        })));
        
        if (claims) insuranceClaimsData.length = 0, insuranceClaimsData.push(...claims.map(c => ({
            InsuranceClaimID: c.InsuranceClaimID,
            PatientID: c.PatientID,
            InsuranceID: c.InsuranceID,
            ClaimAmount: parseFloat(c.ClaimAmount),
            ClaimDate: c.ClaimDate ? c.ClaimDate.split('T')[0] : c.ClaimDate,
            ApprovalDate: c.ApprovalDate ? c.ApprovalDate.split('T')[0] : null
        })));
        
        if (beds) bedData.length = 0, bedData.push(...beds);
        
        console.log('📊 Data loaded from database');
        return true;
    } catch (err) {
        console.error('Error loading data from database:', err);
        return false;
    }
}

// ==========================================
// CRUD Operations with Database Sync
// ==========================================

// Patients
async function savePatientToDatabase(patientData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('patients', patientData.PatientID, {
            LastName: patientData.LastName,
            FirstName: patientData.FirstName,
            DOB: patientData.DOB,
            Address: patientData.Address,
            Gender: patientData.Gender,
            InsuranceID: patientData.InsuranceID
        });
    } else {
        return await apiPost('patients', {
            LastName: patientData.LastName,
            FirstName: patientData.FirstName,
            DOB: patientData.DOB,
            Address: patientData.Address,
            Gender: patientData.Gender,
            InsuranceID: patientData.InsuranceID
        });
    }
}

async function deletePatientFromDatabase(patientId) {
    if (!isServerConnected) return { success: false };
    return await apiDelete('patients', patientId);
}

// Physicians
async function savePhysicianToDatabase(physicianData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('physicians', physicianData.PhysicianID, physicianData);
    } else {
        return await apiPost('physicians', physicianData);
    }
}

async function deletePhysicianFromDatabase(physicianId) {
    if (!isServerConnected) return { success: false };
    return await apiDelete('physicians', physicianId);
}

// Appointments
async function saveAppointmentToDatabase(appointmentData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('appointments', appointmentData.AppointmentID, appointmentData);
    } else {
        return await apiPost('appointments', appointmentData);
    }
}

async function deleteAppointmentFromDatabase(appointmentId) {
    if (!isServerConnected) return { success: false };
    return await apiDelete('appointments', appointmentId);
}

// Admissions
async function saveAdmissionToDatabase(admissionData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('admissions', admissionData.AdmissionID, admissionData);
    } else {
        return await apiPost('admissions', admissionData);
    }
}

async function deleteAdmissionFromDatabase(admissionId) {
    if (!isServerConnected) return { success: false };
    return await apiDelete('admissions', admissionId);
}

// Rooms
async function saveRoomToDatabase(roomData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('rooms', roomData.RoomID, roomData);
    } else {
        return await apiPost('rooms', roomData);
    }
}

// Billing
async function saveBillingToDatabase(billingData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('billing', billingData.BillingID, billingData);
    } else {
        return await apiPost('billing', billingData);
    }
}

// Insurance
async function saveInsuranceToDatabase(insuranceData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('insurance', insuranceData.InsuranceID, insuranceData);
    } else {
        return await apiPost('insurance', insuranceData);
    }
}

// Patient Records
async function saveRecordToDatabase(recordData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('records', recordData.RecordID, recordData);
    } else {
        return await apiPost('records', recordData);
    }
}

// Insurance Claims
async function saveClaimToDatabase(claimData, isUpdate = false) {
    if (!isServerConnected) return { success: false };
    
    if (isUpdate) {
        return await apiPut('claims', claimData.InsuranceClaimID, claimData);
    } else {
        return await apiPost('claims', claimData);
    }
}

// Initialize database connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Small delay to ensure app.js is fully loaded
    setTimeout(async () => {
        const connected = await loadAllDataFromDatabase();
        if (connected) {
            showToastMessage('Connected to database server!', 'success');
            // Refresh all tables with database data
            if (typeof loadPatientsTable === 'function') loadPatientsTable();
            if (typeof loadPhysiciansTable === 'function') loadPhysiciansTable();
            if (typeof loadAppointmentsTable === 'function') loadAppointmentsTable();
            if (typeof loadAdmissionsTable === 'function') loadAdmissionsTable();
            if (typeof loadRoomsTable === 'function') loadRoomsTable();
            if (typeof loadBillingTable === 'function') loadBillingTable();
            if (typeof loadInsuranceTable === 'function') loadInsuranceTable();
            if (typeof loadRecordsTable === 'function') loadRecordsTable();
            if (typeof loadClaimsTable === 'function') loadClaimsTable();
            if (typeof initDashboard === 'function') initDashboard();
        }
    }, 500);
});
