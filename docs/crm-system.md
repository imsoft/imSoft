# CRM System Documentation

## Overview

The CRM (Customer Relationship Management) system is a comprehensive admin-only module designed to help manage contacts, deals, and sales activities. This system provides complete CRUD operations for managing customer relationships and tracking the sales pipeline.

## Features

### 1. Dashboard
- **Real-time Statistics**: Total contacts, pipeline value, monthly revenue, won deals
- **Recent Activities**: View the latest interactions logged in the system
- **Recent Deals**: Quick overview of the newest opportunities
- **Quick Navigation**: Fast access to contacts, deals, and activities

### 2. Contacts Management
Complete contact lifecycle management with:
- **Contact Types**: Lead, Prospect, Customer, Partner
- **Contact Status**: Active, Inactive, Lost
- **Detailed Information**:
  - Basic info (name, email, phone, company, job title)
  - Address (street, city, state, country, postal code)
  - Online presence (LinkedIn, website)
  - Custom notes
  - Source tracking

### 3. Deals/Opportunities
Full sales pipeline management:
- **Deal Stages**: Qualification → Proposal → Negotiation → Closed Won/Lost
- **Deal Information**:
  - Title and description
  - Associated contact and service
  - Deal value (MXN currency)
  - Win probability (0-100%)
  - Expected close date
  - Actual close date (for closed deals)
  - Lost reason (for lost deals)
- **Pipeline Tracking**: View all active deals and their stages

### 4. Activities
Track all interactions and tasks:
- **Activity Types**:
  - Call
  - Email
  - Meeting
  - Note
  - Task
- **Activity Details**:
  - Subject and description
  - Related contact and/or deal
  - Status (completed, scheduled, cancelled)
  - Scheduled/completed date and time
  - Duration (in minutes)
  - Outcome (successful, unsuccessful, no answer, rescheduled)
  - Next action items

## Database Schema

### Tables

