import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AuthForm from '@/components/auth/AuthForm'

const AuthFormWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('AuthForm', () => {
  it('renders login form correctly', () => {
    const { getByText, getByLabelText } = render(
      <AuthFormWrapper>
        <AuthForm type="login" />
      </AuthFormWrapper>
    )

    expect(getByText('Login to Your Account')).toBeInTheDocument()
    expect(getByLabelText(/email/i)).toBeInTheDocument()
    expect(getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders register form correctly', () => {
    const { getByText, getByLabelText } = render(
      <AuthFormWrapper>
        <AuthForm type="register" />
      </AuthFormWrapper>
    )

    expect(getByText('Create an Account')).toBeInTheDocument()
    expect(getByLabelText(/email/i)).toBeInTheDocument()
    expect(getByLabelText(/password/i)).toBeInTheDocument()
  })
})