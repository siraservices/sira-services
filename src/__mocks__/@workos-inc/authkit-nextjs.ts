export const getSignInUrl = jest.fn();
export const getSignUpUrl = jest.fn();
export const authkitMiddleware = jest.fn((config: unknown) => ({
  _config: config,
  _type: "middleware",
}));
export const handleAuth = jest.fn(() => jest.fn());
