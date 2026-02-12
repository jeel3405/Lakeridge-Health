CREATE TABLE Insurance (
    InsuranceID INT PRIMARY KEY,
    ProviderName VARCHAR(100) NOT NULL,
    Province VARCHAR(50) NOT NULL,
    City VARCHAR(50) NOT NULL,
    PostalCode VARCHAR(10) NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    Email VARCHAR(100) NOT NULL
);

CREATE TABLE Patients (
    PatientID INT PRIMARY KEY,
    LastName VARCHAR(50) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    DOB DATE NOT NULL,
    Address VARCHAR(100) NOT NULL,
    Gender CHAR(1) NOT NULL,
    InsuranceID INT,
    FOREIGN KEY (InsuranceID) REFERENCES Insurance(InsuranceID)
);

CREATE TABLE Physicians (
    PhysicianID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Specialization VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY,
    RoomType VARCHAR(20) NOT NULL,
    Capacity INT NOT NULL,
    Occupancy INT NOT NULL,
    RoomsAvailable INT NOT NULL
);

CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY,
    PatientID INT,
    PhysicianID INT,
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Status VARCHAR(20) NOT NULL,
    ReasonForVisit VARCHAR(200),
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (PhysicianID) REFERENCES Physicians(PhysicianID)
);

CREATE TABLE Admissions (
    AdmissionID INT PRIMARY KEY,
    PatientID INT,
    RoomID INT,
    AdmissionDate DATE NOT NULL,
    InsuranceVerified TINYINT NOT NULL,
    TreatmentPlan VARCHAR(500),
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
);

CREATE TABLE PatientRecords (
    RecordID INT PRIMARY KEY,
    PatientID INT,
    VisitDate DATE NOT NULL,
    Treatment VARCHAR(500) NOT NULL,
    FollowUpDate DATE,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);

CREATE TABLE InsuranceClaims (
    InsuranceClaimID INT PRIMARY KEY,
    PatientID INT,
    InsuranceID INT,
    ClaimAmount DECIMAL(10,2) NOT NULL,
    ClaimDate DATE NOT NULL,
    ApprovalDate DATE,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (InsuranceID) REFERENCES Insurance(InsuranceID)
);

CREATE TABLE Billing (
    BillingID INT PRIMARY KEY,
    PatientID INT,
    TotalAmount DECIMAL(10,2) NOT NULL,
    InvoiceDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    InsuranceClaimID INT,
    PaymentStatus VARCHAR(20) NOT NULL,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID),
    FOREIGN KEY (InsuranceClaimID) REFERENCES InsuranceClaims(InsuranceClaimID)
);

CREATE TABLE Bed (
    BedID INT PRIMARY KEY,
    RoomID INT,
    BedNumber INT NOT NULL,
    PatientID INT,
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);
