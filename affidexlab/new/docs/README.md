# DecaFlow Partner API Documentation

This directory contains the complete API documentation for DecaFlow partner integrations.

## Files

- `openapi.yaml` - Complete OpenAPI 3.0 specification
- `api-viewer.html` - Interactive API documentation viewer (Swagger UI)
- `INTEGRATION_GUIDE.md` - Step-by-step integration guide for partners

## Viewing Documentation

### Online
Documentation should be hosted at:
- https://docs.decaflow.xyz/api

### Local Development
1. Start a local HTTP server:
   ```bash
   python -m http.server 8000
   ```
2. Open http://localhost:8000/api-viewer.html

### Swagger Editor
Paste the contents of `openapi.yaml` into https://editor.swagger.io

## Publishing

The OpenAPI spec and viewer should be deployed to:
- Production docs: `https://docs.decaflow.xyz/api`
- Sandbox docs: `https://sandbox-docs.decaflow.xyz/api`

## Using the Spec

### Generate Client SDKs
```bash
openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o ./generated-sdk
```

### Validate
```bash
swagger-cli validate openapi.yaml
```

### Generate Postman Collection
Import `openapi.yaml` directly into Postman for testing.

## Support

For API questions or issues:
- Email: techpartners@decaflow.xyz
- Documentation: https://docs.decaflow.xyz
- Status: https://status.decaflow.xyz
