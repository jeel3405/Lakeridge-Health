

const usersData = [
    // Administrators
    { UserID: 'ADM001', Username: 'admin', Password: 'Admin@2024', Role: 'administrator', Name: 'System Administrator', Email: 'admin@lrch.ca', PhysicianID: null },
    
    // Physicians (linked to physiciansData by PhysicianID)
    { UserID: 'PHY001', Username: 'dwilson', Password: 'Cardio#1234', Role: 'physician', Name: 'Dr. David Wilson', Email: 'david.wilson@lrch.ca', PhysicianID: 1 },
    { UserID: 'PHY002', Username: 'sbrown', Password: 'Peds@5678', Role: 'physician', Name: 'Dr. Sarah Brown', Email: 'sarah.brown@lrch.ca', PhysicianID: 2 },
    { UserID: 'PHY003', Username: 'jtaylor', Password: 'Ortho#9012', Role: 'physician', Name: 'Dr. James Taylor', Email: 'james.taylor@lrch.ca', PhysicianID: 3 },
    { UserID: 'PHY004', Username: 'eanderson', Password: 'Neuro@3456', Role: 'physician', Name: 'Dr. Emily Anderson', Email: 'emily.anderson@lrch.ca', PhysicianID: 4 },
    { UserID: 'PHY005', Username: 'rmartinez', Password: 'Surg#7890', Role: 'physician', Name: 'Dr. Robert Martinez', Email: 'robert.martinez@lrch.ca', PhysicianID: 5 },
    
    // Viewers (staff with read-only access)
    { UserID: 'VWR001', Username: 'jreceptionist', Password: 'View@1234', Role: 'viewer', Name: 'Jane Receptionist', Email: 'jane.r@lrch.ca', PhysicianID: null },
    { UserID: 'VWR002', Username: 'mnurse', Password: 'View@5678', Role: 'viewer', Name: 'Mike Nurse', Email: 'mike.n@lrch.ca', PhysicianID: null },
    { UserID: 'VWR003', Username: 'sclerk', Password: 'View@9012', Role: 'viewer', Name: 'Susan Clerk', Email: 'susan.c@lrch.ca', PhysicianID: null },
    
    // Patients (limited access to own data only)
    { UserID: 'PAT001', Username: 'jsmith', Password: 'Patient#123', Role: 'patient', Name: 'John Smith', Email: 'john.smith@email.com', PatientID: 1 },
    { UserID: 'PAT002', Username: 'mjohnson', Password: 'Patient#456', Role: 'patient', Name: 'Mary Johnson', Email: 'mary.j@email.com', PatientID: 2 },
    { UserID: 'PAT003', Username: 'dwilliams', Password: 'Patient#789', Role: 'patient', Name: 'David Williams', Email: 'david.w@email.com', PatientID: 3 }
];

// Role-based permissions configuration
const rolePermissions = {
    administrator: {
        canEditPatients: true,
        canDeletePatients: true,
        canViewPatients: true,
        canEditPhysicians: true,
        canEditAppointments: true,
        canEditAdmissions: true,
        canEditRecords: true,
        canEditBilling: true,
        canManageRooms: true,
        canManageUsers: true
    },
    physician: {
        canEditPatients: true,       // Physicians CAN edit patient data
        canDeletePatients: false,
        canViewPatients: true,
        canEditPhysicians: false,
        canEditAppointments: true,
        canEditAdmissions: true,
        canEditRecords: true,
        canEditBilling: false,
        canManageRooms: false,
        canManageUsers: false
    },
    viewer: {
        canEditPatients: false,      // Viewers CANNOT edit patient data
        canDeletePatients: false,
        canViewPatients: true,
        canEditPhysicians: false,
        canEditAppointments: false,
        canEditAdmissions: false,
        canEditRecords: false,
        canEditBilling: false,
        canManageRooms: false,
        canManageUsers: false
    },
    patient: {
        canEditPatients: false,      // Patients CANNOT edit patient data
        canDeletePatients: false,
        canViewPatients: true,       // Only their own data
        canEditPhysicians: false,
        canEditAppointments: false,
        canEditAdmissions: false,
        canEditRecords: false,
        canEditBilling: false,
        canManageRooms: false,
        canManageUsers: false
    }
};

// Current logged-in user (default to administrator for demo)
let currentUser = usersData[0]; // Administrator by default

// Authentication helper functions
function login(username, password) {
    const user = usersData.find(u => u.Username === username && u.Password === password);
    if (user) {
        currentUser = user;
        return { success: true, user: user };
    }
    return { success: false, message: 'Invalid username or password' };
}

function logout() {
    currentUser = null;
}

function getCurrentUser() {
    return currentUser;
}

function hasPermission(permission) {
    if (!currentUser) return false;
    return rolePermissions[currentUser.Role][permission] || false;
}

function canEditPatientData() {
    // Only administrators and physicians can edit patient data
    return currentUser && (currentUser.Role === 'administrator' || currentUser.Role === 'physician');
}

