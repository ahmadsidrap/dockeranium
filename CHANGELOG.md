## Changelog

### [0.0.1] - 2024-03-20
#### Added
- Project initialization
- Basic README.md structure

### [0.1.0] - 2024-03-20
#### Added
- Initial project setup
- Dashboard layout with responsive sidebar
- Header with logo and app name
- User dropdown menu with profile and logout options
- Basic project structure
- License file

### [0.1.1] - 2024-03-20
#### Added
- Implemented basic dashboard layout components
- Added responsive sidebar with navigation menu
- Created header with user dropdown
- Set up initial page structure
- TypeScript configurations

### [0.1.2] - 2024-03-20
#### Added
- Docker Compose configuration
- Frontend Dockerfile
- Development environment setup instructions
- Added volume mount for .next directory

### [0.1.3] - 2024-03-20
#### Added
- Backend Django project setup
- Docker container list API endpoint
- Backend Dockerfile and Docker Compose integration
- Docker SDK integration for container management
- Added WSGI and ASGI configuration
- Fixed backend permissions in Dockerfile

### [0.1.4] - 2024-03-20
#### Added
- Added .gitignore files for frontend, backend, and root directory
- Added proper version control configuration
- Added exclusions for build artifacts, dependencies, and environment files

### [0.1.5] - 2024-03-20
#### Added
- Created Containers page with table view
- Integrated container list API with frontend
- Added loading and error states
- Added container status indicators

### [0.1.6] - 2024-03-20
#### Added
- Created Images page with table view
- Added Docker images list API endpoint
- Integrated images list API with frontend
- Added size formatting utility
- Added platform information display

### [0.1.7] - 2024-03-20
#### Added
- Created Networks page with table view
- Added Docker networks list API endpoint
- Integrated networks list API with frontend
- Added network details display (subnet, gateway, containers)
- Added network driver and scope information

### [0.1.8] - 2024-03-20
#### Added
- Created Volumes page with table view
- Added Docker volumes list API endpoint
- Integrated volumes list API with frontend
- Added volume size formatting
- Added mount point display with truncation
- Added volume metadata display (driver, scope, creation time)

### [0.1.9] - 2024-03-20
#### Added
- Enhanced table horizontal scrolling
- Added fixed column widths for better layout
- Improved table cell text truncation
- Added hover effects on table rows
- Improved table accessibility

### [0.1.10] - 2024-03-20
#### Fixed
- Improved table horizontal scrolling behavior
- Added sticky headers
- Fixed column minimum widths
- Enhanced table container structure
- Improved text truncation in cells

### [0.1.11] - 2024-03-20
#### Fixed
- Fixed table width to match container
- Improved horizontal scrolling behavior
- Added proper cell width constraints
- Enhanced text truncation
- Simplified table structure

### [0.1.12] - 2024-03-20
#### Fixed
- Changed to overflow-x-scroll for better horizontal scrolling
- Simplified table structure
- Added minimum table width
- Improved table responsiveness
- Fixed scrollbar visibility

### [0.1.13] - 2024-03-20
#### Added
- Made sidebar floating and fixed position
- Fixed header position
- Adjusted main content padding
- Improved layout structure
- Added z-index for proper layering

### [0.1.14] - 2024-03-20
#### Changed
- Removed padding from main content area
- Improved content container structure
- Added header border for better separation
- Adjusted spacing for better content fit
- Optimized layout for full-width content

### [0.1.15] - 2024-03-20
#### Added
- Active state for sidebar menu items
- Visual feedback for current route
- Improved menu item transitions
- Enhanced menu item hover states
- Better navigation state management

### [0.1.16] - 2024-03-20
#### Added
- Container control buttons (Start/Stop)
- Container action API endpoints
- Loading states for container actions
- Visual feedback for action states
- Error handling for container actions

### [0.1.17] - 2024-03-20
#### Fixed
- Changed ContainerListView to ContainerViewSet for proper action handling
- Fixed API routing for container actions
- Updated URL patterns to use DRF router
- Fixed container start/stop endpoints
- Improved error handling for container actions

### [0.1.18] - 2024-03-20
#### Fixed
- Added trailing slash to API endpoints for container actions
- Fixed POST request URL formatting
- Resolved Django APPEND_SLASH redirect issue
#### Commit ID:
- df2fbbd4068dd20a089296d8158a191f5454759d

### [0.1.19] - 2024-03-20
#### Added
- Container detail page with comprehensive information
- Clickable container names in list view
- Container network settings display
- Container mount points information
- Container configuration details
- Real-time container status updates
#### Commit ID:
- f7da15843abb69738a038bffa440002bc498b100

