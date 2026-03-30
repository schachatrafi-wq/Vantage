import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Vantage</h1>
        <p className="text-muted mt-2 text-sm">Your personalized intelligence feed</p>
      </div>
      <SignUp
        appearance={{
          variables: {
            colorBackground: '#131c2e',
            colorText: '#f0f4ff',
            colorTextSecondary: '#8b9ab5',
            colorInputBackground: '#1a2540',
            colorInputText: '#f0f4ff',
            colorPrimary: '#3b82f6',
          },
        }}
      />
    </div>
  )
}
