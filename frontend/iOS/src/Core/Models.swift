import Foundation

// MARK: - User
struct User: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let role: Role
    let avatar: String?
    let lastLoginAt: Date?
}

// MARK: - Patient
struct Patient: Codable, Identifiable {
    let id: String
    let mrn: String
    let name: String
    let dateOfBirth: Date
    let gender: Gender
    let phone: String
    let email: String
    let address: String
    let emergencyContact: Contact
    let primaryCareDoctor: String?
    let allergies: [String]
    let medications: [Medication]
    let chronicConditions: [String]
    let lastVisit: Date
    let nextAppointment: Date?
}

struct Contact: Codable {
    let name: String
    let relationship: String
    let phone: String
    let email: String?
}

struct Medication: Codable {
    let name: String
    let dosage: String
    let frequency: String
    let startDate: Date
    let endDate: Date?
    let prescribedBy: String?
    let notes: String?
}

// MARK: - Doctor
struct Doctor: Codable, Identifiable {
    let id: String
    let npi: String
    let name: String
    let specialty: String
    let qualification: [String]
    let contactInfo: Contact
    let hospitalAffiliation: [String]
    let schedule: DoctorSchedule
    let ratings: [DoctorRating]
}

struct DoctorSchedule: Codable {
    let monday: [TimeSlot]
    let tuesday: [TimeSlot]
    let wednesday: [TimeSlot]
    let thursday: [TimeSlot]
    let friday: [TimeSlot]
    let saturday: [TimeSlot]
    let sunday: [TimeSlot]
}

struct TimeSlot: Codable {
    let start: String  // "09:00"
    let end: String    // "17:00"
}

struct DoctorRating: Codable {
    let patientId: String
    let patientName: String
    let rating: Int
    let comment: String
    let date: Date
}

// MARK: - Department
struct Department: Codable, Identifiable {
    let id: String
    let name: String
    let code: String
    let description: String
    let location: String
    let phone: String
    let email: String
    let headDoctor: String
    let capacity: Int
    let currentOccupancy: Int
    let services: [String]
}

// MARK: - Appointment
import Foundation

enum AppointmentStatus: String, Codable, CaseIterable {
    case scheduled = "scheduled"
    case checkedIn = "checked_in"
    case inProgress = "in_progress"
    case completed = "completed"
    case cancelled = "cancelled"
    case noShow = "no_show"
    case rescheduled = "rescheduled"
}

enum AppointmentType: String, Codable, CaseIterable {
    case initial = "initial"
    case followUp = "follow_up"
    case emergency = "emergency"
    case procedure = "procedure"
    case consultation = "consultation"
}

struct Appointment: Codable, Identifiable {
    let id: String
    let patientId: String
    let patientName: String
    let doctorId: String
    let doctorName: String
    let departmentId: String
    let departmentName: String
    let scheduledDate: Date
    let scheduledTime: String
    let duration: Int // minutes
    let status: AppointmentStatus
    let type: AppointmentType
    let reason: String
    let notes: String?
    let checkInTime: Date?
    let checkOutTime: Date?
    let createdAt: Date
    let updatedAt: Date
}

// MARK: - Vitals
struct Vitals: Codable, Identifiable {
    let id: String
    let patientId: String
    let patientName: String
    let recordedBy: String
    let recordedAt: Date
    let temperature: Double // Celsius
    let heartRate: Int // bpm
    let bloodPressure: BloodPressure
    let respiratoryRate: Int // breaths per minute
    let oxygenSaturation: Double // SpO2
    let weight: Double // kg
    let height: Double // cm
    let bmi: Double
    let glucoseLevel: Double // mg/dL
    let notes: String?
}

struct BloodPressure: Codable {
    let systolic: Int
    let diastolic: Int
}

// MARK: - Prescription
enum PrescriptionStatus: String, Codable, CaseIterable {
    case active = "active"
    case completed = "completed"
    case expired = "expired"
    case cancelled = "cancelled"
    case onHold = "on_hold"
}

struct Prescription: Codable, Identifiable {
    let id: String
    let patientId: String
    let patientName: String
    let doctorId: String
    let doctorName: String
    let medication: Medication
    let quantity: Int
    let refills: Int
    let expirationDate: Date
    let status: PrescriptionStatus
    let filledAt: Date?
    let filledBy: String?
    let notes: String?
}

// MARK: - Lab Order and Results
enum LabOrderStatus: String, Codable, CaseIterable {
    case ordered = "ordered"
    case sampleCollected = "sample_collected"
    case inProgress = "in_progress"
    case completed = "completed"
    case cancelled = "cancelled"
}