// Insurance Data
const insuranceData = [
    { InsuranceID: 1, ProviderName: 'Ontario Health Insurance', Province: 'Ontario', City: 'Toronto', PostalCode: 'M1M 1M1', PhoneNumber: '416-555-0101', Email: 'contact@ohi.ca' },
    { InsuranceID: 2, ProviderName: 'Sun Life', Province: 'Ontario', City: 'Ottawa', PostalCode: 'K1P 1J1', PhoneNumber: '613-555-0202', Email: 'info@sunlife.ca' },
    { InsuranceID: 3, ProviderName: 'Manulife', Province: 'Ontario', City: 'Waterloo', PostalCode: 'N2L 2R7', PhoneNumber: '519-555-0303', Email: 'support@manulife.ca' },
    { InsuranceID: 4, ProviderName: 'Great-West Life', Province: 'Ontario', City: 'London', PostalCode: 'N6A 4K3', PhoneNumber: '519-555-0404', Email: 'info@gwl.ca' },
    { InsuranceID: 5, ProviderName: 'Blue Cross', Province: 'Ontario', City: 'Toronto', PostalCode: 'M5H 2N2', PhoneNumber: '416-555-0505', Email: 'service@bluecross.ca' },
    { InsuranceID: 6, ProviderName: 'Medavie Blue Cross', Province: 'Ontario', City: 'Ottawa', PostalCode: 'K2P 1C3', PhoneNumber: '613-555-0606', Email: 'info@medavie.ca' },
    { InsuranceID: 7, ProviderName: 'Desjardins Insurance', Province: 'Quebec', City: 'Montreal', PostalCode: 'H3A 1B2', PhoneNumber: '514-555-0707', Email: 'contact@desjardins.ca' },
    { InsuranceID: 8, ProviderName: 'The Co-operators', Province: 'British Columbia', City: 'Vancouver', PostalCode: 'V6B 2T5', PhoneNumber: '604-555-0808', Email: 'info@cooperators.ca' },
    { InsuranceID: 9, ProviderName: 'Empire Life', Province: 'Ontario', City: 'Toronto', PostalCode: 'M4B 1C2', PhoneNumber: '416-555-0909', Email: 'help@empirelife.ca' },
    { InsuranceID: 10, ProviderName: 'TD Insurance', Province: 'Ontario', City: 'Ottawa', PostalCode: 'K1P 5W3', PhoneNumber: '613-555-1001', Email: 'contact@tdinsurance.ca' },
    { InsuranceID: 11, ProviderName: 'RBC Insurance', Province: 'Ontario', City: 'Toronto', PostalCode: 'M5C 1B5', PhoneNumber: '416-555-1102', Email: 'info@rbcinsurance.ca' },
    { InsuranceID: 12, ProviderName: 'Aviva', Province: 'Ontario', City: 'Markham', PostalCode: 'L3R 1A4', PhoneNumber: '905-555-1203', Email: 'support@aviva.ca' },
    { InsuranceID: 13, ProviderName: 'Allstate Insurance', Province: 'Ontario', City: 'Mississauga', PostalCode: 'L5N 8K6', PhoneNumber: '905-555-1304', Email: 'help@allstate.ca' },
    { InsuranceID: 14, ProviderName: 'Intact Insurance', Province: 'Quebec', City: 'Montreal', PostalCode: 'H2X 3S4', PhoneNumber: '514-555-1405', Email: 'info@intact.ca' },
    { InsuranceID: 15, ProviderName: 'La Capitale', Province: 'Quebec', City: 'Quebec City', PostalCode: 'G1R 4T5', PhoneNumber: '418-555-1506', Email: 'support@lacapitale.ca' },
    { InsuranceID: 16, ProviderName: 'Blue Cross', Province: 'Alberta', City: 'Edmonton', PostalCode: 'T5J 2Z6', PhoneNumber: '780-555-1607', Email: 'contact@bluecross.ca' },
    { InsuranceID: 17, ProviderName: 'Sun Life', Province: 'Ontario', City: 'Ottawa', PostalCode: 'K1A 0A1', PhoneNumber: '613-555-1708', Email: 'info@sunlife.ca' },
    { InsuranceID: 18, ProviderName: 'Manulife', Province: 'British Columbia', City: 'Vancouver', PostalCode: 'V6E 4M6', PhoneNumber: '604-555-1809', Email: 'help@manulife.ca' },
    { InsuranceID: 19, ProviderName: 'Great-West Life', Province: 'Manitoba', City: 'Winnipeg', PostalCode: 'R3C 1V7', PhoneNumber: '204-555-1910', Email: 'info@gwl.ca' },
    { InsuranceID: 20, ProviderName: 'TD Insurance', Province: 'Nova Scotia', City: 'Halifax', PostalCode: 'B3H 1P4', PhoneNumber: '902-555-2001', Email: 'info@tdinsurance.ca' },
    { InsuranceID: 21, ProviderName: 'RBC Insurance', Province: 'Ontario', City: 'Toronto', PostalCode: 'M5J 2N8', PhoneNumber: '416-555-2102', Email: 'help@rbcinsurance.ca' },
    { InsuranceID: 22, ProviderName: 'The Co-operators', Province: 'Ontario', City: 'Hamilton', PostalCode: 'L8N 3V3', PhoneNumber: '905-555-2203', Email: 'info@cooperators.ca' },
    { InsuranceID: 23, ProviderName: 'Medavie Blue Cross', Province: 'Nova Scotia', City: 'Halifax', PostalCode: 'B3K 5L7', PhoneNumber: '902-555-2304', Email: 'support@medavie.ca' },
    { InsuranceID: 24, ProviderName: 'Desjardins Insurance', Province: 'Quebec', City: 'Laval', PostalCode: 'H7N 2W9', PhoneNumber: '450-555-2405', Email: 'contact@desjardins.ca' },
    { InsuranceID: 25, ProviderName: 'Empire Life', Province: 'Alberta', City: 'Calgary', PostalCode: 'T2P 1N8', PhoneNumber: '403-555-2506', Email: 'support@empirelife.ca' },
    { InsuranceID: 26, ProviderName: 'Aetna', Province: 'Ontario', City: 'Toronto', PostalCode: 'M4X 1A6', PhoneNumber: '416-555-2607', Email: 'info@aetna.ca' },
    { InsuranceID: 27, ProviderName: 'Cigna', Province: 'Alberta', City: 'Edmonton', PostalCode: 'T5G 2Y8', PhoneNumber: '780-555-2708', Email: 'support@cigna.ca' },
    { InsuranceID: 28, ProviderName: 'Blue Cross', Province: 'Saskatchewan', City: 'Regina', PostalCode: 'S4P 3X2', PhoneNumber: '306-555-2809', Email: 'contact@bluecross.ca' },
    { InsuranceID: 29, ProviderName: 'Humana', Province: 'Ontario', City: 'Toronto', PostalCode: 'M6J 1E6', PhoneNumber: '416-555-2901', Email: 'service@humana.ca' },
    { InsuranceID: 30, ProviderName: 'RBC Insurance', Province: 'British Columbia', City: 'Victoria', PostalCode: 'V8V 1W2', PhoneNumber: '250-555-3002', Email: 'help@rbcinsurance.ca' },
    { InsuranceID: 31, ProviderName: 'Aetna', Province: 'Ontario', City: 'Ottawa', PostalCode: 'K2P 2G6', PhoneNumber: '613-555-3103', Email: 'info@aetna.ca' },
    { InsuranceID: 32, ProviderName: 'Cigna', Province: 'Quebec', City: 'Montreal', PostalCode: 'H3G 2S2', PhoneNumber: '514-555-3204', Email: 'support@cigna.ca' },
    { InsuranceID: 33, ProviderName: 'Great-West Life', Province: 'Newfoundland', City: 'St. John', PostalCode: 'A1E 1A7', PhoneNumber: '709-555-3305', Email: 'info@gwl.ca' },
    { InsuranceID: 34, ProviderName: 'La Capitale', Province: 'Quebec', City: 'Quebec City', PostalCode: 'G1R 5V8', PhoneNumber: '418-555-3406', Email: 'help@lacapitale.ca' },
    { InsuranceID: 35, ProviderName: 'Sun Life', Province: 'Ontario', City: 'Ottawa', PostalCode: 'K1S 1X3', PhoneNumber: '613-555-3507', Email: 'info@sunlife.ca' },
    { InsuranceID: 36, ProviderName: 'Blue Cross', Province: 'Alberta', City: 'Calgary', PostalCode: 'T2P 3V1', PhoneNumber: '403-555-3608', Email: 'support@bluecross.ca' },
    { InsuranceID: 37, ProviderName: 'Desjardins Insurance', Province: 'Ontario', City: 'Guelph', PostalCode: 'N1E 3V7', PhoneNumber: '519-555-3709', Email: 'info@desjardins.ca' },
    { InsuranceID: 38, ProviderName: 'Cigna', Province: 'Nova Scotia', City: 'Halifax', PostalCode: 'B3N 3A6', PhoneNumber: '902-555-3801', Email: 'help@cigna.ca' },
    { InsuranceID: 39, ProviderName: 'Medavie Blue Cross', Province: 'New Brunswick', City: 'Moncton', PostalCode: 'E1C 4P5', PhoneNumber: '506-555-3902', Email: 'contact@medavie.ca' },
    { InsuranceID: 40, ProviderName: 'Empire Life', Province: 'Ontario', City: 'Toronto', PostalCode: 'M5A 2Y6', PhoneNumber: '416-555-4003', Email: 'info@empirelife.ca' },
    { InsuranceID: 41, ProviderName: 'RBC Insurance', Province: 'Quebec', City: 'Montreal', PostalCode: 'H2X 3R6', PhoneNumber: '514-555-4104', Email: 'support@rbcinsurance.ca' },
    { InsuranceID: 42, ProviderName: 'The Co-operators', Province: 'Saskatchewan', City: 'Regina', PostalCode: 'S4N 4J7', PhoneNumber: '306-555-4205', Email: 'contact@cooperators.ca' },
    { InsuranceID: 43, ProviderName: 'Manulife', Province: 'Alberta', City: 'Edmonton', PostalCode: 'T5K 0A7', PhoneNumber: '780-555-4306', Email: 'info@manulife.ca' },
    { InsuranceID: 44, ProviderName: 'Humana', Province: 'British Columbia', City: 'Vancouver', PostalCode: 'V5X 1B8', PhoneNumber: '604-555-4407', Email: 'help@humana.ca' },
    { InsuranceID: 45, ProviderName: 'Allstate Insurance', Province: 'Ontario', City: 'Oakville', PostalCode: 'L6H 2P7', PhoneNumber: '905-555-4508', Email: 'info@allstate.ca' },
    { InsuranceID: 46, ProviderName: 'Aetna', Province: 'British Columbia', City: 'Vancouver', PostalCode: 'V6B 3L9', PhoneNumber: '604-555-4609', Email: 'support@aetna.ca' },
    { InsuranceID: 47, ProviderName: 'Blue Cross', Province: 'Manitoba', City: 'Winnipeg', PostalCode: 'R3C 1T8', PhoneNumber: '204-555-4710', Email: 'contact@bluecross.ca' },
    { InsuranceID: 48, ProviderName: 'Desjardins Insurance', Province: 'Nova Scotia', City: 'Halifax', PostalCode: 'B3H 4Y2', PhoneNumber: '902-555-4811', Email: 'info@desjardins.ca' },
    { InsuranceID: 49, ProviderName: 'Medavie Blue Cross', Province: 'Ontario', City: 'Toronto', PostalCode: 'M4B 1C2', PhoneNumber: '416-555-4912', Email: 'support@medavie.ca' },
    { InsuranceID: 50, ProviderName: 'Sun Life', Province: 'Quebec', City: 'Montreal', PostalCode: 'H3B 1V7', PhoneNumber: '514-555-5013', Email: 'info@sunlife.ca' }
];

