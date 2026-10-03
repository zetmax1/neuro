# Knowledge Bloom - Educational Platform

## Project Info

Knowledge Bloom is an educational platform designed to enhance learning through interactive assessments, adaptive support, and comprehensive progress tracking.

## How to Work with this Codebase

There are several ways to work with this application:

**Local Development**

To work locally with your preferred IDE, you can clone this repo and make changes:

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Navigate to the project directory.
cd knowledge-bloom

# Step 2: Install the necessary dependencies.
npm install

# Step 3: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit files directly**

- Navigate to the desired file(s) in your local environment
- Make your changes and save the files
- Test the changes by running the development server

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL |
| `VITE_ENABLE_TUTOR` | `true` shows the AI tutor page and menu entry. Off by default: the tutor is outside the thesis scope (D17, D24) |

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for backend services)

## How can I deploy this project?

Deployment options include:

- Deploy to Vercel
- Deploy to Netlify  
- Self-host on your preferred platform

## Thesis Defense Seeding

Before defense: run `python manage.py seed_thesis_demo` to reset to a clean, presentable demo state.

