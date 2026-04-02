# ODSS Core

[![npm version](https://badge.fury.io/js/%40odss%2Fcore.svg)](https://badge.fury.io/js/%40odss%2Fcore)

**ODSS** (Open Dynamic Service System) is an OSGi-like modular framework for JavaScript/TypeScript applications. It provides dynamic module loading, service registration, and lifecycle management for applications of any size.

## Features

- **Modular Architecture** - Load, unload, and update modules at runtime
- **Service Registry** - Register and discover services dynamically
- **Event System** - Framework, bundle, and service event handling
- **Async Support** - Full async/await support throughout
- **TypeScript Ready** - Built with TypeScript and type definitions included

## Core Concepts

### Framework

The central container that manages all bundles and services:

```typescript
const framework = new FrameworkFactory().create();
await framework.start();
```

### Bundles

Modular components that can be installed and manipulated at runtime:

```typescript
const bundle = await framework.installBundle('my-bundle', true);
await bundle.start();
await bundle.stop();
```

### Services

Objects registered for consumption by other bundles:

```typescript
await context.registerService('MyService', serviceInstance);
const service = context.getService(reference);
```

### Events

Framework communication through events:

```typescript
framework.on.bundle.add(bundle, (event) => {
  console.log(`Bundle: ${event.type}`);
});
```

## Installation

```bash
npm install @odss/core @odss/common @odss/query
```

## Quick Start

```typescript
import { FrameworkFactory } from '@odss/core';

async function main() {
  // Create framework instance
  const framework = new FrameworkFactory().create({
    'app.name': 'MyApp',
    'app.version': '1.0.0'
  });

  // Start the framework
  await framework.start();

  // Install a bundle with auto-start
  await framework.installBundle('my-bundle', true);

  // Stop the framework when done
  await framework.stop();
}

main().catch(console.error);
```

## Bundle with Activator

```typescript
// In your bundle module (activator.js)
export class Activator {
  async start(context) {
    console.log('Starting bundle');
    this.registration = await context.registerService(
      'MyService',
      { doWork: () => 'Active' },
      { priority: 10 }
    );
  }

  async stop(context) {
    console.log('Stopping bundle');
    await this.registration.unregister();
  }
}
```

## Package Structure

- `@odss/core` - Main framework implementation
- `@odss/common` - Common interfaces and types
- `@odss/query` - Service filter queries

## Documentation

- [Architecture Overview](https://github.com/odss/odss-core/blob/main/docs/architecture.md)
- [API Reference](https://github.com/odss/odss-core/blob/main/docs/api.md)
- [Examples](https://github.com/odss/odss-core/tree/main/examples)

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## License

[MIT](LICENSE)
