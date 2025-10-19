# EdTech

A comprehensive platform connecting mentors and mentees in the education technology sector, built with Angular and Firebase.

## Overview

EdTech is a web application designed to facilitate mentor-mentee relationships within the educational technology field. The platform provides an intelligent matching system, profile management, mentorship request workflow, and communication tools to support effective mentorship experiences.

## Features

### Mentor-Mentee Matching System
- **Intelligent Recommendation Engine**: AI-driven algorithm matching mentors and mentees based on skills, goals, location, availability, and other weighted factors
- **Advanced Search and Filtering**: Comprehensive search with filters for skills, industry, location, availability, and ratings
- **Profile Management**: Complete profile creation and management for both mentors and mentees

### Collaboration Tools
- **Request/Approval Workflow**: Streamlined system for sending, receiving, and managing mentorship requests
- **Messaging System**: Integrated communication platform for mentor-mentee conversations
- **Dashboard Access**: Separate dashboards for mentors and mentees to track active mentorships

### Core Functionality
- **Authentication System**: Secure login and signup with Firebase Auth
- **Profile Completion**: Guided onboarding process for comprehensive user profiles
- **Mentor Limits**: Configurable limits for active mentees per mentor
- **Notification System**: Real-time notifications for requests and updates

## Technology Stack

- **Frontend**: Angular 20 with TypeScript
- **Styling**: Tailwind CSS with DaisyUI components
- **Backend**: Firebase (Authentication, Firestore Database, Hosting)
- **Testing**: Jasmine and Karma
- **Package Management**: npm

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── auth/               # Authentication service
│   │   └── guards/             # Route guards
│   ├── shared/                 # Shared components and services
│   │   ├── components/         # Reusable UI components
│   │   ├── models/             # Data models
│   │   └── services/           # Shared business logic services
│   └── pages/                  # Application pages/routing modules
│       ├── auth/               # Authentication pages
│       ├── home/               # Home page
│       ├── matching/           # Mentor-mentee matching
│       ├── profile/            # User profiles
│       ├── messages/           # Messaging system
│       ├── mentor-dashboard/   # Mentor dashboard
│       ├── mentee-dashboard/   # Mentee dashboard
│       └── [other pages...]
├── environments/               # Environment configurations
└── styles.scss                 # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/krtdotcode/EdTech.git
   cd edtech
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication and Firestore Database
   - Copy your Firebase configuration to `src/environments/environment.ts`

4. **Configure your Firebase settings**
   - Replace the placeholder values in `src/environments/environment.ts` with your Firebase project configuration
   - Update Firestore rules if needed (see `firestore.rules`)
   - Configure Firestore indexes if required (see `firestore.indexes.json`)

### Development

1. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

2. **Run tests**
   ```bash
   npm test
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

### Deployment

The application can be deployed to Firebase Hosting:
```bash
firebase deploy
```

Make sure your Firebase project is configured and authenticated locally.

## Usage

### For New Users
1. Register an account through the signup page
2. Complete your profile during onboarding
3. Specify whether you're registering as a mentor or mentee
4. Start using the platform to find matches and request mentorships

### For Mentors
- Review incoming mentorship requests
- Manage active mentorship relationships
- Communicate with mentees through the messaging system
- Provide feedback and guidance

### For Mentees
- Browse mentor profiles and search for suitable matches
- Send mentorship requests to potential mentors
- Communicate with approved mentors
- Track progress and leave feedback

## API Services

The application provides several key services:

- **ProfileService**: Manages user profile data and mentorship requests
- **RecommendationService**: Handles AI-driven mentor recommendations
- **AuthService**: Manages user authentication
- **MessagingService**: Handles real-time messaging functionality

## Testing

Comprehensive unit and integration tests are provided:
```bash
npm test
```

Test coverage includes core services, components, and API integrations.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgment

Part of the code was inspired by the official Angular documentation and Firebase documentation.

## Credits

### Developers

**Kurt Joshua Cayaga**
- 3rd Year | BS Computer Science
- University of Cabuyao

**Jaireell Son Regala**
- 3rd Year | BS Information Technology
- Bulacan State University
