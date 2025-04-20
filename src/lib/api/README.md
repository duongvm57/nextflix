# API Architecture

This directory contains the API architecture for the application. The architecture is designed to be clean, maintainable, and easy to understand.

## Structure

The API architecture is divided into three layers:

1. **API Client Layer** (`client.ts`): Responsible for making HTTP requests to the external API. This layer handles low-level concerns such as:
   - Making HTTP requests
   - Error handling
   - Retry logic
   - Timeout handling

2. **Service Layer** (`services.ts`): Responsible for business logic and data transformation. This layer:
   - Uses the API Client to fetch data
   - Transforms API responses into application models
   - Handles caching
   - Implements business logic

3. **API Route Layer** (in `src/app/api/`): Responsible for exposing API endpoints to the client. This layer:
   - Uses the Service Layer to fetch data
   - Handles request/response formatting
   - Implements caching headers
   - Handles authentication (if needed)

## Usage

### Importing

You can import the API functions from the `@/lib/api` module:

```typescript
import { getCategories, getMovies, getMovieDetail } from '@/lib/api';
```

### Examples

```typescript
// Fetch categories
const categories = await getCategories();

// Fetch movies
const movies = await getNewMovies(1);

// Fetch movie detail
const movie = await getMovieDetail('movie-slug');
```

## Migration from old API

The old API (`src/services/phimapi.ts`) is deprecated and will be removed in the future. Please use `@/lib/api` instead.

The old API is kept for backward compatibility, but all new code should use the new API architecture.

## Benefits of the New Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility, making the code easier to understand and maintain.
2. **Testability**: Each layer can be tested independently.
3. **Reusability**: The API Client and Service Layer can be reused across different parts of the application.
4. **Maintainability**: Changes to the external API only require changes to the API Client layer.
5. **Consistency**: All API calls follow the same pattern, making the code more consistent.
