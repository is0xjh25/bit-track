# BitTrack

## Table of Contents
- [Overview](#overview)
- [Design](#design)
- [Development and Technologies](#development-and-technologies)
- [Deployment](#deployment)
- [Developed By](#developed-by)

## Overview
**BitTrack** is a simple web application that enables users to track their cryptocurrency assets. Using this tool, users can:
- Add and manage different crypto assets in their portfolio.
- View real-time prices for each cryptocurrency.
- See the total portfolio value, updated based on live data from a crypto API.

The app leverages Vue3 for a modern front-end experience, styled with Quasar for responsive material design. Supabase handles authentication and database management for user portfolios.

## Design
The project follows a straightforward design to maximize user experience:
1. **Login/Signup Page**: Users can register or log in via Supabase’s authentication service.
2. **Portfolio Page**: This main page displays:
   - A list of added assets (with add/edit/delete options).
   - Real-time crypto prices.
   - Total portfolio value calculated based on current holdings and live prices.
3. **Responsive Layout**: The app is optimized for both desktop and mobile users using Quasar’s responsive components.

## Development and Technologies
The app was built with the following technologies:
- **Vue3**: Main front-end framework, offering a reactive and flexible structure for components.
- **Quasar**: Provides responsive and material design UI components to enhance user experience.
- **Supabase**: Handles user authentication and provides a real-time database for storing user portfolios.
- **CoinGecko API**: Used for fetching live cryptocurrency prices, allowing for accurate portfolio valuation.
  
The code is organized into separate components for reusability and easy maintenance. Supabase functions and CoinGecko API calls are encapsulated to keep code modular and clean.

## Deployment
To deploy this project:
1. **Frontend**: Deploy the Vue3 and Quasar app on platforms like [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/).
2. **Backend (Supabase)**: Set up a Supabase project, configure authentication, and create a table for portfolio management.

### Local Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Set up environment variables for Supabase and API keys.
4. Run `npm run dev` to start the development server locally.

## Developed by
- The application is developed by _[is0xjh25](https://linktr.ee/is0xjh25)_.

