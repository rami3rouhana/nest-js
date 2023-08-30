declare namespace Express {
  export interface Request {
    csrfToken(): string;
    apiVersion?: string;
  }
}
