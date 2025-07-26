# Product Requirements Document: Admin Access Control & Chat Management Fixes

## Introduction/Overview

This PRD addresses three critical issues in the SentraCMS system:
1. **Admin Team Access Control**: Restrict admin team access to only assigned clients, with superadmin having full access
2. **Chat Disable/Enable Feature**: Allow admin to disable/enable client chat functionality
3. **Chat Naming Issues Fix**: Resolve incorrect name and role display in chat messages

These features will improve system security, provide better chat management capabilities, and fix critical user identification issues.

## Goals

1. Implement role-based access control for admin teams to only access assigned clients
2. Provide admin with ability to control client chat access on per-client basis
3. Fix chat display issues showing incorrect names and roles
4. Maintain superadmin's ability to access all clients and features
5. Ensure seamless user experience with proper access restrictions

## User Stories

### Access Control
- As a **superadmin**, I want to assign specific clients to admin team members so that access is controlled and organized
- As a **superadmin**, I want to access all clients and their data regardless of assignments
- As an **admin team member**, I want to only see and access clients assigned to me so that I can focus on my designated responsibilities
- As an **admin team member**, I want to be unable to access unassigned clients so that data security is maintained

### Chat Management
- As an **admin**, I want to disable a client's chat when needed so that communication can be controlled
- As an **admin**, I want to enable a client's chat when appropriate so that communication can resume
- As a **client**, I want to see my chat history even when chat is disabled so that I can review past conversations

### Chat Display Fix
- As a **user**, I want to see correct names in chat messages so that I know who sent each message
- As a **user**, I want to see correct roles displayed so that I understand each user's authority level

## Functional Requirements

### 1. Admin Team Access Control

1.1. **Client Assignment System**
   - Superadmin can assign/unassign clients to admin team members via client profile page
   - One client can be assigned to multiple admin team members
   - One admin team member can be assigned to multiple clients
   - Assignment changes take effect immediately

1.2. **Access Restrictions**
   - Admin team members can only access assigned clients in ALL features:
     - Client list page
     - Client profile/details
     - Chat with clients
     - Client billing/invoices
     - Client calendar/appointments
     - Client reports
     - Client progress tracking
   - Unassigned clients are completely hidden from admin team view
   - Superadmin maintains full access to all clients regardless of assignments

1.3. **Database Design**
   - Create `client_assignments` table with columns:
     - `id` (primary key)
     - `admin_id` (foreign key to users table)
     - `client_id` (foreign key to users table)
     - `assigned_date` (timestamp)
     - `assigned_by` (foreign key to users table - superadmin who made assignment)

### 2. Chat Disable/Enable Feature

2.1. **Admin Interface**
   - Add "Disable Chat"/"Enable Chat" button in admin chat window
   - Button positioned at top of chat window, next to refresh button
   - Button text changes based on current state:
     - Show "Disable Chat" when chat is enabled
     - Show "Enable Chat" when chat is disabled

2.2. **Functionality**
   - When chat disabled:
     - Client cannot send new messages
     - Client can still view chat history
     - Admin can still send messages to client
   - When chat enabled:
     - Normal chat functionality restored
   - Default state: New clients have chat enabled

2.3. **Database Changes**
   - Add `chat_enabled` column to clients/users table (boolean, default true)

### 3. Chat Naming Issues Fix

3.1. **Issue Investigation**
   - Investigate current chat display logic for names and roles
   - Identify root cause of incorrect name/role mappings
   - Verify database integrity for user names and roles

3.2. **Display Requirements**
   - Chat messages must show correct sender name
   - Chat messages must show correct sender role
   - Role display format: superadmin, admin team, client team, client admin
   - Ensure consistency across all chat interfaces

## Non-Goals (Out of Scope)

- Bulk client assignment interface (only individual assignment via client profile)
- Email notifications for assignment changes
- Audit logging for access control changes
- Chat message editing or deletion
- Real-time notifications for chat status changes
- Mobile app interface changes

## Design Considerations

- **Client Assignment UI**: Add assignment section in existing client profile modal/page
- **Chat Button**: Style consistently with existing chat interface buttons
- **Access Control**: Implement at API/service level to ensure security
- **User Feedback**: Provide clear visual indicators for chat status and assignment status

## Technical Considerations

- **Database Migration**: Required for new `client_assignments` table and `chat_enabled` column
- **Authentication Middleware**: Update to check client assignments for admin team access
- **Frontend Filtering**: Filter client lists based on user role and assignments
- **Chat Status Sync**: Ensure chat status updates are reflected in real-time
- **Role Verification**: Verify current role mapping logic and fix inconsistencies

## Success Metrics

1. **Security**: Zero unauthorized access to unassigned clients by admin team members
2. **Functionality**: 100% correct name and role display in chat messages
3. **Usability**: Chat enable/disable feature works reliably for all clients
4. **Performance**: No significant impact on page load times with access control
5. **Data Integrity**: All client assignments tracked accurately in database

## Open Questions

1. Should there be a notification system when admin disables client chat?
2. What happens to existing chat sessions when access is revoked?
3. Should there be a grace period for access revocation?
4. How should the system handle deleted or deactivated admin accounts with assignments?
5. Should clients be notified when their assigned admin changes?

## Implementation Priority

1. **Phase 1**: Fix chat naming issues (critical bug fix)
2. **Phase 2**: Implement admin access control system
3. **Phase 3**: Add chat disable/enable feature

## Database Schema Changes

```sql
-- New table for client assignments
CREATE TABLE client_assignments (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id),
    UNIQUE(admin_id, client_id)
);

-- Add chat enabled column to users table
ALTER TABLE users ADD COLUMN chat_enabled BOOLEAN DEFAULT true;
``` 