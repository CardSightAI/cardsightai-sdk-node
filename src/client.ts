import createClient, { type Client as OpenAPIClient, type Middleware } from 'openapi-fetch';
import type { paths } from './generated/types.js';

/**
 * CardSightAI API client configuration options
 */
export interface CardSightAIConfig {
  /**
   * API key for authentication. If not provided, will check CARDSIGHTAI_API_KEY environment variable
   */
  apiKey?: string;

  /**
   * Base URL for the API. Defaults to production URL
   */
  baseUrl?: string;

  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Custom headers to include with every request
   */
  headers?: Record<string, string>;
}

/**
 * Error thrown when API requests fail
 */
export class CardSightAIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any,
    public request?: any
  ) {
    super(message);
    this.name = 'CardSightAIError';
  }
}

/**
 * Error thrown when API key is missing
 */
export class AuthenticationError extends CardSightAIError {
  constructor() {
    super('API key is required. Set it via init() or CARDSIGHTAI_API_KEY environment variable');
    this.name = 'AuthenticationError';
  }
}

/**
 * Main CardSightAI SDK client
 */
export class CardSightAI {
  private client: OpenAPIClient<paths>;
  private config: Required<CardSightAIConfig>;

  constructor(config?: CardSightAIConfig) {
    // Get API key from config or environment
    const apiKey = config?.apiKey || process.env.CARDSIGHTAI_API_KEY;

    if (!apiKey) {
      throw new AuthenticationError();
    }

    // Set defaults
    this.config = {
      apiKey,
      baseUrl: config?.baseUrl || 'https://api.cardsight.ai',
      fetch: config?.fetch || fetch,
      timeout: config?.timeout || 30000,
      headers: config?.headers || {}
    };

    // Create the OpenAPI client
    this.client = createClient<paths>({
      baseUrl: this.config.baseUrl,
      fetch: this.config.fetch,
      headers: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...this.config.headers
      }
    });

