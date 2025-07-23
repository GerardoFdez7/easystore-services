# Authentication Guard

This module provides JWT-based authentication for the EasyStore services backend.

## Features

- **Global Authentication**: All GraphQL operations require a valid JWT token by default
- **Public Routes**: Register and login operations are marked as public and don't require authentication
- **JWT Token Validation**: Validates tokens using the existing JWT handler
- **User Context**: Authenticated user information is available in resolvers

## Usage

### Public Routes

To mark a resolver method as public (no authentication required), use the `@Public()` decorator:

```typescript
import { Public } from '../infrastructure/decorators/public.decorator';

@Public()
@Mutation(() => AuthIdentityType)
async register(@Args('input') input: RegisterAuthInput): Promise<AuthIdentityType> {
  // This endpoint doesn't require authentication
}
```

### Accessing Current User

To access the authenticated user information in a resolver, use the `@CurrentUser()` decorator:

```typescript
import { CurrentUser } from '../infrastructure/decorators/current-user.decorator';
import { JwtPayload } from '../infrastructure/jwt/jwt-handler';

@Mutation(() => SomeType)
async protectedOperation(
  @CurrentUser() user: JwtPayload,
  @Args('input') input: SomeInput,
): Promise<SomeType> {
  // user.id and user.email are available
  console.log('Authenticated user:', user.email);
}
```

## Authentication Flow

1. **Login**: User provides credentials to the login mutation
2. **Token Generation**: Server generates and returns a JWT token
3. **Token Usage**: Client includes the token in the Authorization header: `Bearer <token>`
4. **Token Validation**: The guard validates the token on each request
5. **User Context**: User information is attached to the request context

## Configuration

The authentication guard is configured globally in the `AppModule` and will protect all GraphQL operations except those marked with `@Public()`.

### Protected Operations

All operations that don't have the `@Public()` decorator are protected by default. This includes but is not limited to:

- Product operations
- Category operations
- Tenant operations
- Address operations
- Order operations
- And more...

### Public Operations

- Register
- Login
- Logout

## Error Handling

The guard will throw `UnauthorizedException` in the following cases:

- No Authorization header is provided
- Authorization header doesn't start with 'Bearer '
- Token is invalid or expired
- Token has been invalidated (blacklisted)
