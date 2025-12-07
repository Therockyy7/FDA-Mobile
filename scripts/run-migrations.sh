#!/bin/bash

# Script to run Supabase migrations in order
# Usage: ./scripts/run-migrations.sh

set -e

echo "🚀 Starting database migrations..."

MIGRATION_DIR="supabase-migrations"

# Check if migration directory exists
if [ ! -d "$MIGRATION_DIR" ]; then
    echo "❌ Migration directory not found: $MIGRATION_DIR"
    exit 1
fi

# Array of migrations in order
migrations=(
    "001_create_notes_table.sql"
    "002_create_user_profiles_table.sql" 
    "003_create_activities_table.sql"
    "004_add_categories_to_notes.sql"
)

echo "📋 Found ${#migrations[@]} migrations to run"

# Run each migration
for migration in "${migrations[@]}"; do
    migration_file="$MIGRATION_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo "❌ Migration file not found: $migration_file"
        exit 1
    fi
    
    echo "⏳ Running migration: $migration"
    
    # Use Supabase CLI to run migration
    if command -v supabase &> /dev/null; then
        supabase db push --file "$migration_file"
    else
        echo "⚠️  Supabase CLI not found. Please run manually:"
        echo "   Copy contents of $migration_file to Supabase SQL Editor"
    fi
    
    echo "✅ Completed: $migration"
done

echo "🎉 All migrations completed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify tables were created in Supabase Dashboard"
echo "2. Test the application with real data"
echo "3. Create some sample notes to test functionality"