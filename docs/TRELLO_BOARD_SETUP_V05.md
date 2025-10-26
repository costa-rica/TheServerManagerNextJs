# TRELLO_BOARD_SETUP_V05

## Trello Board Structure Overview

The Trello workspace for **The 404 Server Manager** project now follows a **six-board setup** designed to clearly track the lifecycle of every task across both backend and frontend repositories.

### 🧩 Board Structure

| Board Name                 | Purpose                                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The404-API To Do's**     | Contains all backend tasks that have not yet been started. Each card represents a distinct, actionable task for the **The404-API** repository.     |
| **The404-API In Progress** | Holds backend tasks that are currently being worked on. When a developer starts a task from the To Do list, they move the corresponding card here. |
| **The404-API Completed**   | Stores all finished backend tasks. Once a task in the In Progress list is verified and merged, the card is moved here.                             |

| Board Name                 | Purpose                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **The404-Web To Do's**     | Contains all frontend tasks that have not yet been started. Each card represents a distinct, actionable task for the **The404-Web** repository. |
| **The404-Web In Progress** | Holds frontend tasks that are currently being developed. Developers move cards here when work begins.                                           |
| **The404-Web Completed**   | Contains all completed frontend tasks that have passed verification and testing. Cards are moved here when the feature or fix is finalized.     |

### 🔁 Workflow Summary

Each Trello board operates on a simple, linear task flow:

1. **To Do’s → In Progress → Completed**
2. Cards are **moved**, not copied — this ensures each task exists only once in the workflow.
3. Archiving is **not** used for tracking progress. Instead, it’s reserved for cleaning up cards only after a release cycle or milestone is fully closed.

This structure provides a clear view of:

- What’s planned (To Do’s)
- What’s actively being built (In Progress)
- What’s finished and verified (Completed)

## It creates a unified visual pipeline for both repositories while maintaining separation between backend (API) and frontend (Web) development work.

## The404-API To Do's

### Card 1: Create NginxFiles Mongoose Schema

- Create `src/models/nginxFile.ts`
- Define interface `INginxFileDocument` with fields:
  - `serverName`: string
  - `portNumber`: number
  - `serverNameArrayOfAdditionalServerNames`: string[]
  - `appHostServerMachineId`: ObjectId
  - `nginxHostServerMachineId`: ObjectId
  - `framework`: string (optional)
  - `storeDirectory`: string (optional)
  - timestamps (createdAt, updatedAt)
- Export Mongoose model

### Card 2: Test NginxFile Model Creation

- Write test to create sample NginxFile document
- Verify relationships with Machine collection work correctly
- Test validation for required fields

### Card 3: Create JWT Authentication Middleware

- Create `src/middleware/auth.ts`
- Implement `verifyToken` middleware function
- Extract user ID from JWT and attach to `req.user`
- Handle invalid/expired token errors

### Card 4: Create Nginx Router Setup

- Create `src/routes/nginx.ts`
- Register router under `/nginx` in `src/app.ts`
- Apply JWT middleware to all nginx routes
- Add basic error handling

### Card 5: Implement GET /nginx Endpoint

- Create controller function in `src/routes/nginx.ts`
- Fetch all NginxFiles from database
- Populate both `appHostServerMachineId` and `nginxHostServerMachineId`
- Return array of nginx config objects
- Add error handling for database failures

## 🧩 Card 6: Implement POST /nginx/create-config-file (Part 1: Validation)

### Description

This endpoint will make use of external template files stored in the directory defined by the `.env` variable `PATH_PROJECT_RESOURCES`. In that directory, there will be a subdirectory called `createTemplateFile/`, which contains the template `.txt` files used for nginx configuration generation.

The validation step should ensure that the request body includes all required fields and that they are valid before passing data to the file creation module.

### Requirements

- Validate the following request body elements:
  - `templateFileName` (string) – must correspond to an existing `.txt` file in `PATH_PROJECT_RESOURCES/createTemplateFile/`
  - `serverNamesArray` (array of strings)
  - `appHostServerMachineId` (valid ObjectId reference to the Machines collection)
  - `portNumber` (number)
  - `saveDestination` (string) – must be either `sites-available` or `conf.d`
- Verify that the specified template file exists before continuing.
- Return `400` with a clear error message if any validation fails.
- Prepare the validated request body for processing by the nginx module.

---

## 🧰 Card 7: Implement POST /nginx/create-config-file (Part 2: Template Processing Module)

### Description

Create a new module called `src/modules/nginx.ts` that will contain logic for handling nginx configuration file creation using template files stored externally. This module will export at least one main function to be used by the `POST /nginx/create-config-file` endpoint after validation is complete.

### Requirements

