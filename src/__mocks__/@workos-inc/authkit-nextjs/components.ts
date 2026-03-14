export const useAuth = jest.fn(() => ({
  user: null,
  loading: false,
  signOut: jest.fn(),
}));

export const AuthKitProvider = ({ children }: { children: React.ReactNode }) => children;
