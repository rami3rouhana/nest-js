interface IAppConfiguration {
  CORS_ORIGIN: string;
}

export const Configuration: IAppConfiguration = {
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

export const CorsConfig = {
  origin: Configuration.CORS_ORIGIN || '*',
  methods: ['GET', 'PUT', 'POST'], // Allowed methods.
  allowedHeaders: ['Content-Type', 'Authorization'], // Indicates which HTTP headers can be used when making a request.
  preflightContinue: false, // Fail safe action if needed.
  optionsSuccessStatus: 204, // Preflight status if the methods are allowed.
  credentials: false, // Enables cookies.
};