- Read the template file located in `${PATH_PROJECT_RESOURCES}/createTemplateFile/` as specified by the `templateFileName` request body parameter.
- Replace placeholder tokens in the template with actual values:
  - `<ReplaceMe: server name>` → first entry of `serverNamesArray`
  - `<ReplaceMe: local ip>` → value from the `localIpAddress` field of the Machine document found using `appHostServerMachineId`
  - `<ReplaceMe: port number>` → `portNumber` from the request body
- Generate the new nginx configuration file in the appropriate directory (`/etc/nginx/sites-available` or `/etc/nginx/conf.d`).
- Save metadata to the `NginxFiles` collection after successful creation.

---

## 🧾 Card 8: Add File and Directory Validation Utility

### Description

Before attempting to read or write nginx configuration files, verify that the required directories and files exist within the project’s resource path. Implement this logic as a separate helper to keep route and module code clean.

### Requirements

- Add a utility function called `verifyTemplateFileExists()` in `src/utils/fileValidation.ts` (or similar).
- Confirm that `PATH_PROJECT_RESOURCES/createTemplateFile/` exists.
- Confirm that the requested `templateFileName` exists before proceeding.
- Return meaningful error responses if missing or inaccessible.

---

## 🧪 Card 9: Integration Test for Template File Processing

### Description

Create integration tests to verify that the new POST `/nginx/create-config-file` endpoint correctly validates, processes, and writes nginx configuration files using the provided templates.

### Requirements

- Use Jest and Supertest to simulate HTTP POST requests.
- Mock filesystem interactions where appropriate.
- Confirm that placeholder replacement is performed correctly.
- Ensure that MongoDB document creation occurs as expected in the `NginxFiles` collection.

### Card 10: Implement POST /nginx/create-config-file Endpoint (Part 3: Database Record)

- Create new NginxFile document with:
  - Primary server name (first in array)
  - Additional server names
  - Port number
  - Both machine IDs
  - Framework and store directory
- Save to database
- Return created document

### Card 12: Write Unit Tests for Nginx Routes

- Create `src/tests/nginxRoutes.test.ts`
- Mock database calls
- Mock file system operations
- Test GET /nginx success and error cases
- Test POST /nginx/create-config-file validation

### Card 13: Update API Documentation

- Update `docs/API_REFERENCE.md`
- Add `/nginx` section with:
  - GET /nginx endpoint documentation
  - POST /nginx/create-config-file endpoint documentation
  - Request/response examples
  - Error response codes and messages

---

## The404-Web To Do's

### Card 14: Create Machine Slice

- Create `src/store/features/machines/machineSlice.ts`
- Define `MachineState` interface with `machinesArray` and `connectedMachine`
- Create reducers: `setMachinesArray`, `connectMachine`, `disconnectMachine`
- Export typed hooks if needed

### Card 15: Update Store Configuration

- Add `machineSlice` to `rootReducer` in `src/store/index.ts`
- Ensure machine state is NOT in persist whitelist
- Test Redux DevTools shows new slice

### Card 16: Refactor User Slice

- Remove from `userSlice.ts`: `machineName`, `urlFor404Api`, `localIpAddress`, `nginxStoragePathOptions`
- Keep only authentication fields: `token`, `username`, `email`, `isAdmin`
- Update type definitions

### Card 17: Update AppHeader to Use Machine Slice

- Refactor `src/layout/AppHeader.tsx`
- Use `useAppSelector` to get `connectedMachine` from machine slice
- Display `machineName` and `urlFor404Api`
- Handle null connectedMachine state

### Card 18: Update Machines Page to Use Machine Slice

- Refactor `src/app/(dashboard)/servers/machines/page.tsx`
- Use `setMachinesArray` to populate machines
- Use `connectMachine` when user clicks "Connect Machine" button
- Dispatch to machine slice instead of user slice

### Card 19: Add DNS Parent NavItem to Sidebar

- Update `src/layout/AppSidebar.tsx`
- Add new parent NavItem: "DNS" or "Manage DNS"
- Use globe icon from `src/icons/`
- Add subItems array (placeholder paths)

### Card 20: Add Nginx SubItem to DNS Menu

- In `AppSidebar.tsx`, add subItem under DNS:
  - Name: "Nginx"
  - Path: `/dns/nginx`

### Card 21: Add Registrar SubItem to DNS Menu

- In `AppSidebar.tsx`, add subItem under DNS:
  - Name: "Registrar" or "GoDaddy"
  - Path: `/dns/registrar`

### Card 22: Create DNS Nginx Page Layout

- Create `src/app/(dashboard)/dns/nginx/page.tsx`
- Set up basic page structure with two sections:
  - Top: Form container
  - Bottom: Table container
- Add page heading and breadcrumbs

### Card 23: Create Machine Dropdown Components

- Create reusable dropdown component for selecting machines
- Fetch machines from Redux store (`machinesArray`)
- Display machine name and URL
- Return selected machine object on change

### Card 24: Create Nginx Host Machine Dropdown

