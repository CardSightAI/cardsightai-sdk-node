import createClient, { type Client as OpenAPIClient, type Middleware } from 'openapi-fetch';
import type { paths } from './generated/types.js';

/**
 * Type helpers for extracting request/response types from OpenAPI paths
 */
type GetQueryParams<T extends keyof paths> = paths[T] extends { get: { parameters: { query?: infer Q } } }
  ? Q
  : never;

type PostBody<T extends keyof paths> = paths[T] extends { post: { requestBody?: { content: { 'application/json': infer B } } } }
  ? B
  : paths[T] extends { post: { requestBody: { content: { 'application/json': infer B } } } }
  ? B
  : never;

type PutBody<T extends keyof paths> = paths[T] extends { put: { requestBody?: { content: { 'application/json': infer B } } } }
  ? B
  : paths[T] extends { put: { requestBody: { content: { 'application/json': infer B } } } }
  ? B
  : never;


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
        // Check if body is FormData - if so, don't set Content-Type
        const isFormData = (options as any).body instanceof FormData;

        // Create headers object
        const headers = new Headers(request.headers);

        // Only set Content-Type for non-FormData requests that don't already have it
        if (!isFormData && !headers.has('Content-Type') && request.method !== 'GET' && request.method !== 'HEAD') {
          headers.set('Content-Type', 'application/json');
        }

        // Add timeout using AbortController
        let signal = undefined;
        if (config.timeout) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.timeout);

          // Store cleanup function in WeakMap
          timeoutCleanups.set(options, () => clearTimeout(timeoutId));

          signal = controller.signal;
        }

        // Return new request with updated headers and signal
        return new Request(request, {
          headers,
          signal
        });
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
            headers: Object.fromEntries([...request.headers as any])
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
      list: (params?: GetQueryParams<'/v1/catalog/cards'>) =>
        this.client.GET('/v1/catalog/cards', { params: { query: params } }),

      get: (id: string) => this.client.GET('/v1/catalog/cards/{id}', { params: { path: { id } } })
    },

    /**
     * Get sets with optional filters
     */
    sets: {
      list: (params?: GetQueryParams<'/v1/catalog/sets'>) => this.client.GET('/v1/catalog/sets', { params: { query: params } }),

      get: (id: string) => this.client.GET('/v1/catalog/sets/{id}', { params: { path: { id } } }),

      cards: (id: string, params?: GetQueryParams<'/v1/catalog/sets/{id}/cards'>) =>
        this.client.GET('/v1/catalog/sets/{id}/cards', {
          params: { path: { id }, query: params }
        })
    },

    /**
     * Get releases
     */
    releases: {
      list: (params?: GetQueryParams<'/v1/catalog/releases'>) =>
        this.client.GET('/v1/catalog/releases', { params: { query: params } }),

      get: (id: string) =>
        this.client.GET('/v1/catalog/releases/{id}', { params: { path: { id } } }),

      cards: (id: string, params?: GetQueryParams<'/v1/catalog/releases/{id}/cards'>) =>
        this.client.GET('/v1/catalog/releases/{id}/cards', {
          params: { path: { id }, query: params }
        })
    },

    /**
     * Get manufacturers
     */
    manufacturers: (params?: GetQueryParams<'/v1/catalog/manufacturers'>) =>
      this.client.GET('/v1/catalog/manufacturers', { params: { query: params } }),

    /**
     * Get segments
     */
    segments: (params?: GetQueryParams<'/v1/catalog/segments'>) =>
      this.client.GET('/v1/catalog/segments', { params: { query: params } }),

    /**
     * Get parallels
     */
    parallels: (params?: GetQueryParams<'/v1/catalog/parallels'>) =>
      this.client.GET('/v1/catalog/parallels', { params: { query: params } }),

    /**
     * Get attributes
     */
    attributes: {
      list: (params?: GetQueryParams<'/v1/catalog/attributes'>) =>
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
    list: (params?: GetQueryParams<'/v1/collection/'>) =>
      this.client.GET('/v1/collection/', {
        params: { query: params }
      }),

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
    create: (data: PostBody<'/v1/collection/'>) => this.client.POST('/v1/collection/', { body: data }),

    /**
     * Update collection
     */
    update: (collectionId: string, data: PutBody<'/v1/collection/{collectionId}'>) =>
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
      list: (collectionId: string, params?: GetQueryParams<'/v1/collection/{collectionId}/cards'>) =>
        this.client.GET('/v1/collection/{collectionId}/cards', {
          params: { path: { collectionId }, query: params }
        }),

      add: (collectionId: string, data: PostBody<'/v1/collection/{collectionId}/cards'>) =>
        this.client.POST('/v1/collection/{collectionId}/cards', {
          params: { path: { collectionId } },
          body: data
        }),

      get: (collectionId: string, cardId: string) =>
        this.client.GET('/v1/collection/{collectionId}/cards/{cardId}', {
          params: { path: { collectionId, cardId } }
        }),

      update: (collectionId: string, cardId: string, data: PutBody<'/v1/collection/{collectionId}/cards/{cardId}'>) =>
        this.client.PUT('/v1/collection/{collectionId}/cards/{cardId}', {
          params: { path: { collectionId, cardId } },
          body: data
        }),

      delete: (collectionId: string, cardId: string) =>
        this.client.DELETE('/v1/collection/{collectionId}/cards/{cardId}', {
          params: { path: { collectionId, cardId } }
        }),

      /**
       * Get card image
       */
      getImage: (collectionId: string, cardId: string) =>
        this.client.GET('/v1/collection/{collectionId}/cards/{cardId}/image', {
          params: { path: { collectionId, cardId } }
        }),

      /**
       * Get card thumbnail image
       */
      getThumbnail: (collectionId: string, cardId: string) =>
        this.client.GET('/v1/collection/{collectionId}/cards/{cardId}/image/thumb', {
          params: { path: { collectionId, cardId } }
        })
    },

    /**
     * Collection binders
     */
    binders: {
      /**
       * List all binders in a collection
       */
      list: (collectionId: string, params?: GetQueryParams<'/v1/collection/{collectionId}/binders'>) =>
        this.client.GET('/v1/collection/{collectionId}/binders', {
          params: { path: { collectionId }, query: params }
        }),

      /**
       * Create a new binder
       */
      create: (collectionId: string, data?: PostBody<'/v1/collection/{collectionId}/binders'>) =>
        this.client.POST('/v1/collection/{collectionId}/binders', {
          params: { path: { collectionId } },
          body: data || {}
        }),

      /**
       * Get binder details
       */
      get: (collectionId: string, binderId: string) =>
        this.client.GET('/v1/collection/{collectionId}/binders/{binderId}', {
          params: { path: { collectionId, binderId } }
        }),

      /**
       * Update a binder
       */
      update: (collectionId: string, binderId: string, data?: PutBody<'/v1/collection/{collectionId}/binders/{binderId}'>) =>
        this.client.PUT('/v1/collection/{collectionId}/binders/{binderId}', {
          params: { path: { collectionId, binderId } },
          body: data || {}
        }),

      /**
       * Delete a binder (removes all card associations)
       */
      delete: (collectionId: string, binderId: string) =>
        this.client.DELETE('/v1/collection/{collectionId}/binders/{binderId}', {
          params: { path: { collectionId, binderId } }
        }),

      /**
       * Binder cards management
       */
      cards: {
        /**
         * List cards in a binder
         */
        list: (collectionId: string, binderId: string, params?: GetQueryParams<'/v1/collection/{collectionId}/binders/{binderId}/cards'>) =>
          this.client.GET('/v1/collection/{collectionId}/binders/{binderId}/cards', {
            params: { path: { collectionId, binderId }, query: params }
          }),

        /**
         * Add a card to a binder
         */
        add: (collectionId: string, binderId: string, data: PostBody<'/v1/collection/{collectionId}/binders/{binderId}/cards'>) =>
          this.client.POST('/v1/collection/{collectionId}/binders/{binderId}/cards', {
            params: { path: { collectionId, binderId } },
            body: data
          }),

        /**
         * Remove a card from a binder (card stays in collection)
         */
        delete: (collectionId: string, binderId: string, cardId: string) =>
          this.client.DELETE('/v1/collection/{collectionId}/binders/{binderId}/cards/{cardId}', {
            params: { path: { collectionId, binderId, cardId } }
          })
      }
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
    breakdown: (collectionId: string, params: GetQueryParams<'/v1/collection/{collectionId}/breakdown'>) =>
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
    query: (data: PostBody<'/v1/ai/query'>) =>
      this.client.POST('/v1/ai/query', {
        body: data
      })
  };

  /**
   * Collectors endpoints - Manage card collectors
   */
  public readonly collectors = {
    /**
     * List all collectors
     */
    list: (params?: GetQueryParams<'/v1/collectors/'>) =>
      this.client.GET('/v1/collectors/', {
        params: { query: params }
      }),

    /**
     * Create a new collector
     */
    create: (data?: PostBody<'/v1/collectors/'>) =>
      this.client.POST('/v1/collectors/', {
        body: data || {}
      }),

    /**
     * Get a specific collector by ID
     */
    get: (collectorId: string) =>
      this.client.GET('/v1/collectors/{collectorId}', {
        params: { path: { collectorId } }
      }),

    /**
     * Update a collector
     */
    update: (collectorId: string, data?: PutBody<'/v1/collectors/{collectorId}'>) =>
      this.client.PUT('/v1/collectors/{collectorId}', {
        params: { path: { collectorId } },
        body: data || {}
      }),

    /**
     * Delete a collector (also deletes associated collections)
     */
    delete: (collectorId: string) =>
      this.client.DELETE('/v1/collectors/{collectorId}', {
        params: { path: { collectorId } }
      })
  };

  /**
   * Lists endpoints - Manage card lists (want lists, wishlists, etc.)
   */
  public readonly lists = {
    /**
     * Get all lists
     */
    list: (params?: GetQueryParams<'/v1/lists/'>) =>
      this.client.GET('/v1/lists/', {
        params: { query: params }
      }),

    /**
     * Create a new list
     */
    create: (data: PostBody<'/v1/lists/'>) =>
      this.client.POST('/v1/lists/', {
        body: data
      }),

    /**
     * Get a specific list
     */
    get: (listId: string) =>
      this.client.GET('/v1/lists/{listId}', {
        params: { path: { listId } }
      }),

    /**
     * Update a list
     */
    update: (listId: string, data?: PutBody<'/v1/lists/{listId}'>) =>
      this.client.PUT('/v1/lists/{listId}', {
        params: { path: { listId } },
        body: data || {}
      }),

    /**
     * Delete a list (removes all card associations)
     */
    delete: (listId: string) =>
      this.client.DELETE('/v1/lists/{listId}', {
        params: { path: { listId } }
      }),

    /**
     * Cards in lists
     */
    cards: {
      /**
       * Get cards in a list
       */
      list: (listId: string, params?: GetQueryParams<'/v1/lists/{listId}/cards'>) =>
        this.client.GET('/v1/lists/{listId}/cards', {
          params: { path: { listId }, query: params }
        }),

      /**
       * Add card(s) to a list
       */
      add: (listId: string, data: PostBody<'/v1/lists/{listId}/cards'>) =>
        this.client.POST('/v1/lists/{listId}/cards', {
          params: { path: { listId } },
          body: data
        }),

      /**
       * Remove a card from a list
       */
      delete: (listId: string, cardId: string) =>
        this.client.DELETE('/v1/lists/{listId}/cards/{cardId}', {
          params: { path: { listId, cardId } }
        })
    }
  };

  /**
   * Grades endpoints - Manage grading companies, types, and grades
   */
  public readonly grades = {
    /**
     * Grading companies
     */
    companies: {
      /**
       * List all grading companies
       */
      list: () =>
        this.client.GET('/v1/grades/companies'),

      /**
       * Get grading types for a specific company
       */
      types: (companyId: string) =>
        this.client.GET('/v1/grades/companies/{companyId}/types', {
          params: { path: { companyId } }
        }),

      /**
       * Get grades for a specific grading type
       */
      grades: (companyId: string, typeId: string) =>
        this.client.GET('/v1/grades/companies/{companyId}/types/{typeId}/grades', {
          params: { path: { companyId, typeId } }
        })
    }
  };

  /**
   * Images endpoints
   */
  public readonly images = {
    /**
     * Get card image by ID
     * @param id - Card ID
     * @param params - Optional query parameters
     * @param params.format - Image format: 'raw' (returns JPEG binary, default) or 'json' (returns metadata with base64)
     */
    getCard: async (id: string, params?: GetQueryParams<'/v1/images/cards/{id}'>) => {
      // For raw format, we need to handle the response differently
      // since openapi-fetch doesn't know it's binary data
      if (params?.format === 'raw' || !params?.format) {
        // Raw is the default, so handle both explicit raw and undefined
        const response = await this.client.GET('/v1/images/cards/{id}', {
          params: { path: { id }, query: params },
          // Tell openapi-fetch not to parse the response
          parseAs: 'blob'
        } as any);

        return response;
      } else {
        // JSON format - let openapi-fetch handle normally
        return this.client.GET('/v1/images/cards/{id}', {
          params: { path: { id }, query: params }
        });
      }
    }
  };

  /**
   * Subscription endpoints
   */
  public readonly subscription = {
    /**
     * Get subscription information
     */
    get: () => this.client.GET('/v1/subscription/')
  };

  /**
   * Feedback endpoints
   */
  public readonly feedback = {
    general: (data: PostBody<'/v1/feedback/general'>) => this.client.POST('/v1/feedback/general', { body: data }),

    card: (id: string, data: PostBody<'/v1/feedback/card/{id}'>) =>
      this.client.POST('/v1/feedback/card/{id}', {
        params: { path: { id } },
        body: data
      }),

    identify: (id: string, data: PostBody<'/v1/feedback/identify/{id}'>) =>
      this.client.POST('/v1/feedback/identify/{id}', {
        params: { path: { id } },
        body: data
      }),

    release: (id: string, data: PostBody<'/v1/feedback/release/{id}'>) =>
      this.client.POST('/v1/feedback/release/{id}', {
        params: { path: { id } },
        body: data
      }),

    set: (id: string, data: PostBody<'/v1/feedback/set/{id}'>) =>
      this.client.POST('/v1/feedback/set/{id}', {
        params: { path: { id } },
        body: data
      }),

    manufacturer: (id: string, data: PostBody<'/v1/feedback/manufacturer/{id}'>) =>
      this.client.POST('/v1/feedback/manufacturer/{id}', {
        params: { path: { id } },
        body: data
      }),

    segment: (id: string, data: PostBody<'/v1/feedback/segment/{id}'>) =>
      this.client.POST('/v1/feedback/segment/{id}', {
        params: { path: { id } },
        body: data
      }),

    /**
     * Get feedback by ID (GET endpoint)
     */
    get: (id: string) =>
      this.client.GET('/v1/feedback/{id}', {
        params: { path: { id } }
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
