import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'

const AuthFormWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('AuthForm', () => {
  it('renders login form correctly', () => {
    render(
      <AuthFormWrapper>
        <AuthForm type="login" />
      </AuthFormWrapper>
    )

    expect(screen.getByText('Login to Your Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('renders register form correctly', () => {
    render(
      <AuthFormWrapper>
        <AuthForm type="register" />
      </AuthFormWrapper>
    )

    expect(screen.getByText('Create an Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <AuthFormWrapper>
        <AuthForm mode="login" />
      </AuthFormWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(
      <AuthFormWrapper>
        <AuthForm mode="login" />
      </AuthFormWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(
      <AuthFormWrapper>
        <AuthForm mode="register" />
      </AuthFormWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, '123')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    render(
      <AuthFormWrapper>
        <AuthForm mode="login" />
      </AuthFormWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Should show loading state temporarily
    expect(submitButton).toBeDisabled()
  })
})