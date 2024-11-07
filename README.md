# BitTrack
<p align="left">
  <img alt="Logo" src="public/bit-track-logo.png" width="250" >


## Table of Contents
- [Overview](#overview)
- [Design](#design)
- [Development and Technologies](#development-and-technologies)
- [Deployment](#deployment)
- [Developed By](#developed-by)

# BitTrack

## Overview
**BitTrack** is a web application designed to help users manage and monitor their cryptocurrency portfolios. With BitTrack, users can:
- Add and manage a variety of crypto assets in their portfolio.
- View real-time prices for each cryptocurrency.
- Track their total portfolio value, dynamically updated based on live data from a crypto API.
- Receive live investment suggestions from an AI consultant tailored to their current asset holdings.

The app is built with Vue3 for a modern front-end experience and styled with Quasar for responsive material design. Supabase handles user authentication, database management for user portfolios, and supports password reset functionality.

## Design
The project is crafted with a clean, intuitive design to maximize user experience across various devices. The main pages are:

1. **Login/Signup/Reset Password Page**: This page allows users to register or log in through Supabase’s authentication service, with a reset password feature for seamless account recovery.

2. **Portfolio Page**: The central hub for portfolio management, displaying:
   - A list of added assets with options to add, edit, or delete holdings.
   - Real-time cryptocurrency prices, updated continuously.
   - Total portfolio value, calculated dynamically based on live data.
   - AI-powered investment suggestions tailored to the user’s asset allocation, providing insights and tips to enhance decision-making.

3. **Market Page**: This page offers an overview of live market data, including the latest prices and trends for a wide range of cryptocurrencies, helping users stay informed on broader market movements.

4. **AI Consultant Page**: Dedicated to providing live, personalised investment suggestions. Based on the user’s portfolio and market conditions, the AI consultant offers real-time insights and recommendations to support informed investment decisions.

5. **Responsive Layout**: The app is optimized for both desktop and mobile users, utilising Quasar’s responsive components to ensure a smooth and accessible experience across different devices.

## Development and Technologies
The app is built using the following technologies:

- **Vue3**: The primary front-end framework, offering a reactive and modular structure for components.
- **Quasar**: Provides responsive and material design UI components to improve user experience.
- **Supabase**: Manages user authentication, enables a secure password reset feature, and offers a real-time database for storing portfolios.
- **CoinGecko API**: Fetches live cryptocurrency prices, ensuring accurate portfolio valuation.
- **AI Consultant**: An integrated AI assistant that analyzes the user's current asset holdings and provides real-time investment recommendations to support informed decision-making.
  
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