### [0.1.20] - 2024-03-20
#### Changed
- Removed redundant Status column from containers table
- Simplified container state display
#### Commit ID:
- b82e6035f8715176a4675f730e5b299c4d35e239

### [0.1.21] - 2024-03-20
#### Added
- Image detail page with comprehensive information
- Clickable image IDs in list view
- Image configuration display
- Image history view
- Environment variables display
- Exposed ports information
#### Commit ID:
- e57d65cb0d6c2465e8f6ba283a8d95947b71fae8

### [0.1.22] - 2024-03-20
#### Added
- Image detail API endpoint
- Extended image information retrieval
- Image configuration API
- Image history API
- Error handling for image not found
#### Commit ID:
- 239ffb30ffa1a4669c82d21e2c6cf3bc3a8cbbf4

### [0.1.23] - 2024-03-20
#### Added
- Network detail page with comprehensive information
- Clickable network IDs in list view
- Network IPAM configuration display
- Connected containers list
- Network options and labels display
- Network detail API endpoint
#### Commit ID:
- ff28b91848b5d2a0eb03fe0cdf41f079503c98fd

### [0.1.24] - 2024-03-20
#### Added
- Volume detail page with comprehensive information
- Clickable volume names in list view
- Volume mount information display
- Mounted containers list
- Volume options and labels display
- Volume detail API endpoint
#### Commit ID:
- f1114c7615f1d03e4fe4e666f91276bcf76b2f4f

### [0.1.25] - 2024-03-20
#### Fixed
- Added null checks for volume options and labels
- Fixed TypeError in volume detail page
- Improved error handling for undefined properties
#### Commit ID:
- 35a43774807aa0e88e65504c331e716e3b570289

### [0.1.26] - 2024-03-20
#### Added
- Dashboard overview with resource counters
- Container status statistics
- Quick access cards to resources
- Stats API endpoint
- Visual resource cards with hover effects
#### Commit ID:
- 8d971aee526e15180ba6159d8f0b8a2b60af05f1

### [0.1.27] - 2024-03-20
#### Added
- Clickable container names in network detail view
- Direct navigation to container details from network view
- Improved container-network relationship navigation
#### Commit ID:
- d2cd35bd298de078f6459f0ad0121c6f785de837

### [0.1.28] - 2024-03-20
#### Added
- Container control buttons in network detail view
- Start/Stop functionality for connected containers
- Container state information in network API
- Loading states for container actions
- Automatic refresh after container action
#### Commit ID:
- 7346127307fd35efe64ab9bbd9f8c0394378ddd0

### [0.1.29] - 2024-03-20
#### Added
- Reverse Proxy management page
- Running containers list with network details
- Port mapping information display
- Network information for containers
- Container filtering by running state
- Running containers API endpoint
#### Changed
- Updated sidebar menu with Reverse Proxy option
#### Commit ID:
- 98bebbbdb08d6413c36b769386a9dff718be3d4d

### [0.1.30] - 2024-03-20
#### Added
- System resource monitoring dashboard
- CPU usage monitoring with per-core stats
- Memory usage monitoring
- Disk usage monitoring
- Network interface monitoring
- Real-time stats updates
- System stats API endpoint
#### Changed
- Added icon for Reverse Proxy menu
- Enhanced dashboard layout with system metrics
#### Commit ID:
- dba51ab7df2ce49824fa2f36fa3b680e67f22de5

### [0.1.31] - 2024-03-20
#### Added
- psutil package to requirements.txt
#### Changed
- Updated dependencies for system monitoring
#### Commit ID:
- c79d418b42fa7175a57969a9adb8971512671456

### [0.1.32] - 2024-03-20
#### Added
- Network deletion functionality
- Network usage status check
- Delete button for unused networks
- Disabled state for networks in use
- Loading state for delete action
#### Changed
- Added network containers count
- Enhanced network list view with actions column

### [0.1.33] - 2024-03-20
#### Fixed
- Fixed network container count to show actual connected containers
- Improved network usage detection accuracy

### [0.1.34] - 2024-03-20
#### Fixed
- Fixed network container count to handle missing containers
- Improved container counting accuracy in network list
- Added error handling for deleted containers
- Enhanced network usage detection reliability
#### Commit ID:
- 022acbc42d28d8045619e603a9c3eb2e13f7df84

