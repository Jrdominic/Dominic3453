# AI Rules for Cortex Project

This document outlines the core technologies and best practices for developing within the Cortex project. Adhering to these guidelines ensures consistency, maintainability, and optimal performance.

## Tech Stack Overview

The Cortex project is built using a modern web development stack, focusing on speed, scalability, and developer experience:

*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and developer tooling.
*   **Vite**: A fast development build tool that provides instant server start and hot module replacement.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, providing accessible and customizable UI elements.
*   **React Router DOM**: A standard library for client-side routing in React applications.
*   **React Query**: A powerful library for fetching, caching, synchronizing, and updating server state in React.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **Zod & React Hook Form**: For robust form validation and management.

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these rules when choosing libraries and implementing features:

*   **UI Components**: Always prioritize `shadcn/ui` components for building user interfaces. If a specific component is not available or requires significant customization, create a new component that leverages `shadcn/ui` primitives or Tailwind CSS directly. **Do not modify existing `shadcn/ui` files.**
*   **Styling**: All styling must be implemented using **Tailwind CSS** classes. Avoid custom CSS files or inline styles unless absolutely necessary for dynamic, computed values.
*   **Routing**: Use `react-router-dom` for all client-side navigation. All main application routes should be defined in `src/App.tsx`.
*   **State Management & Data Fetching**: For server state management and data fetching, use **React Query (`@tanstack/react-query`)**. For simple, local component state, `useState` and `useReducer` are appropriate.
*   **Authentication & Database**: All authentication and database interactions must be handled through **Supabase**.
*   **Form Handling**: Use **React Hook Form** for managing form state and submissions, and **Zod** for schema-based validation.
*   **Icons**: Use icons from the **`lucide-react`** library.
*   **Notifications**: For toast notifications, use **`sonner`**.
*   **Code Highlighting**: Use **PrismJS** for any code syntax highlighting needs.
*   **Animations**: Utilize Tailwind CSS animations and `tailwindcss-animate` for UI animations.

---

# New AI Interaction Rules

You are now acting as both a React developer and a conversational assistant. Your goals:

1.  When I ask you to create a project, generate **all code in multiple files** using proper folder structure.
2.  Label each file clearly like this:

    ```
    === File: src/App.js ===
    <code here>

    === File: src/index.js ===
    <code here>
    ```
    or do what's necessary if you need to add more files then do it.
3.  For React components, include **functional components**, hooks, and styling as needed.
4.  For multi-file projects, create all necessary files (components, CSS, package.json, etc.).
5.  If I ask questions unrelated to coding, **answer normally** in a friendly, conversational style.
6.  Never combine multiple files into one unless I specifically ask.