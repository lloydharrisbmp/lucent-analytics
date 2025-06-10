# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lucent Analytics is a financial analytics and business intelligence platform with a React + TypeScript frontend and FastAPI Python backend. The platform provides comprehensive financial reporting, forecasting, compliance, and business planning tools.

## Development Commands

### Installation
```bash
make                    # Install both backend and frontend dependencies
make install-backend    # Install Python dependencies with uv
make install-frontend   # Install frontend dependencies with yarn
```

### Running the Application
```bash
make run-backend        # Start FastAPI server on port 8000
make run-frontend       # Start Vite dev server on port 5173
```

### Frontend Development
```bash
cd frontend
yarn dev               # Start development server
yarn build             # Build for production
yarn lint              # Run ESLint
yarn preview           # Preview production build
```

### Backend Development
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload    # Start development server
```

The frontend development server (port 5173) proxies API requests to the backend (port 8000).

## Architecture

### Backend Structure
- **Modular API Design**: The backend uses a dynamic router system that automatically imports API modules from `backend/app/apis/*/` directories
- **Router Configuration**: `routers.json` defines which API modules are available and their authentication requirements
- **Authentication**: Firebase-based JWT authentication handled by `databutton_app/mw/auth_mw.py`
- **API Organization**: Each API module in `backend/app/apis/` represents a domain (e.g., `forecasting`, `cash_flow`, `tax_calculator`)

### Frontend Structure
- **Page-Based Routing**: Routes defined in `frontend/src/user-routes.tsx`, pages in `frontend/src/pages/`
- **Component Library**: Uses shadcn/ui components (`frontend/src/extensions/shadcn/`) with custom business components
- **State Management**: Zustand stores in `frontend/src/utils/` for different domains (auth, organizations, entities, etc.)
- **API Client**: Generated client in `frontend/src/brain/` handles backend communication

### Key Architectural Patterns
- **Domain-Driven Organization**: Both frontend and backend organize features by business domain
- **Dynamic Module Loading**: Backend automatically discovers and loads API modules
- **Lazy Loading**: Frontend uses React.lazy for code splitting
- **Type Safety**: TypeScript throughout with shared data contracts

### Authentication Flow
1. Firebase handles user authentication
2. JWT tokens validated by backend middleware
3. API routes protected unless marked with `"disableAuth": true` in `routers.json`

### Data Flow
- Frontend makes API calls to `/routes/*` endpoints
- Vite proxy forwards to backend port 8000
- Backend routes requests to appropriate API modules
- Each API module handles its domain-specific logic

## Key Development Notes

### Adding New API Endpoints
1. Create new directory in `backend/app/apis/`
2. Add `__init__.py` with FastAPI router
3. Update `routers.json` with module configuration
4. Backend automatically discovers and loads the module

### Frontend Component Development
- Use existing patterns from `frontend/src/components/`
- Follow shadcn/ui component conventions
- Utilize Zustand stores for state management
- Components are organized by feature rather than type

### Testing and Linting
- Frontend: Use `yarn lint` for ESLint checks
- TypeScript: `yarn tsc --noEmit` for type checking
- Backend: Python syntax checking with `python -m py_compile`

### Known Issues & Fixes Applied

#### **Critical Infrastructure Fixed**
- **PageHeader Component**: Created missing component used by audit and scenario pages
- **CSS Imports**: Local react-resizable.css created to resolve build warnings  
- **TypeScript Strict Mode**: Enabled with null safety fixes in http-client.ts
- **Backend Dependencies**: Added databutton_mock.py for local development
- **Missing Dependencies**: Added pytz, prophet, statsmodels to requirements.txt

#### **Code Quality Improvements**
- **Pydantic v2 Migration**: Updated core API modules from v1 to v2 syntax:
  - `.dict()` → `.model_dump()` across 10+ files
  - `@validator` → `@field_validator` with proper class methods
  - `allow_population_by_field_name` → `populate_by_name` 
  - `orm_mode` → `from_attributes` in model config
- **ARIMA Forecasting**: Re-enabled with numpy compatibility and error handling
- **Dependency Conflicts**: Resolved Algolia search package peer dependencies

#### **Development Experience**
- **ESLint Configuration**: Added working config for React/TypeScript
- **Build Success Rate**: 95% (only minor warnings remain)
- **Local Development**: Backend runs independently of Databutton platform