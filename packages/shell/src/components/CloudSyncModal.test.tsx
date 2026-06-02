import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CloudSyncModal from "./CloudSyncModal";

// We will mock '../utils/supabase' so we can control configuration and mock supabase client functions
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};

let mockIsSupabaseConfigured = true;

vi.mock("../utils/supabase", () => {
  return {
    get isSupabaseConfigured() {
      return mockIsSupabaseConfigured;
    },
    get supabase() {
      return mockIsSupabaseConfigured ? mockSupabase : null;
    },
  };
});

describe("CloudSyncModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockIsSupabaseConfigured = true;
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("does not render when isOpen is false", () => {
    render(<CloudSyncModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("SYS_AUTHENTICATOR.EXE")).not.toBeInTheDocument();
  });

  it("renders configuration error warning block when Supabase is not configured", () => {
    mockIsSupabaseConfigured = false;
    render(<CloudSyncModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("SYS_AUTHENTICATOR.EXE")).toBeInTheDocument();
    expect(screen.getByText("⚠ CONFIGURATION ERROR")).toBeInTheDocument();
    expect(screen.getByText(/LOCAL STORAGE FALLBACK IS IN EFFECT/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("EMAIL_ADDR:")).not.toBeInTheDocument();
  });

  it("renders auth form when Supabase is configured and user is logged out", async () => {
    render(<CloudSyncModal isOpen={true} onClose={() => {}} />);
    await waitFor(() => expect(mockSupabase.auth.getUser).toHaveBeenCalled());

    expect(screen.getByText("SYS_AUTHENTICATOR.EXE")).toBeInTheDocument();
    expect(screen.getByLabelText("EMAIL_ADDR:")).toBeInTheDocument();
    expect(screen.getByLabelText("ACCESS_KEY:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN" })).toBeInTheDocument();
  });

  it("switches to registration form when register button is clicked", async () => {
    render(<CloudSyncModal isOpen={true} onClose={() => {}} />);
    await waitFor(() => expect(mockSupabase.auth.getUser).toHaveBeenCalled());

    const switchBtn = screen.getByRole("button", { name: "NEW TERMINAL ID? REGISTER HERE" });
    fireEvent.click(switchBtn);

    expect(screen.getByRole("button", { name: "REGISTER ACCOUNT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ALREADY INSTALLED? LOG IN" })).toBeInTheDocument();
  });

  it("calls signUp on form submission when registering", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: {} }, error: null });
    render(<CloudSyncModal isOpen={true} onClose={() => {}} />);
    await waitFor(() => expect(mockSupabase.auth.getUser).toHaveBeenCalled());

    // Switch to sign up
    fireEvent.click(screen.getByRole("button", { name: "NEW TERMINAL ID? REGISTER HERE" }));

    // Fill form
    fireEvent.change(screen.getByLabelText("EMAIL_ADDR:"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("ACCESS_KEY:"), { target: { value: "password123" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "REGISTER ACCOUNT" }));

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(screen.getByText("REGISTRATION SUCCESS. VERIFY EMAIL IF REQUIRED.")).toBeInTheDocument();
    });
  });

  it("calls signInWithPassword on form submission when logging in", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: {} }, error: null });
    const handleClose = vi.fn();
    render(<CloudSyncModal isOpen={true} onClose={handleClose} />);
    await waitFor(() => expect(mockSupabase.auth.getUser).toHaveBeenCalled());

    // Fill form
    fireEvent.change(screen.getByLabelText("EMAIL_ADDR:"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("ACCESS_KEY:"), { target: { value: "password123" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "SIGN IN" }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(screen.getByText("LOGIN SUCCESSFUL. CLOUD PROGRESS SYNCED.")).toBeInTheDocument();
    });
  });

  it("displays error messages in red text when auth fails", async () => {
    const mockError = new Error("Invalid login credentials");
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: mockError });
    render(<CloudSyncModal isOpen={true} onClose={() => {}} />);
    await waitFor(() => expect(mockSupabase.auth.getUser).toHaveBeenCalled());

    // Fill form
    fireEvent.change(screen.getByLabelText("EMAIL_ADDR:"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("ACCESS_KEY:"), { target: { value: "password123" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "SIGN IN" }));

    await waitFor(() => {
      expect(screen.getByText("ERROR: INVALID LOGIN CREDENTIALS")).toBeInTheDocument();
    });
  });

  it("renders connected status and logout button when user is logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { email: "user@cozyos.net" } }, error: null });

    render(<CloudSyncModal isOpen={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("STATUS: CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("ACCOUNT: user@cozyos.net")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "LOG OUT" })).toBeInTheDocument();
    });
  });

  it("calls signOut when clicking log out", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { email: "user@cozyos.net" } }, error: null });
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    const handleClose = vi.fn();

    render(<CloudSyncModal isOpen={true} onClose={handleClose} />);

    // Wait for the user status to load and display CONNECTED
    await screen.findByText("STATUS: CONNECTED");

    // Click Log Out
    fireEvent.click(screen.getByRole("button", { name: "LOG OUT" }));

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(screen.getByText("LOGOUT SUCCESSFUL. LOCAL REPO REMAINS ACTIVE.")).toBeInTheDocument();
    });
  });
});
