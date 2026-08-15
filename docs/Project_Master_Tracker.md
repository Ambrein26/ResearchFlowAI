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

ResearchFlow AI — Project Master Tracker

Current state after today's development session

Project Information

Item

Current Value

Project Name

ResearchFlow AI

Type

AI-powered Research Paper Analysis & Literature Review Platform

Frontend

React + Vite + Tailwind CSS

Backend

FastAPI

Database

PostgreSQL / Supabase

AI

Google Gemini

PDF Processing

PyMuPDF

ORM

SQLAlchemy

Current Stable Area

Paper upload → AI analysis → database → paper management → dynamic analysis

Next Major Feature

Research Workspace

Today's Completed Work

Verified the real database-backed Papers page.

GET /api/papers is working.

Paper cards display database records dynamically.

Paper search works.

Delete paper works.

View Analysis uses /analysis/:paperId.

GET /api/papers/{paper_id} is working.

Analysis.jsx fetches the selected paper dynamically.

Hardcoded analysis content was removed from the real workflow.

Analysis loading and error states were added.

Analysis fields are safely normalized when the backend returns strings or arrays.

Dashboard was verified as working.

Route/import issues affecting Profile, Workspace, Settings and Compare were resolved.

The real UUID paper-analysis page works correctly.

Backend Status

Component

Status

Notes

FastAPI app

Completed

Running successfully

CORS

Completed

Frontend communication enabled

PDF upload

Completed

PDF validation implemented

PDF extraction

Completed

PyMuPDF service

Gemini analysis

Completed

Structured analysis generated

Paper schema

Completed

Analysis fields defined

SQLAlchemy

Completed

ORM connected

PostgreSQL/Supabase

Completed

Paper records persist

POST /api/papers/analyze

Completed

Analyzes and saves paper

GET /api/papers

Completed

Returns saved papers

GET /api/papers/{paper_id}

Completed

Returns selected paper

DELETE /api/papers/{paper_id}

Completed

Delete verified

Frontend Status

Area

Status

Current Behavior

Dashboard

Working

Shows dashboard and upload navigation

Papers

Working

Loads real database papers

Upload modal

Working

Uploads and analyzes papers

Search

Working

Filters saved papers

Delete

Working

Deletes paper from backend

Analysis route

Working

/analysis/:paperId

Analysis page

Working

Displays selected database paper

Loading/error handling

Working

Added to dynamic pages

Compare

Foundation only

Needs implementation

Workspace

Foundation only

Needs implementation

Settings

Foundation only

UI exists; functionality pending

Profile

Foundation only

UI/route foundation

Authentication

Pending

UI/backend integration remains

Current Folder/Architecture Direction

Frontend: src/pages, src/components, src/layouts, src/routes, src/services.
Backend: app/main.py, app/api/routes, app/services, app/models, app/schemas, app/db, app/core, app/utils.

Current Milestone

Milestone 8 — Database persistence and the paper workflow have been completed. Dynamic paper analysis and paper management are also completed. The next development milestone is the Research Workspace.

Approximate Progress

Approximately 50% overall. The percentage is a planning estimate, not a measured metric.

Next Checkpoint

Research Workspace: make the workspace a real, paper-specific research area connected to the selected paper and backend data.

15.8
ResearchFlow AI — Project Master Tracker

Current state after the latest development session

Project Information

Project Name

ResearchFlow AI

Type

AI-powered Research Paper Analysis & Literature Review Platform

Frontend

React + Vite + Tailwind CSS

Backend

FastAPI

Database

PostgreSQL / Supabase

AI

Google Gemini

PDF Processing

PyMuPDF

ORM

SQLAlchemy

Authentication

Supabase Authentication

Current Stable Area

Authentication → paper workflow → database → dynamic analysis → Research Workspace foundation

Next Major Feature

Persistent AI Assistant conversation history

Today's Completed Work

Supabase authentication integrated into Login and Register.

AuthContext and ProtectedRoute implemented.

Authenticated navigation verified.

Profile connected to the authenticated Supabase user.

Settings page implemented.

Dashboard and application routes verified.

Paper-specific Research Workspace navigation corrected.

Notes and bookmarks database support created.

Existing paper upload, AI analysis, database persistence, listing, search, delete and dynamic analysis retained.

AI Assistant foundation exists; conversation persistence remains.

Backend Status

Phase / Area

Status

Current State

FastAPI

Completed

Running successfully

CORS

Completed

Frontend communication configured

PDF upload/extraction

Completed

Validation + PyMuPDF

Gemini analysis

Completed

Structured analysis

SQLAlchemy

Completed

ORM connected

PostgreSQL/Supabase

Completed

Persistence working

Paper APIs

Completed

Analyze, list, retrieve, delete

Notes

Completed

Backend/database foundation

Bookmarks

Completed

Backend/database foundation

Assistant

Foundation

Persistence next

Authentication

Completed

Supabase session integration

Authorization

Next

Verify user ownership across resources

Frontend Status

Phase / Area

Status

Current State

Landing

Completed

Public landing page

Login/Register

Completed

Supabase authentication

Dashboard

Working

Authenticated dashboard

My Papers

Working

Database-backed papers

Analysis

Working

Dynamic selected-paper analysis

Workspace

Working foundation

Opened from selected paper; notes/bookmarks supported

Compare

Foundation

Full implementation pending

AI Assistant

Foundation

Conversation history pending

Profile

Working

Authenticated account information

Settings

Working UI

Preferences/security sections

Protected routes

Completed

Unauthenticated users redirected

Next Checkpoint

Create assistant conversation and message persistence.

Associate conversations with users and optionally papers.

Verify user-specific notes, bookmarks, papers and conversations.

Complete local end-to-end testing.

Prepare and perform production deployment.

Latest update date: 15 August 2026