### [0.1.35] - 2024-03-20
#### Added
- Delete confirmation modal for networks
- Network filtering to hide special networks
#### Changed
- Hidden host and none networks from list
- Hidden networks without subnet/gateway
- Improved delete UX with confirmation dialog
#### Fixed
- Network list filtering for better usability
#### Commit ID:
- 7ebc9c8bc5c2e5b2ebc62af6d20a6dda921d2b03

### [0.1.36] - 2024-03-20
#### Added
- Image deletion functionality
- Delete confirmation modal for images
- System stats display in images page
- Total volume size calculation
- Host memory usage display
#### Changed
- Enhanced image list view with actions column
- Added system resource information to UI
#### Fixed
- Added error handling for image deletion
- Improved volume size calculation

### [0.1.37] - 2024-03-20
#### Added
- Image search functionality by name or ID
- Host storage information display
#### Changed
- Updated system stats display to show disk usage
- Improved image filtering with search
#### Enhanced
- Image list view with search capabilities
- System resource information display
#### Commit ID:
- 40f933adde993d680ae75f5092cb00eda6e30ddd

### [0.1.38] - 2024-03-20
#### Added
- Bulk delete functionality for images
- Checkbox selection for multiple images
- Select all/none functionality
- Bulk delete confirmation modal
#### Enhanced
- Image deletion UX with bulk actions
- Selection state management
- Delete confirmation with image list
#### Fixed
- Sequential deletion to prevent server overload
#### Commit ID:
- a1d33acda21decb65ca4b62cd7265d2cf57e4792

### [0.1.39] - 2024-03-20
#### Added
- Search functionality for networks, volumes, and containers
- Bulk delete functionality for networks, volumes, and containers
- Delete confirmation modals across all resource pages
- Checkbox selection for multiple items
- Select all/none functionality for all resources
#### Enhanced
- Resource management UX with bulk actions
- Search capabilities across all resources
- Delete confirmation dialogs
#### Fixed
- Improved error handling for bulk operations
- Sequential deletion to prevent server overload

### [0.1.40] - 2024-03-20
#### Fixed
- Removed legacy deleteLoading reference in network delete button
- Fixed network delete button state management
- Improved network deletion UX consistency
#### Commit ID:
- 88932a943bbe1ce0eedc452d3b5f39e779da16d6

### [0.1.41] - 2024-03-20
#### Added
- Applied search and bulk delete pattern to volumes page
- Applied search and bulk delete pattern to containers page
#### Enhanced
- Consistent UX across all resource pages
- Unified search functionality implementation
- Standardized bulk delete behavior
#### Fixed
- Unified error handling across pages
- Consistent loading states

### [0.1.42] - 2024-03-20
#### Fixed
- Fixed actionLoading state in containers page
- Added missing state management for container actions
- Improved container action and bulk delete coexistence
#### Enhanced
- Combined individual and bulk actions for containers
- Improved container state management
#### Commit ID:
- 239d61a28996e7e45a20fb8ed6dfd37aee2c3b81

### [0.1.43] - 2024-03-20
#### Added
- Container deletion API endpoint
- Container destroy method in ViewSet
#### Fixed
- Added missing DELETE method for containers
- Added running container check before deletion
- Improved error handling for container deletion
#### Commit ID:
- 2aff773cc67f7ec44541f7992f8280a5a6086f79

### [0.1.44] - 2024-03-20
#### Added
- Search functionality for volumes
- Bulk delete functionality for volumes
- Delete confirmation modal for volumes
- Volume filtering by name, driver, and mount point
#### Enhanced
- Volume list view with bulk actions
- Volume deletion UX with confirmations
- Volume search capabilities
#### Fixed
- Volume deletion error handling
- Volume in-use state management

### [0.1.45] - 2024-03-20
#### Added
- Volume deletion API endpoint
- Volume destroy method in ViewSet
#### Fixed
- Added missing DELETE method for volumes
- Added volume usage check before deletion
- Added mounted containers check
- Improved error handling for volume deletion
#### Commit ID:
- 4b1103d7bb3c0c20526610ed73801945736ae603

### [0.1.46] - 2024-03-20
#### Added
- Authentication system using Iron Session
- Login page with form validation
- Protected routes with middleware
- Session management
- Logout functionality
#### Enhanced
- Security with environment variables
- User experience with loading states
- Error handling for authentication
#### Fixed
- Route protection for unauthorized access
- Session persistence
#### Commit ID:
- 5d1b152f2d6022fff52c130f315554d2f07ec4ec

### [0.1.47] - 2024-03-20
#### Changed
- Simplified user dropdown menu
- Removed profile option from dropdown
#### Enhanced
- Authentication middleware reliability
- Login redirect handling
- Session management
#### Security
- Strengthened route protection
- Improved session validation