    // Add middleware for error handling and timeout
    this.setupMiddleware();
  }

  /**
   * Set up middleware for error handling and request enhancement
   */
  private setupMiddleware() {
    const config = this.config; // Capture config for closure

    // WeakMap to store timeout cleanup functions
    const timeoutCleanups = new WeakMap<any, () => void>();

    // Error handling middleware
    this.client.use({
      async onRequest({ request, options }) {
        // Add timeout using AbortController
        if (config.timeout) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.timeout);

          // Store cleanup function in WeakMap
          timeoutCleanups.set(options, () => clearTimeout(timeoutId));

          // Return new request with signal
          return new Request(request, {
            signal: controller.signal
          });
        }

        return request;
      },

      async onResponse({ response, request, options }) {
        // Clean up timeout
        const cleanup = timeoutCleanups.get(options);
        if (cleanup) {
          cleanup();
          timeoutCleanups.delete(options);
        }

        // Handle errors
        if (!response.ok) {
          let errorMessage = `API request failed with status ${response.status}`;
          let responseData: any;

          try {
            responseData = await response.clone().json();
            if (responseData?.message) {
              errorMessage = responseData.message;
            } else if (responseData?.error) {
              errorMessage = responseData.error;
            }
          } catch {
            // If response isn't JSON, try text
            try {
              const text = await response.clone().text();
              if (text) errorMessage = text;
            } catch {
              // Ignore parsing errors
            }
          }

          throw new CardSightAIError(errorMessage, response.status, responseData, {
            url: response.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries())
          });
        }

        return response;
      }
    } as Middleware);
  }

  /**
   * Health check endpoints
   */
  public readonly health = {
    /**
     * Basic health check
     */
    check: () => this.client.GET('/health'),

    /**
     * Authenticated health check - validates API key
     */
    checkAuth: () => this.client.GET('/health/auth')
  };

  /**
   * Card identification endpoints
   */
  public readonly identify = {
    /**
     * Identify a card from an image
     */
    card: (image: Blob | File | ArrayBuffer, options?: any) => {
      const formData = new FormData();

      if (image instanceof Blob || image instanceof File) {
        formData.append('image', image);
      } else {
        formData.append('image', new Blob([image]));
      }

      return this.client.POST('/v1/identify/card', {
        ...options,
        body: formData as any,
        bodySerializer: (body: any) => body // Don't serialize FormData
      });
    }
  };

  /**
   * Catalog endpoints
   */
  public readonly catalog = {
    /**
     * Get cards with optional filters
     */
    cards: {
      list: (params?: any) => this.client.GET('/v1/catalog/cards', { params: { query: params } }),

      get: (id: string) => this.client.GET('/v1/catalog/cards/{id}', { params: { path: { id } } })
    },

    /**
     * Get sets with optional filters
     */
    sets: {
      list: (params?: any) => this.client.GET('/v1/catalog/sets', { params: { query: params } }),

      get: (id: string) => this.client.GET('/v1/catalog/sets/{id}', { params: { path: { id } } }),

      cards: (id: string, params?: any) =>
        this.client.GET('/v1/catalog/sets/{id}/cards', {
          params: { path: { id }, query: params }
        })
    },

    /**
     * Get releases
     */
    releases: {
      list: (params?: any) =>
        this.client.GET('/v1/catalog/releases', { params: { query: params } }),

      get: (id: string) =>
        this.client.GET('/v1/catalog/releases/{id}', { params: { path: { id } } }),

      cards: (id: string, params?: any) =>
        this.client.GET('/v1/catalog/releases/{id}/cards', {
          params: { path: { id }, query: params }
        })
    },

    /**
     * Get manufacturers
     */
    manufacturers: (params?: any) =>
      this.client.GET('/v1/catalog/manufacturers', { params: { query: params } }),

    /**
     * Get segments
     */
    segments: (params?: any) =>
      this.client.GET('/v1/catalog/segments', { params: { query: params } }),

    /**
     * Get parallels
     */
    parallels: (params?: any) =>
      this.client.GET('/v1/catalog/parallels', { params: { query: params } }),

    /**
     * Get attributes
     */
    attributes: {
      list: (params?: any) =>
        this.client.GET('/v1/catalog/attributes', { params: { query: params } }),

      get: (id: string) =>
        this.client.GET('/v1/catalog/attributes/{id}', { params: { path: { id } } })
    },

    /**
     * Get catalog statistics
     */
    statistics: () => this.client.GET('/v1/catalog/statistics')
  };

  /**
   * Collection management endpoints
   */
  public readonly collections = {
    /**
     * List all collections
     */
    list: () => this.client.GET('/v1/collection/'),

    /**
     * Get collection details
     */
    get: (collectionId: string) =>
      this.client.GET('/v1/collection/{collectionId}', {
        params: { path: { collectionId } }
      }),

    /**
     * Create a new collection
     */
    create: (data: any) => this.client.POST('/v1/collection/', { body: data }),

    /**
     * Update collection
     */
    update: (collectionId: string, data: any) =>
      this.client.PUT('/v1/collection/{collectionId}', {
        params: { path: { collectionId } },
        body: data
      }),

    /**
     * Delete collection
     */
    delete: (collectionId: string) =>
      this.client.DELETE('/v1/collection/{collectionId}', {
        params: { path: { collectionId } }
      }),

    /**
     * Collection cards
     */
    cards: {
      list: (collectionId: string, params?: any) =>
        this.client.GET('/v1/collection/{collectionId}/cards', {
          params: { path: { collectionId }, query: params }
        }),

      add: (collectionId: string, data: any) =>
        this.client.POST('/v1/collection/{collectionId}/cards', {
          params: { path: { collectionId } },
          body: data
        }),

      get: (collectionId: string, cardId: string) =>
        this.client.GET('/v1/collection/{collectionId}/cards/{cardId}', {
          params: { path: { collectionId, cardId } }
        }),

      update: (collectionId: string, cardId: string, data: any) =>
        this.client.PUT('/v1/collection/{collectionId}/cards/{cardId}', {
          params: { path: { collectionId, cardId } },
          body: data
        }),

      delete: (collectionId: string, cardId: string) =>
        this.client.DELETE('/v1/collection/{collectionId}/cards/{cardId}', {
          params: { path: { collectionId, cardId } }
        })
    },

    /**
     * Collection analytics
     */
    analytics: (collectionId: string) =>
      this.client.GET('/v1/collection/{collectionId}/analytics', {
        params: { path: { collectionId } }
      }),

    /**
     * Collection breakdown
     */
    breakdown: (collectionId: string, params?: any) =>
      this.client.GET('/v1/collection/{collectionId}/breakdown', {
        params: { path: { collectionId }, query: params }
      }),

    /**
     * Set progress tracking
     */
    setProgress: {
      list: (collectionId: string) =>
        this.client.GET('/v1/collection/{collectionId}/set-progress', {
          params: { path: { collectionId } }
        }),

      get: (collectionId: string, setId: string) =>
        this.client.GET('/v1/collection/{collectionId}/set-progress/{setId}', {
          params: { path: { collectionId, setId } }
        }),

      getParallel: (collectionId: string, setId: string, parallelId: string) =>
        this.client.GET('/v1/collection/{collectionId}/set-progress/{setId}/{parallelId}', {
          params: { path: { collectionId, setId, parallelId } }
        })
    }
  };

  /**
   * Autocomplete endpoints for search
   */
  public readonly autocomplete = {
    cards: (query: string) =>
      this.client.GET('/v1/autocomplete/cards', {
        params: { query: { q: query } }
      }),

    sets: (query: string) =>
      this.client.GET('/v1/autocomplete/sets', {
        params: { query: { q: query } }
      }),

    manufacturers: (query: string) =>
      this.client.GET('/v1/autocomplete/manufacturers', {
        params: { query: { q: query } }
      }),

    releases: (query: string) =>
      this.client.GET('/v1/autocomplete/releases', {
        params: { query: { q: query } }
      }),

    segments: (query: string) =>
      this.client.GET('/v1/autocomplete/segments', {
        params: { query: { q: query } }
      }),

    years: (query: string) =>
      this.client.GET('/v1/autocomplete/years', {
        params: { query: { q: query } }
      })
  };

  /**
   * AI query endpoint
   */
  public readonly ai = {
    query: (question: string, options?: any) =>
      this.client.POST('/v1/ai/query', {
        body: { question, ...options }
      })
  };

  /**
   * Feedback endpoints
   */
  public readonly feedback = {
    general: (data: any) => this.client.POST('/v1/feedback/general', { body: data }),

    card: (id: string, data: any) =>
      this.client.POST('/v1/feedback/card/{id}', {
        params: { path: { id } },
        body: data
      }),

    identify: (id: string, data: any) =>
      this.client.POST('/v1/feedback/identify/{id}', {
        params: { path: { id } },
        body: data
      })
  };

  /**
   * Direct access to the underlying OpenAPI client for advanced use cases
   */
  public get raw() {
    return this.client;
  }
}

/**
 * Initialize the CardSightAI client
 */
export function init(config?: CardSightAIConfig): CardSightAI {
  return new CardSightAI(config);
}

// Default export
export default CardSightAI;
