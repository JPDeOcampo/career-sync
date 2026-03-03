import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "@/pages/login";
import { toast } from "sonner";

// -----------------------------
// Mock Redux Dispatch
// -----------------------------
const mockDispatch = jest.fn();

jest.mock("@/hooks/useRedux", () => ({
  useAppDispatch: () => mockDispatch,
}));

// -----------------------------
// Mock next/navigation (App Router)
// -----------------------------
const mockPush = jest.fn();

jest.mock("next/router", () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// -----------------------------
// Mock Toast (sonner)
// -----------------------------
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// -----------------------------
// Mock RTK Query Login Mutation
// -----------------------------
const mockUserLogin = jest.fn();

jest.mock("@/store/api/authApi", () => ({
  useUserLoginMutation: () => [mockUserLogin, { isLoading: false }],
}));

// =============================
// TESTS
// =============================
describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form", () => {
    render(<Login />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("submits form successfully", async () => {
    mockUserLogin.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          user: { firstName: "John" },
        }),
    });

    render(<Login />);

    await userEvent.type(
      screen.getByLabelText(/email/i),
      "jonathandeocampo06@gmail.com",
    );
    await userEvent.type(screen.getByLabelText(/password/i), "Qwertyuia1!");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockUserLogin).toHaveBeenCalledWith({
        email: "jonathandeocampo06@gmail.com",
        password: "Qwertyuia1!",
      });

      expect(mockDispatch).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard");

      expect(toast.success).toHaveBeenCalledWith("Welcome back, John!");
    });
  });

  it("shows error on 401 response", async () => {
    mockUserLogin.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 401 }),
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@mail.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password");
    });
  });

  it("shows generic error for unknown errors", async () => {
    mockUserLogin.mockReturnValueOnce({
      unwrap: () => Promise.reject({ status: 500 }),
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@mail.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });
});