- Add dropdown to form: "Nginx Host Machine"
- Populate from `machinesArray`
- Use machine dropdown component
- Save selected machine to form state

### Card 25: Create App Host Machine Dropdown

- Add dropdown to form: "App Host Machine"
- Populate from `machinesArray`
- Use machine dropdown component
- Save selected machine to form state

### Card 26: Create Server Names Input with Dynamic Add

- Add text input: "Primary Server Name"
- Add "+ Add Additional Server Name" button
- Allow multiple server name inputs
- Store as array in form state
- Validate format (domain/subdomain)

### Card 27: Create Port Number Input

- Add number input: "Port Number"
- Validate range (1-65535)
- Show validation errors

### Card 28: Create Framework Radio Buttons

- Add radio group: "App Technology"
- Options: ExpressJS, Next.js, Python
- Style with terminal theme
- Store selected value in form state

### Card 29: Create Store Directory Radio Buttons

- Add radio group: "Config Store Directory"
- Populate options from selected Nginx host's `nginxStoragePathOptions`
- Handle case when no Nginx host selected
- Store selected value in form state

### Card 30: Create Form Submit Handler

- Validate all required fields
- Show loading state during submission
- Call API to create nginx config
- Handle success: clear form, refresh table
- Handle errors: show error message

### Card 31: Create TableNginxFiles Component Structure

- Create `src/components/tables/TableNginxFiles.tsx`
- Set up table with columns:
  - Server Name
  - Port
  - App Host Machine
  - Nginx Host Machine
  - Last Modified
- Use terminal-themed table styling

### Card 32: Implement Data Fetching for TableNginxFiles

- Add `useEffect` to fetch nginx files on mount
- Use `connectedMachine.urlFor404Api` for API base URL
- Include JWT token from Redux
- Handle loading and error states

### Card 33: Populate TableNginxFiles with Data

- Map fetched nginx files to table rows
- Display machine names (not IDs)
- Format dates appropriately
- Handle empty state (no configs)

### Card 34: Add Refresh Functionality to Table

- Add refresh button above table
- Re-fetch data on click
- Show loading indicator during refresh

### Card 35: Create DNS Registrar Page Layout

- Create `src/app/(dashboard)/dns/registrar/page.tsx`
- Add placeholder heading: "DNS Registrar Management"
- Add note: "Porkbun API integration coming soon"

### Card 36: Create Registrar Form (Placeholder)

- Add form with fields:
  - Server name input
  - IP address input
  - TTL input
- Style consistently with nginx page
- Non-functional (no submit yet)

### Card 37: Create Registrar Table (Placeholder)

- Add empty table structure with columns:
  - Domain
  - IP Address
  - TTL
  - Last Modified
- Show "No records yet" message

### Card 38: Create Nginx API Helper - GET

- Create `src/utils/api/nginx.ts`
- Implement `getNginxFiles(token: string, apiBaseUrl: string)`
- Return typed response
- Handle network errors

### Card 39: Create Nginx API Helper - POST

- In `src/utils/api/nginx.ts`
- Implement `createNginxConfig(payload: CreateNginxConfigPayload, token: string, apiBaseUrl: string)`
- Define `CreateNginxConfigPayload` interface
- Return typed response
- Handle network errors

### Card 40: Manual Integration Test - Create Config

- Navigate to `/dns/nginx`
- Fill out form with test data
- Submit form
- Verify success message
- Verify new row appears in table

### Card 41: Manual Integration Test - File Verification

- SSH into maestro03 (Nginx host machine)
- Check `/etc/nginx/sites-available/` for new config file
- Verify file contents match form inputs
- Verify syntax: `sudo nginx -t`

### Card 42: UI Responsiveness QA

- Test form on mobile screen sizes
- Verify dropdowns work on touch devices
- Check table horizontal scroll
- Test sidebar collapse/expand

### Card 43: Theme Compliance Check

- Verify all new components use terminal color palette
- Check brand orange for primary actions
- Verify dark mode works correctly
- Test high contrast ratios

### Card 44: Update README with DNS Routes

- Add `/dns/nginx` route documentation
- Add `/dns/registrar` route documentation
- Update navigation menu structure
- Add machine slice documentation

### Card 45: Update CLAUDE_THE404_WEB.md

- Add DNS page section
- Document machine slice pattern
- Add API helper documentation
- Update component organization section

---

## Summary

**Total Cards:** 45

- **The404-API:** 13 cards
- **The404-Web:** 32 cards

**Estimated Effort per Card:** 1-3 hours of focused work

**Key Dependencies:**

- Cards 1-3 should be completed before Cards 4-8 (API foundation before routes)
- Cards 14-18 should be completed before Cards 22-45 (Redux refactor before new pages)
- API Cards 1-13 should be completed before Web Cards 38-41 (backend before frontend integration)
