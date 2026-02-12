// ==========================================
// Lakeridge Health Hospital - Application JS
// ==========================================

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const globalSearch = document.getElementById('globalSearch');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initPatients();
    initPhysicians();
    initAppointments();
    initAdmissions();
    initRooms();
    initBilling();
    initInsurance();
    initRecords();
    initClaims();
    initGlobalSearch();
    initForms();
});

// ==========================================
// Navigation
// ==========================================
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ==========================================
// Dashboard
// ==========================================
function initDashboard() {
    // Update stats
    document.getElementById('totalPatients').textContent = patientsData.length;
    document.getElementById('totalPhysicians').textContent = physiciansData.length;
    document.getElementById('totalAppointments').textContent = appointmentsData.length;
    document.getElementById('availableRooms').textContent = roomsData.reduce((sum, r) => sum + r.RoomsAvailable, 0);
    
    // Load recent appointments
    loadRecentAppointments();
    
    // Load room status chart
    loadRoomStatusChart();
}

function loadRecentAppointments() {
    const tbody = document.querySelector('#recentAppointmentsTable tbody');
    const recentAppts = appointmentsData.slice(0, 5);
    
    tbody.innerHTML = recentAppts.map(apt => `
        <tr>
            <td>${getPatientName(apt.PatientID)}</td>
            <td>${getPhysicianName(apt.PhysicianID)}</td>
            <td>${formatDate(apt.Date)}</td>
            <td><span class="status-badge ${apt.Status.toLowerCase()}">${apt.Status}</span></td>
        </tr>
    `).join('');
}

function loadRoomStatusChart() {
    const chartContainer = document.getElementById('roomStatusChart');
    
    chartContainer.innerHTML = roomsData.map(room => {
        const occupancyPercent = (room.Occupancy / room.Capacity) * 100;
        const roomClass = room.RoomType.toLowerCase().replace(/[^a-z]/g, '-');
        
        return `
            <div class="room-bar">
                <span class="room-bar-label">${room.RoomType}</span>
                <div class="room-bar-container">
                    <div class="room-bar-fill ${roomClass}" style="width: ${occupancyPercent}%"></div>
                </div>
                <span class="room-bar-value">${room.Occupancy}/${room.Capacity}</span>
            </div>
        `;
    }).join('');
}

// ==========================================
// Patients
// ==========================================
function initPatients() {
    loadPatientsTable();
    
    // Search functionality
    document.getElementById('patientSearch').addEventListener('input', filterPatients);
    document.getElementById('genderFilter').addEventListener('change', filterPatients);
}