### [0.1.48] - 2024-03-20
#### Fixed
- Middleware protection for authenticated routes
- Session clearing on logout
- Proper redirection after logout
#### Enhanced
- Authentication middleware reliability
- Session management
- Logout functionality
#### Security
- Improved route protection
- Better session handling

### [0.1.49] - 2024-03-20
#### Fixed
- Fixed module resolution for session management
- Updated import paths for API routes
- Corrected file structure for Next.js
#### Enhanced
- Improved project structure
- Better module organization

### [0.1.50] - 2024-03-20
#### Fixed
- Updated iron-session implementation for Next.js compatibility
- Fixed module resolution issues
- Updated session management approach
#### Enhanced
- Simplified session handling
- Improved type safety
- Better error handling

### [0.1.51] - 2024-03-20
#### Fixed
- Fixed iron-session imports and compatibility issues
- Updated session handling with latest iron-session API
- Fixed middleware session management
#### Enhanced
- Better error handling in middleware
- Improved session creation
- More robust session management
#### Security
- Updated session handling approach
- Better error recovery

### [0.1.52] - 2024-03-20
#### Fixed
- Updated API routes to use new session handler
- Fixed session import errors
- Corrected session type usage
#### Enhanced
- Simplified session handling in API routes
- Improved type safety in session management
#### Security
- Updated session handling approach

### [0.1.53] - 2024-03-20
#### Fixed
- Removed duplicate middleware file
- Fixed middleware session handling
- Updated to use next-iron-session
#### Enhanced
- Simplified middleware logic
- Improved session cookie check
- Better error handling
#### Security
- More robust session validation

### [0.1.54] - 2024-03-20
#### Fixed
- Fixed Header component session handling
- Added proper type definitions
- Fixed Menu component implementation
#### Added
- @headlessui/react for dropdown menu
- Loading state for logout action
#### Enhanced
- Improved user menu UX
- Better type safety in Header component

### [0.1.55] - 2024-03-20
#### Fixed
- Removed duplicate session.ts file
- Fixed iron-session type imports
- Updated SessionOptions type usage
#### Enhanced
- Cleaned up project structure
- Improved type definitions
#### Security
- Consistent session configuration

### [0.1.56] - 2024-03-20
#### Fixed
- Fixed container detail page type errors
- Fixed session type definitions
- Removed unnecessary createResponse usage
- Fixed params type handling
#### Enhanced
- Improved type safety in container detail page
- Better session type definitions
- Cleaner session implementation
#### Security
- More type-safe session handling

### [0.1.57] - 2024-03-20
#### Fixed
- Fixed Container type definition
- Updated ContainerDetail interface
- Fixed State property casing
#### Enhanced
- Improved type safety for container state
- Better container property definitions
- More accurate Docker API types

### [0.1.58] - 2024-03-20
#### Fixed
- Fixed useParams type errors across all [id] pages
- Added proper type definitions for page parameters
- Fixed module resolution issues
- Added missing type declarations
#### Added
- PageParams type utility
- Better TypeScript configuration
#### Enhanced
- Improved type safety across pages
- Better module imports handling
#### Security
- Type-safe parameter handling

### [0.1.59] - 2024-03-20
#### Fixed
- Removed dependency on @types/iron-session
- Added custom type definitions for iron-session
- Fixed querystring dependency issue
- Improved type declarations
#### Added
- Custom iron-session type definitions
- Better type support for Next.js API routes
#### Enhanced
- More robust type system
- Better module type declarations
#### Security
- Type-safe session handling

### [0.1.60] - 2024-03-20
#### Fixed
- Applied PageParams type to all [id] pages
- Fixed type errors in detail pages
- Consistent params handling across pages
#### Enhanced
- Unified params type usage
- Better type safety in detail pages
- Consistent type assertions
#### Security
- Type-safe parameter handling in all routes

### [0.1.61] - 2024-03-20
#### Fixed
- Fixed pathname null check in Sidebar component
- Added type safety for usePathname hook
- Improved active link detection
#### Enhanced
- Better null handling in navigation
- More robust path matching
- Improved type safety in layout components

### [0.1.62] - 2024-03-20
#### Added
- react-icons package for sidebar icons
#### Fixed
- Missing dependency for sidebar icons
- Module resolution for react-icons
#### Enhanced
- Better icon support in sidebar
- Consistent icon usage

