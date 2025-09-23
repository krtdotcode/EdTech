# MentoringApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Mentor-Mentee Matching Features

This application includes a comprehensive mentor-mentee matching system with the following features:

### 1. Profile Data Management
- **Database Schema:** Defined for `MentorProfile`, `MenteeProfile`, and `MentorshipRequest` in `src/app/shared/models/profile.model.ts`.
- **API Endpoints:** Implemented in `src/app/shared/services/profile.service.ts` for retrieving and updating mentor and mentee profiles.

### 2. Search & Filtering
- **Frontend UI:** Components for search bar and filter options (skills, goals, industry, location, availability, ratings) are available in `src/app/pages/matching/matching.html`.
- **Backend Logic:** Implemented in `src/app/pages/matching/matching.ts` and `src/app/shared/services/profile.service.ts` for searching and filtering mentor profiles.
- **Display Results:** Search results are displayed in `src/app/pages/matching/matching.html`.

### 3. Recommendation Engine
- **Algorithm Design:** An AI-driven recommendation algorithm based on profile matching, goals, and weighted factors (e.g., skill overlap > location > availability) is implemented.
- **Backend Service & API:** The `src/app/shared/services/recommendation.service.ts` contains the logic and acts as the API endpoint for mentor recommendations.
- **Display Recommendations:** Recommended mentors are displayed in `src/app/pages/matching/matching.html`.

### 4. Request/Approval Workflow
- **Database Schema:** Defined for mentorship requests in `src/app/shared/models/profile.model.ts`.
- **Frontend UI (Mentee):** Mentees can send mentorship requests via `src/app/pages/matching/matching.html` and `src/app/pages/matching/matching.ts`.
- **Frontend UI (Mentor):** Mentors can view and manage pending requests (accept/reject) in `src/app/pages/mentor-requests/mentor-requests.html` and `src/app/pages/mentor-requests/mentor-requests.ts`.
- **Backend API Endpoints:** Implemented in `src/app/shared/services/profile.service.ts` for creating, accepting, and rejecting requests.
- **Configurable Limit:** Logic for limiting active mentees per mentor is implemented in `src/app/shared/services/profile.service.ts`.
- **Notification System:** Basic notification (console logs and alerts) for requests and approvals/rejections is in place.

### 5. Testing
- **Unit and Integration Tests:** Comprehensive tests are provided for:
    - `ProfileService`: `src/app/shared/services/profile.service.spec.ts`
    - `RecommendationService`: `src/app/shared/services/recommendation.service.spec.ts`
    - `Matching Component`: `src/app/pages/matching/matching.spec.ts`
    - `MentorRequests Component`: `src/app/pages/mentor-requests/mentor-requests.spec.ts`

### 6. Styling
- **DaisyUI and Tailwind CSS:** All relevant frontend components have been converted to use DaisyUI and Tailwind CSS for modern and responsive styling.