// Patients Data
const patientsData = [
    { PatientID: 1, LastName: 'Smith', FirstName: 'John', DOB: '1980-05-15', Address: '123 Main St, Toronto', Gender: 'M', InsuranceID: 1 },
    { PatientID: 2, LastName: 'Johnson', FirstName: 'Mary', DOB: '1992-08-22', Address: '456 Oak Ave, Ottawa', Gender: 'F', InsuranceID: 2 },
    { PatientID: 3, LastName: 'Williams', FirstName: 'David', DOB: '1975-03-10', Address: '789 Pine Rd, Kingston', Gender: 'M', InsuranceID: 3 },
    { PatientID: 4, LastName: 'Brown', FirstName: 'Sarah', DOB: '1988-11-30', Address: '321 Elm St, Hamilton', Gender: 'F', InsuranceID: 4 },
    { PatientID: 5, LastName: 'Davis', FirstName: 'Michael', DOB: '1965-07-25', Address: '654 Maple Dr, London', Gender: 'M', InsuranceID: 5 },
    { PatientID: 6, LastName: 'Taylor', FirstName: 'Emily', DOB: '1990-02-17', Address: '567 Birch Rd, Mississauga', Gender: 'F', InsuranceID: 1 },
    { PatientID: 7, LastName: 'Moore', FirstName: 'Chris', DOB: '1983-09-12', Address: '789 Walnut St, Brampton', Gender: 'M', InsuranceID: 2 },
    { PatientID: 8, LastName: 'Clark', FirstName: 'Emma', DOB: '1996-01-04', Address: '345 Cedar St, Toronto', Gender: 'F', InsuranceID: 3 },
    { PatientID: 9, LastName: 'Walker', FirstName: 'Daniel', DOB: '1978-03-25', Address: '987 Pine Dr, Ottawa', Gender: 'M', InsuranceID: 4 },
    { PatientID: 10, LastName: 'Hall', FirstName: 'Olivia', DOB: '1985-07-19', Address: '654 Maple Ave, Kingston', Gender: 'F', InsuranceID: 5 },
    { PatientID: 11, LastName: 'Lopez', FirstName: 'Sophia', DOB: '1991-12-15', Address: '123 Elm Rd, London', Gender: 'F', InsuranceID: 1 },
    { PatientID: 12, LastName: 'Harris', FirstName: 'Liam', DOB: '1986-04-28', Address: '456 Spruce Ln, Hamilton', Gender: 'M', InsuranceID: 2 },
    { PatientID: 13, LastName: 'Allen', FirstName: 'Charlotte', DOB: '1993-11-02', Address: '789 Cherry Ln, Toronto', Gender: 'F', InsuranceID: 3 },
    { PatientID: 14, LastName: 'Young', FirstName: 'Benjamin', DOB: '1982-08-18', Address: '321 Willow St, Mississauga', Gender: 'M', InsuranceID: 4 },
    { PatientID: 15, LastName: 'King', FirstName: 'Grace', DOB: '1979-06-21', Address: '567 Pine Dr, Brampton', Gender: 'F', InsuranceID: 5 },
    { PatientID: 16, LastName: 'Scott', FirstName: 'Lucas', DOB: '1995-09-10', Address: '234 Maple St, Ottawa', Gender: 'M', InsuranceID: 1 },
    { PatientID: 17, LastName: 'Green', FirstName: 'Ava', DOB: '1984-05-09', Address: '765 Walnut Ave, Kingston', Gender: 'F', InsuranceID: 2 },
    { PatientID: 18, LastName: 'Adams', FirstName: 'Ethan', DOB: '1977-02-13', Address: '543 Elm Dr, London', Gender: 'M', InsuranceID: 3 },
    { PatientID: 19, LastName: 'Baker', FirstName: 'Mia', DOB: '1997-12-31', Address: '876 Cedar Ave, Hamilton', Gender: 'F', InsuranceID: 4 },
    { PatientID: 20, LastName: 'Nelson', FirstName: 'Noah', DOB: '1981-07-22', Address: '789 Cherry Ln, Toronto', Gender: 'M', InsuranceID: 5 },
    { PatientID: 21, LastName: 'Carter', FirstName: 'Ella', DOB: '1994-10-06', Address: '345 Maple Dr, Mississauga', Gender: 'F', InsuranceID: 1 },
    { PatientID: 22, LastName: 'Mitchell', FirstName: 'Oliver', DOB: '1990-03-16', Address: '234 Willow Rd, Brampton', Gender: 'M', InsuranceID: 2 },
    { PatientID: 23, LastName: 'Perez', FirstName: 'Harper', DOB: '1987-08-03', Address: '987 Walnut St, Ottawa', Gender: 'F', InsuranceID: 3 },
    { PatientID: 24, LastName: 'Roberts', FirstName: 'Elijah', DOB: '1976-05-11', Address: '543 Spruce Ave, Kingston', Gender: 'M', InsuranceID: 4 },
    { PatientID: 25, LastName: 'Turner', FirstName: 'Amelia', DOB: '1998-01-26', Address: '876 Birch Dr, London', Gender: 'F', InsuranceID: 5 },
    { PatientID: 26, LastName: 'Phillips', FirstName: 'Sebastian', DOB: '1989-09-30', Address: '321 Cedar St, Hamilton', Gender: 'M', InsuranceID: 1 },
    { PatientID: 27, LastName: 'Campbell', FirstName: 'Zoe', DOB: '1974-06-20', Address: '456 Maple Rd, Toronto', Gender: 'F', InsuranceID: 2 },
    { PatientID: 28, LastName: 'Parker', FirstName: 'Henry', DOB: '1983-10-14', Address: '234 Walnut Ln, Mississauga', Gender: 'M', InsuranceID: 3 },
    { PatientID: 29, LastName: 'Evans', FirstName: 'Lillian', DOB: '1999-12-08', Address: '789 Willow Dr, Brampton', Gender: 'F', InsuranceID: 4 },
    { PatientID: 30, LastName: 'Edwards', FirstName: 'Jack', DOB: '1980-11-04', Address: '543 Pine Ave, Ottawa', Gender: 'M', InsuranceID: 5 },
    { PatientID: 31, LastName: 'Collins', FirstName: 'Abigail', DOB: '1992-07-27', Address: '654 Birch St, Kingston', Gender: 'F', InsuranceID: 1 },
    { PatientID: 32, LastName: 'Stewart', FirstName: 'Samuel', DOB: '1988-02-06', Address: '876 Maple Ln, London', Gender: 'M', InsuranceID: 2 },
    { PatientID: 33, LastName: 'Sanchez', FirstName: 'Emily', DOB: '1991-11-23', Address: '345 Spruce Dr, Hamilton', Gender: 'F', InsuranceID: 3 },
    { PatientID: 34, LastName: 'Morris', FirstName: 'Joseph', DOB: '1985-03-17', Address: '987 Cedar St, Toronto', Gender: 'M', InsuranceID: 4 },
    { PatientID: 35, LastName: 'Rogers', FirstName: 'Victoria', DOB: '1979-08-29', Address: '234 Cherry Ln, Mississauga', Gender: 'F', InsuranceID: 5 },
    { PatientID: 36, LastName: 'Reed', FirstName: 'Mason', DOB: '1993-06-12', Address: '543 Walnut Dr, Brampton', Gender: 'M', InsuranceID: 1 },
    { PatientID: 37, LastName: 'Cook', FirstName: 'Madison', DOB: '1987-04-15', Address: '876 Willow St, Ottawa', Gender: 'F', InsuranceID: 2 },
    { PatientID: 38, LastName: 'Morgan', FirstName: 'Andrew', DOB: '1978-10-19', Address: '321 Birch Ave, Kingston', Gender: 'M', InsuranceID: 3 },
    { PatientID: 39, LastName: 'Bell', FirstName: 'Hannah', DOB: '1996-09-05', Address: '789 Maple Dr, London', Gender: 'F', InsuranceID: 4 },
    { PatientID: 40, LastName: 'Murphy', FirstName: 'Alexander', DOB: '1984-01-22', Address: '456 Cedar Rd, Hamilton', Gender: 'M', InsuranceID: 5 },
    { PatientID: 41, LastName: 'Bailey', FirstName: 'Chloe', DOB: '1989-11-10', Address: '123 Cherry St, Toronto', Gender: 'F', InsuranceID: 1 },
    { PatientID: 42, LastName: 'Rivera', FirstName: 'Logan', DOB: '1995-07-14', Address: '234 Spruce Ln, Mississauga', Gender: 'M', InsuranceID: 2 },
    { PatientID: 43, LastName: 'Cooper', FirstName: 'Aria', DOB: '1981-03-01', Address: '654 Pine Dr, Brampton', Gender: 'F', InsuranceID: 3 },
    { PatientID: 44, LastName: 'Richardson', FirstName: 'Liam', DOB: '1982-06-25', Address: '876 Willow St, Ottawa', Gender: 'M', InsuranceID: 4 },
    { PatientID: 45, LastName: 'Cox', FirstName: 'Natalie', DOB: '1977-12-30', Address: '345 Birch Ave, Kingston', Gender: 'F', InsuranceID: 5 },
    { PatientID: 46, LastName: 'Howard', FirstName: 'Matthew', DOB: '1990-08-11', Address: '543 Maple Dr, London', Gender: 'M', InsuranceID: 1 },
    { PatientID: 47, LastName: 'Ward', FirstName: 'Ella', DOB: '1994-02-28', Address: '789 Cedar Rd, Hamilton', Gender: 'F', InsuranceID: 2 },
    { PatientID: 48, LastName: 'Torres', FirstName: 'Sophia', DOB: '1986-10-03', Address: '234 Walnut Ave, Toronto', Gender: 'F', InsuranceID: 3 },
    { PatientID: 49, LastName: 'Peterson', FirstName: 'Noah', DOB: '1983-01-07', Address: '567 Pine Ln, Mississauga', Gender: 'M', InsuranceID: 4 },
    { PatientID: 50, LastName: 'Gray', FirstName: 'Avery', DOB: '1975-11-19', Address: '876 Spruce Dr, Brampton', Gender: 'F', InsuranceID: 5 }
];

