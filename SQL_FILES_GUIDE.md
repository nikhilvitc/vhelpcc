# SQL Files Guide for VHELPCC

This directory contains the essential SQL schema files for the VHELPCC platform. Here's what each file does:

## Core Schema Files

### 1. `vhelpcc-updated-complete-schema.sql`
**Primary database schema - USE THIS FIRST**

This is the main, comprehensive database schema that includes:
- ✅ User authentication and management
- ✅ Repair services (phone & laptop)
- ✅ Food delivery system (restaurants, orders, menu items)
- ✅ Lost & found functionality
- ✅ Multi-role support (customer, admin, restaurant_admin, delivery, vendor)
- ✅ Complete indexing and performance optimization
- ✅ Audit trails and triggers
- ✅ Sample data for testing
- ✅ Proper constraints and validations

**When to use:** This should be your first and primary schema file. Run this in Supabase SQL Editor to set up the complete platform.

### 2. `restaurant-schema.sql`
**Enhanced restaurant features - OPTIONAL**

This is a specialized schema that provides advanced restaurant management features:
- 🍽️ Enhanced restaurant management with detailed information
- 📋 Menu categorization system
- 📊 Advanced order tracking with status history
- ⭐ Customer review and rating system
- 🚚 Delivery zone management
- 🕒 Operating hours management
- 📈 Restaurant analytics support

**When to use:** Run this AFTER the main schema if you want enhanced restaurant features. This extends the basic food delivery functionality with advanced restaurant management capabilities.

## Utility Files

### 3. `add-restaurant-admin.sql`
**Restaurant admin setup helper**

A utility script to help you quickly add restaurant administrator users:
- 👤 Template for creating restaurant admin users
- 🔗 Links users to specific restaurants
- ✅ Includes verification queries
- 📝 Step-by-step instructions
- 🛠️ Troubleshooting queries

**When to use:** Use this template when you need to add new restaurant administrators to the system.

### 4. `supabase-role-update.sql`
**Role constraint updates**

Updates the user role constraints to include vendor roles:
- 🔧 Adds phone_vendor and laptop_vendor roles
- 🔄 Updates existing role constraints
- ✅ Includes verification queries

**When to use:** Run this if you need to add vendor roles to an existing database or if you're updating from an older schema version.

## Setup Instructions

### For New Installations:
1. **Start with the main schema:**
   ```sql
   -- Run this first in Supabase SQL Editor
   -- Copy and paste the entire content of:
   vhelpcc-updated-complete-schema.sql
   ```

2. **Optional - Add enhanced restaurant features:**
   ```sql
   -- Run this second if you want advanced restaurant features
   -- Copy and paste the entire content of:
   restaurant-schema.sql
   ```

3. **Add restaurant admins as needed:**
   ```sql
   -- Use this template to add restaurant administrators
   -- Follow the instructions in:
   add-restaurant-admin.sql
   ```

### For Existing Installations:
1. **Update role constraints if needed:**
   ```sql
   -- Run this to add vendor roles
   supabase-role-update.sql
   ```

2. **Add enhanced restaurant features:**
   ```sql
   -- Run this to add advanced restaurant management
   restaurant-schema.sql
   ```

## File Dependencies

```
vhelpcc-updated-complete-schema.sql (REQUIRED - Run first)
├── restaurant-schema.sql (OPTIONAL - Enhanced features)
├── add-restaurant-admin.sql (UTILITY - As needed)
└── supabase-role-update.sql (UTILITY - For updates)
```

## What Was Removed

The following files were removed during cleanup as they were redundant or outdated:
- ❌ `restaurant-admin-test-data.sql` (replaced by comprehensive sample data in main schema)
- ❌ Various `.md` documentation files (consolidated into README.md)
- ❌ CSV data files (converted to JSON in public folder)
- ❌ Separate food delivery project (integrated into main project)

## Support

If you encounter any issues with the SQL schemas:
1. Check the Supabase SQL Editor for error messages
2. Ensure you're running the files in the correct order
3. Verify your Supabase project has the necessary permissions
4. Check the README.md for additional setup instructions