### [0.1.63] - 2024-03-20
#### Fixed
- Added proper session type declarations for API routes
- Fixed NextApiRequest type extension
- Fixed session property type errors
#### Added
- Custom type declarations for Next.js
- Better type support for iron-session
#### Enhanced
- Improved type safety in API routes
- Better session type handling
#### Security
- Type-safe session management in API routes

### [0.1.64] - 2024-03-20
#### Added
- Login page with form validation
- Loading state for login form
- Error handling for login failures
#### Enhanced
- User authentication flow
- Login form UX with loading states
- Error message display
#### Security
- Proper form validation
- Secure login handling

### [0.1.65] - 2024-03-20
#### Fixed
- Fixed iron-session module resolution
- Removed outdated next-iron-session
- Updated session configuration
#### Added
- Environment variable for session password
#### Enhanced
- Simplified session dependencies
- Better session configuration
#### Security
- Improved session password handling

### [0.2.0] - 2024-03-20
#### Fixed
- Updated iron-session to latest version
- Fixed session type imports
- Improved session type definitions
#### Enhanced
- Better type inheritance for session data
- More robust session configuration
#### Security
- Updated session package version

### [0.1.67] - 2024-03-20
#### Fixed
- Fixed network data handling with proper null checks
- Added type safety for network IPAM configuration
- Improved error handling for network data
- Removed debug console logs
#### Enhanced
- More robust network data filtering
- Better type safety for network properties
#### Commit ID:
- 771829eb826adb8c3f4bf2b270b0274ca7b7e03d

### [0.2.1] - 2024-03-20
#### Added
- Logout confirmation modal in user menu
#### Changed
- Updated user menu to show logged in username instead of "User"
#### Enhanced
- Better logout UX with confirmation dialog
- More informative user identification

### [0.2.2] - 2024-03-20
#### Added
- Enabled hot reloading in Docker development environment
#### Changed
- Updated Next.js configuration for file watching in Docker
- Modified Docker Compose to support hot reloading
#### Enhanced
- Development experience with automatic reloading
- File change detection in containerized environment

### [0.2.3] - 2024-03-20
#### Added
- Custom SVG logo for Dockeranium
- Introvesia copyright in sidebar
#### Changed
- Updated header to show Dockeranium branding
- Added logo to header
#### Enhanced
- Better brand identity with custom logo
- Professional appearance with copyright notice

### [0.2.4] - 2024-03-20
#### Fixed
- Fixed layout structure with proper fixed positioning
- Removed padding from main content area
- Improved spacing and alignment of all elements
#### Changed
- Reorganized layout components for better structure
- Updated header with logo and site title
- Improved content container structure
#### Enhanced
- Better overall layout consistency
- Added header border for better separation
#### Commit ID:
- cd37f697a1dc2fa54d916e1fa773faf55020c4cf

### [0.2.5] - 2024-03-20
#### Added
- Logout API endpoint
- Better error handling for logout process
#### Fixed
- Fixed 404 error on logout
- Added proper session cleanup on logout
#### Enhanced
- Improved logout error feedback
- Better session management

### [0.2.6] - 2024-03-20
#### Fixed
- Updated logout API route to use correct session handler method
- Changed withSessionRoute to withSession for iron-session compatibility
- Fixed type errors in logout route implementation
#### Enhanced
- Improved session cleanup on logout
- Better type safety in logout handler
#### Security
- More reliable session destruction on logout

### [0.2.7] - 2024-03-20
#### Fixed
- Added missing @types/next dependency for proper type support
- Fixed next/server module resolution error in logout route
#### Added
- TypeScript type definitions for Next.js

### [0.2.8] - 2024-03-20
#### Fixed
- Added null checks for network IPAM configuration in networks table
- Fixed type error for possibly null IPAM values
- Improved error handling for missing network configuration
#### Commit ID:
- f66c0f53cc28bd5c0419fa1e4841ad7b7eb177b4

### [0.2.9] - 2024-03-20
#### Added
- Disconnected containers section in Containers page
- Run button to start disconnected containers
- Container state filtering functionality
- Visual indicators for container state
#### Enhanced
- Container management capabilities
- Container state visibility

### [0.2.10] - 2024-03-20
#### Added
- Disconnected containers section in container detail page
- Run button for disconnected containers
- Container connection status indicators
#### Enhanced
- Container detail page with network status information
- Container management capabilities in detail view

### [0.2.11] - 2024-03-20
#### Fixed
- Fixed container state property casing in container detail page
- Added proper type definition for container State property
- Added null checks for container state access
#### Enhanced
- Improved type safety for container state handling
- Better error handling for undefined container states

