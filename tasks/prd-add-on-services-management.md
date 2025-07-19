# Product Requirements Document: Add-On Services Management System

## Introduction/Overview

Sistem Add-On Services Management membolehkan admin menguruskan perkhidmatan tambahan yang boleh dipilih oleh client, serta menguruskan permintaan add-on services dari client. Sistem ini akan mengintegrasikan dengan existing client portal dan memberikan admin kawalan penuh ke atas perkhidmatan tambahan.

## Goals

1. **Admin boleh menguruskan add-on services** - CRUD operations untuk services dengan kategori, harga, dan status
2. **Admin boleh view dan manage client requests** - Lihat, approve, reject, dan track status permintaan
3. **Client boleh request add-on services** - Interface yang user-friendly untuk memilih dan request services
4. **Notification system** - Client dapat notification bila request di-approve/reject
5. **Reporting dan analytics** - Admin boleh generate reports dan view analytics

## User Stories

### Admin Stories:
- **As an admin**, I want to create, edit, and delete add-on services so that I can manage available services
- **As an admin**, I want to set prices and categories for services so that clients can understand what they're purchasing
- **As an admin**, I want to view all client requests for add-on services so that I can manage them efficiently
- **As an admin**, I want to approve or reject client requests so that I can control service delivery
- **As an admin**, I want to view request history and analytics so that I can track business performance
- **As an admin**, I want to export request data so that I can generate reports

### Client Stories:
- **As a client**, I want to browse available add-on services so that I can enhance my package
- **As a client**, I want to request add-on services so that I can get additional features
- **As a client**, I want to view the status of my requests so that I know when services will be delivered
- **As a client**, I want to receive notifications when my request is approved/rejected so that I stay informed

## Functional Requirements

### 1. Add-On Services Management
1. **Create Service**: Admin boleh create add-on service dengan fields:
   - Name (required)
   - Description (required)
   - Category (required) - Support, Analytics, Domain, Integration, Mobile, Security
   - Price (required) - dalam RM
   - Status (required) - Available/Unavailable
   - Features list (optional)

2. **Edit Service**: Admin boleh edit semua fields service yang sedia ada

3. **Delete Service**: Admin boleh delete service (dengan confirmation)

4. **View Services**: Admin boleh view semua services dalam table dengan:
   - Search functionality
   - Filter by category
   - Filter by status
   - Sort by name, price, category

### 2. Client Requests Management
1. **View Requests**: Admin boleh view semua client requests dengan:
   - Client name dan email
   - Requested services
   - Request date
   - Status (Pending, Approved, Rejected, Completed)
   - Total amount

2. **Manage Requests**: Admin boleh:
   - Approve request
   - Reject request dengan reason
   - Mark as completed
   - Add notes/comments

3. **Request History**: Admin boleh view request history dengan:
   - Filter by date range
   - Filter by status
   - Filter by client
   - Export to CSV/Excel

### 3. Client Portal Integration
1. **Browse Services**: Client boleh browse available services dalam modal
2. **Request Services**: Client boleh select multiple services dan submit request
3. **View Status**: Client boleh view status request mereka
4. **Notifications**: Client dapat notification bila request di-approve/reject

### 4. Notification System
1. **Email Notifications**: Client dapat email bila request di-approve/reject
2. **In-App Notifications**: Client dapat notification dalam portal
3. **Admin Notifications**: Admin dapat notification bila ada request baru

### 5. Reporting & Analytics
1. **Request Analytics**: 
   - Total requests per month
   - Most requested services
   - Approval rate
   - Revenue from add-on services

2. **Export Functionality**:
   - Export requests to CSV/Excel
   - Export analytics reports
   - Custom date range exports

## Non-Goals (Out of Scope)

1. **Payment Processing**: Payment untuk add-on services tidak termasuk dalam scope ini
2. **Service Delivery**: Actual delivery/service provision tidak termasuk
3. **Client Billing Integration**: Integration dengan billing system tidak termasuk
4. **Multi-language Support**: Hanya Bahasa Melayu dan English sahaja

## Design Considerations

1. **UI/UX**: 
   - Consistent dengan existing design system
   - Responsive design untuk mobile dan desktop
   - Intuitive navigation dan workflows

2. **Modal Integration**: Update existing Add-On Service modal dalam client portal
3. **Sidebar Menu**: Tambah menu "Add-On Services" dalam admin sidebar
4. **Table Design**: Consistent dengan existing table designs dalam system

## Technical Considerations

1. **Database Tables**:
   - `add_on_services` - untuk store service details
   - `client_service_requests` - untuk store client requests
   - `service_request_status` - untuk track status changes

2. **API Endpoints**:
   - CRUD endpoints untuk add-on services
   - CRUD endpoints untuk client requests
   - Analytics endpoints untuk reporting

3. **Integration**:
   - Integrate dengan existing client portal
   - Integrate dengan existing notification system
   - Integrate dengan existing user management

## Success Metrics

1. **Admin Efficiency**: 
   - Time to manage requests berkurang 50%
   - Number of requests processed per day meningkat

2. **Client Satisfaction**:
   - Client request completion rate > 90%
   - Average response time < 24 hours

3. **Business Impact**:
   - Revenue dari add-on services meningkat
   - Number of add-on service requests meningkat

## Open Questions

1. **Approval Workflow**: Adakah perlu multi-level approval atau single admin approval?
2. **Pricing Strategy**: Adakah harga boleh berubah atau fixed?
3. **Service Categories**: Adakah kategori yang sedia ada mencukupi atau perlu tambah?
4. **Notification Frequency**: Berapa kerap admin perlu dapat notification untuk request baru?

## Implementation Priority

### Phase 1 (High Priority)
1. Database schema creation
2. Add-On Services CRUD functionality
3. Client request submission
4. Basic admin request management

### Phase 2 (Medium Priority)
1. Notification system
2. Request history dan analytics
3. Export functionality
4. Advanced filtering dan search

### Phase 3 (Low Priority)
1. Advanced analytics dashboard
2. Multi-level approval workflow
3. Integration dengan billing system
4. Mobile app support 