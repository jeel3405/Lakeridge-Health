SELECT 
    a.AppointmentID, 
    ph.FirstName AS PhysicianFirstName, 
    ph.LastName AS PhysicianLastName, 
    a.Date, 
    a.Time, 
    a.ReasonForVisit
FROM Appointments a
JOIN Physicians ph ON a.PhysicianID = ph.PhysicianID
WHERE a.PatientID = 1 
  AND a.Date >= GETDATE();

SELECT 
    RoomType, 
    COUNT(*) AS AvailableRooms
FROM Rooms
WHERE RoomsAvailable > 0
GROUP BY RoomType;

SELECT 
    b.BillingID, 
    p.FirstName, 
    p.LastName, 
    b.TotalAmount, 
    b.DueDate, 
    i.ProviderName
FROM Billing b
JOIN Patients p ON b.PatientID = p.PatientID
JOIN Insurance i ON p.InsuranceID = i.InsuranceID
WHERE b.PaymentStatus = 'Pending';

SELECT 
    ph.FirstName, 
    ph.LastName, 
    COUNT(a.AppointmentID) AS DailyAppointments,
    STRING_AGG(a.Time, ', ') WITHIN GROUP (ORDER BY a.Time) AS AppointmentTimes
FROM Physicians ph
LEFT JOIN Appointments a ON ph.PhysicianID = a.PhysicianID 
  AND CAST(a.Date AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY ph.PhysicianID, ph.FirstName, ph.LastName;

SELECT 
    r.RoomType, 
    COUNT(a.AdmissionID) AS OccupiedBeds, 
    r.Capacity AS TotalBeds
FROM Rooms r
LEFT JOIN Admissions a ON r.RoomID = a.RoomID
GROUP BY r.RoomType, r.Capacity;

SELECT 
    p.PatientID,
    p.FirstName,
    p.LastName,
    p.DOB,
    p.Address,
    p.Gender,
    i.ProviderName AS InsuranceProvider,
    i.PhoneNumber AS InsuranceContact
FROM Patients p
JOIN Insurance i ON p.InsuranceID = i.InsuranceID;

SELECT 
    a.AppointmentID,
    a.Date,
    a.Time,
    a.Status,
    ph.FirstName AS DoctorFirstName,
    ph.LastName AS DoctorLastName,
    ph.Specialization
FROM Appointments a
JOIN Physicians ph ON a.PhysicianID = ph.PhysicianID
WHERE a.PatientID = 1
ORDER BY a.Date DESC;

SELECT 
    a.Time,
    p.FirstName AS PatientFirstName,
    p.LastName AS PatientLastName,
    a.ReasonForVisit,
    a.Status
FROM Appointments a
JOIN Patients p ON a.PatientID = p.PatientID
WHERE a.PhysicianID = 1 
  AND CAST(a.Date AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY a.Time;

SELECT 
    ph.PhysicianID,
    ph.FirstName,
    ph.LastName,
    COUNT(a.AppointmentID) AS TotalAppointments,
    COUNT(DISTINCT a.PatientID) AS UniquePatients
FROM Physicians ph      
LEFT JOIN Appointments a ON ph.PhysicianID = a.PhysicianID
GROUP BY ph.PhysicianID, ph.FirstName, ph.LastName;

SELECT 
    r.RoomID,
    r.RoomType,
    r.Capacity,
    COUNT(b.BedID) AS OccupiedBeds,
    (r.Capacity - COUNT(b.PatientID)) AS AvailableBeds
FROM Rooms r
LEFT JOIN Bed b ON r.RoomID = b.RoomID 
  AND b.PatientID IS NOT NULL
GROUP BY r.RoomID, r.RoomType, r.Capacity;

SELECT 
    b.BedID,
    r.RoomType,
    b.BedNumber,
    p.FirstName AS PatientFirstName,
    p.LastName AS PatientLastName
FROM Bed b
LEFT JOIN Rooms r ON b.RoomID = r.RoomID
LEFT JOIN Patients p ON b.PatientID = p.PatientID;

SELECT 
    b.BillingID,
    p.FirstName,
    p.LastName,
    b.TotalAmount,
    b.InvoiceDate,
    b.DueDate,
    ISNULL(ic.ClaimAmount, 0) AS InsuranceClaim,
    (b.TotalAmount - ISNULL(ic.ClaimAmount, 0)) AS PatientResponsibility
FROM Billing b
JOIN Patients p ON b.PatientID = p.PatientID
LEFT JOIN InsuranceClaims ic ON b.InsuranceClaimID = ic.InsuranceClaimID
WHERE b.PaymentStatus = 'Pending';

SELECT 
    ic.InsuranceClaimID,
    p.FirstName,
    p.LastName,
    i.ProviderName,
    ic.ClaimAmount,
    ic.ClaimDate,
    ic.ApprovalDate,
    CASE 
        WHEN ic.ApprovalDate IS NULL THEN 'Pending'
        ELSE 'Approved'
    END AS ClaimStatus
FROM InsuranceClaims ic
JOIN Patients p ON ic.PatientID = p.PatientID
JOIN Insurance i ON ic.InsuranceID = i.InsuranceID;

SELECT 
    FORMAT(a.AdmissionDate, 'yyyy-MM') AS Month,
    COUNT(*) AS TotalAdmissions,
    COUNT(DISTINCT a.PatientID) AS UniquePatients,
    ROUND(AVG(CAST(a.InsuranceVerified AS FLOAT)) * 100, 2) AS InsuranceVerificationRate
FROM Admissions a
GROUP BY FORMAT(a.AdmissionDate, 'yyyy-MM')
ORDER BY Month DESC;

SELECT 
    pr.RecordID,
    p.FirstName,
    p.LastName,
    pr.VisitDate,
    pr.Treatment,
    pr.FollowUpDate,
    CASE 
        WHEN pr.FollowUpDate < GETDATE() THEN 'Overdue'
        WHEN CAST(pr.FollowUpDate AS DATE) = CAST(GETDATE() AS DATE) THEN 'Due Today'
        ELSE 'Upcoming'
    END AS FollowUpStatus
FROM PatientRecords pr
JOIN Patients p ON pr.PatientID = p.PatientID
ORDER BY pr.FollowUpDate;