### [0.2.12] - 2024-03-20
#### Changed
- Moved disconnected containers section from container detail to network detail page
- Reorganized container connection status display
#### Enhanced
- Better organization of network-related container information
- Improved network detail page structure

### [0.2.13] - 2024-03-20
#### Added
- Disconnected containers section in network detail page
- Run button for disconnected containers
- Container status indicators in network view
#### Enhanced
- Network detail page with container connection status
- Container management from network view
- Better network-container relationship display

### [0.2.14] - 2024-03-20
#### Changed
- Limited disconnected containers list to only show containers previously connected to current network
- Updated disconnected containers endpoint to filter by network
#### Enhanced
- More relevant disconnected containers display
- Better network-specific container management

### [0.2.15] - 2024-03-20
#### Added
- Backend endpoint for network-specific disconnected containers
- Network container history tracking
- Container connection state filtering
#### Enhanced
- More accurate disconnected containers detection
- Better container-network relationship tracking
#### Fixed
- Proper handling of container network history
- Improved error handling for network operations

### [0.2.16] - 2024-03-20
#### Changed
- Always show disconnected containers section in network detail page
- Improved empty state message for disconnected containers
#### Enhanced
- Better UX with consistent section visibility
- Clearer feedback when no disconnected containers exist

### [0.2.17] - 2024-03-20
#### Fixed
- Fixed 404 error in disconnected containers endpoint
- Added proper ViewSet base methods
- Added debug logging for network operations
#### Enhanced
- Better error handling in network endpoints
- Improved debugging capabilities
- More robust network container tracking

### [0.2.18] - 2024-03-20
#### Fixed
- Reorganized API endpoint structure
- Fixed API URL routing configuration
- Corrected endpoint registration
#### Enhanced
- Better API organization
- Clearer API routing structure

### [0.2.19] - 2024-03-20
#### Fixed
- Converted NetworkListView to NetworkViewSet for consistent API structure
- Fixed network endpoint registration in URL patterns
- Integrated disconnected containers endpoint with NetworkViewSet
#### Enhanced
- More consistent API architecture
- Better network endpoint organization
- Unified network operations handling

### [0.2.20] - 2024-03-20
#### Fixed
- Fixed indentation error in NetworkViewSet list method
- Added proper implementation of network list and detail methods
- Improved error handling in network operations
#### Enhanced
- Better code organization in NetworkViewSet
- More consistent error responses
- Cleaner network data processing

### [0.2.21] - 2024-03-20
#### Added
- Detailed debug logging for container network detection
- Better container ID tracking in network operations
#### Enhanced
- More accurate disconnected container detection
- Better debugging for network container relationships

### [0.2.22] - 2024-03-20
#### Changed
- Aligned disconnected containers table columns with connected containers table
- Added consistent network information display
#### Enhanced
- More consistent table layout across network views
- Better visual alignment of container information

### [0.2.23.1] - 2024-03-20
#### Added
- Network address information for disconnected containers
- Last known network settings in disconnected containers API
- Consistent network data structure between connected and disconnected containers
#### Enhanced
- More complete container network information
- Better network history tracking
- Unified container network display

### [0.2.23.2] - 2024-03-20
#### Fixed
- Fixed next/server module resolution in logout route
- Added proper type declarations for Next.js server components
#### Enhanced
- Better type safety in API routes
- Improved server-side response handling

### [0.2.23.3] - 2024-03-20
#### Added
- Floating log viewer component for containers
- Log viewing button in container list
- Real-time container log display
#### Enhanced
- Better container monitoring capabilities
- Improved log visibility and accessibility

### [0.2.23.4] - 2024-03-20
#### Fixed
- Added missing React imports in LogViewer component
- Fixed type safety for container ID in log viewer
- Added null checks for container ID
#### Enhanced
- Better error handling in log fetching
- Improved type definitions for LogViewer props

### [0.2.23.5] - 2024-03-20
#### Added
- Log button next to Run/Stop actions in container list
#### Enhanced
- Better access to container logs
- Consistent button styling across actions

### [0.2.23.6] - 2024-03-20
#### Added
- Container logs endpoint in backend API
- Log streaming with timestamps
- Container status with logs response
#### Enhanced
- Better log retrieval with error handling
- Limited log output for better performance
- Added container context with logs

### [0.2.23.7] - 2024-03-20
#### Changed
- Reduced size of container control buttons
- Added auto-scroll to bottom for log viewer
#### Enhanced
- Better UI density in container list
- Improved log viewing experience
- More consistent button styling