// Physicians Data
const physiciansData = [
    { PhysicianID: 1, FirstName: 'David', LastName: 'Wilson', Specialization: 'Cardiology', Email: 'david.wilson@lrch.ca' },
    { PhysicianID: 2, FirstName: 'Sarah', LastName: 'Brown', Specialization: 'Pediatrics', Email: 'sarah.brown@lrch.ca' },
    { PhysicianID: 3, FirstName: 'James', LastName: 'Taylor', Specialization: 'Orthopedics', Email: 'james.taylor@lrch.ca' },
    { PhysicianID: 4, FirstName: 'Emily', LastName: 'Anderson', Specialization: 'Neurology', Email: 'emily.anderson@lrch.ca' },
    { PhysicianID: 5, FirstName: 'Robert', LastName: 'Martinez', Specialization: 'General Surgery', Email: 'robert.martinez@lrch.ca' }
];

// Rooms Data
const roomsData = [
    { RoomID: 1, RoomType: 'ICU', Capacity: 4, Occupancy: 2, RoomsAvailable: 2 },
    { RoomID: 2, RoomType: 'Private', Capacity: 1, Occupancy: 0, RoomsAvailable: 1 },
    { RoomID: 3, RoomType: 'Semi-Private', Capacity: 2, Occupancy: 1, RoomsAvailable: 1 },
    { RoomID: 4, RoomType: 'Ward', Capacity: 4, Occupancy: 3, RoomsAvailable: 1 },
    { RoomID: 5, RoomType: 'Operating Room', Capacity: 1, Occupancy: 0, RoomsAvailable: 1 }
];