function loadPatientsTable(data = patientsData) {
    const tbody = document.querySelector('#patientsTable tbody');
    const canEdit = canEditPatientData(); // Only physicians and admins can edit
    const canDelete = hasPermission('canDeletePatients'); // Only admins can delete
    
    tbody.innerHTML = data.map(patient => `
        <tr>
            <td>${patient.PatientID}</td>
            <td>${patient.FirstName} ${patient.LastName}</td>
            <td>${formatDate(patient.DOB)}</td>
            <td>${patient.Gender === 'M' ? 'Male' : patient.Gender === 'F' ? 'Female' : 'Other'}</td>
            <td>${patient.Address}</td>
            <td>${getInsuranceName(patient.InsuranceID)}</td>
            <td>
                <button class="action-btn view" onclick="viewPatient(${patient.PatientID})" title="View Details"><i class="fas fa-eye"></i></button>
                ${canEdit ? `<button class="action-btn edit" onclick="editPatient(${patient.PatientID})" title="Edit Patient"><i class="fas fa-edit"></i></button>` : ''}
                ${canDelete ? `<button class="action-btn delete" onclick="deletePatient(${patient.PatientID})" title="Delete Patient"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        </tr>
    `).join('');
}

function filterPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const genderFilter = document.getElementById('genderFilter').value;
    
    const filtered = patientsData.filter(patient => {
        const matchesSearch = 
            patient.FirstName.toLowerCase().includes(searchTerm) ||
            patient.LastName.toLowerCase().includes(searchTerm) ||
            patient.Address.toLowerCase().includes(searchTerm) ||
            patient.PatientID.toString().includes(searchTerm);
        
        const matchesGender = !genderFilter || patient.Gender === genderFilter;
        
        return matchesSearch && matchesGender;
    });
    
    loadPatientsTable(filtered);
}

function viewPatient(id) {
    const patient = patientsData.find(p => p.PatientID === id);
    if (!patient) return;
    
    const insurance = insuranceData.find(i => i.InsuranceID === patient.InsuranceID);
    const appointments = appointmentsData.filter(a => a.PatientID === id);
    const records = patientRecordsData.filter(r => r.PatientID === id);
    const bills = billingData.filter(b => b.PatientID === id);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-user"></i> Patient Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Patient ID</label>
                <span>${patient.PatientID}</span>
            </div>
            <div class="detail-item">
                <label>Full Name</label>
                <span>${patient.FirstName} ${patient.LastName}</span>
            </div>
            <div class="detail-item">
                <label>Date of Birth</label>
                <span>${formatDate(patient.DOB)}</span>
            </div>
            <div class="detail-item">
                <label>Gender</label>
                <span>${patient.Gender === 'M' ? 'Male' : patient.Gender === 'F' ? 'Female' : 'Other'}</span>
            </div>
            <div class="detail-item full-width">
                <label>Address</label>
                <span>${patient.Address}</span>
            </div>
            <div class="detail-item full-width">
                <label>Insurance Provider</label>
                <span>${insurance ? insurance.ProviderName : 'None'} ${insurance ? '(' + insurance.PhoneNumber + ')' : ''}</span>
            </div>
        </div>
        
        <h3 style="margin: 25px 0 15px;"><i class="fas fa-calendar"></i> Appointments (${appointments.length})</h3>
        <table style="margin-bottom: 20px;">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Physician</th>
                    <th>Reason</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${appointments.slice(0, 5).map(apt => `
                    <tr>
                        <td>${formatDate(apt.Date)}</td>
                        <td>${formatTime(apt.Time)}</td>
                        <td>${getPhysicianName(apt.PhysicianID)}</td>
                        <td>${apt.ReasonForVisit || '-'}</td>
                        <td><span class="status-badge ${apt.Status.toLowerCase()}">${apt.Status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3 style="margin: 25px 0 15px;"><i class="fas fa-file-invoice-dollar"></i> Billing Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Invoice Date</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bills.slice(0, 5).map(bill => `
                    <tr>
                        <td>${formatDate(bill.InvoiceDate)}</td>
                        <td>${formatCurrency(bill.TotalAmount)}</td>
                        <td>${formatDate(bill.DueDate)}</td>
                        <td><span class="status-badge ${bill.PaymentStatus.toLowerCase()}">${bill.PaymentStatus}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    openModal('detailsModal');
}

function editPatient(id) {
    // Check if user has permission to edit patient data
    if (!canEditPatientData()) {
        showToast('Access Denied: Only physicians and administrators can edit patient data', 'error');
        return;
    }
    
    const patient = patientsData.find(p => p.PatientID === id);
    if (!patient) return;
    
    document.getElementById('patientId').value = patient.PatientID;
    document.getElementById('patientFirstName').value = patient.FirstName;
    document.getElementById('patientLastName').value = patient.LastName;
    document.getElementById('patientDOB').value = patient.DOB;
    document.getElementById('patientGender').value = patient.Gender;
    document.getElementById('patientAddress').value = patient.Address;
    document.getElementById('patientInsurance').value = patient.InsuranceID;
    
    openModal('patientModal');
}

async function deletePatient(id) {
    // Check if user has permission to delete patient data
    if (!hasPermission('canDeletePatients')) {
        showToast('Access Denied: Only administrators can delete patient data', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this patient?')) {
        const index = patientsData.findIndex(p => p.PatientID === id);
        if (index > -1) {
            patientsData.splice(index, 1);
            const result = await deletePatientFromDatabase(id);
            if (result && !result.error) {
                showToast('Patient deleted successfully (removed from database)');
            } else {
                showToast('Patient deleted locally (database sync pending)', 'warning');
            }
            loadPatientsTable();
            initDashboard();
        }
    }
}

// ==========================================
// Physicians
// ==========================================
function initPhysicians() {
    loadPhysiciansTable();
    populateSpecializationFilter();
    
    document.getElementById('physicianSearch').addEventListener('input', filterPhysicians);
    document.getElementById('specializationFilter').addEventListener('change', filterPhysicians);
}

function loadPhysiciansTable(data = physiciansData) {
    const tbody = document.querySelector('#physiciansTable tbody');
    
    tbody.innerHTML = data.map(physician => `
        <tr>
            <td>${physician.PhysicianID}</td>
            <td>Dr. ${physician.FirstName} ${physician.LastName}</td>
            <td>${physician.Specialization}</td>
            <td>${physician.Email}</td>
            <td>
                <button class="action-btn view" onclick="viewPhysician(${physician.PhysicianID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editPhysician(${physician.PhysicianID})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deletePhysician(${physician.PhysicianID})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function populateSpecializationFilter() {
    const filter = document.getElementById('specializationFilter');
    const specializations = [...new Set(physiciansData.map(p => p.Specialization))];
    
    specializations.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        filter.appendChild(option);
    });
}

function filterPhysicians() {
    const searchTerm = document.getElementById('physicianSearch').value.toLowerCase();
    const specFilter = document.getElementById('specializationFilter').value;
    
    const filtered = physiciansData.filter(physician => {
        const matchesSearch = 
            physician.FirstName.toLowerCase().includes(searchTerm) ||
            physician.LastName.toLowerCase().includes(searchTerm) ||
            physician.Specialization.toLowerCase().includes(searchTerm);
        
        const matchesSpec = !specFilter || physician.Specialization === specFilter;
        
        return matchesSearch && matchesSpec;
    });
    
    loadPhysiciansTable(filtered);
}

function viewPhysician(id) {
    const physician = physiciansData.find(p => p.PhysicianID === id);
    if (!physician) return;
    
    const appointments = appointmentsData.filter(a => a.PhysicianID === id);
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(a => a.Date === today);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-user-md"></i> Physician Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Physician ID</label>
                <span>${physician.PhysicianID}</span>
            </div>
            <div class="detail-item">
                <label>Full Name</label>
                <span>Dr. ${physician.FirstName} ${physician.LastName}</span>
            </div>
            <div class="detail-item">
                <label>Specialization</label>
                <span>${physician.Specialization}</span>
            </div>
            <div class="detail-item">
                <label>Email</label>
                <span>${physician.Email}</span>
            </div>
            <div class="detail-item">
                <label>Total Appointments</label>
                <span>${appointments.length}</span>
            </div>
            <div class="detail-item">
                <label>Today's Appointments</label>
                <span>${todayAppts.length}</span>
            </div>
        </div>
        
        <h3 style="margin: 25px 0 15px;"><i class="fas fa-calendar"></i> Recent Appointments</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Reason</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${appointments.slice(0, 10).map(apt => `
                    <tr>
                        <td>${formatDate(apt.Date)}</td>
                        <td>${formatTime(apt.Time)}</td>
                        <td>${getPatientName(apt.PatientID)}</td>
                        <td>${apt.ReasonForVisit || '-'}</td>
                        <td><span class="status-badge ${apt.Status.toLowerCase()}">${apt.Status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    openModal('detailsModal');
}

function editPhysician(id) {
    const physician = physiciansData.find(p => p.PhysicianID === id);
    if (!physician) return;
    
    document.getElementById('physicianId').value = physician.PhysicianID;
    document.getElementById('physicianFirstName').value = physician.FirstName;
    document.getElementById('physicianLastName').value = physician.LastName;
    document.getElementById('physicianSpecialization').value = physician.Specialization;
    document.getElementById('physicianEmail').value = physician.Email;
    
    openModal('physicianModal');
}

function deletePhysician(id) {
    if (confirm('Are you sure you want to delete this physician?')) {
        const index = physiciansData.findIndex(p => p.PhysicianID === id);
        if (index > -1) {
            physiciansData.splice(index, 1);
            loadPhysiciansTable();
            showToast('Physician deleted successfully');
        }
    }
}

// ==========================================
// Appointments
// ==========================================
function initAppointments() {
    loadAppointmentsTable();
    
    document.getElementById('appointmentSearch').addEventListener('input', filterAppointments);
    document.getElementById('appointmentDateFilter').addEventListener('change', filterAppointments);
    document.getElementById('statusFilter').addEventListener('change', filterAppointments);
}

function loadAppointmentsTable(data = appointmentsData) {
    const tbody = document.querySelector('#appointmentsTable tbody');
    
    tbody.innerHTML = data.map(apt => `
        <tr>
            <td>${apt.AppointmentID}</td>
            <td>${getPatientName(apt.PatientID)}</td>
            <td>${getPhysicianName(apt.PhysicianID)}</td>
            <td>${formatDate(apt.Date)}</td>
            <td>${formatTime(apt.Time)}</td>
            <td>${apt.ReasonForVisit || '-'}</td>
            <td><span class="status-badge ${apt.Status.toLowerCase()}">${apt.Status}</span></td>
            <td>
                <button class="action-btn view" onclick="viewAppointment(${apt.AppointmentID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editAppointment(${apt.AppointmentID})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteAppointment(${apt.AppointmentID})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterAppointments() {
    const searchTerm = document.getElementById('appointmentSearch').value.toLowerCase();
    const dateFilter = document.getElementById('appointmentDateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = appointmentsData.filter(apt => {
        const patientName = getPatientName(apt.PatientID).toLowerCase();
        const physicianName = getPhysicianName(apt.PhysicianID).toLowerCase();
        
        const matchesSearch = 
            patientName.includes(searchTerm) ||
            physicianName.includes(searchTerm) ||
            (apt.ReasonForVisit && apt.ReasonForVisit.toLowerCase().includes(searchTerm));
        
        const matchesDate = !dateFilter || apt.Date === dateFilter;
        const matchesStatus = !statusFilter || apt.Status === statusFilter;
        
        return matchesSearch && matchesDate && matchesStatus;
    });
    
    loadAppointmentsTable(filtered);
}

function viewAppointment(id) {
    const apt = appointmentsData.find(a => a.AppointmentID === id);
    if (!apt) return;
    
    const patient = patientsData.find(p => p.PatientID === apt.PatientID);
    const physician = physiciansData.find(p => p.PhysicianID === apt.PhysicianID);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-calendar-check"></i> Appointment Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Appointment ID</label>
                <span>${apt.AppointmentID}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span class="status-badge ${apt.Status.toLowerCase()}">${apt.Status}</span>
            </div>
            <div class="detail-item">
                <label>Date</label>
                <span>${formatDate(apt.Date)}</span>
            </div>
            <div class="detail-item">
                <label>Time</label>
                <span>${formatTime(apt.Time)}</span>
            </div>
            <div class="detail-item">
                <label>Patient</label>
                <span>${patient ? patient.FirstName + ' ' + patient.LastName : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Physician</label>
                <span>${physician ? 'Dr. ' + physician.FirstName + ' ' + physician.LastName : 'Unknown'}</span>
            </div>
            <div class="detail-item full-width">
                <label>Reason for Visit</label>
                <span>${apt.ReasonForVisit || 'Not specified'}</span>
            </div>
        </div>
    `;
    
    openModal('detailsModal');
}

function editAppointment(id) {
    const apt = appointmentsData.find(a => a.AppointmentID === id);
    if (!apt) return;
    
    populateAppointmentForm();
    
    document.getElementById('appointmentId').value = apt.AppointmentID;
    document.getElementById('appointmentPatient').value = apt.PatientID;
    document.getElementById('appointmentPhysician').value = apt.PhysicianID;
    document.getElementById('appointmentDate').value = apt.Date;
    document.getElementById('appointmentTime').value = apt.Time;
    document.getElementById('appointmentReason').value = apt.ReasonForVisit || '';
    document.getElementById('appointmentStatus').value = apt.Status;
    
    openModal('appointmentModal');
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const index = appointmentsData.findIndex(a => a.AppointmentID === id);
        if (index > -1) {
            appointmentsData.splice(index, 1);
            loadAppointmentsTable();
            loadRecentAppointments();
            showToast('Appointment deleted successfully');
        }
    }
}

// ==========================================
// Admissions
// ==========================================
function initAdmissions() {
    loadAdmissionsTable();
    
    document.getElementById('admissionSearch').addEventListener('input', filterAdmissions);
    document.getElementById('insuranceVerifiedFilter').addEventListener('change', filterAdmissions);
}

function loadAdmissionsTable(data = admissionsData) {
    const tbody = document.querySelector('#admissionsTable tbody');
    
    tbody.innerHTML = data.map(admission => `
        <tr>
            <td>${admission.AdmissionID}</td>
            <td>${getPatientName(admission.PatientID)}</td>
            <td>${getRoomType(admission.RoomID)} (Room ${admission.RoomID})</td>
            <td>${formatDate(admission.AdmissionDate)}</td>
            <td><span class="status-badge ${admission.InsuranceVerified ? 'verified' : 'not-verified'}">${admission.InsuranceVerified ? 'Verified' : 'Not Verified'}</span></td>
            <td>${admission.TreatmentPlan ? admission.TreatmentPlan.substring(0, 50) + '...' : '-'}</td>
            <td>
                <button class="action-btn view" onclick="viewAdmission(${admission.AdmissionID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editAdmission(${admission.AdmissionID})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteAdmission(${admission.AdmissionID})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterAdmissions() {
    const searchTerm = document.getElementById('admissionSearch').value.toLowerCase();
    const verifiedFilter = document.getElementById('insuranceVerifiedFilter').value;
    
    const filtered = admissionsData.filter(admission => {
        const patientName = getPatientName(admission.PatientID).toLowerCase();
        
        const matchesSearch = 
            patientName.includes(searchTerm) ||
            (admission.TreatmentPlan && admission.TreatmentPlan.toLowerCase().includes(searchTerm));
        
        const matchesVerified = verifiedFilter === '' || admission.InsuranceVerified.toString() === verifiedFilter;
        
        return matchesSearch && matchesVerified;
    });
    
    loadAdmissionsTable(filtered);
}

function viewAdmission(id) {
    const admission = admissionsData.find(a => a.AdmissionID === id);
    if (!admission) return;
    
    const patient = patientsData.find(p => p.PatientID === admission.PatientID);
    const room = roomsData.find(r => r.RoomID === admission.RoomID);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-bed"></i> Admission Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Admission ID</label>
                <span>${admission.AdmissionID}</span>
            </div>
            <div class="detail-item">
                <label>Admission Date</label>
                <span>${formatDate(admission.AdmissionDate)}</span>
            </div>
            <div class="detail-item">
                <label>Patient</label>
                <span>${patient ? patient.FirstName + ' ' + patient.LastName : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Room</label>
                <span>${room ? room.RoomType + ' (Room ' + room.RoomID + ')' : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Insurance Verified</label>
                <span class="status-badge ${admission.InsuranceVerified ? 'verified' : 'not-verified'}">${admission.InsuranceVerified ? 'Yes' : 'No'}</span>
            </div>
            <div class="detail-item full-width">
                <label>Treatment Plan</label>
                <span>${admission.TreatmentPlan || 'Not specified'}</span>
            </div>
        </div>
    `;
    
    openModal('detailsModal');
}

function editAdmission(id) {
    const admission = admissionsData.find(a => a.AdmissionID === id);
    if (!admission) return;
    
    populateAdmissionForm();
    
    document.getElementById('admissionId').value = admission.AdmissionID;
    document.getElementById('admissionPatient').value = admission.PatientID;
    document.getElementById('admissionRoom').value = admission.RoomID;
    document.getElementById('admissionDate').value = admission.AdmissionDate;
    document.getElementById('admissionInsuranceVerified').value = admission.InsuranceVerified;
    document.getElementById('admissionTreatmentPlan').value = admission.TreatmentPlan;
    
    openModal('admissionModal');
}

function deleteAdmission(id) {
    if (confirm('Are you sure you want to delete this admission?')) {
        const index = admissionsData.findIndex(a => a.AdmissionID === id);
        if (index > -1) {
            admissionsData.splice(index, 1);
            loadAdmissionsTable();
            showToast('Admission deleted successfully');
        }
    }
}

// ==========================================
// Rooms
// ==========================================
function initRooms() {
    loadRoomsTable();
    loadBedsTable();
    populateRoomTypeFilter();
    
    document.getElementById('roomSearch').addEventListener('input', filterRooms);
    document.getElementById('roomTypeFilter').addEventListener('change', filterRooms);
    document.getElementById('bedSearch').addEventListener('input', filterBeds);
}

function loadRoomsTable(data = roomsData) {
    const tbody = document.querySelector('#roomsTable tbody');
    
    tbody.innerHTML = data.map(room => `
        <tr>
            <td>${room.RoomID}</td>
            <td>${room.RoomType}</td>
            <td>${room.Capacity}</td>
            <td>${room.Occupancy}</td>
            <td><span class="status-badge ${room.RoomsAvailable > 0 ? 'approved' : 'pending'}">${room.RoomsAvailable}</span></td>
            <td>
                <button class="action-btn view" onclick="viewRoom(${room.RoomID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editRoom(${room.RoomID})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function loadBedsTable(data = bedData) {
    const tbody = document.querySelector('#bedsTable tbody');
    
    tbody.innerHTML = data.map(bed => `
        <tr>
            <td>${bed.BedID}</td>
            <td>${bed.RoomID}</td>
            <td>${bed.BedNumber}</td>
            <td>${bed.PatientID ? getPatientName(bed.PatientID) : '<span class="status-badge approved">Available</span>'}</td>
            <td>
                <button class="action-btn view" onclick="viewBed(${bed.BedID})"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function populateRoomTypeFilter() {
    const filter = document.getElementById('roomTypeFilter');
    const roomTypes = [...new Set(roomsData.map(r => r.RoomType))];
    
    roomTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        filter.appendChild(option);
    });
}

function filterRooms() {
    const searchTerm = document.getElementById('roomSearch').value.toLowerCase();
    const typeFilter = document.getElementById('roomTypeFilter').value;
    
    const filtered = roomsData.filter(room => {
        const matchesSearch = room.RoomType.toLowerCase().includes(searchTerm);
        const matchesType = !typeFilter || room.RoomType === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    loadRoomsTable(filtered);
}

function filterBeds() {
    const searchTerm = document.getElementById('bedSearch').value.toLowerCase();
    
    const filtered = bedData.filter(bed => {
        const patientName = bed.PatientID ? getPatientName(bed.PatientID).toLowerCase() : '';
        return patientName.includes(searchTerm) || bed.BedID.toString().includes(searchTerm);
    });
    
    loadBedsTable(filtered);
}

function viewRoom(id) {
    const room = roomsData.find(r => r.RoomID === id);
    if (!room) return;
    
    const beds = bedData.filter(b => b.RoomID === id);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-door-open"></i> Room Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Room ID</label>
                <span>${room.RoomID}</span>
            </div>
            <div class="detail-item">
                <label>Room Type</label>
                <span>${room.RoomType}</span>
            </div>
            <div class="detail-item">
                <label>Capacity</label>
                <span>${room.Capacity}</span>
            </div>
            <div class="detail-item">
                <label>Current Occupancy</label>
                <span>${room.Occupancy}</span>
            </div>
            <div class="detail-item">
                <label>Available Spaces</label>
                <span class="status-badge ${room.RoomsAvailable > 0 ? 'approved' : 'pending'}">${room.RoomsAvailable}</span>
            </div>
        </div>
        
        <h3 style="margin: 25px 0 15px;"><i class="fas fa-bed"></i> Beds in this Room</h3>
        <table>
            <thead>
                <tr>
                    <th>Bed ID</th>
                    <th>Bed Number</th>
                    <th>Patient</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${beds.map(bed => `
                    <tr>
                        <td>${bed.BedID}</td>
                        <td>${bed.BedNumber}</td>
                        <td>${bed.PatientID ? getPatientName(bed.PatientID) : '-'}</td>
                        <td><span class="status-badge ${bed.PatientID ? 'pending' : 'approved'}">${bed.PatientID ? 'Occupied' : 'Available'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    openModal('detailsModal');
}

function editRoom(id) {
    const room = roomsData.find(r => r.RoomID === id);
    if (!room) return;
    
    document.getElementById('roomId').value = room.RoomID;
    document.getElementById('roomType').value = room.RoomType;
    document.getElementById('roomCapacity').value = room.Capacity;
    
    openModal('roomModal');
}

function viewBed(id) {
    const bed = bedData.find(b => b.BedID === id);
    if (!bed) return;
    
    const room = roomsData.find(r => r.RoomID === bed.RoomID);
    const patient = bed.PatientID ? patientsData.find(p => p.PatientID === bed.PatientID) : null;
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-bed"></i> Bed Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Bed ID</label>
                <span>${bed.BedID}</span>
            </div>
            <div class="detail-item">
                <label>Bed Number</label>
                <span>${bed.BedNumber}</span>
            </div>
            <div class="detail-item">
                <label>Room</label>
                <span>${room ? room.RoomType + ' (Room ' + room.RoomID + ')' : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span class="status-badge ${bed.PatientID ? 'pending' : 'approved'}">${bed.PatientID ? 'Occupied' : 'Available'}</span>
            </div>
            ${patient ? `
            <div class="detail-item full-width">
                <label>Current Patient</label>
                <span>${patient.FirstName} ${patient.LastName}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    openModal('detailsModal');
}

// ==========================================
// Billing
// ==========================================
function initBilling() {
    loadBillingTable();
    updateBillingStats();
    
    document.getElementById('billingSearch').addEventListener('input', filterBilling);
    document.getElementById('paymentStatusFilter').addEventListener('change', filterBilling);
}

function loadBillingTable(data = billingData) {
    const tbody = document.querySelector('#billingTable tbody');
    
    tbody.innerHTML = data.map(bill => `
        <tr>
            <td>${bill.BillingID}</td>
            <td>${getPatientName(bill.PatientID)}</td>
            <td>${formatCurrency(bill.TotalAmount)}</td>
            <td>${formatDate(bill.InvoiceDate)}</td>
            <td>${formatDate(bill.DueDate)}</td>
            <td><span class="status-badge ${bill.PaymentStatus.toLowerCase()}">${bill.PaymentStatus}</span></td>
            <td>
                <button class="action-btn view" onclick="viewBilling(${bill.BillingID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editBilling(${bill.BillingID})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function updateBillingStats() {
    const pending = billingData.filter(b => b.PaymentStatus === 'Pending');
    const paid = billingData.filter(b => b.PaymentStatus === 'Paid');
    
    const totalOutstanding = pending.reduce((sum, b) => sum + b.TotalAmount, 0);
    const totalPaid = paid.reduce((sum, b) => sum + b.TotalAmount, 0);
    
    document.getElementById('totalOutstanding').textContent = formatCurrency(totalOutstanding);
    document.getElementById('paidThisMonth').textContent = formatCurrency(totalPaid);
    document.getElementById('pendingInvoices').textContent = pending.length;
}

function filterBilling() {
    const searchTerm = document.getElementById('billingSearch').value.toLowerCase();
    const statusFilter = document.getElementById('paymentStatusFilter').value;
    
    const filtered = billingData.filter(bill => {
        const patientName = getPatientName(bill.PatientID).toLowerCase();
        
        const matchesSearch = patientName.includes(searchTerm) || bill.BillingID.toString().includes(searchTerm);
        const matchesStatus = !statusFilter || bill.PaymentStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    loadBillingTable(filtered);
}

function viewBilling(id) {
    const bill = billingData.find(b => b.BillingID === id);
    if (!bill) return;
    
    const patient = patientsData.find(p => p.PatientID === bill.PatientID);
    const claim = insuranceClaimsData.find(c => c.InsuranceClaimID === bill.InsuranceClaimID);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-file-invoice-dollar"></i> Billing Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Billing ID</label>
                <span>${bill.BillingID}</span>
            </div>
            <div class="detail-item">
                <label>Patient</label>
                <span>${patient ? patient.FirstName + ' ' + patient.LastName : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Total Amount</label>
                <span style="font-size: 1.25rem; font-weight: 600; color: #1e88e5;">${formatCurrency(bill.TotalAmount)}</span>
            </div>
            <div class="detail-item">
                <label>Payment Status</label>
                <span class="status-badge ${bill.PaymentStatus.toLowerCase()}">${bill.PaymentStatus}</span>
            </div>
            <div class="detail-item">
                <label>Invoice Date</label>
                <span>${formatDate(bill.InvoiceDate)}</span>
            </div>
            <div class="detail-item">
                <label>Due Date</label>
                <span>${formatDate(bill.DueDate)}</span>
            </div>
            ${claim ? `
            <div class="detail-item full-width">
                <label>Insurance Claim</label>
                <span>Claim #${claim.InsuranceClaimID} - ${formatCurrency(claim.ClaimAmount)} (${claim.ApprovalDate ? 'Approved: ' + formatDate(claim.ApprovalDate) : 'Pending'})</span>
            </div>
            ` : ''}
        </div>
    `;
    
    openModal('detailsModal');
}

function editBilling(id) {
    const bill = billingData.find(b => b.BillingID === id);
    if (!bill) return;
    
    populateBillingForm();
    
    document.getElementById('billingId').value = bill.BillingID;
    document.getElementById('billingPatient').value = bill.PatientID;
    document.getElementById('billingAmount').value = bill.TotalAmount;
    document.getElementById('billingStatus').value = bill.PaymentStatus;
    document.getElementById('billingInvoiceDate').value = bill.InvoiceDate;
    document.getElementById('billingDueDate').value = bill.DueDate;
    
    openModal('billingModal');
}

// ==========================================
// Insurance
// ==========================================
function initInsurance() {
    loadInsuranceTable();
    populateProvinceFilter();
    
    document.getElementById('insuranceSearch').addEventListener('input', filterInsurance);
    document.getElementById('provinceFilter').addEventListener('change', filterInsurance);
}

function loadInsuranceTable(data = insuranceData) {
    const tbody = document.querySelector('#insuranceTable tbody');
    
    tbody.innerHTML = data.map(insurance => `
        <tr>
            <td>${insurance.InsuranceID}</td>
            <td>${insurance.ProviderName}</td>
            <td>${insurance.Province}</td>
            <td>${insurance.City}</td>
            <td>${insurance.PhoneNumber}</td>
            <td>${insurance.Email}</td>
            <td>
                <button class="action-btn view" onclick="viewInsurance(${insurance.InsuranceID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editInsurance(${insurance.InsuranceID})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function populateProvinceFilter() {
    const filter = document.getElementById('provinceFilter');
    const provinces = [...new Set(insuranceData.map(i => i.Province))].sort();
    
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        filter.appendChild(option);
    });
}

function filterInsurance() {
    const searchTerm = document.getElementById('insuranceSearch').value.toLowerCase();
    const provinceFilter = document.getElementById('provinceFilter').value;
    
    const filtered = insuranceData.filter(insurance => {
        const matchesSearch = 
            insurance.ProviderName.toLowerCase().includes(searchTerm) ||
            insurance.City.toLowerCase().includes(searchTerm) ||
            insurance.Email.toLowerCase().includes(searchTerm);
        
        const matchesProvince = !provinceFilter || insurance.Province === provinceFilter;
        
        return matchesSearch && matchesProvince;
    });
    
    loadInsuranceTable(filtered);
}

function viewInsurance(id) {
    const insurance = insuranceData.find(i => i.InsuranceID === id);
    if (!insurance) return;
    
    const patientsWithInsurance = patientsData.filter(p => p.InsuranceID === id);
    const claimsForInsurance = insuranceClaimsData.filter(c => c.InsuranceID === id);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-shield-alt"></i> Insurance Provider Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Provider ID</label>
                <span>${insurance.InsuranceID}</span>
            </div>
            <div class="detail-item">
                <label>Provider Name</label>
                <span>${insurance.ProviderName}</span>
            </div>
            <div class="detail-item">
                <label>Province</label>
                <span>${insurance.Province}</span>
            </div>
            <div class="detail-item">
                <label>City</label>
                <span>${insurance.City}</span>
            </div>
            <div class="detail-item">
                <label>Postal Code</label>
                <span>${insurance.PostalCode}</span>
            </div>
            <div class="detail-item">
                <label>Phone</label>
                <span>${insurance.PhoneNumber}</span>
            </div>
            <div class="detail-item full-width">
                <label>Email</label>
                <span>${insurance.Email}</span>
            </div>
            <div class="detail-item">
                <label>Covered Patients</label>
                <span>${patientsWithInsurance.length}</span>
            </div>
            <div class="detail-item">
                <label>Total Claims</label>
                <span>${claimsForInsurance.length}</span>
            </div>
        </div>
    `;
    
    openModal('detailsModal');
}

function editInsurance(id) {
    const insurance = insuranceData.find(i => i.InsuranceID === id);
    if (!insurance) return;
    
    document.getElementById('insuranceId').value = insurance.InsuranceID;
    document.getElementById('insuranceProviderName').value = insurance.ProviderName;
    document.getElementById('insuranceProvince').value = insurance.Province;
    document.getElementById('insuranceCity').value = insurance.City;
    document.getElementById('insurancePostalCode').value = insurance.PostalCode;
    document.getElementById('insurancePhone').value = insurance.PhoneNumber;
    document.getElementById('insuranceEmail').value = insurance.Email;
    
    openModal('insuranceModal');
}

// ==========================================
// Patient Records
// ==========================================
function initRecords() {
    loadRecordsTable();
    
    document.getElementById('recordSearch').addEventListener('input', filterRecords);
    document.getElementById('recordDateFilter').addEventListener('change', filterRecords);
}

function loadRecordsTable(data = patientRecordsData) {
    const tbody = document.querySelector('#recordsTable tbody');
    
    tbody.innerHTML = data.map(record => `
        <tr>
            <td>${record.RecordID}</td>
            <td>${getPatientName(record.PatientID)}</td>
            <td>${formatDate(record.VisitDate)}</td>
            <td>${record.Treatment.substring(0, 50)}...</td>
            <td>${formatDate(record.FollowUpDate)}</td>
            <td>
                <button class="action-btn view" onclick="viewRecord(${record.RecordID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editRecord(${record.RecordID})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterRecords() {
    const searchTerm = document.getElementById('recordSearch').value.toLowerCase();
    const dateFilter = document.getElementById('recordDateFilter').value;
    
    const filtered = patientRecordsData.filter(record => {
        const patientName = getPatientName(record.PatientID).toLowerCase();
        
        const matchesSearch = 
            patientName.includes(searchTerm) ||
            record.Treatment.toLowerCase().includes(searchTerm);
        
        const matchesDate = !dateFilter || record.VisitDate === dateFilter;
        
        return matchesSearch && matchesDate;
    });
    
    loadRecordsTable(filtered);
}

function viewRecord(id) {
    const record = patientRecordsData.find(r => r.RecordID === id);
    if (!record) return;
    
    const patient = patientsData.find(p => p.PatientID === record.PatientID);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-folder-open"></i> Patient Record Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Record ID</label>
                <span>${record.RecordID}</span>
            </div>
            <div class="detail-item">
                <label>Patient</label>
                <span>${patient ? patient.FirstName + ' ' + patient.LastName : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Visit Date</label>
                <span>${formatDate(record.VisitDate)}</span>
            </div>
            <div class="detail-item">
                <label>Follow-Up Date</label>
                <span>${formatDate(record.FollowUpDate)}</span>
            </div>
            <div class="detail-item full-width">
                <label>Treatment</label>
                <span>${record.Treatment}</span>
            </div>
        </div>
    `;
    
    openModal('detailsModal');
}

function editRecord(id) {
    const record = patientRecordsData.find(r => r.RecordID === id);
    if (!record) return;
    
    populateRecordForm();
    
    document.getElementById('recordId').value = record.RecordID;
    document.getElementById('recordPatient').value = record.PatientID;
    document.getElementById('recordVisitDate').value = record.VisitDate;
    document.getElementById('recordFollowUpDate').value = record.FollowUpDate || '';
    document.getElementById('recordTreatment').value = record.Treatment;
    
    openModal('recordModal');
}

// ==========================================
// Insurance Claims
// ==========================================
function initClaims() {
    loadClaimsTable();
    
    document.getElementById('claimSearch').addEventListener('input', filterClaims);
    document.getElementById('claimStatusFilter').addEventListener('change', filterClaims);
}

function loadClaimsTable(data = insuranceClaimsData) {
    const tbody = document.querySelector('#claimsTable tbody');
    
    tbody.innerHTML = data.map(claim => `
        <tr>
            <td>${claim.InsuranceClaimID}</td>
            <td>${getPatientName(claim.PatientID)}</td>
            <td>${getInsuranceName(claim.InsuranceID)}</td>
            <td>${formatCurrency(claim.ClaimAmount)}</td>
            <td>${formatDate(claim.ClaimDate)}</td>
            <td>${claim.ApprovalDate ? formatDate(claim.ApprovalDate) : '<span class="status-badge pending">Pending</span>'}</td>
            <td>
                <button class="action-btn view" onclick="viewClaim(${claim.InsuranceClaimID})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="editClaim(${claim.InsuranceClaimID})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterClaims() {
    const searchTerm = document.getElementById('claimSearch').value.toLowerCase();
    const statusFilter = document.getElementById('claimStatusFilter').value;
    
    const filtered = insuranceClaimsData.filter(claim => {
        const patientName = getPatientName(claim.PatientID).toLowerCase();
        const insuranceName = getInsuranceName(claim.InsuranceID).toLowerCase();
        
        const matchesSearch = 
            patientName.includes(searchTerm) ||
            insuranceName.includes(searchTerm);
        
        let matchesStatus = true;
        if (statusFilter === 'Approved') {
            matchesStatus = claim.ApprovalDate !== null;
        } else if (statusFilter === 'Pending') {
            matchesStatus = claim.ApprovalDate === null;
        }
        
        return matchesSearch && matchesStatus;
    });
    
    loadClaimsTable(filtered);
}

function viewClaim(id) {
    const claim = insuranceClaimsData.find(c => c.InsuranceClaimID === id);
    if (!claim) return;
    
    const patient = patientsData.find(p => p.PatientID === claim.PatientID);
    const insurance = insuranceData.find(i => i.InsuranceID === claim.InsuranceID);
    
    document.getElementById('detailsModalTitle').innerHTML = '<i class="fas fa-file-medical"></i> Insurance Claim Details';
    document.getElementById('detailsContent').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <label>Claim ID</label>
                <span>${claim.InsuranceClaimID}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span class="status-badge ${claim.ApprovalDate ? 'approved' : 'pending'}">${claim.ApprovalDate ? 'Approved' : 'Pending'}</span>
            </div>
            <div class="detail-item">
                <label>Patient</label>
                <span>${patient ? patient.FirstName + ' ' + patient.LastName : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Insurance Provider</label>
                <span>${insurance ? insurance.ProviderName : 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <label>Claim Amount</label>
                <span style="font-size: 1.25rem; font-weight: 600; color: #1e88e5;">${formatCurrency(claim.ClaimAmount)}</span>
            </div>
            <div class="detail-item">
                <label>Claim Date</label>
                <span>${formatDate(claim.ClaimDate)}</span>
            </div>
            ${claim.ApprovalDate ? `
            <div class="detail-item">
                <label>Approval Date</label>
                <span>${formatDate(claim.ApprovalDate)}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    openModal('detailsModal');
}

function editClaim(id) {
    const claim = insuranceClaimsData.find(c => c.InsuranceClaimID === id);
    if (!claim) return;
    
    populateClaimForm();
    
    document.getElementById('claimId').value = claim.InsuranceClaimID;
    document.getElementById('claimPatient').value = claim.PatientID;
    document.getElementById('claimInsurance').value = claim.InsuranceID;
    document.getElementById('claimAmount').value = claim.ClaimAmount;
    document.getElementById('claimDate').value = claim.ClaimDate;
    
    openModal('claimModal');
}

// ==========================================
// Global Search
// ==========================================
function initGlobalSearch() {
    globalSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm.length < 2) return;
        
        // Search across all data
        const patientResults = patientsData.filter(p => 
            p.FirstName.toLowerCase().includes(searchTerm) ||
            p.LastName.toLowerCase().includes(searchTerm)
        );
        
        const physicianResults = physiciansData.filter(p =>
            p.FirstName.toLowerCase().includes(searchTerm) ||
            p.LastName.toLowerCase().includes(searchTerm) ||
            p.Specialization.toLowerCase().includes(searchTerm)
        );
        
        const roomResults = roomsData.filter(r =>
            r.RoomType.toLowerCase().includes(searchTerm)
        );
        
        // Show results count in console (could enhance with dropdown)
        console.log(`Search results for "${searchTerm}":`, {
            patients: patientResults.length,
            physicians: physicianResults.length,
            rooms: roomResults.length
        });
    });
}

// ==========================================
// Forms
// ==========================================
function initForms() {
    // Populate dropdown selects
    populatePatientInsuranceDropdown();
    
    // Patient form submission
    document.getElementById('patientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const patientId = document.getElementById('patientId').value;
        const patientData = {
            PatientID: patientId ? parseInt(patientId) : Math.max(...patientsData.map(p => p.PatientID)) + 1,
            FirstName: document.getElementById('patientFirstName').value,
            LastName: document.getElementById('patientLastName').value,
            DOB: document.getElementById('patientDOB').value,
            Gender: document.getElementById('patientGender').value,
            Address: document.getElementById('patientAddress').value,
            InsuranceID: parseInt(document.getElementById('patientInsurance').value) || null
        };
        
        if (patientId) {
            // Update existing patient
            const index = patientsData.findIndex(p => p.PatientID === parseInt(patientId));
            if (index > -1) {
                patientsData[index] = patientData;
                // Save to database
                const result = await savePatientToDatabase(patientData, true);
                if (result && !result.error) {
                    showToast('Patient updated successfully (saved to database)');
                } else {
                    showToast('Patient updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            // Add new patient - save to database first
            const result = await savePatientToDatabase(patientData, false);
            if (result && result.PatientID) {
                patientData.PatientID = result.PatientID;
                patientsData.push(patientData);
                showToast('Patient added successfully (saved to database)');
            } else {
                patientsData.push(patientData);
                showToast('Patient added locally (database sync pending)', 'warning');
            }
        }
        
        loadPatientsTable();
        initDashboard();
        closeModal('patientModal');
        document.getElementById('patientForm').reset();
    });
    
    // Physician form submission
    document.getElementById('physicianForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const physicianId = document.getElementById('physicianId').value;
        const physicianData = {
            PhysicianID: physicianId ? parseInt(physicianId) : Math.max(...physiciansData.map(p => p.PhysicianID)) + 1,
            FirstName: document.getElementById('physicianFirstName').value,
            LastName: document.getElementById('physicianLastName').value,
            Specialization: document.getElementById('physicianSpecialization').value,
            Email: document.getElementById('physicianEmail').value
        };
        
        if (physicianId) {
            const index = physiciansData.findIndex(p => p.PhysicianID === parseInt(physicianId));
            if (index > -1) {
                physiciansData[index] = physicianData;
                const result = await savePhysicianToDatabase(physicianData, true);
                if (result && !result.error) {
                    showToast('Physician updated successfully (saved to database)');
                } else {
                    showToast('Physician updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await savePhysicianToDatabase(physicianData, false);
            if (result && result.PhysicianID) {
                physicianData.PhysicianID = result.PhysicianID;
                physiciansData.push(physicianData);
                showToast('Physician added successfully (saved to database)');
            } else {
                physiciansData.push(physicianData);
                showToast('Physician added locally (database sync pending)', 'warning');
            }
        }
        
        loadPhysiciansTable();
        initDashboard();
        closeModal('physicianModal');
        document.getElementById('physicianForm').reset();
    });
    
    // Appointment form submission
    document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const appointmentId = document.getElementById('appointmentId').value;
        const appointmentData = {
            AppointmentID: appointmentId ? parseInt(appointmentId) : Math.max(...appointmentsData.map(a => a.AppointmentID)) + 1,
            PatientID: parseInt(document.getElementById('appointmentPatient').value),
            PhysicianID: parseInt(document.getElementById('appointmentPhysician').value),
            Date: document.getElementById('appointmentDate').value,
            Time: document.getElementById('appointmentTime').value + ':00',
            ReasonForVisit: document.getElementById('appointmentReason').value,
            Status: document.getElementById('appointmentStatus').value
        };
        
        if (appointmentId) {
            const index = appointmentsData.findIndex(a => a.AppointmentID === parseInt(appointmentId));
            if (index > -1) {
                appointmentsData[index] = appointmentData;
                const result = await saveAppointmentToDatabase(appointmentData, true);
                if (result && !result.error) {
                    showToast('Appointment updated successfully (saved to database)');
                } else {
                    showToast('Appointment updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveAppointmentToDatabase(appointmentData, false);
            if (result && result.AppointmentID) {
                appointmentData.AppointmentID = result.AppointmentID;
                appointmentsData.push(appointmentData);
                showToast('Appointment booked successfully (saved to database)');
            } else {
                appointmentsData.push(appointmentData);
                showToast('Appointment booked locally (database sync pending)', 'warning');
            }
        }
        
        loadAppointmentsTable();
        loadRecentAppointments();
        initDashboard();
        closeModal('appointmentModal');
        document.getElementById('appointmentForm').reset();
    });

    // Admission form submission
    document.getElementById('admissionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const admissionId = document.getElementById('admissionId').value;
        const admissionData = {
            AdmissionID: admissionId ? parseInt(admissionId) : Math.max(...admissionsData.map(a => a.AdmissionID)) + 1,
            PatientID: parseInt(document.getElementById('admissionPatient').value),
            RoomID: parseInt(document.getElementById('admissionRoom').value),
            AdmissionDate: document.getElementById('admissionDate').value,
            InsuranceVerified: parseInt(document.getElementById('admissionInsuranceVerified').value),
            TreatmentPlan: document.getElementById('admissionTreatmentPlan').value
        };
        
        if (admissionId) {
            const index = admissionsData.findIndex(a => a.AdmissionID === parseInt(admissionId));
            if (index > -1) {
                admissionsData[index] = admissionData;
                const result = await saveAdmissionToDatabase(admissionData, true);
                if (result && !result.error) {
                    showToast('Admission updated successfully (saved to database)');
                } else {
                    showToast('Admission updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveAdmissionToDatabase(admissionData, false);
            if (result && result.AdmissionID) {
                admissionData.AdmissionID = result.AdmissionID;
                admissionsData.push(admissionData);
                showToast('Admission created successfully (saved to database)');
            } else {
                admissionsData.push(admissionData);
                showToast('Admission created locally (database sync pending)', 'warning');
            }
        }
        
        loadAdmissionsTable();
        closeModal('admissionModal');
        document.getElementById('admissionForm').reset();
    });

    // Room form submission
    document.getElementById('roomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const roomId = document.getElementById('roomId').value;
        const roomData = {
            RoomID: roomId ? parseInt(roomId) : Math.max(...roomsData.map(r => r.RoomID)) + 1,
            RoomType: document.getElementById('roomType').value,
            Capacity: parseInt(document.getElementById('roomCapacity').value),
            Occupancy: 0,
            RoomsAvailable: parseInt(document.getElementById('roomCapacity').value)
        };
        
        if (roomId) {
            const index = roomsData.findIndex(r => r.RoomID === parseInt(roomId));
            if (index > -1) {
                roomsData[index] = roomData;
                const result = await saveRoomToDatabase(roomData, true);
                if (result && !result.error) {
                    showToast('Room updated successfully (saved to database)');
                } else {
                    showToast('Room updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveRoomToDatabase(roomData, false);
            if (result && result.RoomID) {
                roomData.RoomID = result.RoomID;
                roomsData.push(roomData);
                showToast('Room added successfully (saved to database)');
            } else {
                roomsData.push(roomData);
                showToast('Room added locally (database sync pending)', 'warning');
            }
        }
        
        loadRoomsTable();
        loadRoomStatusChart();
        initDashboard();
        closeModal('roomModal');
        document.getElementById('roomForm').reset();
    });

    // Billing form submission
    document.getElementById('billingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const billingId = document.getElementById('billingId').value;
        const billData = {
            BillingID: billingId ? parseInt(billingId) : Math.max(...billingData.map(b => b.BillingID)) + 1,
            PatientID: parseInt(document.getElementById('billingPatient').value),
            TotalAmount: parseFloat(document.getElementById('billingAmount').value),
            PaymentStatus: document.getElementById('billingStatus').value,
            InvoiceDate: document.getElementById('billingInvoiceDate').value,
            DueDate: document.getElementById('billingDueDate').value
        };
        
        if (billingId) {
            const index = billingData.findIndex(b => b.BillingID === parseInt(billingId));
            if (index > -1) {
                billingData[index] = billData;
                const result = await saveBillingToDatabase(billData, true);
                if (result && !result.error) {
                    showToast('Invoice updated successfully (saved to database)');
                } else {
                    showToast('Invoice updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveBillingToDatabase(billData, false);
            if (result && result.BillingID) {
                billData.BillingID = result.BillingID;
                billingData.push(billData);
                showToast('Invoice created successfully (saved to database)');
            } else {
                billingData.push(billData);
                showToast('Invoice created locally (database sync pending)', 'warning');
            }
        }
        
        loadBillingTable();
        updateBillingStats();
        closeModal('billingModal');
        document.getElementById('billingForm').reset();
    });

    // Insurance form submission
    document.getElementById('insuranceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const insuranceId = document.getElementById('insuranceId').value;
        const insData = {
            InsuranceID: insuranceId ? parseInt(insuranceId) : Math.max(...insuranceData.map(i => i.InsuranceID)) + 1,
            ProviderName: document.getElementById('insuranceProviderName').value,
            Province: document.getElementById('insuranceProvince').value,
            City: document.getElementById('insuranceCity').value,
            PostalCode: document.getElementById('insurancePostalCode').value,
            PhoneNumber: document.getElementById('insurancePhone').value,
            Email: document.getElementById('insuranceEmail').value
        };
        
        if (insuranceId) {
            const index = insuranceData.findIndex(i => i.InsuranceID === parseInt(insuranceId));
            if (index > -1) {
                insuranceData[index] = insData;
                const result = await saveInsuranceToDatabase(insData, true);
                if (result && !result.error) {
                    showToast('Insurance provider updated successfully (saved to database)');
                } else {
                    showToast('Insurance provider updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveInsuranceToDatabase(insData, false);
            if (result && result.InsuranceID) {
                insData.InsuranceID = result.InsuranceID;
                insuranceData.push(insData);
                showToast('Insurance provider added successfully (saved to database)');
            } else {
                insuranceData.push(insData);
                showToast('Insurance provider added locally (database sync pending)', 'warning');
            }
        }
        
        loadInsuranceTable();
        closeModal('insuranceModal');
        document.getElementById('insuranceForm').reset();
    });

    // Record form submission
    document.getElementById('recordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recordId = document.getElementById('recordId').value;
        const recData = {
            RecordID: recordId ? parseInt(recordId) : Math.max(...patientRecordsData.map(r => r.RecordID)) + 1,
            PatientID: parseInt(document.getElementById('recordPatient').value),
            VisitDate: document.getElementById('recordVisitDate').value,
            FollowUpDate: document.getElementById('recordFollowUpDate').value || null,
            Treatment: document.getElementById('recordTreatment').value
        };
        
        if (recordId) {
            const index = patientRecordsData.findIndex(r => r.RecordID === parseInt(recordId));
            if (index > -1) {
                patientRecordsData[index] = recData;
                const result = await saveRecordToDatabase(recData, true);
                if (result && !result.error) {
                    showToast('Patient record updated successfully (saved to database)');
                } else {
                    showToast('Patient record updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveRecordToDatabase(recData, false);
            if (result && result.RecordID) {
                recData.RecordID = result.RecordID;
                patientRecordsData.push(recData);
                showToast('Patient record added successfully (saved to database)');
            } else {
                patientRecordsData.push(recData);
                showToast('Patient record added locally (database sync pending)', 'warning');
            }
        }
        
        loadRecordsTable();
        closeModal('recordModal');
        document.getElementById('recordForm').reset();
    });

    // Claim form submission
    document.getElementById('claimForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const claimId = document.getElementById('claimId').value;
        const claimData = {
            InsuranceClaimID: claimId ? parseInt(claimId) : Math.max(...insuranceClaimsData.map(c => c.InsuranceClaimID)) + 1,
            PatientID: parseInt(document.getElementById('claimPatient').value),
            InsuranceID: parseInt(document.getElementById('claimInsurance').value),
            ClaimAmount: parseFloat(document.getElementById('claimAmount').value),
            ClaimDate: document.getElementById('claimDate').value,
            ApprovalDate: null
        };
        
        if (claimId) {
            const index = insuranceClaimsData.findIndex(c => c.InsuranceClaimID === parseInt(claimId));
            if (index > -1) {
                insuranceClaimsData[index] = claimData;
                const result = await saveClaimToDatabase(claimData, true);
                if (result && !result.error) {
                    showToast('Insurance claim updated successfully (saved to database)');
                } else {
                    showToast('Insurance claim updated locally (database sync pending)', 'warning');
                }
            }
        } else {
            const result = await saveClaimToDatabase(claimData, false);
            if (result && result.InsuranceClaimID) {
                claimData.InsuranceClaimID = result.InsuranceClaimID;
                insuranceClaimsData.push(claimData);
                showToast('Insurance claim submitted successfully (saved to database)');
            } else {
                insuranceClaimsData.push(claimData);
                showToast('Insurance claim submitted locally (database sync pending)', 'warning');
            }
        }
        
        loadClaimsTable();
        closeModal('claimModal');
        document.getElementById('claimForm').reset();
    });
}

function populatePatientInsuranceDropdown() {
    const select = document.getElementById('patientInsurance');
    select.innerHTML = '<option value="">Select Insurance</option>';
    
    insuranceData.forEach(insurance => {
        const option = document.createElement('option');
        option.value = insurance.InsuranceID;
        option.textContent = insurance.ProviderName;
        select.appendChild(option);
    });
}

function populateAppointmentForm() {
    // Populate patient dropdown
    const patientSelect = document.getElementById('appointmentPatient');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patientsData.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PatientID;
        option.textContent = `${patient.FirstName} ${patient.LastName}`;
        patientSelect.appendChild(option);
    });
    
    // Populate physician dropdown
    const physicianSelect = document.getElementById('appointmentPhysician');
    physicianSelect.innerHTML = '<option value="">Select Physician</option>';
    physiciansData.forEach(physician => {
        const option = document.createElement('option');
        option.value = physician.PhysicianID;
        option.textContent = `Dr. ${physician.FirstName} ${physician.LastName} (${physician.Specialization})`;
        physicianSelect.appendChild(option);
    });
}

// ==========================================
// Modal Functions
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    if (modalId === 'appointmentModal') {
        populateAppointmentForm();
    } else if (modalId === 'admissionModal') {
        populateAdmissionForm();
    } else if (modalId === 'billingModal') {
        populateBillingForm();
    } else if (modalId === 'recordModal') {
        populateRecordForm();
    } else if (modalId === 'claimModal') {
        populateClaimForm();
    } else if (modalId === 'roomModal') {
        populateRoomForm();
    }
}

function populateAdmissionForm() {
    // Populate patient dropdown
    const patientSelect = document.getElementById('admissionPatient');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patientsData.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PatientID;
        option.textContent = `${patient.FirstName} ${patient.LastName}`;
        patientSelect.appendChild(option);
    });
    
    // Populate room dropdown
    const roomSelect = document.getElementById('admissionRoom');
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    roomsData.filter(r => r.RoomsAvailable > 0).forEach(room => {
        const option = document.createElement('option');
        option.value = room.RoomID;
        option.textContent = `${room.RoomType} (Room ${room.RoomID}) - ${room.RoomsAvailable} available`;
        roomSelect.appendChild(option);
    });
    
    // Set default date to today
    document.getElementById('admissionDate').value = new Date().toISOString().split('T')[0];
}

function populateBillingForm() {
    // Populate patient dropdown
    const patientSelect = document.getElementById('billingPatient');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patientsData.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PatientID;
        option.textContent = `${patient.FirstName} ${patient.LastName}`;
        patientSelect.appendChild(option);
    });
    
    // Set default dates
    const today = new Date();
    document.getElementById('billingInvoiceDate').value = today.toISOString().split('T')[0];
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('billingDueDate').value = dueDate.toISOString().split('T')[0];
}

function populateRecordForm() {
    // Populate patient dropdown
    const patientSelect = document.getElementById('recordPatient');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patientsData.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PatientID;
        option.textContent = `${patient.FirstName} ${patient.LastName}`;
        patientSelect.appendChild(option);
    });
    
    // Set default visit date to today
    document.getElementById('recordVisitDate').value = new Date().toISOString().split('T')[0];
}

function populateClaimForm() {
    // Populate patient dropdown
    const patientSelect = document.getElementById('claimPatient');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patientsData.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PatientID;
        option.textContent = `${patient.FirstName} ${patient.LastName}`;
        patientSelect.appendChild(option);
    });
    
    // Populate insurance dropdown
    const insuranceSelect = document.getElementById('claimInsurance');
    insuranceSelect.innerHTML = '<option value="">Select Insurance Provider</option>';
    insuranceData.forEach(insurance => {
        const option = document.createElement('option');
        option.value = insurance.InsuranceID;
        option.textContent = insurance.ProviderName;
        insuranceSelect.appendChild(option);
    });
    
    // Set default claim date to today
    document.getElementById('claimDate').value = new Date().toISOString().split('T')[0];
}

function populateRoomForm() {
    // Reset form and set default values
    document.getElementById('roomForm').reset();
    document.getElementById('roomCapacity').value = 1;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = 'toast';
    if (type === 'error') {
        toast.classList.add('error');
        toast.querySelector('i').className = 'fas fa-times-circle';
    } else {
        toast.querySelector('i').className = 'fas fa-check-circle';
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// User Authentication & Role Management
// ==========================================
function toggleUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    dropdown.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function switchUser(username) {
    const user = usersData.find(u => u.Username === username);
    if (user) {
        currentUser = user;
        updateUserDisplay();
        
        // Refresh all tables to update action buttons based on new permissions
        loadPatientsTable();
        
        // Close dropdown
        document.querySelector('.user-dropdown').classList.remove('open');
        
        // Show notification
        showToast(`Switched to ${user.Name} (${user.Role})`);
    }
}

function updateUserDisplay() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update avatar
    const avatar = document.getElementById('userAvatar');
    const initials = user.Name.split(' ').map(n => n[0]).join('');
    const bgColor = getRoleColor(user.Role);
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor}&color=fff`;
    
    // Update name
    document.getElementById('currentUserName').textContent = user.Name;
    
    // Update role badge
    const roleBadge = document.getElementById('currentRoleBadge');
    roleBadge.textContent = user.Role.charAt(0).toUpperCase() + user.Role.slice(1);
    roleBadge.className = `role-badge ${user.Role}`;
}

function getRoleColor(role) {
    const colors = {
        administrator: '1565c0',
        physician: '2e7d32',
        viewer: 'ef6c00',
        patient: '7b1fa2'
    };
    return colors[role] || '1e88e5';
}

// Initialize user display on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUserDisplay();
});