struct LabOrder: Codable, Identifiable {
    let id: String
    let patientId: String
    let patientName: String
    let orderedBy: String
    let orderedAt: Date
    let lab: String
    let tests: [LabTest]
    let status: LabOrderStatus
    let sampleCollectedAt: Date?
    let resultReadyAt: Date?
    let results: [LabResult]?
    let notes: String?
}

struct LabTest: Codable {
    let name: String
    let code: String
    let description: String?
}

struct LabResult: Codable {
    let testId: String
    let testName: String
    let value: String
    let unit: String
    let referenceRange: ReferenceRange
    let isAbnormal: Bool
    let notes: String?
}

struct ReferenceRange: Codable {
    let low: Double
    let high: Double
}

// MARK: - Medicine
enum MedicineForm: String, Codable, CaseIterable {
    case tablet = "tablet"
    case capsule = "capsule"
    case liquid = "liquid"
    case inhaler = "inhaler"
    case cream = "cream"
    case injection = "injection"
    case ointment = "ointment"
    case other = "other"
}

enum MedicineStatus: String, Codable, CaseIterable {
    case inStock = "in_stock"
    case lowStock = "low_stock"
    case outOfStock = "out_of_stock"
    case discontinued = "discontinued"
    case expiringSoon = "expiring_soon"
}

struct Medicine: Codable, Identifiable {
    let id: String
    let name: String
    let genericName: String
    let brand: String
    let dosage: String
    let form: MedicineForm
    let quantity: Int
    let unitPrice: Double
    let manufacturer: String
    let expirationDate: Date
    let lotNumber: String
    let status: MedicineStatus
    let storage: StorageLocation
    let reorderLevel: Int
}

struct StorageLocation: Codable {
    let cabinet: String
    let shelf: String
    let bin: String
    let temperature: TemperatureType
}

enum TemperatureType: String, Codable, CaseIterable {
    case room = "room"
    case refrigerated = "refrigerated"
    case frozen = "frozen"
}

// MARK: - Audit and Notification
struct AuditLog: Codable, Identifiable {
    let id: String
    let userId: String
    let userName: String
    let action: String
    let entity: String
    let entityId: String
    let timestamp: Date
    let details: String
    let ipAddress: String
}

enum NotificationType: String, Codable, CaseIterable {
    case appointment = "appointment"
    case vitals = "vitals"
    case prescription = "prescription"
    case labResult = "lab_result"
    case system = "system"
    case announcement = "announcement"
}

enum NotificationPriority: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case urgent = "urgent"
}

struct Notification: Codable, Identifiable {
    let id: String
    let userId: String
    let title: String
    let message: String
    let type: NotificationType
    let priority: NotificationPriority
    let isRead: Bool
    let createdAt: Date
    let actionUrl: String?
}

// MARK: - Role
import Foundation

enum Role: String, Codable, CaseIterable {
    case admin = "admin"
    case doctor = "doctor"
    case frontDesk = "front_desk"
    case nurse = "nurse"
    case pharmacy = "pharmacy"
    case laboratory = "laboratory"
}

enum Gender: String, Codable, CaseIterable {
    case male = "male"
    case female = "female"
    case other = "other"
    case preferNotToSay = "prefer-not-to-say"
}

// MARK: - RBAC
import Foundation

struct RBAC {
    static func canAccess(route: String, userRole: Role) -> Bool {
        let allowedRoles: [Role]
        
        switch route {
        case "/admin", "/admin/*":
            allowedRoles = [.admin]
        case "/doctor", "/doctor/*":
            allowedRoles = [.doctor, .admin]
        case "/frontdesk", "/frontdesk/*":
            allowedRoles = [.frontDesk, .admin]
        case "/nurse", "/nurse/*":
            allowedRoles = [.nurse, .admin]
        case "/pharmacy", "/pharmacy/*":
            allowedRoles = [.pharmacy, .admin]
        case "/lab", "/lab/*":
            allowedRoles = [.laboratory, .admin]
        default:
            allowedRoles = []
        }
        
        if userRole == .admin {
            return true
        }
        
        return allowedRoles.contains(userRole)
    }
    
    static func getDefaultRoute(for role: Role) -> String {
        switch role {
        case .admin:
            return "/admin"
        case .doctor:
            return "/doctor"
        case .frontDesk:
            return "/frontdesk"
        case .nurse:
            return "/nurse"
        case .pharmacy:
            return "/pharmacy"
        case .laboratory:
            return "/lab"
        }
    }
}