// Appointments Data
const appointmentsData = [
    { AppointmentID: 1, PatientID: 1, PhysicianID: 1, Date: '2024-12-01', Time: '09:00:00', Status: 'Scheduled', ReasonForVisit: 'Routine Checkup' },
    { AppointmentID: 2, PatientID: 2, PhysicianID: 2, Date: '2024-12-01', Time: '10:30:00', Status: 'Scheduled', ReasonForVisit: 'Vaccination' },
    { AppointmentID: 3, PatientID: 3, PhysicianID: 3, Date: '2024-12-02', Time: '11:00:00', Status: 'Scheduled', ReasonForVisit: 'Knee Pain' },
    { AppointmentID: 4, PatientID: 4, PhysicianID: 4, Date: '2024-12-02', Time: '12:30:00', Status: 'Scheduled', ReasonForVisit: 'Headache' },
    { AppointmentID: 5, PatientID: 5, PhysicianID: 5, Date: '2024-12-03', Time: '14:00:00', Status: 'Scheduled', ReasonForVisit: 'Pre-Surgery Consultation' },
    { AppointmentID: 6, PatientID: 6, PhysicianID: 1, Date: '2024-12-03', Time: '15:30:00', Status: 'Scheduled', ReasonForVisit: 'Chest Pain' },
    { AppointmentID: 7, PatientID: 7, PhysicianID: 2, Date: '2024-12-04', Time: '10:00:00', Status: 'Scheduled', ReasonForVisit: 'Flu Symptoms' },
    { AppointmentID: 8, PatientID: 8, PhysicianID: 3, Date: '2024-12-04', Time: '11:45:00', Status: 'Scheduled', ReasonForVisit: 'Back Pain' },
    { AppointmentID: 9, PatientID: 9, PhysicianID: 4, Date: '2024-12-05', Time: '13:30:00', Status: 'Scheduled', ReasonForVisit: 'Migraines' },
    { AppointmentID: 10, PatientID: 10, PhysicianID: 5, Date: '2024-12-05', Time: '15:15:00', Status: 'Scheduled', ReasonForVisit: 'Post-Surgery Follow-Up' },
    { AppointmentID: 11, PatientID: 11, PhysicianID: 1, Date: '2024-12-06', Time: '08:00:00', Status: 'Scheduled', ReasonForVisit: 'Diabetes Checkup' },
    { AppointmentID: 12, PatientID: 12, PhysicianID: 2, Date: '2024-12-06', Time: '09:15:00', Status: 'Scheduled', ReasonForVisit: 'Fever Treatment' },
    { AppointmentID: 13, PatientID: 13, PhysicianID: 3, Date: '2024-12-07', Time: '10:30:00', Status: 'Scheduled', ReasonForVisit: 'Joint Pain' },
    { AppointmentID: 14, PatientID: 14, PhysicianID: 4, Date: '2024-12-07', Time: '11:45:00', Status: 'Scheduled', ReasonForVisit: 'Seasonal Allergies' },
    { AppointmentID: 15, PatientID: 15, PhysicianID: 5, Date: '2024-12-08', Time: '13:00:00', Status: 'Scheduled', ReasonForVisit: 'Annual Physical' },
    { AppointmentID: 16, PatientID: 16, PhysicianID: 1, Date: '2024-12-08', Time: '14:30:00', Status: 'Scheduled', ReasonForVisit: 'Blood Pressure Check' },
    { AppointmentID: 17, PatientID: 17, PhysicianID: 2, Date: '2024-12-09', Time: '09:45:00', Status: 'Scheduled', ReasonForVisit: 'Skin Rash' },
    { AppointmentID: 18, PatientID: 18, PhysicianID: 3, Date: '2024-12-09', Time: '11:00:00', Status: 'Scheduled', ReasonForVisit: 'Fracture Follow-Up' },
    { AppointmentID: 19, PatientID: 19, PhysicianID: 4, Date: '2024-12-10', Time: '10:00:00', Status: 'Scheduled', ReasonForVisit: 'Neurological Testing' },
    { AppointmentID: 20, PatientID: 20, PhysicianID: 5, Date: '2024-12-10', Time: '12:30:00', Status: 'Scheduled', ReasonForVisit: 'Post-Operative Visit' },
    { AppointmentID: 21, PatientID: 21, PhysicianID: 1, Date: '2024-12-11', Time: '08:30:00', Status: 'Scheduled', ReasonForVisit: 'Heart Checkup' },
    { AppointmentID: 22, PatientID: 22, PhysicianID: 2, Date: '2024-12-11', Time: '09:30:00', Status: 'Scheduled', ReasonForVisit: 'Fever Follow-Up' },
    { AppointmentID: 23, PatientID: 23, PhysicianID: 3, Date: '2024-12-12', Time: '10:45:00', Status: 'Scheduled', ReasonForVisit: 'Arthritis Pain' },
    { AppointmentID: 24, PatientID: 24, PhysicianID: 4, Date: '2024-12-12', Time: '12:15:00', Status: 'Scheduled', ReasonForVisit: 'Eye Irritation' },
    { AppointmentID: 25, PatientID: 25, PhysicianID: 5, Date: '2024-12-13', Time: '13:45:00', Status: 'Scheduled', ReasonForVisit: 'Pre-Surgery Preparation' },
    { AppointmentID: 26, PatientID: 26, PhysicianID: 1, Date: '2024-12-13', Time: '15:00:00', Status: 'Scheduled', ReasonForVisit: 'Cardiac Monitoring' },
    { AppointmentID: 27, PatientID: 27, PhysicianID: 2, Date: '2024-12-14', Time: '09:00:00', Status: 'Scheduled', ReasonForVisit: 'Cough Treatment' },
    { AppointmentID: 28, PatientID: 28, PhysicianID: 3, Date: '2024-12-14', Time: '11:15:00', Status: 'Scheduled', ReasonForVisit: 'MRI Review' },
    { AppointmentID: 29, PatientID: 29, PhysicianID: 4, Date: '2024-12-15', Time: '10:45:00', Status: 'Scheduled', ReasonForVisit: 'Migraine Treatment' },
    { AppointmentID: 30, PatientID: 30, PhysicianID: 5, Date: '2024-12-15', Time: '12:45:00', Status: 'Scheduled', ReasonForVisit: 'Post-Op Follow-Up' },
    { AppointmentID: 31, PatientID: 31, PhysicianID: 1, Date: '2024-12-16', Time: '08:30:00', Status: 'Scheduled', ReasonForVisit: 'Routine Checkup' },
    { AppointmentID: 32, PatientID: 32, PhysicianID: 2, Date: '2024-12-16', Time: '09:45:00', Status: 'Scheduled', ReasonForVisit: 'Flu Symptoms' },
    { AppointmentID: 33, PatientID: 33, PhysicianID: 3, Date: '2024-12-17', Time: '10:15:00', Status: 'Scheduled', ReasonForVisit: 'Sprain Review' },
    { AppointmentID: 34, PatientID: 34, PhysicianID: 4, Date: '2024-12-17', Time: '11:30:00', Status: 'Scheduled', ReasonForVisit: 'Eye Exam' },
    { AppointmentID: 35, PatientID: 35, PhysicianID: 5, Date: '2024-12-18', Time: '13:15:00', Status: 'Scheduled', ReasonForVisit: 'Orthopedic Assessment' },
    { AppointmentID: 36, PatientID: 36, PhysicianID: 1, Date: '2024-12-18', Time: '15:30:00', Status: 'Scheduled', ReasonForVisit: 'Neurological Testing' },
    { AppointmentID: 37, PatientID: 37, PhysicianID: 2, Date: '2024-12-19', Time: '09:15:00', Status: 'Scheduled', ReasonForVisit: 'Diabetes Check' },
    { AppointmentID: 38, PatientID: 38, PhysicianID: 3, Date: '2024-12-19', Time: '10:45:00', Status: 'Scheduled', ReasonForVisit: 'Allergy Test' },
    { AppointmentID: 39, PatientID: 39, PhysicianID: 4, Date: '2024-12-20', Time: '12:00:00', Status: 'Scheduled', ReasonForVisit: 'Skin Rash Follow-Up' },
    { AppointmentID: 40, PatientID: 40, PhysicianID: 5, Date: '2024-12-20', Time: '13:30:00', Status: 'Scheduled', ReasonForVisit: 'Post-Surgery Exam' },
    { AppointmentID: 41, PatientID: 41, PhysicianID: 1, Date: '2024-12-21', Time: '08:30:00', Status: 'Scheduled', ReasonForVisit: 'Heart Monitoring' },
    { AppointmentID: 42, PatientID: 42, PhysicianID: 2, Date: '2024-12-21', Time: '09:45:00', Status: 'Scheduled', ReasonForVisit: 'Blood Pressure Check' },
    { AppointmentID: 43, PatientID: 43, PhysicianID: 3, Date: '2024-12-22', Time: '10:15:00', Status: 'Scheduled', ReasonForVisit: 'X-Ray Review' },
    { AppointmentID: 44, PatientID: 44, PhysicianID: 4, Date: '2024-12-22', Time: '11:45:00', Status: 'Scheduled', ReasonForVisit: 'Ear Pain Consultation' },
    { AppointmentID: 45, PatientID: 45, PhysicianID: 5, Date: '2024-12-23', Time: '13:00:00', Status: 'Scheduled', ReasonForVisit: 'General Follow-Up' },
    { AppointmentID: 46, PatientID: 46, PhysicianID: 1, Date: '2024-12-23', Time: '15:15:00', Status: 'Scheduled', ReasonForVisit: 'Vaccination' },
    { AppointmentID: 47, PatientID: 47, PhysicianID: 2, Date: '2024-12-24', Time: '09:30:00', Status: 'Scheduled', ReasonForVisit: 'Routine Screening' },
    { AppointmentID: 48, PatientID: 48, PhysicianID: 3, Date: '2024-12-24', Time: '10:45:00', Status: 'Scheduled', ReasonForVisit: 'Fracture Follow-Up' },
    { AppointmentID: 49, PatientID: 49, PhysicianID: 4, Date: '2024-12-25', Time: '11:15:00', Status: 'Scheduled', ReasonForVisit: 'Skin Allergy Review' },
    { AppointmentID: 50, PatientID: 50, PhysicianID: 5, Date: '2024-12-25', Time: '16:00:00', Status: 'Scheduled', ReasonForVisit: 'Surgery Review' }
];

