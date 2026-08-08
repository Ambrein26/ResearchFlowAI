ResearchFlow AI - Project Master Tracker

Project Information

Project Name: ResearchFlow AI

Description: AI-powered Research Paper Analysis & Literature Review Platform built using React, FastAPI, Supabase, PostgreSQL, and Google Gemini AI.

Current Status

Current Milestone: Milestone 7 - Gemini AI Integration Completed

Current Working Pipeline: PDF Upload → FastAPI → PyMuPDF → Gemini → Structured AI Analysis

Project Progress: Approximately 35% (working core pipeline completed; database, frontend integration, authentication, advanced features, testing and deployment remain)

Completed Milestones

Phase 0 - Planning

Project finalized

Features finalized

Tech stack finalized

Folder structure planned

System architecture planned

Phase 1 - Environment Setup

Created project folder

Configured .gitignore

Installed Python

Installed Node.js

Installed VS Code

Created frontend, backend, docs and screenshots folders

Phase 2 - React Setup

React installed using Vite

JavaScript selected

Axios installed

React Router DOM installed

Phase 3 - FastAPI Setup

Virtual environment created

FastAPI installed

Uvicorn installed

requirements.txt generated

Structured app folders created

Phase 4 - Frontend ↔ Backend Connection

Created first FastAPI API

Tested API

Enabled CORS

Installed Axios

Created services/api.js

React successfully communicates with FastAPI

Phase 5 - Frontend Architecture & Routing

Created components, layouts, context, hooks, routes and utils folders

Created Landing/Home, Login, Register, Dashboard, Papers, Analysis, Workspace and Compare pages

Created MainLayout, AuthLayout and DashboardLayout

Implemented AppRoutes and BrowserRouter

Verified routes successfully

Phase 6 - PDF Processing

Installed PyMuPDF

Installed python-multipart

Created pdf_service.py

Created papers API route

Implemented PDF validation and upload

Implemented page-wise and full-text extraction

Tested successfully through Swagger

Phase 7 - Gemini AI Integration

Created backend .env for Gemini API key

Installed google-genai and python-dotenv

Created paper_analysis.py Pydantic schema

Created ai_service.py

Integrated Gemini with FastAPI

Implemented structured research-paper analysis

Tested successfully through Swagger

Installed Packages

Frontend

React

Vite

Axios

React Router DOM

Backend

FastAPI

Uvicorn

PyMuPDF

python-multipart

google-genai

python-dotenv

Pending / Planned Packages

Frontend

Tailwind CSS / UI dependencies as required by the existing frontend

Backend

SQLAlchemy

Alembic

PostgreSQL driver

Supabase integration

Current Backend Structure

backend/app/
├── api/routes/papers.py
├── core/
├── db/
├── models/
├── schemas/paper_analysis.py
├── services/pdf_service.py
├── services/ai_service.py
├── utils/
└── main.py

Next Milestone

Milestone 8 - Database Persistence

Create Supabase project/database

Configure database environment variables

Install SQLAlchemy and PostgreSQL driver

Create database configuration

Create Paper model

Create database table

Save Gemini analysis results

Test saved papers in Supabase