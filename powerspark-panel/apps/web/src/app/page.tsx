import Link from "next/link";
import { Zap, Server, ShieldCheck, Gauge, ArrowRight } from "lucide-react";

/**
 * PowerSpark Panel - Landing Page
 * Preview-only marketing page. No authentication, dashboard, server
 * management, file manager, console, or billing logic lives here -
 * all links/buttons are placeholders for future steps.
 */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#" },
];

const FEATURES = [
  {
    icon: Server,
    title: "Native Process Hosting",
    description:
      "Minecraft servers run as native Linux processes for maximum performance — no container overhead.",
  },
  {
    icon: Gauge,
    title: "Real-Time Insights",
    description:
      "Keep an eye on TPS, memory, and player counts the moment your server needs attention.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Role-based access and isolated server environments keep every instance protected.",
  },
  {
    icon: Zap,
    title: "Instant Provisioning",
    description:
      "Spin up a new Minecraft server in seconds with sensible, production-ready defaults.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">PowerSpark Panel</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            >
              Log in
            </Link>
            <Link
              href="#"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]"
            aria-hidden
          />
          <div className="container flex flex-col items-center px-4 py-24 text-center sm:py-32">
            <span className="mb-6 inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Now in early development
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Minecraft hosting,
              <span className="text-primary"> engineered for control.</span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              PowerSpark Panel gives you a clean, fast, and reliable control panel for running
              Minecraft servers — built from the ground up for performance and clarity.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-secondary/40">
          <div className="container px-4 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for hosting done right
              </h2>
              <p className="mt-4 text-muted-foreground">
                A modern foundation for everything a Minecraft hosting panel needs — with more
                capabilities landing as development continues.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Status strip */}
        <section className="border-t border-border">
          <div className="container flex flex-col items-center gap-4 px-4 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              This preview is a foundation, not a finished panel
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Authentication, the server dashboard, file manager, console, and billing are not
              part of this build yet — they arrive in upcoming development steps.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium">PowerSpark Panel</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PowerSpark Panel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