// Admissions Data
const admissionsData = [
    { AdmissionID: 1, PatientID: 1, RoomID: 1, AdmissionDate: '2024-11-25', InsuranceVerified: 1, TreatmentPlan: 'Intensive care for cardiac issues' },
    { AdmissionID: 2, PatientID: 2, RoomID: 3, AdmissionDate: '2024-11-26', InsuranceVerified: 1, TreatmentPlan: 'Surgery recovery' },
    { AdmissionID: 3, PatientID: 3, RoomID: 4, AdmissionDate: '2024-11-26', InsuranceVerified: 1, TreatmentPlan: 'Pneumonia treatment' },
    { AdmissionID: 4, PatientID: 4, RoomID: 1, AdmissionDate: '2024-11-27', InsuranceVerified: 1, TreatmentPlan: 'Neurological observation' },
    { AdmissionID: 5, PatientID: 5, RoomID: 2, AdmissionDate: '2024-11-28', InsuranceVerified: 1, TreatmentPlan: 'Pre-operative care' },
    { AdmissionID: 6, PatientID: 6, RoomID: 1, AdmissionDate: '2024-11-29', InsuranceVerified: 1, TreatmentPlan: 'Heart monitoring and tests' },
    { AdmissionID: 7, PatientID: 7, RoomID: 3, AdmissionDate: '2024-11-30', InsuranceVerified: 1, TreatmentPlan: 'Treatment for flu and fever' },
    { AdmissionID: 8, PatientID: 8, RoomID: 4, AdmissionDate: '2024-11-30', InsuranceVerified: 1, TreatmentPlan: 'Spinal injury observation' },
    { AdmissionID: 9, PatientID: 9, RoomID: 5, AdmissionDate: '2024-12-01', InsuranceVerified: 1, TreatmentPlan: 'Severe migraine observation' },
    { AdmissionID: 10, PatientID: 10, RoomID: 2, AdmissionDate: '2024-12-01', InsuranceVerified: 1, TreatmentPlan: 'Post-surgical care' },
    { AdmissionID: 11, PatientID: 11, RoomID: 1, AdmissionDate: '2024-12-02', InsuranceVerified: 1, TreatmentPlan: 'Diabetes control and observation' },
    { AdmissionID: 12, PatientID: 12, RoomID: 3, AdmissionDate: '2024-12-02', InsuranceVerified: 1, TreatmentPlan: 'Respiratory infection treatment' },
    { AdmissionID: 13, PatientID: 13, RoomID: 4, AdmissionDate: '2024-12-03', InsuranceVerified: 1, TreatmentPlan: 'Arthritis pain management' },
    { AdmissionID: 14, PatientID: 14, RoomID: 5, AdmissionDate: '2024-12-03', InsuranceVerified: 1, TreatmentPlan: 'Allergy treatment' },
    { AdmissionID: 15, PatientID: 15, RoomID: 2, AdmissionDate: '2024-12-04', InsuranceVerified: 1, TreatmentPlan: 'Routine surgery observation' },
    { AdmissionID: 16, PatientID: 16, RoomID: 1, AdmissionDate: '2024-12-04', InsuranceVerified: 1, TreatmentPlan: 'Hypertension management' },
    { AdmissionID: 17, PatientID: 17, RoomID: 3, AdmissionDate: '2024-12-05', InsuranceVerified: 1, TreatmentPlan: 'Skin rash treatment' },
    { AdmissionID: 18, PatientID: 18, RoomID: 4, AdmissionDate: '2024-12-05', InsuranceVerified: 1, TreatmentPlan: 'Fracture recovery' },
    { AdmissionID: 19, PatientID: 19, RoomID: 5, AdmissionDate: '2024-12-06', InsuranceVerified: 1, TreatmentPlan: 'Seizure observation and tests' },
    { AdmissionID: 20, PatientID: 20, RoomID: 2, AdmissionDate: '2024-12-06', InsuranceVerified: 1, TreatmentPlan: 'Post-surgery complications' },
    { AdmissionID: 21, PatientID: 21, RoomID: 1, AdmissionDate: '2024-12-07', InsuranceVerified: 1, TreatmentPlan: 'Heart valve monitoring' },
    { AdmissionID: 22, PatientID: 22, RoomID: 3, AdmissionDate: '2024-12-07', InsuranceVerified: 1, TreatmentPlan: 'Fever and dehydration treatment' },
    { AdmissionID: 23, PatientID: 23, RoomID: 4, AdmissionDate: '2024-12-08', InsuranceVerified: 1, TreatmentPlan: 'Orthopedic surgery follow-up' },
    { AdmissionID: 24, PatientID: 24, RoomID: 5, AdmissionDate: '2024-12-08', InsuranceVerified: 1, TreatmentPlan: 'Respiratory distress monitoring' },
    { AdmissionID: 25, PatientID: 25, RoomID: 2, AdmissionDate: '2024-12-09', InsuranceVerified: 1, TreatmentPlan: 'Pre-surgery cardiac tests' },
    { AdmissionID: 26, PatientID: 26, RoomID: 1, AdmissionDate: '2024-12-09', InsuranceVerified: 1, TreatmentPlan: 'Chest pain diagnosis' },
    { AdmissionID: 27, PatientID: 27, RoomID: 3, AdmissionDate: '2024-12-10', InsuranceVerified: 1, TreatmentPlan: 'Cough and flu treatment' },
    { AdmissionID: 28, PatientID: 28, RoomID: 4, AdmissionDate: '2024-12-10', InsuranceVerified: 1, TreatmentPlan: 'Spinal therapy and monitoring' },
    { AdmissionID: 29, PatientID: 29, RoomID: 5, AdmissionDate: '2024-12-11', InsuranceVerified: 1, TreatmentPlan: 'Migraine and neurological care' },
    { AdmissionID: 30, PatientID: 30, RoomID: 2, AdmissionDate: '2024-12-11', InsuranceVerified: 1, TreatmentPlan: 'Post-surgery wound care' }
];

