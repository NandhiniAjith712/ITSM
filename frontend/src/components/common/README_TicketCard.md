# TicketCard Component - Centralized Ticket Template

## Overview
The `TicketCard` component is a centralized, global ticket template that ensures consistency across all dashboards (Admin, Manager, Agent, etc.). It provides a unified look and feel for all tickets regardless of where they're displayed.

## Features
- **Consistent Design**: Same visual appearance across all dashboards
- **Flexible Configuration**: Configurable sections and actions
- **Status-Based Styling**: Automatic styling based on ticket status
- **Built-in Actions**: Resolve, Escalate, Reopen buttons
- **Chat Integration**: Built-in TicketChat component
- **Reply System**: Integrated reply functionality
- **Media Support**: Image and PDF attachment handling
- **Responsive Design**: Mobile-friendly layout

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ticket` | Object | Required | Ticket data object |
| `userType` | String | 'agent' | Type of user (agent, manager, admin) |
| `onStatusChange` | Function | - | Callback for status changes |
| `onReplyAdded` | Function | - | Callback when reply is added |
| `showReplySection` | Boolean | true | Show/hide reply section |
| `showActions` | Boolean | true | Show/hide action buttons |
| `showChat` | Boolean | true | Show/hide chat icon |
| `customActions` | Function | null | Custom action buttons |

## Usage Examples

### Basic Usage
```jsx
import TicketCard from './TicketCard';

<TicketCard
  ticket={ticket}
  userType="agent"
  onStatusChange={handleStatusChange}
  onReplyAdded={handleReplyAdded}
/>
```

### Without Reply Section
```jsx
<TicketCard
  ticket={ticket}
  userType="manager"
  showReplySection={false}
  onStatusChange={handleStatusChange}
/>
```

### With Custom Actions
```jsx
<TicketCard
  ticket={ticket}
  userType="admin"
  customActions={(ticket) => (
    <>
      <button onClick={() => handleCustomAction(ticket.id)}>
        Custom Action
      </button>
      <button onClick={() => handleAnotherAction(ticket.id)}>
        Another Action
      </button>
    </>
  )}
/>
```

## Ticket Object Structure
The component expects a ticket object with the following properties:

```javascript
{
  id: number,
  email: string,
  name: string,
  issue_type: string,
  issue_type_other: string, // optional
  issue_title: string,
  description: string,
  status: 'new' | 'in_progress' | 'escalated' | 'closed',
  product: string, // optional
  module: string, // optional
  attachment_name: string, // optional
  attachment_type: string, // optional
  created_at: string,
  updated_at: string // optional
}
```

## Status-Based Styling
The component automatically applies different styles based on ticket status:

- **NEW**: Blue border and badge
- **IN PROGRESS**: Orange border and badge
- **ESCALATED**: Red border and badge
- **CLOSED**: Green border and badge (with reduced opacity)

## Action Buttons
Default action buttons are automatically shown based on ticket status:

- **NEW/IN_PROGRESS**: Resolve, Escalate
- **ESCALATED**: Resolve only
- **CLOSED**: Reopen

## Integration with Dashboards

### AdminDashboard.js
```jsx
<TicketCard
  ticket={ticket}
  userType="agent"
  onStatusChange={handleStatusChange}
  onReplyAdded={(ticketId) => {
    fetchTickets();
    fetchTicketReplies(ticketId);
  }}
  showReplySection={true}
  showActions={true}
  showChat={true}
/>
```

### ManagerDashboard.js
```jsx
<TicketCard
  ticket={ticket}
  userType="agent"
  onStatusChange={handleStatusChange}
  onReplyAdded={(ticketId) => {
    fetchData();
    fetchTicketReplies(ticketId);
  }}
  showReplySection={true}
  showActions={true}
  showChat={true}
/>
```

## CSS Classes
The component uses the following CSS classes for styling:

- `.ticket-card` - Main container
- `.ticket-card.{status}` - Status-specific styling
- `.ticket-header` - Header section
- `.ticket-body` - Body section
- `.ticket-actions` - Action buttons section
- `.reply-section` - Reply form section

## Benefits of Centralization

1. **Consistency**: All tickets look identical across dashboards
2. **Maintainability**: Single source of truth for ticket UI
3. **Reusability**: Easy to add to new dashboards
4. **Bug Fixes**: Fix once, applies everywhere
5. **Feature Updates**: New features automatically available everywhere
6. **Testing**: Single component to test

## Migration Guide

### Before (Individual Dashboard Implementation)
```jsx
// Each dashboard had its own ticket HTML structure
<div className="ticket-card">
  <div className="ticket-header">
    <h3>{ticket.email}</h3>
    <span className="status-badge">{ticket.status}</span>
  </div>
  <div className="ticket-body">
    {/* Different structure in each dashboard */}
  </div>
</div>
```

### After (Centralized TicketCard)
```jsx
// All dashboards use the same component
<TicketCard
  ticket={ticket}
  userType="agent"
  onStatusChange={handleStatusChange}
  onReplyAdded={handleReplyAdded}
/>
```

## Future Enhancements
- Custom theme support
- Additional status types
- Enhanced media handling
- Accessibility improvements
- Performance optimizations
