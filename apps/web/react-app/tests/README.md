# Personality Spark Test Suite

This comprehensive Playwright test suite verifies all security and quality fixes implemented in the Personality Spark application. The tests are organized into categories covering security, frontend functionality, API behavior, and integration flows.

## Test Structure

```
tests/
├── pages/                 # Page Object Models
│   ├── HomePage.ts       # Home page interactions
│   ├── QuizListPage.ts   # Quiz listing page
│   ├── QuizPage.ts       # Quiz taking interface
│   ├── ResultPage.ts     # Results display page
│   └── BlogPage.ts       # Blog functionality
├── fixtures/             # Test data and helpers
│   ├── test-data.ts      # Mock data for tests
│   └── test-helpers.ts   # Utility functions
├── security/             # Security tests
│   ├── cors.spec.ts      # CORS validation
│   ├── xss.spec.ts       # XSS protection
│   ├── input-validation.spec.ts  # Input validation
│   └── rate-limiting.spec.ts     # Rate limiting
├── frontend/             # Frontend tests
│   ├── error-boundaries.spec.ts  # Error handling
│   ├── error-states.spec.ts      # Error UI states
│   ├── share-functionality.spec.ts # Share features
│   └── blog-sanitization.spec.ts  # Content sanitization
├── api/                  # API tests
│   ├── health-check.spec.ts      # Health endpoints
│   ├── request-tracking.spec.ts  # Request ID tracking
│   ├── error-responses.spec.ts   # Error formatting
│   └── cache-headers.spec.ts     # Caching behavior
└── integration/          # End-to-end tests
    ├── quiz-flow.spec.ts         # Complete quiz flows
    ├── blog-navigation.spec.ts   # Blog navigation
    └── error-recovery.spec.ts    # Error recovery flows
```

## Running Tests

### All Tests
```bash
npm test
```

### By Category
```bash
npm run test:security     # Security tests only
npm run test:frontend     # Frontend tests only
npm run test:api         # API tests only
npm run test:integration # Integration tests only
```

### By Browser
```bash
npm run test:chrome      # Chrome/Chromium only
npm run test:firefox     # Firefox only
npm run test:safari      # Safari/WebKit only
npm run test:mobile      # Mobile browsers
```

### Development
```bash
npm run test:headed      # With browser UI
npm run test:ui         # Interactive UI mode
npm run test:debug      # Debug mode
```

### Reports
```bash
npm run test:report     # View HTML report
```

## Test Categories

### Security Tests

#### CORS Protection (`security/cors.spec.ts`)
- ✅ Rejects unauthorized origins
- ✅ Allows authorized origins
- ✅ Handles preflight requests
- ✅ Doesn't expose sensitive headers

#### XSS Protection (`security/xss.spec.ts`)
- ✅ Sanitizes malicious blog content
- ✅ Prevents XSS in quiz content
- ✅ Sanitizes user form inputs
- ✅ Validates Content Security Policy
- ✅ Escapes HTML in error messages

#### Input Validation (`security/input-validation.spec.ts`)
- ✅ Rejects invalid quiz submissions
- ✅ Validates quiz ID parameters
- ✅ Validates result ID format
- ✅ Limits input length
- ✅ Validates email formats
- ✅ Prevents path traversal attacks

#### Rate Limiting (`security/rate-limiting.spec.ts`)
- ✅ Enforces API rate limits
- ✅ Different limits for different endpoints
- ✅ Resets after time window
- ✅ Handles UI rate limit gracefully

### Frontend Tests

#### Error Boundaries (`frontend/error-boundaries.spec.ts`)
- ✅ Handles component errors gracefully
- ✅ Recovers from errors on retry
- ✅ Handles async errors in quiz flow
- ✅ Handles network timeouts
- ✅ Logs errors appropriately
- ✅ Doesn't expose sensitive information

#### Error States (`frontend/error-states.spec.ts`)
- ✅ Quiz list error handling
- ✅ Quiz loading error handling
- ✅ Result loading error handling
- ✅ Blog loading error handling
- ✅ Maintains context during recovery

#### Share Functionality (`frontend/share-functionality.spec.ts`)
- ✅ Copies share links to clipboard
- ✅ Handles clipboard API unavailability
- ✅ Generates shareable cards
- ✅ Shares to social media platforms
- ✅ Tracks share events
- ✅ Proper Open Graph meta tags
- ✅ Modal accessibility
- ✅ Text-only share options

#### Blog Sanitization (`frontend/blog-sanitization.spec.ts`)
- ✅ Sanitizes malicious HTML
- ✅ Sanitizes blog list previews
- ✅ Handles data URLs safely
- ✅ Preserves safe HTML formatting
- ✅ Handles markdown content safely
- ✅ Limits external resource loading
- ✅ Handles HTML entities properly

### API Tests

#### Health Check (`api/health-check.spec.ts`)
- ✅ Working health endpoint
- ✅ Proper content types
- ✅ No authentication required
- ✅ Fast response times
- ✅ Service dependency status
- ✅ HEAD request support
- ✅ Proper cache headers

