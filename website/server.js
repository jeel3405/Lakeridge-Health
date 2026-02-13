
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool;

// Get database connection (creates one if not exists)
async function getPool() {
    if (pool) {
        return pool;
    }
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to Azure SQL database');
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        throw err;
    }
}

async function connectDB() {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to Azure SQL database');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

app.get('/api/patients', async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query('SELECT * FROM Patients ORDER BY PatientID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/patients', async (req, res) => {
    try {
        const { LastName, FirstName, DOB, Address, Gender, InsuranceID } = req.body;
        
        // Get next PatientID
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(PatientID), 0) + 1 AS NextID FROM Patients');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('PatientID', sql.Int, nextId)
            .input('LastName', sql.VarChar(50), LastName)
            .input('FirstName', sql.VarChar(50), FirstName)
            .input('DOB', sql.Date, DOB)
            .input('Address', sql.VarChar(100), Address)
            .input('Gender', sql.Char(1), Gender)
            .input('InsuranceID', sql.Int, InsuranceID)
            .query('INSERT INTO Patients VALUES (@PatientID, @LastName, @FirstName, @DOB, @Address, @Gender, @InsuranceID)');
        
        res.json({ success: true, PatientID: nextId, message: 'Patient added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/patients/:id', async (req, res) => {
    try {
        const { LastName, FirstName, DOB, Address, Gender, InsuranceID } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('PatientID', sql.Int, id)
            .input('LastName', sql.VarChar(50), LastName)
            .input('FirstName', sql.VarChar(50), FirstName)
            .input('DOB', sql.Date, DOB)
            .input('Address', sql.VarChar(100), Address)
            .input('Gender', sql.Char(1), Gender)
            .input('InsuranceID', sql.Int, InsuranceID)
            .query(`UPDATE Patients SET 
                LastName = @LastName, FirstName = @FirstName, DOB = @DOB, 
                Address = @Address, Gender = @Gender, InsuranceID = @InsuranceID 
                WHERE PatientID = @PatientID`);
        
        res.json({ success: true, message: 'Patient updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/patients/:id', async (req, res) => {
    try {
        await (await getPool()).request()
            .input('PatientID', sql.Int, req.params.id)
            .query('DELETE FROM Patients WHERE PatientID = @PatientID');
        
        res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/physicians', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Physicians ORDER BY PhysicianID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/physicians', async (req, res) => {
    try {
        const { FirstName, LastName, Specialization, Email } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(PhysicianID), 0) + 1 AS NextID FROM Physicians');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('PhysicianID', sql.Int, nextId)
            .input('FirstName', sql.VarChar(50), FirstName)
            .input('LastName', sql.VarChar(50), LastName)
            .input('Specialization', sql.VarChar(50), Specialization)
            .input('Email', sql.VarChar(100), Email)
            .query('INSERT INTO Physicians VALUES (@PhysicianID, @FirstName, @LastName, @Specialization, @Email)');
        
        res.json({ success: true, PhysicianID: nextId, message: 'Physician added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/physicians/:id', async (req, res) => {
    try {
        const { FirstName, LastName, Specialization, Email } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('PhysicianID', sql.Int, id)
            .input('FirstName', sql.VarChar(50), FirstName)
            .input('LastName', sql.VarChar(50), LastName)
            .input('Specialization', sql.VarChar(50), Specialization)
            .input('Email', sql.VarChar(100), Email)
            .query(`UPDATE Physicians SET 
                FirstName = @FirstName, LastName = @LastName, 
                Specialization = @Specialization, Email = @Email 
                WHERE PhysicianID = @PhysicianID`);
        
        res.json({ success: true, message: 'Physician updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/physicians/:id', async (req, res) => {
    try {
        await (await getPool()).request()
            .input('PhysicianID', sql.Int, req.params.id)
            .query('DELETE FROM Physicians WHERE PhysicianID = @PhysicianID');
        
        res.json({ success: true, message: 'Physician deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/appointments', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Appointments ORDER BY AppointmentID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { PatientID, PhysicianID, Date, Time, Status, ReasonForVisit } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(AppointmentID), 0) + 1 AS NextID FROM Appointments');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('AppointmentID', sql.Int, nextId)
            .input('PatientID', sql.Int, PatientID)
            .input('PhysicianID', sql.Int, PhysicianID)
            .input('Date', sql.Date, Date)
            .input('Time', sql.Time, Time)
            .input('Status', sql.VarChar(20), Status)
            .input('ReasonForVisit', sql.VarChar(200), ReasonForVisit)
            .query('INSERT INTO Appointments VALUES (@AppointmentID, @PatientID, @PhysicianID, @Date, @Time, @Status, @ReasonForVisit)');
        
        res.json({ success: true, AppointmentID: nextId, message: 'Appointment created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { PatientID, PhysicianID, Date, Time, Status, ReasonForVisit } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('AppointmentID', sql.Int, id)
            .input('PatientID', sql.Int, PatientID)
            .input('PhysicianID', sql.Int, PhysicianID)
            .input('Date', sql.Date, Date)
            .input('Time', sql.Time, Time)
            .input('Status', sql.VarChar(20), Status)
            .input('ReasonForVisit', sql.VarChar(200), ReasonForVisit)
            .query(`UPDATE Appointments SET 
                PatientID = @PatientID, PhysicianID = @PhysicianID, Date = @Date,
                Time = @Time, Status = @Status, ReasonForVisit = @ReasonForVisit 
                WHERE AppointmentID = @AppointmentID`);
        
        res.json({ success: true, message: 'Appointment updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await (await getPool()).request()
            .input('AppointmentID', sql.Int, req.params.id)
            .query('DELETE FROM Appointments WHERE AppointmentID = @AppointmentID');
        
        res.json({ success: true, message: 'Appointment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admissions', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Admissions ORDER BY AdmissionID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admissions', async (req, res) => {
    try {
        const { PatientID, RoomID, AdmissionDate, InsuranceVerified, TreatmentPlan } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(AdmissionID), 0) + 1 AS NextID FROM Admissions');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('AdmissionID', sql.Int, nextId)
            .input('PatientID', sql.Int, PatientID)
            .input('RoomID', sql.Int, RoomID)
            .input('AdmissionDate', sql.Date, AdmissionDate)
            .input('InsuranceVerified', sql.TinyInt, InsuranceVerified)
            .input('TreatmentPlan', sql.VarChar(500), TreatmentPlan)
            .query('INSERT INTO Admissions VALUES (@AdmissionID, @PatientID, @RoomID, @AdmissionDate, @InsuranceVerified, @TreatmentPlan)');
        
        res.json({ success: true, AdmissionID: nextId, message: 'Admission created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admissions/:id', async (req, res) => {
    try {
        const { PatientID, RoomID, AdmissionDate, InsuranceVerified, TreatmentPlan } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('AdmissionID', sql.Int, id)
            .input('PatientID', sql.Int, PatientID)
            .input('RoomID', sql.Int, RoomID)
            .input('AdmissionDate', sql.Date, AdmissionDate)
            .input('InsuranceVerified', sql.TinyInt, InsuranceVerified)
            .input('TreatmentPlan', sql.VarChar(500), TreatmentPlan)
            .query(`UPDATE Admissions SET 
                PatientID = @PatientID, RoomID = @RoomID, AdmissionDate = @AdmissionDate,
                InsuranceVerified = @InsuranceVerified, TreatmentPlan = @TreatmentPlan 
                WHERE AdmissionID = @AdmissionID`);
        
        res.json({ success: true, message: 'Admission updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admissions/:id', async (req, res) => {
    try {
        await (await getPool()).request()
            .input('AdmissionID', sql.Int, req.params.id)
            .query('DELETE FROM Admissions WHERE AdmissionID = @AdmissionID');
        
        res.json({ success: true, message: 'Admission deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rooms', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Rooms ORDER BY RoomID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rooms', async (req, res) => {
    try {
        const { RoomType, Capacity, Occupancy, RoomsAvailable } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(RoomID), 0) + 1 AS NextID FROM Rooms');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('RoomID', sql.Int, nextId)
            .input('RoomType', sql.VarChar(20), RoomType)
            .input('Capacity', sql.Int, Capacity)
            .input('Occupancy', sql.Int, Occupancy || 0)
            .input('RoomsAvailable', sql.Int, RoomsAvailable || Capacity)
            .query('INSERT INTO Rooms VALUES (@RoomID, @RoomType, @Capacity, @Occupancy, @RoomsAvailable)');
        
        res.json({ success: true, RoomID: nextId, message: 'Room added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/rooms/:id', async (req, res) => {
    try {
        const { RoomType, Capacity, Occupancy, RoomsAvailable } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('RoomID', sql.Int, id)
            .input('RoomType', sql.VarChar(20), RoomType)
            .input('Capacity', sql.Int, Capacity)
            .input('Occupancy', sql.Int, Occupancy)
            .input('RoomsAvailable', sql.Int, RoomsAvailable)
            .query(`UPDATE Rooms SET 
                RoomType = @RoomType, Capacity = @Capacity, 
                Occupancy = @Occupancy, RoomsAvailable = @RoomsAvailable 
                WHERE RoomID = @RoomID`);
        
        res.json({ success: true, message: 'Room updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/billing', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Billing ORDER BY BillingID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/billing', async (req, res) => {
    try {
        const { PatientID, TotalAmount, InvoiceDate, DueDate, PaymentStatus } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(BillingID), 0) + 1 AS NextID FROM Billing');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('BillingID', sql.Int, nextId)
            .input('PatientID', sql.Int, PatientID)
            .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
            .input('InvoiceDate', sql.Date, InvoiceDate)
            .input('DueDate', sql.Date, DueDate)
            .input('PaymentStatus', sql.VarChar(20), PaymentStatus)
            .query('INSERT INTO Billing (BillingID, PatientID, TotalAmount, InvoiceDate, DueDate, PaymentStatus) VALUES (@BillingID, @PatientID, @TotalAmount, @InvoiceDate, @DueDate, @PaymentStatus)');
        
        res.json({ success: true, BillingID: nextId, message: 'Invoice created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/billing/:id', async (req, res) => {
    try {
        const { PatientID, TotalAmount, InvoiceDate, DueDate, PaymentStatus } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('BillingID', sql.Int, id)
            .input('PatientID', sql.Int, PatientID)
            .input('TotalAmount', sql.Decimal(10, 2), TotalAmount)
            .input('InvoiceDate', sql.Date, InvoiceDate)
            .input('DueDate', sql.Date, DueDate)
            .input('PaymentStatus', sql.VarChar(20), PaymentStatus)
            .query(`UPDATE Billing SET 
                PatientID = @PatientID, TotalAmount = @TotalAmount, 
                InvoiceDate = @InvoiceDate, DueDate = @DueDate, PaymentStatus = @PaymentStatus 
                WHERE BillingID = @BillingID`);
        
        res.json({ success: true, message: 'Invoice updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/insurance', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Insurance ORDER BY InsuranceID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/insurance', async (req, res) => {
    try {
        const { ProviderName, Province, City, PostalCode, PhoneNumber, Email } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(InsuranceID), 0) + 1 AS NextID FROM Insurance');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('InsuranceID', sql.Int, nextId)
            .input('ProviderName', sql.VarChar(100), ProviderName)
            .input('Province', sql.VarChar(50), Province)
            .input('City', sql.VarChar(50), City)
            .input('PostalCode', sql.VarChar(10), PostalCode)
            .input('PhoneNumber', sql.VarChar(15), PhoneNumber)
            .input('Email', sql.VarChar(100), Email)
            .query('INSERT INTO Insurance VALUES (@InsuranceID, @ProviderName, @Province, @City, @PostalCode, @PhoneNumber, @Email)');
        
        res.json({ success: true, InsuranceID: nextId, message: 'Insurance provider added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/insurance/:id', async (req, res) => {
    try {
        const { ProviderName, Province, City, PostalCode, PhoneNumber, Email } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('InsuranceID', sql.Int, id)
            .input('ProviderName', sql.VarChar(100), ProviderName)
            .input('Province', sql.VarChar(50), Province)
            .input('City', sql.VarChar(50), City)
            .input('PostalCode', sql.VarChar(10), PostalCode)
            .input('PhoneNumber', sql.VarChar(15), PhoneNumber)
            .input('Email', sql.VarChar(100), Email)
            .query(`UPDATE Insurance SET 
                ProviderName = @ProviderName, Province = @Province, City = @City,
                PostalCode = @PostalCode, PhoneNumber = @PhoneNumber, Email = @Email 
                WHERE InsuranceID = @InsuranceID`);
        
        res.json({ success: true, message: 'Insurance provider updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/records', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM PatientRecords ORDER BY RecordID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/records', async (req, res) => {
    try {
        const { PatientID, VisitDate, Treatment, FollowUpDate } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(RecordID), 0) + 1 AS NextID FROM PatientRecords');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('RecordID', sql.Int, nextId)
            .input('PatientID', sql.Int, PatientID)
            .input('VisitDate', sql.Date, VisitDate)
            .input('Treatment', sql.VarChar(500), Treatment)
            .input('FollowUpDate', sql.Date, FollowUpDate || null)
            .query('INSERT INTO PatientRecords VALUES (@RecordID, @PatientID, @VisitDate, @Treatment, @FollowUpDate)');
        
        res.json({ success: true, RecordID: nextId, message: 'Patient record added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/records/:id', async (req, res) => {
    try {
        const { PatientID, VisitDate, Treatment, FollowUpDate } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('RecordID', sql.Int, id)
            .input('PatientID', sql.Int, PatientID)
            .input('VisitDate', sql.Date, VisitDate)
            .input('Treatment', sql.VarChar(500), Treatment)
            .input('FollowUpDate', sql.Date, FollowUpDate || null)
            .query(`UPDATE PatientRecords SET 
                PatientID = @PatientID, VisitDate = @VisitDate, 
                Treatment = @Treatment, FollowUpDate = @FollowUpDate 
                WHERE RecordID = @RecordID`);
        
        res.json({ success: true, message: 'Patient record updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/claims', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM InsuranceClaims ORDER BY InsuranceClaimID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/claims', async (req, res) => {
    try {
        const { PatientID, InsuranceID, ClaimAmount, ClaimDate, ApprovalDate } = req.body;
        
        const maxIdResult = await (await getPool()).request().query('SELECT ISNULL(MAX(InsuranceClaimID), 0) + 1 AS NextID FROM InsuranceClaims');
        const nextId = maxIdResult.recordset[0].NextID;
        
        await (await getPool()).request()
            .input('InsuranceClaimID', sql.Int, nextId)
            .input('PatientID', sql.Int, PatientID)
            .input('InsuranceID', sql.Int, InsuranceID)
            .input('ClaimAmount', sql.Decimal(10, 2), ClaimAmount)
            .input('ClaimDate', sql.Date, ClaimDate)
            .input('ApprovalDate', sql.Date, ApprovalDate || null)
            .query('INSERT INTO InsuranceClaims VALUES (@InsuranceClaimID, @PatientID, @InsuranceID, @ClaimAmount, @ClaimDate, @ApprovalDate)');
        
        res.json({ success: true, InsuranceClaimID: nextId, message: 'Insurance claim submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/claims/:id', async (req, res) => {
    try {
        const { PatientID, InsuranceID, ClaimAmount, ClaimDate, ApprovalDate } = req.body;
        const { id } = req.params;
        
        await (await getPool()).request()
            .input('InsuranceClaimID', sql.Int, id)
            .input('PatientID', sql.Int, PatientID)
            .input('InsuranceID', sql.Int, InsuranceID)
            .input('ClaimAmount', sql.Decimal(10, 2), ClaimAmount)
            .input('ClaimDate', sql.Date, ClaimDate)
            .input('ApprovalDate', sql.Date, ApprovalDate || null)
            .query(`UPDATE InsuranceClaims SET 
                PatientID = @PatientID, InsuranceID = @InsuranceID, 
                ClaimAmount = @ClaimAmount, ClaimDate = @ClaimDate, ApprovalDate = @ApprovalDate 
                WHERE InsuranceClaimID = @InsuranceClaimID`);
        
        res.json({ success: true, message: 'Insurance claim updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/beds', async (req, res) => {
    try {
        const result = await (await getPool()).request().query('SELECT * FROM Bed ORDER BY BedID');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, async () => {
    console.log('\n🏥 Lakeridge Health Hospital Server');
    console.log('====================================');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Static files from: ${__dirname}\n`);
    
    const connected = await connectDB();
    
    if (connected) {
        console.log('\n✅ Server is ready! Open http://localhost:3000 in your browser.\n');
    } else {
        console.log('\n⚠️  Server running but database not connected.');
        console.log('   The website will work but data won\'t be saved to the database.\n');
    }
});

// Export for Vercel serverless
module.exports = app;