// Patient Records Data
const patientRecordsData = [
    { RecordID: 1, PatientID: 1, VisitDate: '2024-11-25', Treatment: 'Prescribed beta blockers for hypertension', FollowUpDate: '2024-12-25' },
    { RecordID: 2, PatientID: 2, VisitDate: '2024-11-26', Treatment: 'Appendectomy surgery performed successfully', FollowUpDate: '2024-12-10' },
    { RecordID: 3, PatientID: 3, VisitDate: '2024-11-26', Treatment: 'Prescribed antibiotics for pneumonia', FollowUpDate: '2024-12-03' },
    { RecordID: 4, PatientID: 4, VisitDate: '2024-11-27', Treatment: 'MRI scan of brain completed for headaches', FollowUpDate: '2024-12-05' },
    { RecordID: 5, PatientID: 5, VisitDate: '2024-11-28', Treatment: 'Pre-operative blood work completed', FollowUpDate: '2024-12-01' },
    { RecordID: 6, PatientID: 6, VisitDate: '2024-11-29', Treatment: 'Chest X-ray performed for cough', FollowUpDate: '2024-12-10' },
    { RecordID: 7, PatientID: 7, VisitDate: '2024-11-30', Treatment: 'Vaccination for flu', FollowUpDate: '2024-12-15' },
    { RecordID: 8, PatientID: 8, VisitDate: '2024-12-01', Treatment: 'Physical therapy for back pain', FollowUpDate: '2024-12-20' },
    { RecordID: 9, PatientID: 9, VisitDate: '2024-12-01', Treatment: 'Blood pressure monitored and stabilized', FollowUpDate: '2024-12-15' },
    { RecordID: 10, PatientID: 10, VisitDate: '2024-12-02', Treatment: 'Post-surgery wound care', FollowUpDate: '2024-12-16' },
    { RecordID: 11, PatientID: 11, VisitDate: '2024-12-03', Treatment: 'Diagnosed with skin rash, prescribed ointment', FollowUpDate: '2024-12-18' },
    { RecordID: 12, PatientID: 12, VisitDate: '2024-12-03', Treatment: 'Counseling session for anxiety', FollowUpDate: '2024-12-20' },
    { RecordID: 13, PatientID: 13, VisitDate: '2024-12-04', Treatment: 'Routine dental cleaning', FollowUpDate: '2024-12-24' },
    { RecordID: 14, PatientID: 14, VisitDate: '2024-12-04', Treatment: 'Cast removal for fractured arm', FollowUpDate: '2024-12-17' },
    { RecordID: 15, PatientID: 15, VisitDate: '2024-12-05', Treatment: 'Diabetes management consultation', FollowUpDate: '2024-12-20' },
    { RecordID: 16, PatientID: 16, VisitDate: '2024-12-06', Treatment: 'Endoscopy for stomach pain', FollowUpDate: '2024-12-21' },
    { RecordID: 17, PatientID: 17, VisitDate: '2024-12-07', Treatment: 'Hearing test and ear infection treated', FollowUpDate: '2024-12-23' },
    { RecordID: 18, PatientID: 18, VisitDate: '2024-12-07', Treatment: 'Vision test and prescription update', FollowUpDate: '2024-12-22' },
    { RecordID: 19, PatientID: 19, VisitDate: '2024-12-08', Treatment: 'Electrocardiogram performed', FollowUpDate: '2024-12-27' },
    { RecordID: 20, PatientID: 20, VisitDate: '2024-12-08', Treatment: 'Pregnancy follow-up consultation', FollowUpDate: '2024-12-28' },
    { RecordID: 21, PatientID: 21, VisitDate: '2024-12-09', Treatment: 'Bone density scan', FollowUpDate: '2024-12-29' },
    { RecordID: 22, PatientID: 22, VisitDate: '2024-12-09', Treatment: 'Vaccination for Hepatitis B', FollowUpDate: '2024-12-25' },
    { RecordID: 23, PatientID: 23, VisitDate: '2024-12-10', Treatment: 'Post-surgery physiotherapy', FollowUpDate: '2024-12-30' },
    { RecordID: 24, PatientID: 24, VisitDate: '2024-12-11', Treatment: 'Diagnosis and treatment of bronchitis', FollowUpDate: '2024-12-31' },
    { RecordID: 25, PatientID: 25, VisitDate: '2024-12-11', Treatment: 'Blood test for cholesterol levels', FollowUpDate: '2025-01-10' }
];

// Insurance Claims Data
const insuranceClaimsData = [
    { InsuranceClaimID: 1, PatientID: 1, InsuranceID: 1, ClaimAmount: 1500.00, ClaimDate: '2024-11-25', ApprovalDate: '2024-11-26' },
    { InsuranceClaimID: 2, PatientID: 2, InsuranceID: 2, ClaimAmount: 500.00, ClaimDate: '2024-11-26', ApprovalDate: '2024-11-27' },
    { InsuranceClaimID: 3, PatientID: 3, InsuranceID: 3, ClaimAmount: 1200.00, ClaimDate: '2024-11-26', ApprovalDate: '2024-11-27' },
    { InsuranceClaimID: 4, PatientID: 4, InsuranceID: 4, ClaimAmount: 800.00, ClaimDate: '2024-11-27', ApprovalDate: '2024-11-28' },
    { InsuranceClaimID: 5, PatientID: 5, InsuranceID: 5, ClaimAmount: 2000.00, ClaimDate: '2024-11-28', ApprovalDate: '2024-11-29' },
    { InsuranceClaimID: 6, PatientID: 6, InsuranceID: 1, ClaimAmount: 1100.00, ClaimDate: '2024-11-29', ApprovalDate: '2024-11-30' },
    { InsuranceClaimID: 7, PatientID: 7, InsuranceID: 2, ClaimAmount: 450.00, ClaimDate: '2024-11-30', ApprovalDate: '2024-12-01' },
    { InsuranceClaimID: 8, PatientID: 8, InsuranceID: 3, ClaimAmount: 950.00, ClaimDate: '2024-12-01', ApprovalDate: '2024-12-02' },
    { InsuranceClaimID: 9, PatientID: 9, InsuranceID: 4, ClaimAmount: 1400.00, ClaimDate: '2024-12-01', ApprovalDate: '2024-12-02' },
    { InsuranceClaimID: 10, PatientID: 10, InsuranceID: 5, ClaimAmount: 1800.00, ClaimDate: '2024-12-02', ApprovalDate: '2024-12-03' },
    { InsuranceClaimID: 11, PatientID: 11, InsuranceID: 1, ClaimAmount: 1300.00, ClaimDate: '2024-12-02', ApprovalDate: '2024-12-03' },
    { InsuranceClaimID: 12, PatientID: 12, InsuranceID: 2, ClaimAmount: 700.00, ClaimDate: '2024-12-03', ApprovalDate: '2024-12-04' },
    { InsuranceClaimID: 13, PatientID: 13, InsuranceID: 3, ClaimAmount: 1100.00, ClaimDate: '2024-12-03', ApprovalDate: '2024-12-04' },
    { InsuranceClaimID: 14, PatientID: 14, InsuranceID: 4, ClaimAmount: 1600.00, ClaimDate: '2024-12-04', ApprovalDate: '2024-12-05' },
    { InsuranceClaimID: 15, PatientID: 15, InsuranceID: 5, ClaimAmount: 2200.00, ClaimDate: '2024-12-04', ApprovalDate: '2024-12-05' },
    { InsuranceClaimID: 16, PatientID: 16, InsuranceID: 6, ClaimAmount: 950.00, ClaimDate: '2024-12-05', ApprovalDate: '2024-12-06' },
    { InsuranceClaimID: 17, PatientID: 17, InsuranceID: 7, ClaimAmount: 1800.00, ClaimDate: '2024-12-05', ApprovalDate: '2024-12-06' },
    { InsuranceClaimID: 18, PatientID: 18, InsuranceID: 8, ClaimAmount: 2000.00, ClaimDate: '2024-12-06', ApprovalDate: '2024-12-07' },
    { InsuranceClaimID: 19, PatientID: 19, InsuranceID: 9, ClaimAmount: 1000.00, ClaimDate: '2024-12-06', ApprovalDate: '2024-12-07' },
    { InsuranceClaimID: 20, PatientID: 20, InsuranceID: 10, ClaimAmount: 1200.00, ClaimDate: '2024-12-07', ApprovalDate: '2024-12-08' }
];

