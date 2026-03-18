Online Rating on Stores
Description

Online Rating on Stores is a full-stack web application that allows users to rate stores on a scale of 1 to 5. The system provides role-based access for Administrator, Normal User, and Store Owner, enabling store management, rating submission, and performance tracking.

Tech Stack

Frontend: React.js

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT

Features

Role-based authentication and authorization

Store rating system (1 to 5)

Search and filter functionality

Secure API using JWT

Form validations

User Roles
Administrator

Add and manage users and stores

View dashboard statistics

Apply filters and view user/store details

Normal User

Register and login

Browse and search stores

Submit and update ratings

Store Owner

View users who rated their store

Check average rating

Installation and Setup
Step 1: Clone the Repository
git clone https://github.com/Audi-Meghana/Store-plus.git
cd Store-plus
Step 2: Backend Setup
cd backend
npm install

Create a .env file inside the backend folder and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Run the backend server:

npm start
Step 3: Frontend Setup

Open a new terminal and run:

cd frontend
npm install
npm start
Project Structure
backend/
frontend/
README.md
