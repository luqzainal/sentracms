## Relevant Files

- `src/components/Clients/ClientsPage.tsx` - Main client list component yang perlu sync data
- `src/components/Clients/ClientProfile.tsx` - Client profile page untuk data updates
- `src/components/Clients/AddInvoiceModal.tsx` - Invoice creation modal untuk duplication prevention
- `src/components/Clients/EditInvoiceModal.tsx` - Invoice editing dengan payment calculation
- `src/components/Calendar/CalendarPage.tsx` - Calendar component untuk event display dan persistence
- `src/components/Auth/Login.tsx` - Login component untuk client authentication
- `src/services/database.ts` - Database service untuk data operations
- `src/store/AppStore.ts` - State management untuk real-time updates
- `api/generate-upload-url.mjs` - File upload API untuk comment attachments
- `src/components/common/FileUpload.tsx` - File upload component (to be created)
- `src/components/common/EventPopup.tsx` - Event popup modal (to be created)

### Notes

- Gunakan existing Supabase database structure dan DigitalOcean Spaces integration
- Ensure real-time updates menggunakan state management yang sedia ada
- File uploads perlu integrate dengan existing API structure
- Testing akan focus pada critical path untuk setiap bug fix

## Tasks

- [x] 1.0 Invoice Management System Fixes
  - [x] 1.1 Implement auto-calculation untuk paid amount dalam invoice
  - [x] 1.2 Update invoice display untuk show calculated paid amount secara real-time
  - [x] 1.3 Fix due amount calculation (Total - Paid)
  - [x] 1.4 Implement duplicate invoice detection berdasarkan client + invoice title
  - [x] 1.5 Add warning dialog untuk potential duplicate invoices
  - [x] 1.6 Update AddInvoiceModal dengan duplicate prevention logic
  - [x] 1.7 Update EditInvoiceModal dengan payment amount recalculation
  - [x] 1.8 Fix duplicate invoice creation bug (removed setTimeout refresh and auto-creation features)
  - [x] 1.9 Add loading states to prevent double submission in modal forms
  - [x] 1.10 Fix payment amount calculation errors (string/number conversion)
  - [x] 1.11 Implement data corruption fix with recalculation function

- [ ] 2.0 Client Data Management & Authentication
  - [x] 2.1 Identify dan fix client data synchronization issues
  - [x] 2.2 Implement real-time client data updates di ClientsPage
  - [x] 2.3 Fix client data persistence di ClientProfile
  - [x] 2.4 Debug client login authentication issues
    - [x] Fixed authentication logic inconsistency between SupabaseContext and usersService
    - [x] Added proper error handling with specific error messages
    - [x] Added user existence check before password validation
    - [x] Added account status validation
    - [x] Added comprehensive logging for debugging
    - [x] Added createTestUsers function for testing authentication
  - [x] 2.5 Fix client account registration dalam settings
    - [x] Added debug logging for user registration process
    - [x] Fixed password handling in AppStore.addUser function
    - [x] Ensured proper data mapping from UserModal to database
    - [x] Added comprehensive error handling for registration flow
  - [x] 2.6 Improve error messages untuk client login failures
    - [x] Added client-side validation for email and password fields
    - [x] Improved error messages with specific, actionable guidance
    - [x] Enhanced error display with better UI (icons, structured layout)
    - [x] Added role-specific error messages for different user types
    - [x] Added login tips section to help users
    - [x] Improved error messages for database connection issues
  - [x] 2.7 Test client session management dan persistence
    - [x] Analyzed current localStorage-based session storage mechanism
    - [x] Added session timestamp tracking for expiration management
    - [x] Implemented session validation and integrity checks
    - [x] Added 24-hour session timeout functionality
    - [x] Enhanced session restoration with proper error handling
    - [x] Added comprehensive session logging for debugging
    - [x] Created utility functions for session management
    - [x] Improved logout functionality to clear all session data

- [x] 3.0 Event System Fixes
  - [x] 3.1 Fix calendar event display persistence
    - [x] Connected calendar events to database using calendarService
    - [x] Updated AppStore to use database persistence for calendar events
    - [x] Made addCalendarEvent, updateCalendarEvent, deleteCalendarEvent async
    - [x] Added proper error handling for calendar operations
    - [x] Added fetchCalendarEvents on component mount and user authentication
  - [x] 3.2 Create EventPopup component untuk event information display
    - [x] Created new EventPopup component with better UI/UX
    - [x] Added comprehensive event information display
    - [x] Included start/end date and time display
    - [x] Added event type icons and color coding
    - [x] Implemented proper date and time formatting
    - [x] Added edit and delete functionality in popup
  - [x] 3.3 Fix calendar event data synchronization
    - [x] Updated CalendarPage to fetch events on mount
    - [x] Added calendar event fetching on user authentication
    - [x] Fixed event data mapping between database and UI
    - [x] Added proper async/await handling for event operations
  - [x] 3.4 Test calendar event CRUD operations
  - [x] 3.1 Debug event data loss issue bila klik calendar events
  - [x] 3.2 Fix event data persistence dalam CalendarPage
  - [x] 3.3 Implement EventPopup component untuk event details
  - [x] 3.4 Add event popup trigger pada calendar event clicks
  - [x] 3.5 Ensure event popup shows complete event information
  - [x] 3.6 Test event data retention selepas calendar interactions

- [x] 4.0 File Upload System Implementation
  - [x] 4.1 Create FileUpload component untuk comment attachments
  - [x] 4.2 Implement file validation (JPG, PNG, PDF, max 5MB)
  - [x] 4.3 Integrate FileUpload dengan DigitalOcean Spaces API
  - [x] 4.4 Add file upload progress indicators
  - [x] 4.5 Implement file preview untuk images
  - [x] 4.6 Add download functionality untuk PDF files
  - [x] 4.7 Handle file upload error cases dengan proper messaging
  - [x] 4.8 Integrate file upload dalam comment sections

- [ ] 5.0 Testing & Validation
  - [ ] 5.1 Test invoice payment calculation accuracy
  - [ ] 5.2 Test invoice duplicate prevention functionality
  - [ ] 5.3 Test client data real-time synchronization
  - [ ] 5.4 Test client authentication dan login flow
  - [ ] 5.5 Test event data persistence dan popup functionality
  - [ ] 5.6 Test file upload functionality dengan different file types
  - [ ] 5.7 Perform end-to-end testing untuk all user types
  - [ ] 5.8 Validate all fixes meet PRD requirements 