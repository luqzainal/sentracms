# PRD: Critical Bug Fixes untuk Sentra CMS

## Introduction/Overview

Dokumen ini menggariskan keperluan untuk menyelesaikan 7 masalah kritikal yang telah dikenal pasti dalam sistem Sentra CMS. Masalah-masalah ini mempengaruhi operasi harian dan perlu diselesaikan dengan segera untuk memastikan sistem berfungsi dengan betul.

Sistem Sentra CMS mempunyai 4 jenis pengguna: Superadmin, Team, Client Team, dan Client Staff. Masalah-masalah semasa telah menganggu workflow dan pengalaman pengguna untuk semua jenis pengguna ini.

## Goals

1. **Memastikan data integriti** - Semua data yang dimasukkan oleh pengguna mesti disimpan dan dipaparkan dengan betul
2. **Meningkatkan pengalaman pengguna** - Menghapuskan masalah yang menganggu workflow harian
3. **Memastikan sistem yang stabil** - Mengurangkan bugs dan unexpected behavior
4. **Meningkatkan kebolehpercayaan** - Pengguna boleh bergantung kepada sistem untuk operasi kritikal

## User Stories

### Story 1: Invoice Payment Tracking
**Sebagai** admin/team member  
**Saya mahu** invoice "Paid" amount automatically dikira berdasarkan payments yang telah dibuat  
**Supaya** saya tidak perlu manual calculate dan boleh track payment status dengan tepat

### Story 2: Client Data Consistency  
**Sebagai** admin/team member  
**Saya mahu** client data yang telah dikemaskini dipaparkan secara real-time di semua pages  
**Supaya** saya sentiasa mendapat maklumat client yang terkini

### Story 3: Event Data Persistence
**Sebagai** admin/team member  
**Saya mahu** event data kekal terpelihara walaupun saya klik pada calendar events  
**Supaya** data yang telah saya masukkan tidak hilang dan workflow tidak terganggu

### Story 4: File Upload untuk Comments
**Sebagai** pengguna sistem  
**Saya mahu** boleh upload file attachment (gambar/PDF) dalam comments  
**Supaya** saya boleh berkongsi dokumen dan visual materials dengan mudah

### Story 5: Invoice Duplication Prevention
**Sebagai** admin/team member  
**Saya mahu** sistem prevent duplicate invoice creation  
**Supaya** saya tidak accidentally create multiple invoices untuk client yang sama

### Story 6: Client Account Access
**Sebagai** admin  
**Saya mahu** client accounts yang telah saya register boleh login dengan credentials yang telah ditetapkan  
**Supaya** clients boleh access system dan collaborate dengan team

### Story 7: Event Information Display
**Sebagai** pengguna sistem  
**Saya mahu** bila klik event di calendar, system paparkan popup dengan maklumat lengkap event  
**Supaya** saya boleh lihat details tanpa perlu navigate ke page lain

## Functional Requirements

### 1. Invoice Payment Auto-Calculation
1.1. Sistem mesti automatically calculate "Paid" amount berdasarkan semua payments yang telah direcord untuk invoice tersebut  
1.2. Bila user add payment baru, "Paid" amount mesti update secara real-time  
1.3. "Due" amount mesti dikira sebagai (Total - Paid)  
1.4. Calculation mesti accurate dan reflect latest payment data

### 2. Client Data Real-Time Synchronization
2.1. Bila client data dikemaskini di mana-mana page, semua pages yang menunjukkan client data mesti update secara real-time  
2.2. Client list page mesti menunjukkan data yang terkini  
2.3. Client profile page mesti sync dengan client list  
2.4. Update mesti berlaku tanpa perlu refresh page

### 3. Event Data Persistence Fix
3.1. Event data mesti kekal terpelihara bila user klik event di calendar  
3.2. System mesti tidak clear atau reset client data bila event actions dilakukan  
3.3. Event details mesti dipaparkan dengan betul tanpa mempengaruhi data lain  
3.4. Data persistence mesti diuji untuk semua jenis event operations

