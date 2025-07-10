# FotoFlow Client

This is the client-side of the FotoFlow application.

## Installation

To install the dependencies, run the following command:

```bash
bun install
```

## Available Scripts

In the project directory, you can run:

### `bun run dev`

Runs the app in the development mode.<br />
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `bun run build`

Builds the app for production to the `dist` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `bun run lint`

Lints the project files using ESLint.

### `bun run preview`

Previews the production build locally.

## Project Structure

Here is a breakdown of the project's directory structure:

- **`src/app`**: Contains the Redux store configuration, including slices, thunks, and custom hooks.
- **`src/assets`**: Static assets such as images and icons.
- **`src/components`**: Reusable React components used throughout the application.
  - **`src/components/ui`**: UI components, likely from a component library like shadcn/ui.
- **`src/hooks`**: Custom React hooks for shared logic.
- **`src/layout`**: Components that define the overall structure of the application, such as the main layout.
- **`src/lib`**: Utility functions and helper scripts.
- **`src/pages`**: Top-level components for each page or route in the application.
  - **`src/pages/auth`**: Pages related to user authentication (e.g., Login, Register).
  - **`src/pages/Main`**: Core pages of the application accessible after authentication.
- **`src/routes`**: Components and configuration for routing, including protected routes.
- **`src/service`**: Services for communicating with the backend API.
- **`src/types`**: TypeScript type definitions for data structures used in the application.
