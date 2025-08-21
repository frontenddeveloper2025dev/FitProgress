# Fitness Tracker Application

## Overview

This is a full-stack fitness tracking web application built with React and Express. The app allows users to log workouts, track exercises, view progress analytics, and manage their fitness journey with features like workout calendars, statistics dashboards, and exercise databases. The application uses a modern tech stack with TypeScript throughout, shadcn/ui components for the frontend, and Drizzle ORM for database management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** and follows a modern component-based architecture:

- **Routing**: Uses `wouter` for lightweight client-side routing with pages for Dashboard, Log Workout, Calendar, and Progress
- **UI Framework**: Implements **shadcn/ui** component library with **Radix UI** primitives for accessibility and **Tailwind CSS** for styling
- **State Management**: Uses **TanStack Query (React Query)** for server state management and data fetching with built-in caching
- **Form Handling**: **React Hook Form** with **Zod** schema validation for type-safe form management
- **Build Tool**: **Vite** for fast development and optimized production builds

### Backend Architecture
The server-side follows a **RESTful API** pattern with **Express.js**:

- **Runtime**: Node.js with **TypeScript** and ESM modules
- **API Structure**: RESTful endpoints for exercises (`/api/exercises`) and workouts (`/api/workouts`) with full CRUD operations
- **Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation for development, designed to easily swap to database persistence
- **Request Handling**: Express middleware for JSON parsing, CORS, error handling, and request logging
- **Development Server**: Integrated Vite middleware for hot module replacement in development

### Data Storage Architecture
The application uses **Drizzle ORM** with **PostgreSQL** for production data persistence:

- **Schema Design**: Type-safe schema definitions with three main entities:
  - `exercises`: Exercise library with categories, target muscles, and descriptions
  - `workouts`: Workout sessions with metadata like duration, calories, and notes
  - `workoutExercises`: Junction table linking exercises to workouts with sets, reps, weight, etc.
- **Database Provider**: Configured for **Neon Database** (serverless PostgreSQL)
- **Migrations**: Drizzle Kit for schema migrations with auto-generated SQL
- **Type Safety**: Full TypeScript integration with inferred types from database schema

### Component Architecture
The frontend follows a **component composition** pattern:

- **Page Components**: Top-level route components (Dashboard, LogWorkout, Calendar, Progress)
- **UI Components**: Reusable shadcn/ui components with consistent styling and behavior
- **Feature Components**: Domain-specific components like `StatsCard`, `WorkoutTimer`, and `Navigation`
- **Layout System**: Responsive design with mobile-first approach using Tailwind breakpoints

### State Management Strategy
The application uses a **server-first** state management approach:

- **Server State**: TanStack Query manages all API data with automatic caching, background updates, and optimistic updates
- **Client State**: React's built-in state (useState, useReducer) for local UI state like form inputs and modal visibility
- **Form State**: React Hook Form for complex form state with validation
- **No Global State Store**: Avoids Redux/Zustand complexity by leveraging React Query's built-in state management

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight client-side routing
- **react-hook-form** + **@hookform/resolvers**: Form handling with validation
- **zod**: Runtime type validation and schema definition

### Database & ORM
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migrations and schema management
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-zod**: Zod schema generation from Drizzle schemas

### UI & Styling
- **@radix-ui/react-***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx** + **tailwind-merge**: Conditional CSS class composition
- **lucide-react**: SVG icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

### Data Visualization
- **recharts**: React charting library for progress analytics
- **embla-carousel-react**: Touch-friendly carousel component

### Additional Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: URL-safe unique ID generation
- **cmdk**: Command palette component