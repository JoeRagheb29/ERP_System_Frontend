# ERP System Frontend

Frontend for a role-based ERP platform built with React and Vite.

The UI is organized around three main domains:

- Authentication and onboarding
- Authenticated dashboard shell with navigation
- Organization administration with RBAC-driven access control

The frontend talks to a FastAPI backend through a shared Axios client and keeps authentication state in Zustand.

## Tech Stack

- React 19
- Vite
- React Router
- Zustand
- React Hook Form
- Zod
- Axios
- Tailwind CSS
- Font Awesome

## Project Structure

```text
src/
  App.jsx
  main.jsx
  api/
    auth.api.js
    client.js
  layouts/
    DashboardLayout.jsx
    OnboardingPage.jsx
    Sidebar.jsx
    Topbar.jsx
  routes/
    ProtectedRoute.jsx
  store/
    auth.store.js
  RBAC/
    checkPermission.util.js
    hooks.util.js
  features/
    auth/
      components/
        Feild.jsx
      hooks/
        uselogin.js
        Useregister.js
      pages/
        LoginPage.jsx
        RegisterPage.jsx
    Organization/
      components/
        CapabilitiesPanel.jsx
        DeptBadge.jsx
        MembersSection.jsx
        RoleBadge.jsx
        RoleEditor.jsx
        RoleReferencePanel.jsx
        UserAvatar.jsx
      constants/
        rolesPermissions.constants.js
      pages/
        DashboardPage.jsx
        RolesPermissionsPage.jsx
    HR/
    Inventory/
    Reports/
    Sales/
```

## How The App Works

### Entry Point

- [src/main.jsx](src/main.jsx) mounts the React app inside `StrictMode`.
- [src/App.jsx](src/App.jsx) creates the router, bootstraps authentication on startup, and defines the public and protected routes.

### Authentication Flow

- [src/store/auth.store.js](src/store/auth.store.js) stores the token, user, permissions, and initialization state using Zustand with persistence.
- [src/api/client.js](src/api/client.js) is the shared Axios client.
  - It attaches the Bearer token on every request.
  - It logs the user out automatically on `401` responses.
- [src/api/auth.api.js](src/api/auth.api.js) contains auth-specific requests such as login, current user, and permissions fetches.

### Route Protection

- [src/routes/ProtectedRoute.jsx](src/routes/ProtectedRoute.jsx) handles authentication checks, onboarding redirects, and permission-based access control.
- The RBAC helpers live in [src/RBAC/checkPermission.util.js](src/RBAC/checkPermission.util.js) and [src/RBAC/hooks.util.js](src/RBAC/hooks.util.js).

### Layout Shell

- [src/layouts/DashboardLayout.jsx](src/layouts/DashboardLayout.jsx) is the authenticated shell.
- [src/layouts/Sidebar.jsx](src/layouts/Sidebar.jsx) renders the left navigation.
- [src/layouts/Topbar.jsx](src/layouts/Topbar.jsx) renders the top header.
- [src/layouts/OnboardingPage.jsx](src/layouts/OnboardingPage.jsx) handles the first-run organization setup flow.

## Feature Breakdown

### Auth Feature

- [src/features/auth/pages/LoginPage.jsx](src/features/auth/pages/LoginPage.jsx) renders the sign-in screen.
- [src/features/auth/pages/RegisterPage.jsx](src/features/auth/pages/RegisterPage.jsx) renders the owner signup screen.
- [src/features/auth/hooks/uselogin.js](src/features/auth/hooks/uselogin.js) wraps the login API flow.
- [src/features/auth/hooks/Useregister.js](src/features/auth/hooks/Useregister.js) wraps the registration API flow.
- [src/features/auth/components/Feild.jsx](src/features/auth/components/Feild.jsx) is a reusable form field wrapper.

### Organization Feature

- [src/features/Organization/pages/DashboardPage.jsx](src/features/Organization/pages/DashboardPage.jsx) is the default dashboard landing page.
- [src/features/Organization/pages/RolesPermissionsPage.jsx](src/features/Organization/pages/RolesPermissionsPage.jsx) is the main RBAC management screen.
- [src/features/Organization/constants/rolesPermissions.constants.js](src/features/Organization/constants/rolesPermissions.constants.js) centralizes role metadata, department metadata, colors, and table-access helpers.
- [src/features/Organization/components/MembersSection.jsx](src/features/Organization/components/MembersSection.jsx) renders the member list, add-member form, edit actions, and empty/error/loading states.
- [src/features/Organization/components/RoleReferencePanel.jsx](src/features/Organization/components/RoleReferencePanel.jsx) lets the user preview each role and see its access profile.
- [src/features/Organization/components/CapabilitiesPanel.jsx](src/features/Organization/components/CapabilitiesPanel.jsx) visualizes table-level access by module.
- [src/features/Organization/components/RoleEditor.jsx](src/features/Organization/components/RoleEditor.jsx) handles inline role assignment.
- [src/features/Organization/components/RoleBadge.jsx](src/features/Organization/components/RoleBadge.jsx) renders a role label badge.
- [src/features/Organization/components/DeptBadge.jsx](src/features/Organization/components/DeptBadge.jsx) renders the department badge.
- [src/features/Organization/components/UserAvatar.jsx](src/features/Organization/components/UserAvatar.jsx) renders the member avatar initials.

### Module Placeholders

- [src/features/HR](src/features/HR)
- [src/features/Inventory](src/features/Inventory)
- [src/features/Reports](src/features/Reports)
- [src/features/Sales](src/features/Sales)

These folders are reserved for future module-specific pages and components.

## Routing Map

- `/login` - sign in
- `/register` - owner registration
- `/onboarding` - organization setup
- `/dashboard` - main landing page after login
- `/inventory/*` - inventory module pages
- `/hr/*` - HR module pages
- `/sales/*` - sales module pages
- `/admin/roles` - roles and permissions management
- `/admin/activity-logs` - activity logs placeholder
- `/unauthorized` - access denied screen

## Environment Configuration

Create a `.env` file in the frontend root if you need to override the backend URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If `VITE_API_BASE_URL` is not set, the app falls back to `http://127.0.0.1:8000`.

## Run The Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- The frontend expects the backend to support the auth and organization endpoints used by the Axios client.
- The dashboard and module pages are intentionally split so each feature can grow independently.
- Some folders under `HR`, `Inventory`, `Reports`, and `Sales` are still placeholders for future work.