#### contacts
```sql
- id: UUID (Primary Key)
- first_name: VARCHAR(255) NOT NULL
- last_name: VARCHAR(255) NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL
- phone: VARCHAR(50)
- company: VARCHAR(255)
- job_title: VARCHAR(255)
- contact_type: VARCHAR(50) [lead, prospect, customer, partner]
- status: VARCHAR(50) [active, inactive, lost]
- source: VARCHAR(100)
- tags: TEXT[]
- address_street: VARCHAR(255)
- address_city: VARCHAR(100)
- address_state: VARCHAR(100)
- address_country: VARCHAR(100)
- address_postal_code: VARCHAR(20)
- linkedin_url: VARCHAR(500)
- website_url: VARCHAR(500)
- notes: TEXT
- assigned_to: UUID (FK → auth.users)
- created_by: UUID (FK → auth.users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### deals
```sql
- id: UUID (Primary Key)
- contact_id: UUID (FK → contacts)
- service_id: UUID (FK → services)
- title: VARCHAR(255) NOT NULL
- description: TEXT
- value: DECIMAL(10, 2)
- currency: VARCHAR(3) [default: MXN]
- stage: VARCHAR(50) [qualification, proposal, negotiation, closed_won, closed_lost]
- probability: INTEGER (0-100)
- expected_close_date: DATE
- actual_close_date: DATE
- lost_reason: TEXT
- tags: TEXT[]
- assigned_to: UUID (FK → auth.users)
- created_by: UUID (FK → auth.users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### activities
```sql
- id: UUID (Primary Key)
- contact_id: UUID (FK → contacts)
- deal_id: UUID (FK → deals)
- activity_type: VARCHAR(50) [call, email, meeting, note, task]
- subject: VARCHAR(255) NOT NULL
- description: TEXT
- status: VARCHAR(50) [completed, scheduled, cancelled]
- scheduled_at: TIMESTAMPTZ
- completed_at: TIMESTAMPTZ
- duration_minutes: INTEGER
- outcome: VARCHAR(50) [successful, unsuccessful, no_answer, rescheduled]
- next_action: TEXT
- created_by: UUID (FK → auth.users)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### deal_stages
```sql
- id: UUID (Primary Key)
- name_es: VARCHAR(100)
- name_en: VARCHAR(100)
- slug: VARCHAR(100) UNIQUE
- color: VARCHAR(50)
- order_index: INTEGER
- is_closed: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### contact_custom_fields
```sql
- id: UUID (Primary Key)
- contact_id: UUID (FK → contacts)
- field_name: VARCHAR(100)
- field_value: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Indexes
All tables include optimized indexes for:
- Foreign keys
- Frequently queried fields (email, company, stage, type, status)
- Dates (created_at, close dates)

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Admin-only access**: Only users with `role = 'admin'` can perform CRUD operations
- Automatic tracking of `created_by` field
- All tables include `updated_at` triggers

## Installation

### 1. Run SQL Migration
Execute the SQL script to create all CRM tables:

```bash
# Using Supabase CLI
supabase db push scripts/create-crm-system.sql

# Or via Supabase Dashboard:
# 1. Go to Database → SQL Editor
# 2. Copy contents of scripts/create-crm-system.sql
# 3. Run the query
```

### 2. Verify TypeScript Types
The TypeScript interfaces are already added to `src/types/database.ts`:
- Contact
- Deal
- Activity
- DealStageConfig
- ContactCustomField
- Plus enums for ContactType, ContactStatus, DealStage, ActivityType, ActivityStatus, ActivityOutcome

### 3. Access the CRM
After migration, admin users can access the CRM at:
```
/{lang}/dashboard/admin/crm
```

## File Structure

```
src/app/[lang]/dashboard/admin/crm/
├── page.tsx                          # Main CRM dashboard
├── contacts/
│   ├── page.tsx                      # Contacts list
│   ├── contacts-table.tsx            # Contacts table component
│   ├── contact-form.tsx              # Contact create/edit form
│   └── new/
│       └── page.tsx                  # New contact page
├── deals/
│   ├── page.tsx                      # Deals list
│   ├── deals-table.tsx               # Deals table component
│   ├── deal-form.tsx                 # Deal create/edit form
│   └── new/
│       └── page.tsx                  # New deal page
└── activities/
    ├── page.tsx                      # Activities list
    ├── activities-table.tsx          # Activities table component
    ├── activity-form.tsx             # Activity create/edit form
    └── new/
        └── page.tsx                  # New activity page
```

## Usage Examples

### Creating a New Contact

1. Navigate to `/es/dashboard/admin/crm/contacts`
2. Click "Nuevo Contacto" button
3. Fill in the contact information:
   - Basic info: name, email, phone
   - Classification: type (lead/prospect/customer/partner), status, source
   - Address details (optional)
   - LinkedIn and website URLs (optional)
   - Additional notes
4. Click "Guardar Contacto"

### Creating a Deal

1. Navigate to `/es/dashboard/admin/crm/deals`
2. Click "Nuevo Negocio" button
3. Fill in deal information:
   - Deal name and description
   - Select associated contact (required)
   - Select service (optional)
   - Enter deal value in MXN
   - Set win probability (0-100%)
   - Select current stage
   - Set expected close date
4. Click "Guardar Negocio"

### Logging an Activity

1. Navigate to `/es/dashboard/admin/crm/activities`
2. Click "Nueva Actividad" button
3. Choose activity type and status
4. Enter subject and description
5. Link to contact and/or deal (optional)
6. Set time information:
   - Scheduled date/time (for future activities)
   - Completed date/time (for past activities)
   - Duration in minutes
7. Select outcome and add next action notes
8. Click "Guardar Actividad"

## Dashboard Metrics

The main CRM dashboard displays:

1. **Total Contacts**: Count of all contacts in the system with active leads count
2. **Pipeline Value**: Sum of all open deals (excluding closed won/lost)
3. **Monthly Revenue**: Sum of deals closed won in the current month
4. **Won Deals**: Total number of deals marked as closed won

## Bilingual Support

All CRM pages support both Spanish (es) and English (en):
- UI labels automatically switch based on route language
- Database fields include `_es` and `_en` variants where applicable
- Date/time formatting adapts to locale

## Features by Role

### Admin Users
- Full access to all CRM features
- Can create, read, update, and delete:
  - Contacts
  - Deals
  - Activities
  - Deal stages
- Can view all contacts, deals, and activities across the organization
- Access to CRM dashboard and analytics

### Client Users
- No access to CRM system
- Redirected to client dashboard if attempting to access CRM routes

## Best Practices

### Contact Management
1. Always capture source information to track lead origins
2. Use tags for flexible categorization
3. Keep notes updated with latest interactions
4. Progress contacts through types: Lead → Prospect → Customer
5. Mark inactive contacts rather than deleting them

### Deal Management
1. Update deal stages promptly as they progress
2. Keep probability estimates realistic
3. Document lost reasons for future learning
4. Link deals to specific services for better reporting
5. Set realistic expected close dates

### Activity Tracking
1. Log all significant interactions immediately
2. Always add next action items for follow-up
3. Link activities to both contact and deal when possible
4. Use scheduled activities for upcoming tasks
5. Track duration for time management insights

## Future Enhancements

Potential features for future development:
- Email integration for automatic activity logging
- Calendar integration for meeting scheduling
- Reports and analytics dashboards
- Contact import/export functionality
- Deal pipeline Kanban view with drag-and-drop
- Automated email campaigns
- Contact scoring and lead qualification
- Deal forecast reports
- Activity reminders and notifications
- Custom fields management UI
- Mobile-responsive optimizations
- File attachments for contacts/deals/activities
- Team collaboration features
- Integration with quotation system

## Troubleshooting

### Common Issues

**Issue: Cannot see CRM menu option**
- Solution: Verify user has `role = 'admin'` in user_metadata

**Issue: RLS errors when accessing data**
- Solution: Check that RLS policies are correctly applied and user is authenticated

**Issue: Foreign key constraint errors**
- Solution: Ensure referenced records exist (e.g., contact must exist before creating deal)

**Issue: Date format errors**
- Solution: Use ISO 8601 format (YYYY-MM-DD) for date fields

## Support

For issues or questions about the CRM system:
1. Check this documentation first
2. Review SQL schema in `scripts/create-crm-system.sql`
3. Inspect TypeScript interfaces in `src/types/database.ts`
4. Check browser console for client-side errors
5. Review Supabase logs for database errors

## Conclusion

The CRM system provides a solid foundation for managing customer relationships and sales pipeline. It's designed to be intuitive, secure, and scalable while maintaining full bilingual support.