### [0.2.23.8] - 2024-03-20
#### Changed
- Updated log viewer with dark theme for better readability
- Redesigned control buttons with icons and consistent styling
#### Enhanced
- Better visual hierarchy in log display
- More polished button appearance with transitions
- Added visual feedback for button interactions

### [0.2.23.9] - 2024-03-20
#### Fixed
- Fixed z-index issue with table scroll and sidebar
- Adjusted log viewer font size for better content density
#### Enhanced
- Better UI layer management
- More efficient log display
- Improved readability of container logs

### [0.2.23.10] - 2024-03-20
#### Added
- Font size controls for log viewer
- Zoom in/out functionality for logs
#### Fixed
- Checkbox z-index issue with sidebar
- Extended search box width for better visibility
#### Enhanced
- Better log readability with font size control
- Improved search experience
- More consistent UI layering

### [0.2.23.11] - 2024-03-20
#### Fixed
- Fixed sidebar overlay issue with proper z-index layering
#### Enhanced
- Better UI layer hierarchy
- More consistent component stacking

### [0.2.23.12] - 2024-03-20
#### Added
- Collapsible sidebar with toggle button
- Smooth transition animations for sidebar
#### Enhanced
- Better space utilization with collapsible sidebar
- Improved UI responsiveness
- Added visual feedback for sidebar toggle

### [0.2.23.13] - 2024-03-20
#### Fixed
- Aligned header and sidebar z-index levels
- Fixed header logo visibility with sidebar
#### Enhanced
- Better UI component layering
- More consistent navigation elements
- Improved header and sidebar interaction

### [0.2.23.14] - 2024-03-20
#### Changed
- Moved app logo and name to start after sidebar
- Adjusted header layout for better visibility
#### Enhanced
- Better header organization
- Improved branding visibility
- More consistent layout with collapsible sidebar

### [0.2.23.15] - 2024-03-20
#### Changed
- Separated UserMenu into its own component
- Improved component organization
#### Enhanced
- Better code modularity
- Cleaner component structure
- More maintainable user interface components

### [0.2.23.16] - 2024-03-20
#### Fixed
- Made header logo position responsive to sidebar state
- Added proper spacing for page content to avoid toggle button overlap
#### Enhanced
- Better layout responsiveness
- Improved content positioning
- More consistent spacing across components
#### Commit ID:
- b43e39831b3e4e1cdc08516b2face5567c3a4291

### [0.2.24.0] - 2024-03-20
#### Changed
- Updated "Disconnected Containers" section title in network detail
- Made connected containers section always visible
#### Fixed
- Added container state refresh after stop/start actions
- Improved empty state messages for container sections
#### Enhanced
- Better container state management
- More consistent section visibility
- Clearer feedback for empty states

### [0.2.24.1] - 2024-03-20
#### Fixed
- Restored original Run button styling in network detail
- Made connected containers section always visible with proper empty state
#### Enhanced
- More consistent button styling
- Better empty state feedback for container sections

### [0.2.24.2] - 2024-03-20
#### Added
- Log buttons for both connected and disconnected containers
- Log viewer integration in network detail page
#### Enhanced
- Better container log access
- Consistent button styling across container states

### [0.2.24.3] - 2024-03-20
#### Added
- Periodic log updates for container logs
#### Enhanced
- Real-time log monitoring
- Better log viewing experience

### [0.2.24.4] - 2024-03-20
#### Added
- Periodic log updates only for running containers
- Auto-scroll to bottom on log updates
#### Enhanced
- Improved log viewing experience
- Better performance with conditional log fetching

### [0.2.24.5] - 2024-03-20
#### Added
- Log buttons for both connected and disconnected containers
- Log viewer integration in network detail page
- Conditional log fetching based on container running state
#### Enhanced
- Improved log viewing experience with periodic updates
- Better container state management

### [0.2.24.6] - 2024-03-20
#### Added
- Auto-scroll to bottom when new logs are loaded
#### Enhanced
- Improved log viewing experience with real-time updates

### [0.2.24.7]
- Added environment variable management through .env file
- Created .env.example as a template for environment variables
- Removed hardcoded environment variables from docker-compose.yml
- Added .env to .gitignore for security

### [0.2.24.8]
- Fixed type error in container detail page where ContainerDetail interface incorrectly extends Container interface
- Added proper type definitions for container state properties

### [0.2.24.9]
- Fixed type error in containers page by adding isRunning prop to LogViewer component
- Added container state check for log viewer running status
- Improved type safety in LogViewer component integration

### [0.2.24.10]
- Added configurable port mapping through environment variables
- Updated docker-compose.yml to support dynamic port configuration
- Added port configuration examples to .env.example

