ResearchFlow AI — Development Journal

Updated with today's completed work and current checkpoint

Project

ResearchFlow AI — AI-powered Research Paper Analysis & Literature Review Platform

Day 1 — Planning & Project Setup

Completed

Planned the complete project

Finalized the technology stack

Created the project structure

Configured .gitignore

Learned

Project planning

Folder organization

Git and .gitignore

Day 2 — React & FastAPI Setup

Completed

Installed React using Vite

Installed FastAPI and Uvicorn

Created the backend structure

Created the first FastAPI application

Created the first API endpoint

Ran the backend server

Explored Swagger documentation

Learned

FastAPI

REST APIs

JSON

HTTP requests and responses

Day 3 — Frontend ↔ Backend Connection

Completed

Enabled CORS

Installed Axios

Created the frontend API service

Connected React with FastAPI

Displayed the backend response in React

Learned

Axios

useState

useEffect

Frontend-backend communication

CORS

Day 4 — Frontend Architecture & Routing

Completed

Installed React Router DOM

Created professional frontend folders

Created pages and layouts

Created AppRoutes

Configured BrowserRouter

Fixed Vite import/path errors

Verified application navigation

Learned

React Router

Pages

Layouts

Components

Route configuration

Debugging import paths

Day 5 — Paper Upload & PDF Processing

Completed

Created Upload Paper modal

Connected paper upload UI to FastAPI

Added PDF validation

Implemented PDF text extraction using PyMuPDF

Added page-count and extracted-text handling

Tested PDF extraction through Swagger

Learned

Multipart uploads

UploadFile

PyMuPDF

PDF processing

FastAPI service separation

Day 6 — Gemini AI Analysis

Completed

Configured Gemini API access using environment variables

Installed the Gemini SDK and dotenv support

Created the AI analysis service

Created a structured Pydantic analysis schema

Connected extracted PDF text to Gemini

Implemented research-paper analysis

Resolved the unavailable gemini-2.5-flash model error by switching to an available model

Verified AI analysis successfully

Learned

Gemini API integration

API-key security

Pydantic structured output

Prompt/service design

AI error handling

Day 7 — Database Persistence

Completed

Configured PostgreSQL/Supabase database connection

Configured SQLAlchemy

Created the Paper database model

Created the database table

Connected the analyze endpoint to the database

Saved analyzed paper metadata and AI results

Added commit, refresh and rollback handling

Verified that a paper was saved successfully

Learned

SQLAlchemy ORM

PostgreSQL/Supabase

Database models

Transactions

Rollback and persistence

Day 8 — Paper Management

Completed

Implemented GET /api/papers

Connected the Papers page to the backend

Replaced temporary hardcoded paper data with database data

Added paper search

Displayed title, authors, date and page count

Implemented delete paper functionality

Refreshed the Papers page after upload/delete

Verified delete works

Learned

REST GET endpoints

Dynamic React state

API-driven UI

Delete operations

Frontend refresh workflow

Day 9 — Dynamic Paper Analysis

Completed

Implemented and tested GET /api/papers/{paper_id}

Confirmed dynamic route /analysis/:paperId

Updated Analysis.jsx to use useParams

Removed hardcoded analysis content

Fetched the selected paper from FastAPI

Added loading state

Added error state

Added safe handling for strings and arrays

Displayed TL;DR, summary, contributions, methodology, dataset, model, findings, limitations, future work and keywords from the database

Added print/export action

Verified that a real paper UUID opens its actual analysis page

Fixed blank/loading analysis-page issues

Learned

useParams

Dynamic routing

API-driven analysis pages

Loading/error states

Defensive data normalization

Day 10 — Dashboard & Route Stabilization

Completed

Verified the Dashboard displays correctly

Verified Papers → View Analysis navigation

Verified real paper analysis URLs

Resolved route/component import issues for Profile and other pages

Resolved Workspace loading issue

Confirmed /compare, /workspace and /settings render without hanging

Confirmed delete operation continues to work

Established the current stable checkpoint before continuing the Research Workspace

Learned

Route debugging

Component path consistency

Navigation flow

Stable project checkpoint

Current Working Workflow

Dashboard → Papers → Upload Paper → FastAPI PDF Processing → Gemini Analysis → PostgreSQL/Supabase Save → Papers List → View Analysis → Dynamic Analysis/{paperId}.

The paper shown in the Analysis page is now loaded from the database using the real paper ID; the Analysis page is no longer based on hardcoded sample data.

Current Checkpoint

The upload, AI analysis, database persistence, paper listing, search, delete, dynamic paper retrieval and dynamic analysis workflow are working. The project is ready to continue with the Research Workspace.

Next Goal

Build the Research Workspace around a selected paper.

Connect Workspace data to the backend/database.

Then implement paper comparison and literature-review functionality.

Continue with notes, bookmarks, search, contextual AI, profile/authentication, testing, deployment and documentation.

15.08
ResearchFlow AI — Development Journal

Updated with the latest completed work and current checkpoint

Project

ResearchFlow AI — AI-powered Research Paper Analysis & Literature Review Platform

Latest Development Session — Authentication & Application Integration

Completed

Integrated Supabase Authentication into the React application.

Updated AuthContext to manage the authenticated user and authentication state.

Implemented protected routing for authenticated application pages.

Updated Login and Register to use Supabase authentication successfully.

Resolved development authentication issues related to email confirmation.

Connected authenticated user information to the Profile page.

Implemented Profile showing account name, email address, and account creation date.

Implemented Settings with workspace preferences, notification preferences, and authentication/security information.

Stabilized layouts, navigation, and route/import issues.

Verified Dashboard, Papers, Analysis, Compare, Workspace, Profile, and Settings rendering.

Corrected the Research Workspace flow so it opens from a selected paper rather than as a generic workspace page.

Implemented database support for research notes and bookmarks.

Maintained the existing AI Assistant foundation and identified persistent conversation history as the next backend task.

Existing Stable Workflow

React + Vite + Tailwind CSS frontend connected to FastAPI.

PDF upload and validation with PyMuPDF.

Gemini structured research-paper analysis.

PostgreSQL/Supabase persistence through SQLAlchemy.

Dynamic paper listing, search, deletion, and analysis using real database IDs.

Current Application Flow

User registers/signs in through Supabase Authentication.

Authenticated users enter the protected Dashboard.

Users upload papers and the existing FastAPI → PyMuPDF → Gemini → PostgreSQL/Supabase workflow processes them.

Saved papers appear in My Papers and View Analysis opens the selected paper dynamically.

The selected paper can open its Research Workspace containing notes and bookmarks.

Profile and Settings provide account and workspace information.

AI Assistant is available; persistent conversation history is the next implementation target.

What Was Learned

Supabase Authentication and session handling.

React authentication context and protected routes.

Authenticated navigation and user metadata.

Paper-specific dynamic routing.

Database-backed workspace notes and bookmarks.

Next Development Goal

Add persistent AI Assistant conversations and messages.

Connect Assistant history to the existing AI service and UI.

Verify user-specific ownership/authorization.

Run complete end-to-end testing.

Prepare production configuration and deploy.

Latest update date: 15 August 2026