### 4. File Upload untuk Comments
4.1. System mesti support file upload dalam comment section  
4.2. File types yang disupport: JPG, PNG, PDF  
4.3. Maximum file size: 5MB  
4.4. Files mesti disimpan dalam DigitalOcean Spaces  
4.5. System mesti show preview untuk images dan download link untuk PDFs  
4.6. Upload progress indicator mesti dipaparkan  
4.7. Error handling untuk file upload failures

### 5. Invoice Duplication Prevention
5.1. System mesti detect potential duplicate invoices berdasarkan client dan invoice title  
5.2. Warning message mesti dipaparkan bila user cuba create duplicate invoice  
5.3. User mesti diberi option untuk proceed atau cancel invoice creation  
5.4. System mesti maintain invoice uniqueness per client

### 6. Client Account Registration & Login
6.1. Admin mesti boleh register client accounts dengan credentials yang ditetapkan  
6.2. Client accounts mesti boleh login dengan credentials yang diberikan admin  
6.3. Password authentication mesti berfungsi dengan betul  
6.4. System mesti handle client login session management  
6.5. Error messages mesti specific dan helpful (bukan generic "invalid credentials")

### 7. Event Popup Information Display
7.1. Bila user klik event di calendar, popup mesti muncul dengan maklumat lengkap event  
7.2. Popup mesti menunjukkan: event title, date, time, description, dan semua maklumat yang user masukkan  
7.3. Popup mesti responsive dan user-friendly  
7.4. Popup mesti boleh di-close tanpa mempengaruhi data lain

## Non-Goals (Out of Scope)

- Mobile UI improvements (akan difokuskan dalam PRD berasingan)
- New feature additions
- Design overhaul
- Performance optimization (kecuali yang berkaitan dengan bug fixes)
- Third-party integrations baru
- Reporting enhancements

## Design Considerations

- Maintain existing UI/UX patterns dan consistency
- Ensure responsive design untuk desktop dan tablet
- Follow existing color scheme dan typography
- Popup designs mesti consistent dengan current modal patterns
- File upload component mesti user-friendly dengan drag-and-drop capability
- Error messages mesti clear dan actionable

## Technical Considerations

- Integrate dengan existing DigitalOcean Spaces untuk file storage
- Maintain compatibility dengan current Supabase database structure
- Ensure real-time updates menggunakan existing WebSocket/polling mechanisms
- File upload mesti handle large files efficiently
- Database queries mesti optimized untuk prevent performance issues
- Implement proper error handling dan logging
- Maintain data integrity dengan proper transaction handling

## Success Metrics

1. **Invoice Payment Accuracy**: 100% accuracy dalam paid amount calculation
2. **Data Consistency**: Zero instances of outdated client data being displayed
3. **Event Data Retention**: 100% event data preservation selepas calendar interactions
4. **File Upload Success Rate**: 95% success rate untuk file uploads below 5MB
5. **Invoice Duplication**: Zero unintended duplicate invoices created
6. **Client Login Success**: 100% success rate untuk valid client credentials
7. **Event Information Display**: 100% popup functionality untuk calendar events

## Open Questions

1. Adakah perlu implement audit trail untuk track bila data changes berlaku?
2. Adakah perlu backup/restore functionality untuk event data yang mungkin hilang?
3. Adakah perlu implement file versioning untuk uploaded attachments?
4. Adakah perlu set up monitoring alerts untuk bila bugs ini berlaku lagi?
5. Adakah perlu implement user notification bila file upload fails?

## Implementation Priority

**Phase 1 (Highest Priority)**:
- Event data persistence fix
- Client account login issues
- Invoice payment auto-calculation

**Phase 2 (High Priority)**:
- Client data synchronization
- Invoice duplication prevention

**Phase 3 (Medium Priority)**:
- File upload untuk comments
- Event popup information display

---

**Target Completion**: Immediate (semua phases perlu completed secepat mungkin)
**Stakeholders**: Development team, Superadmin, Team members, Client Team, Client Staff
**Dependencies**: DigitalOcean Spaces access, Supabase database access 