// Billing Data
const billingData = [
    { BillingID: 1, PatientID: 1, TotalAmount: 1500.00, InvoiceDate: '2024-11-25', DueDate: '2024-12-25', InsuranceClaimID: 1, PaymentStatus: 'Pending' },
    { BillingID: 2, PatientID: 2, TotalAmount: 2500.00, InvoiceDate: '2024-11-26', DueDate: '2024-12-26', InsuranceClaimID: 2, PaymentStatus: 'Paid' },
    { BillingID: 3, PatientID: 3, TotalAmount: 1800.00, InvoiceDate: '2024-11-26', DueDate: '2024-12-26', InsuranceClaimID: 3, PaymentStatus: 'Pending' },
    { BillingID: 4, PatientID: 4, TotalAmount: 3000.00, InvoiceDate: '2024-11-27', DueDate: '2024-12-27', InsuranceClaimID: 4, PaymentStatus: 'Processing' },
    { BillingID: 5, PatientID: 5, TotalAmount: 2000.00, InvoiceDate: '2024-11-28', DueDate: '2024-12-28', InsuranceClaimID: 5, PaymentStatus: 'Pending' },
    { BillingID: 6, PatientID: 6, TotalAmount: 1200.00, InvoiceDate: '2024-11-29', DueDate: '2024-12-29', InsuranceClaimID: 1, PaymentStatus: 'Paid' },
    { BillingID: 7, PatientID: 7, TotalAmount: 1400.00, InvoiceDate: '2024-11-30', DueDate: '2024-12-30', InsuranceClaimID: 2, PaymentStatus: 'Pending' },
    { BillingID: 8, PatientID: 8, TotalAmount: 1600.00, InvoiceDate: '2024-12-01', DueDate: '2024-12-31', InsuranceClaimID: 3, PaymentStatus: 'Paid' },
    { BillingID: 9, PatientID: 9, TotalAmount: 1900.00, InvoiceDate: '2024-12-01', DueDate: '2024-12-30', InsuranceClaimID: 4, PaymentStatus: 'Processing' },
    { BillingID: 10, PatientID: 10, TotalAmount: 2200.00, InvoiceDate: '2024-12-02', DueDate: '2024-12-31', InsuranceClaimID: 5, PaymentStatus: 'Pending' },
    { BillingID: 11, PatientID: 11, TotalAmount: 1300.00, InvoiceDate: '2024-12-02', DueDate: '2024-12-31', InsuranceClaimID: 1, PaymentStatus: 'Paid' },
    { BillingID: 12, PatientID: 12, TotalAmount: 1100.00, InvoiceDate: '2024-12-03', DueDate: '2024-12-31', InsuranceClaimID: 2, PaymentStatus: 'Pending' },
    { BillingID: 13, PatientID: 13, TotalAmount: 1450.00, InvoiceDate: '2024-12-03', DueDate: '2024-12-31', InsuranceClaimID: 3, PaymentStatus: 'Paid' },
    { BillingID: 14, PatientID: 14, TotalAmount: 1650.00, InvoiceDate: '2024-12-04', DueDate: '2024-12-31', InsuranceClaimID: 4, PaymentStatus: 'Processing' },
    { BillingID: 15, PatientID: 15, TotalAmount: 1950.00, InvoiceDate: '2024-12-04', DueDate: '2024-12-31', InsuranceClaimID: 5, PaymentStatus: 'Pending' },
    { BillingID: 16, PatientID: 16, TotalAmount: 1250.00, InvoiceDate: '2024-12-05', DueDate: '2024-12-31', InsuranceClaimID: 1, PaymentStatus: 'Paid' },
    { BillingID: 17, PatientID: 17, TotalAmount: 1350.00, InvoiceDate: '2024-12-05', DueDate: '2024-12-31', InsuranceClaimID: 2, PaymentStatus: 'Pending' },
    { BillingID: 18, PatientID: 18, TotalAmount: 1550.00, InvoiceDate: '2024-12-06', DueDate: '2024-12-31', InsuranceClaimID: 3, PaymentStatus: 'Paid' },
    { BillingID: 19, PatientID: 19, TotalAmount: 1750.00, InvoiceDate: '2024-12-06', DueDate: '2024-12-31', InsuranceClaimID: 4, PaymentStatus: 'Processing' },
    { BillingID: 20, PatientID: 20, TotalAmount: 1850.00, InvoiceDate: '2024-12-07', DueDate: '2024-12-31', InsuranceClaimID: 5, PaymentStatus: 'Pending' }
];

// Bed Data
const bedData = [
    { BedID: 1, RoomID: 1, BedNumber: 1, PatientID: 1 },
    { BedID: 2, RoomID: 1, BedNumber: 2, PatientID: 4 },
    { BedID: 3, RoomID: 2, BedNumber: 1, PatientID: null },
    { BedID: 4, RoomID: 3, BedNumber: 1, PatientID: 2 },
    { BedID: 5, RoomID: 3, BedNumber: 2, PatientID: null },
    { BedID: 6, RoomID: 4, BedNumber: 1, PatientID: 3 },
    { BedID: 7, RoomID: 4, BedNumber: 2, PatientID: null },
    { BedID: 8, RoomID: 4, BedNumber: 3, PatientID: null },
    { BedID: 9, RoomID: 4, BedNumber: 4, PatientID: null },
    { BedID: 10, RoomID: 5, BedNumber: 1, PatientID: null }
];

// Helper function to get patient name
function getPatientName(patientId) {
    const patient = patientsData.find(p => p.PatientID === patientId);
    return patient ? `${patient.FirstName} ${patient.LastName}` : 'Unknown';
}

// Helper function to get physician name
function getPhysicianName(physicianId) {
    const physician = physiciansData.find(p => p.PhysicianID === physicianId);
    return physician ? `Dr. ${physician.FirstName} ${physician.LastName}` : 'Unknown';
}

// Helper function to get insurance provider name
function getInsuranceName(insuranceId) {
    const insurance = insuranceData.find(i => i.InsuranceID === insuranceId);
    return insurance ? insurance.ProviderName : 'Unknown';
}

// Helper function to get room type
function getRoomType(roomId) {
    const room = roomsData.find(r => r.RoomID === roomId);
    return room ? room.RoomType : 'Unknown';
}

// Helper function to format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-CA');
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
    }).format(amount);
}

// Helper function to format time
function formatTime(timeStr) {
    if (!timeStr) return '-';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}
