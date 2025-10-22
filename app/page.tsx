"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Zap, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-all duration-300 ease-out">
              <BarChart3 className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">BizTrackr AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-foreground hover:bg-secondary transition-all duration-300 ease-out"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
              Smart Business Management with <span className="text-accent">AI Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Track your sales, expenses, and profits. Get instant AI-powered insights to grow your business smarter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-secondary bg-transparent transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: BarChart3,
              title: "Real-time Analytics",
              description: "Track sales, expenses, and profit trends with beautiful charts and metrics.",
            },
            {
              icon: Zap,
              title: "AI-Powered Insights",
              description: "Get instant recommendations and performance analysis powered by AI.",
            },
            {
              icon: MessageSquare,
              title: "Smart Assistant",
              description: "Chat with your AI business assistant for instant answers and guidance.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur hover:border-accent/50 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <feature.icon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-all duration-300 ease-out" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to transform your business?</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of business owners using BizTrackr AI to make smarter decisions.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 BizTrackr AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
