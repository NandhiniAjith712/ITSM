# TicketTemplate Component

## Overview
The `TicketTemplate` is a comprehensive, reusable component that provides a complete ticket management interface. It can be used across all dashboards and components with customizable features.

## Features
- ✅ **SLA Timer Section** - Complete SLA management with auto-refresh
- ✅ **Ticket Information** - Customer details, agent info, status badges
- ✅ **Ticket Details Grid** - Issue type, title, product, module
- ✅ **Description Section** - Ticket description with media attachment support
- ✅ **Timestamps** - Created and updated timestamps
- ✅ **Action Buttons** - Resolve, Escalate, Reopen with smart logic
- ✅ **Chat Room Integration** - Full TicketChat component embedded
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **Customizable** - Show/hide sections, custom actions, custom headers

## Props

### Required Props
- `ticket` - Ticket object with all ticket data

### Optional Props
- `userType` - User role ('agent', 'admin', 'manager', 'ceo', 'business') - Default: 'agent'
- `showActions` - Show action buttons - Default: true
- `showChat` - Show chat room - Default: true
- `showSLA` - Show SLA timer section - Default: true
- `showTimestamps` - Show timestamps - Default: true
- `showDescription` - Show description section - Default: true
- `showDetails` - Show ticket details grid - Default: true
- `showStatus` - Show status badges - Default: true
- `showCustomerInfo` - Show customer information - Default: true
- `showAgentInfo` - Show agent information - Default: true
- `showNavigation` - Show header with back button - Default: true
- `showLogout` - Show logout button - Default: false
- `onStatusChange` - Callback for status changes
- `onReplyAdded` - Callback when replies are added
- `customActions` - Custom action buttons function
- `customHeader` - Custom header content
- `customFooter` - Custom footer content
- `className` - Additional CSS classes
- `style` - Inline styles

## Usage Examples

### 1. Basic Usage (Full Ticket View)
```jsx
import TicketTemplate from './components/TicketTemplate';

// In your component
<TicketTemplate 
  ticket={ticketData}
  userType="agent"
/>
```

### 2. Minimal Ticket View (No SLA, No Chat)
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="admin"
  showSLA={false}
  showChat={false}
  showTimestamps={false}
/>
```

### 3. Custom Actions
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="manager"
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

### 4. Custom Header
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="ceo"
  customHeader={
    <div>
      <h1>🚨 High Priority Ticket</h1>
      <p>Requires immediate attention</p>
    </div>
  }
/>
```

### 5. Custom Footer
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="business"
  customFooter={
    <div>
      <h3>Additional Information</h3>
      <p>This ticket is part of a larger project</p>
    </div>
  }
/>
```

### 6. Status Change Handling
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="agent"
  onStatusChange={async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Refresh ticket data or update state
        refreshTicketData();
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  }}
/>
```

### 7. Reply Added Handling
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="agent"
  onReplyAdded={(ticketId) => {
    // Update ticket list, show notification, etc.
    showNotification('Reply added successfully!');
    updateTicketList();
  }}
/>
```

### 8. Styling and Classes
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="agent"
  className="my-custom-ticket-view"
  style={{ 
    backgroundColor: '#f0f0f0',
    borderRadius: '20px'
  }}
/>
```

## Integration Examples

### In AgentDashboard
```jsx
import TicketTemplate from './TicketTemplate';

// When showing ticket details
{selectedTicket && (
  <TicketTemplate 
    ticket={selectedTicket}
    userType="agent"
    onStatusChange={handleStatusChange}
    onReplyAdded={handleReplyAdded}
  />
)}
```

### In AdminDashboard
```jsx
import TicketTemplate from './TicketTemplate';

// For admin view with custom actions
<TicketTemplate 
  ticket={ticket}
  userType="admin"
  customActions={(ticket) => (
    <>
      <button onClick={() => assignTicket(ticket.id)}>Assign</button>
      <button onClick={() => deleteTicket(ticket.id)}>Delete</button>
    </>
  )}
/>
```

### In ManagerDashboard
```jsx
import TicketTemplate from './TicketTemplate';

// For manager view with minimal features
<TicketTemplate 
  ticket={ticket}
  userType="manager"
  showSLA={false}
  showChat={false}
  customHeader={<h1>Manager Review: Ticket #{ticket.id}</h1>}
/>
```

### In BusinessDashboard
```jsx
import TicketTemplate from './TicketTemplate';

// For business team view
<TicketTemplate 
  ticket={ticket}
  userType="business"
  showActions={false}
  showChat={false}
  customFooter={
    <div className="business-notes">
      <h3>Business Notes</h3>
      <textarea placeholder="Add business notes here..." />
    </div>
  }
/>
```

## CSS Customization

The component uses the `TicketTemplate.css` file for styling. You can:

1. **Override styles** using CSS specificity
2. **Add custom classes** via the `className` prop
3. **Use inline styles** via the `style` prop
4. **Modify the base CSS** file for global changes

### Custom CSS Example
```css
/* Override specific styles */
.my-custom-ticket .ticket-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.my-custom-ticket .sla-timer-card {
  background: linear-gradient(135deg, #4834d4 0%, #686de0 100%);
}

/* Add new styles */
.business-notes textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
}
```

## Benefits

1. **Reusability** - Use the same component across all dashboards
2. **Consistency** - Uniform ticket interface throughout the application
3. **Maintainability** - Single source of truth for ticket functionality
4. **Flexibility** - Customize what to show/hide based on user role
5. **Performance** - Optimized rendering and state management
6. **Accessibility** - Built-in responsive design and proper ARIA labels

## Migration Guide

### From TicketDetailPage
Replace:
```jsx
<TicketDetailPage />
```

With:
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="agent"
/>
```

### From TicketCard
Replace:
```jsx
<TicketCard ticket={ticket} />
```

With:
```jsx
<TicketTemplate 
  ticket={ticket}
  userType="agent"
  showNavigation={false}
  showSLA={false}
  showChat={false}
  showTimestamps={false}
  showDescription={false}
  showDetails={false}
  showStatus={false}
  showCustomerInfo={false}
  showAgentInfo={false}
  showLogout={false}
/>
```

## Best Practices

1. **Always provide userType** for proper navigation and role-based features
2. **Use customActions** for role-specific functionality
3. **Handle status changes** properly with onStatusChange callback
4. **Customize headers** for context-specific information
5. **Use customFooter** for additional features or notes
6. **Test responsive behavior** on different screen sizes
7. **Maintain consistent styling** across all implementations

## Troubleshooting

### Common Issues

1. **Ticket not displaying** - Check if ticket prop is provided and has required fields
2. **Navigation not working** - Ensure userType is set correctly
3. **Styles not applying** - Verify TicketTemplate.css is imported
4. **Chat not working** - Check if TicketChat component is available
5. **Actions not responding** - Ensure onStatusChange callback is provided

### Debug Mode
Add console logs to see what's happening:
```jsx
<TicketTemplate 
  ticket={ticketData}
  userType="agent"
  onStatusChange={(ticketId, status) => {
    console.log('Status change:', ticketId, status);
    // Your logic here
  }}
/>
```






