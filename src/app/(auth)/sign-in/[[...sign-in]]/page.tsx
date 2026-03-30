import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-border bg-surface">
        <div>
          <span className="text-xl font-bold text-foreground tracking-tight">Vantage</span>
          <span className="ml-2 text-xs text-muted font-medium bg-surface-2 px-1.5 py-0.5 rounded">BETA</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight mb-4">
            Your AI-powered<br />intelligence feed.
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-sm">
            Personalized news across AI, law, markets, cybersecurity, and more — analyzed and ranked by Claude.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {['Real-time ingestion from 60+ sources', 'Claude-generated summaries and insights', 'Breaking news alerts via push notifications'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted">© 2025 Vantage</p>
      </div>

      {/* Right sign-in panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Vantage</h1>
            <p className="text-muted mt-1 text-sm">Your personalized intelligence feed</p>
          </div>
          <div className="mb-6 hidden lg:block">
            <h3 className="text-xl font-semibold text-foreground">Welcome back</h3>
            <p className="text-muted text-sm mt-1">Sign in to your account</p>
          </div>
          <SignIn
            appearance={{
              variables: {
                colorBackground: '#141414',
                colorText: '#f5f5f5',
                colorTextSecondary: '#888888',
                colorInputBackground: '#1c1c1c',
                colorInputText: '#f5f5f5',
                colorPrimary: '#3b82f6',
                borderRadius: '0.5rem',
              },
              elements: {
                card: 'shadow-none bg-transparent p-0',
                rootBox: 'w-full',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