#### Request Tracking (`api/request-tracking.spec.ts`)
- ✅ Includes X-Request-ID headers
- ✅ Generates unique request IDs
- ✅ Accepts client-provided IDs
- ✅ Includes ID in error responses
- ✅ Propagates IDs through API calls
- ✅ Handles ID in CORS preflight
- ✅ Validates request ID format

#### Error Responses (`api/error-responses.spec.ts`)
- ✅ Structured 404 errors
- ✅ Invalid request body handling
- ✅ Validation error details
- ✅ Doesn't expose internal errors
- ✅ Method not allowed errors
- ✅ Consistent error format
- ✅ Content negotiation errors
- ✅ Sanitizes error messages

#### Cache Headers (`api/cache-headers.spec.ts`)
- ✅ Appropriate cache headers for static assets
- ✅ No caching for API responses
- ✅ Short TTL for quiz lists
- ✅ No caching for user-specific data
- ✅ Conditional requests with ETag
- ✅ Last-Modified headers
- ✅ Content type specific caching
- ✅ Vary headers for content negotiation

### Integration Tests

#### Quiz Flow (`integration/quiz-flow.spec.ts`)
- ✅ Complete flow from home to results
- ✅ Quiz abandonment and resumption
- ✅ Network interruption handling
- ✅ Answer validation before submission
- ✅ Progress and completion tracking
- ✅ Multiple quizzes in succession
- ✅ User preference preservation
- ✅ Deep linking to results
- ✅ Browser navigation handling

#### Blog Navigation (`integration/blog-navigation.spec.ts`)
- ✅ Home to blog navigation
- ✅ Blog post loading errors
- ✅ Proper content structure
- ✅ Pagination support
- ✅ Reading analytics tracking
- ✅ Related posts navigation
- ✅ Search functionality
- ✅ Categories and tags
- ✅ Reading position preservation

#### Error Recovery (`integration/error-recovery.spec.ts`)
- ✅ API error recovery during quiz flow
- ✅ Submission error retry
- ✅ Application state maintenance
- ✅ Cascading error handling
- ✅ Authentication error handling
- ✅ Browser storage error recovery
- ✅ Mixed content security errors
- ✅ User-friendly error messages

## Test Helpers and Utilities

### Page Object Models
Each page object provides a clean interface for interacting with specific app sections:

- **HomePage**: Hero section, navigation, feature showcase
- **QuizListPage**: Quiz selection, loading states, error handling
- **QuizPage**: Question answering, progress tracking, submission
- **ResultPage**: Results display, sharing, personality analysis
- **BlogPage**: Post listing, content display, navigation

### Test Data (`fixtures/test-data.ts`)
- Mock quiz data with realistic questions and answers
- Blog post content with various formatting
- API response templates for success and error scenarios  
- Malicious input samples for security testing

### Test Helpers (`fixtures/test-helpers.ts`)
- `setupSuccessfulMocks()`: Configure happy path API responses
- `setupErrorMocks()`: Configure various error scenarios
- `setupRateLimit()`: Simulate rate limiting behavior
- `simulateSlowNetwork()`: Test slow network conditions
- `checkSecurityHeaders()`: Validate security headers
- `injectMaliciousContent()`: Test XSS protection
- `checkBasicAccessibility()`: Basic accessibility checks
- `testKeyboardNavigation()`: Keyboard navigation testing
- `measurePerformance()`: Performance metrics collection

## Configuration

### Playwright Config (`playwright.config.ts`)
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile testing (iPhone, Android)
- Automatic dev server startup
- Screenshot and trace on failure
- Parallel test execution

### Environment Setup
Tests expect the app to be running on `http://localhost:3000`. The dev server is automatically started before tests run.

## Best Practices

### Writing Tests
1. Use page objects for maintainable tests
2. Mock external dependencies consistently
3. Test both success and failure scenarios
4. Include accessibility checks where relevant
5. Use descriptive test names and organize logically

### Security Testing
1. Test with realistic malicious inputs
2. Verify proper sanitization and encoding
3. Check security headers on all endpoints
4. Test rate limiting and abuse prevention
5. Validate CORS configuration

### Error Testing
1. Test all error states in the UI
2. Verify error recovery mechanisms
3. Check error message quality and safety
4. Test network failure scenarios
5. Validate user experience during errors

## Running in CI/CD

The tests are configured to run in CI with:
- Headless mode by default
- Retry on failure
- HTML report generation
- Screenshot and trace capture on failure

## Maintenance

### Adding New Tests
1. Identify the appropriate category (security/frontend/api/integration)
2. Use existing page objects where possible
3. Add new mock data to `test-data.ts` if needed
4. Follow the established naming conventions
5. Include both positive and negative test cases

### Updating Existing Tests
1. Update page objects when UI changes
2. Adjust mock data when API contracts change
3. Review security tests when new vulnerabilities are discovered
4. Update integration tests when user flows change

## Troubleshooting

### Common Issues
- **Tests timing out**: Increase timeout or improve loading performance
- **Flaky tests**: Add proper waits and make assertions more robust
- **Mock issues**: Ensure mock routes match actual API endpoints
- **Browser differences**: Check browser-specific behaviors

### Debug Tools
- Use `test:debug` to step through tests
- Use `test:headed` to see browser interactions
- Use `test:ui` for interactive test development
- Check HTML reports for detailed failure information