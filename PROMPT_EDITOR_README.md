# System Prompts Editor

This document describes the newly implemented System Prompts Editor functionality for admin users.

## Features

### Admin Access Control
- Only users with admin role and `prompt` permissions can access the system prompts functionality
- Permission-based navigation in the sidebar
- Protected routes with proper authentication checks

### Data Table Listing Page
- **Location**: `/dashboard/prompts`
- **Features**:
  - Paginated table with sortable columns
  - Search functionality by prompt name
  - Action buttons for edit and delete operations
  - "Create New Prompt" button in the action bar
  - Select/bulk actions support

### Create/Edit Prompt Page
- **Locations**: 
  - Create: `/dashboard/prompts/new`
  - Edit: `/dashboard/prompts/[id]`
- **Features**:
  - Form with name, description, and prompt content fields
  - Tabbed interface with Editor and Preview modes
  - Rich text editor integration (simplified textarea for now)
  - Real-time preview of prompt content
  - Form validation with error messages
  - Cancel and save functionality

## Database Schema

The `systemPrompts` table is already defined in `src/db/schema.ts`:

```sql
systemPrompts {
  id: serial PRIMARY KEY
  name: text NOT NULL UNIQUE
  description: text
  prompt: text NOT NULL
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp
}
```

## File Structure

```
src/app/dashboard/prompts/
├── page.tsx                    # Main listing page
├── actions.ts                  # Server actions for CRUD operations
├── queries.ts                  # Database queries
├── prompt-table.tsx           # Data table component
├── prompt-table-columns.tsx   # Table column definitions
├── new/
│   └── page.tsx               # Create new prompt page
└── [id]/
    ├── page.tsx               # Prompt detail/edit page
    └── prompt-form.tsx        # Form component
```

## API Actions

### `createPrompt(data: PromptFormData)`
Creates a new system prompt with proper validation and admin permission checks.

### `updatePrompt(id: number, data: PromptFormData)`
Updates an existing system prompt.

### `deletePrompt(id: number)`
Deletes a system prompt (button exists but functionality needs to be connected).

## Navigation

The prompt editor is accessible through the sidebar navigation under "System Prompts" for admin users only.

## Future Enhancements

1. **Rich Text Editor**: Replace the simple textarea with the full Plate editor implementation
2. **Markdown Support**: Add proper markdown rendering in the preview
3. **Prompt Categories**: Add categorization for better organization
4. **Prompt Templates**: Pre-defined templates for common use cases
5. **Version History**: Track changes to prompts over time
6. **Bulk Operations**: Import/export functionality for prompts
7. **Search & Filtering**: Advanced search with filters by category, date, etc.

## Technical Notes

- Uses React Hook Form for form management
- Zod for validation schema
- Server actions for mutations
- shadcn/ui components for consistent styling
- Proper error handling and toast notifications
- Permission-based access control integrated with the existing auth system 