### [0.2.24.11]
- Added production-specific docker-compose configuration
- Created docker-compose.prod.yml with production optimizations
- Added .env.prod.example for production environment setup
- Added restart policies for production containers
- Separated development and production configurations

### [0.2.24.12]
- Added production Dockerfile for frontend (Dockerfile.prod)
- Implemented multi-stage build for smaller production image
- Added security enhancements with non-root user
- Optimized Node.js production configuration
- Enabled standalone output for better performance

### [0.2.24.13]
- Fixed port binding issues in production setup
- Added FRONTEND_INTERNAL_PORT configuration
- Updated Dockerfile.prod to use dynamic PORT environment variable
- Modified docker-compose.prod.yml to handle both external and internal ports
- Updated .env.prod.example with new port configuration

### [0.2.24.14]
- Fixed npm ci command in Dockerfile.prod to properly use package-lock.json
- Updated COPY instruction to include both package files
- Improved dependency installation reliability in production build

### [0.2.24.15]
- Changed npm ci to npm install in Dockerfile.prod due to missing package-lock.json
- Simplified package file copying to handle projects without package-lock.json
- Improved build process reliability

### [0.2.24.16]
- Fixed CSS module parsing error in production build
- Added PostCSS and Tailwind configuration to production build
- Updated Dockerfile.prod to include necessary CSS build files
- Improved production build configuration for styling

### [0.2.24.17]
- Fixed standalone build error in production Dockerfile
- Updated Next.js configuration for standalone output
- Modified production build process to use npm start
- Improved file copying strategy for production build
- Added proper Next.js production configuration

### [0.2.24.18]
- Fixed Dockerfile.prod path resolution error
- Updated docker-compose.prod.yml with correct build context and dockerfile path
- Improved build configuration for production setup

### [0.2.24.19]
- Fixed backend Dockerfile.prod path resolution error
- Updated backend build context and dockerfile path in docker-compose.prod.yml
- Improved backend service build configuration

### [0.2.24.20]
- Added production Dockerfile for backend (Dockerfile.prod)
- Implemented security enhancements with non-root user
- Added gunicorn for production server
- Optimized Python dependencies installation
- Improved backend production configuration

### [0.2.24.21]
- Added gunicorn to backend requirements
- Updated backend dependencies for production deployment
- Improved backend server configuration for production

### [0.2.24.22]
- Added gunicorn configuration for better performance
- Set optimal number of workers for production
- Added request timeout configuration
- Updated gunicorn settings for production workload

### [0.2.24.23]
- Added environment variable configuration for Django settings
- Moved SECRET_KEY to environment variable for better security
- Added configurable DEBUG setting through environment
- Made ALLOWED_HOSTS configurable via environment
- Added CORS_ALLOWED_ORIGINS environment configuration
- Added TIME_ZONE environment variable support
- Updated example environment files with new variables

### [0.2.24.24]
- Added NEXT_PUBLIC_API_URL environment variable for API endpoint configuration
- Updated all API calls to use environment variable
- Improved API endpoint configuration flexibility
- Added API URL fallback for development
- Updated environment example files with API URL

### [0.2.24.25]
- Updated all frontend components to use NEXT_PUBLIC_API_URL
- Standardized API endpoint configuration across all pages
- Added API URL fallback in all components
- Improved API endpoint management consistency
- Enhanced development and production API configuration

### [0.2.24.26]
- Fixed CORS issues with container API endpoints
- Added CORS configuration for Docker network hostnames
- Added CSRF trusted origins configuration
- Improved CORS settings for development environment
- Updated environment examples with new CORS settings

### [0.2.24.27]
- Fixed CORS configuration for container API endpoints
- Added comprehensive CORS headers and methods configuration
- Added CORS debugging and logging configuration
- Reordered middleware for proper CORS handling
- Enhanced CORS security settings

### [0.2.24.28]
- Fixed CORS issues in container detail page
- Added proper headers to API requests
- Improved error handling in container operations
- Added credentials handling for CORS requests
- Enhanced API request configuration

### [0.2.24.29]
- Added Next.js middleware for API request handling
- Configured middleware headers for CORS support
- Enhanced backend CORS configuration for middleware requests
- Added preflight request handling
- Improved CORS headers management

### [0.2.24.30]
- Fixed CORS_ALLOW_ALL_ORIGINS type error
- Updated DEBUG and CORS settings to use proper boolean values
- Improved environment variable type conversion
- Enhanced Django settings configuration
- Fixed backend startup error

[Awaiting Commit ID]
