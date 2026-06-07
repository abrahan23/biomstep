# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BIOMSTEP** is an open-source e-commerce skateshop built with Next.js 14. The app is bootstrapped with `create-t3-app` and features a single-store e-commerce model (not a marketplace). The project is **under active development** and uses new technologies like Drizzle ORM that are subject to change.

Key facts:
- Single store identified by `STORE_ID = "str_default00000"` (configured in `src/config/store.ts`)
- Bilingual support: Spanish (default) and English via `next-intl`
- European focus: EUR currency, es-ES locale for Stripe
- Database: PostgreSQL with Drizzle ORM
- Image hosting: uploadthing (utfs.io)

## Tech Stack

### Core Framework & Styling
- **Framework:** Next.js 14.2.5 (App Router, React 18.3.1)
- **Styling:** Tailwind CSS 3.4.4 with custom theme configuration
- **UI Components:** shadcn/ui (new-york style, RSC enabled)
- **Class utilities:** `cva` (class-variance-authority), `clsx`, `tailwind-merge`

### Authentication & User Management
- **Auth:** Clerk (clerk/nextjs 5.2.3)
- **Protected routes:** Admin, account, checkout, cart routes require authentication
- **Middleware:** Custom middleware in `src/middleware.ts` combines Clerk + next-intl routing

### Database & ORM
- **Database:** PostgreSQL (via DATABASE_URL)
- **ORM:** Drizzle ORM 0.32.0
- **Migrations:** Drizzle Kit with dotenv-cli for environment variables
- **Schema location:** `src/db/schema/` (tables: stores, products, categories, subcategories, carts, orders, customers, variants, tags, payments)

### Content Management
- **Blog/Static Content:** Contentlayer 0.3.4 with MDX
- **Content sources:** `src/content/` (blog posts, authors, pages)
- **Features:** Rehype plugins (autolink headings, code titles, pretty code with Shiki, slug generation)

### Payment Processing
- **Stripe:** stripe 16.2.0 (API key via env), @stripe/react-stripe-js, @stripe/stripe-js
- **Webhooks:** Stripe webhook listener at `/api/webhooks/stripe`
- **Pricing models:** Standard and Pro monthly subscriptions (IDs in env)
- **Features:** Checkout sessions, payment intents, customer management

### Email & Notifications
- **Email:** React Email 2.1.5, Resend 3.4.0 (RESEND_API_KEY required)
- **Email templates:** `src/components/emails/`
- **Features:** Newsletter subscriptions, transactional emails

### File Uploads
- **Service:** uploadthing 7.7.4
- **Core:** `src/app/api/uploadthing/core.ts`
- **Integration:** React hook `useUploadFile` in `src/hooks/use-upload-file.ts`
- **Remote patterns:** utfs.io images configured in next.config.js

### Internationalization (i18n)
- **Library:** next-intl 4.13.0
- **Locales:** Spanish (`es`, default), English (`en`)
- **Routing:** Locale-prefixed URLs (`/es/...`, `/en/...`)
- **Configuration:** `src/i18n/routing.ts` (routing definition), `src/i18n/request.ts` (message loading)
- **Messages:** `messages/en.json`, `messages/es.json`
- **Middleware integration:** Locale detection from URL path, redirect to default if invalid

### Analytics & Monitoring
- **Analytics:** Loglib tracker 0.8.0
- **Component:** `src/components/analytics.tsx`

### Additional Libraries
- **Data tables:** @tanstack/react-table 8.19.3 with match-sorter utilities
- **Charts:** @tremor/react 3.17.4 (includes custom theme config in Tailwind)
- **Forms:** React Hook Form 7.52.1, Zod 3.23.8 (schema validation)
- **Image zoom:** react-medium-image-zoom 5.2.7
- **Date utilities:** date-fns 3.6.0
- **Motion:** Framer Motion 11.3.2
- **Markdown:** react-markdown 9.0.1, remark-gfm 4.0.0
- **Code syntax:** react-syntax-highlighter 15.5.0
- **UI patterns:** Dialog (vaul drawer), command palette (cmdk), OTP input
- **Rate limiting:** @upstash/ratelimit 1.2.1 (Redis via @upstash/redis)
- **Fonts:** Geist (font families), next-themes for dark mode

### AI/LLM
- **OpenAI SDK:** openai 4.52.7
- **Vercel AI SDK:** ai 3.2.22

### Development Tools
- **Linting:** ESLint 8.57.0 with TypeScript support (@typescript-eslint), Tailwind CSS plugin
- **Formatting:** Prettier 3.3.3 with tailwindcss and import sort plugins
- **Type checking:** TypeScript 5.5.3 (strict mode enabled)
- **Build tools:** Drizzle Kit, tsx for TypeScript execution

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale segment (es or en)
│   │   ├── (lobby)/              # Public storefront routes
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── products/         # Product listing
│   │   │   ├── product/[id]      # Product detail
│   │   │   ├── collections/      # Categories/subcategories
│   │   │   ├── build-a-board/    # Custom product builder
│   │   │   └── @modal/           # Parallel route for modals
│   │   ├── (auth)/               # Auth routes (signin, signup)
│   │   ├── (checkout)/           # Checkout flow
│   │   ├── (dashboard)/          # Protected admin & account routes
│   │   │   ├── admin/            # Admin dashboard
│   │   │   ├── account/          # User account
│   │   │   ├── store/[storeId]/  # Store management
│   │   │   └── onboarding/       # Setup wizard
│   │   └── layout.tsx            # Locale layout with i18n provider
│   ├── layout.tsx                # Root layout (Clerk provider)
│   ├── api/                      # API routes
│   │   ├── uploadthing/          # File upload endpoints
│   │   ├── webhooks/stripe/      # Stripe webhook receiver
│   │   ├── email/newsletter/     # Email newsletter endpoint
│   │   ├── og/                   # OG image generation
│   │   └── revalidate/           # ISR revalidation triggers
│   ├── robots.ts                 # SEO robots.txt
│   └── sitemap.ts                # SEO sitemap
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui components
│   ├── emails/                   # React Email templates
│   ├── checkout/                 # Checkout form components
│   ├── data-table/               # Data table utilities
│   ├── account/                  # Account page components
│   ├── shell.tsx                 # Layout shell wrapper
│   ├── providers.tsx             # Theme & i18n providers
│   ├── icons.tsx                 # Icon components
│   ├── analytics.tsx             # Loglib tracker
│   └── [other components]        # Feature-specific components
├── db/                           # Database layer
│   ├── schema/                   # Drizzle ORM schema definitions
│   │   ├── products.ts           # Product table + relations
│   │   ├── categories.ts         # Category hierarchy
│   │   ├── orders.ts             # Order & item tables
│   │   ├── carts.ts              # Cart & items
│   │   ├── stores.ts             # Store config
│   │   ├── variants.ts           # Product options & SKUs
│   │   └── [other tables]        # Addresses, customers, payments, etc.
│   ├── migrate.ts                # Run migrations
│   ├── seed.ts                   # Database seeding
│   ├── sync-catalog.ts           # Sync catalog data
│   └── utils.ts                  # DB utility functions
├── lib/                          # Utility functions
│   ├── actions/                  # Server actions (for mutations)
│   │   ├── cart.ts               # Add to cart, update quantities
│   │   ├── order.ts              # Create & manage orders
│   │   ├── stripe.ts             # Payment processing
│   │   ├── category.ts           # Category queries/mutations
│   │   └── [others]              # Feature-specific actions
│   ├── queries/                  # Database queries (read-only)
│   │   ├── product.ts            # Product queries with filtering
│   │   ├── order.ts              # Order fetching
│   │   └── [others]              # Category, store, etc.
│   ├── validations/              # Zod schemas
│   │   ├── product.ts            # Product form schemas
│   │   ├── cart.ts               # Cart item schemas
│   │   └── [others]              # Auth, order, etc.
│   ├── utils.ts                  # General utilities (cn, debounce, etc.)
│   ├── auth.ts                   # Auth helpers (Clerk integration)
│   ├── stripe.ts                 # Stripe utility functions
│   ├── handle-error.ts           # Error formatting
│   ├── checkout.ts               # Checkout helpers
│   ├── constants.ts              # App-wide constants
│   ├── fonts.ts                  # Font declarations
│   ├── openai.ts                 # OpenAI client instance
│   ├── resend.ts                 # Resend email client
│   └── rate-limit.ts             # Rate limiting setup
├── hooks/                        # React hooks (client-side)
│   ├── use-data-table.ts         # Data table state management
│   ├── use-upload-file.ts        # File upload hook
│   ├── use-debounce.ts           # Debounce hook
│   └── [other hooks]             # Click outside, scroll, etc.
├── config/                       # Configuration objects
│   ├── site.ts                   # Site metadata, footer links
│   ├── store.ts                  # Store ID & currency (STORE_ID constant)
│   ├── pricing.ts                # Subscription plans
│   ├── dashboard.ts              # Dashboard layout config
│   ├── admin.ts                  # Admin navigation config
│   ├── home.ts                   # Home page content config
│   └── query.ts                  # Default query parameters
├── types/                        # TypeScript type definitions
│   └── index.ts                  # NavItem, FooterItem, Plan, etc.
├── styles/                       # Global styles
│   └── globals.css               # Tailwind directives + custom variables
├── content/                      # MDX content (Contentlayer)
│   ├── blog/                     # Blog posts (.mdx files)
│   ├── authors/                  # Author profiles (.mdx files)
│   └── pages/                    # Static pages (about, privacy, etc.)
├── i18n/                         # Internationalization config
│   ├── routing.ts                # Locale definition & navigation helpers
│   └── request.ts                # Message loading per request
├── env.js                        # Environment variable validation (t3-env)
├── middleware.ts                 # Next.js middleware (Clerk + i18n)
└── assets/                       # Static assets
```

## Command Reference

### Development
```bash
pnpm run dev           # Start dev server on port 3000
pnpm run build         # Full build (contentlayer + next build)
pnpm run start         # Start production server
```

### Code Quality
```bash
pnpm run lint          # ESLint + TypeScript checks
pnpm run lint:fix      # Auto-fix linting issues
pnpm run typecheck     # TypeScript type checking
pnpm run format:check  # Check code formatting
pnpm run format:write  # Auto-format all files
pnpm run check         # Run lint + typecheck + format:check
```

### Database
```bash
pnpm run db:generate   # Generate migration files from schema
pnpm run db:introspect # Introspect existing database schema
pnpm run db:push       # Apply migrations to database
pnpm run db:migrate    # Run custom migration script
pnpm run db:drop-migration  # Drop migration (destructive)
pnpm run db:seed       # Seed database with sample data
pnpm run db:studio     # Open Drizzle Studio visual DB browser
```

### Content & Build
```bash
pnpm run shadcn:add <component>  # Add shadcn/ui component
```

### Email & Webhooks (Local Development)
```bash
pnpm run email:dev     # Start React Email dev server on port 3001
pnpm run stripe:listen # Start Stripe webhook listener forwarding to localhost:3000/api/webhooks/stripe
```

### Linting & Analytics
```bash
pnpm run unlighthouse # Run Lighthouse performance audit on https://skateshop.sadmn.com
```

## Key Architectural Patterns

### 1. Single Store E-commerce Model
Unlike a marketplace, this app operates on **one canonical store**. The store ID (`"str_default00000"`) is hardcoded:
- Database seeding inserts this exact store row
- All admin/storefront queries are scoped to `STORE_ID`
- See `src/config/store.ts` for store metadata (name, currency, locale)

### 2. Locale-Based Routing with next-intl
Routes are always locale-prefixed: `/es/products`, `/en/products`
- Middleware detects locale from URL and validates against `routing.locales`
- Falls back to `routing.defaultLocale` (Spanish) if invalid
- Locale-specific pages use `generateStaticParams()` for static rendering
- Messages loaded dynamically per locale from `messages/{locale}.json`

### 3. Protected Route Middleware
Routes under `/(es|en)/admin`, `/(es|en)/account`, `/(es|en)/checkout`, `/(es|en)/cart` require authentication:
- Clerk middleware checks auth status
- Unauthenticated users redirected to `/{locale}/signin`
- Unauthorized users redirected to `/{locale}/`

### 4. Server Actions for Mutations
Mutation logic uses Next.js server actions (in `src/lib/actions/`):
- Called directly from client components with `"use server"`
- Handle cart operations, order creation, product management
- Return typed responses for error handling
- Zod validation schemas in `src/lib/validations/`

### 5. Database Query Patterns
Two-tier query organization:
- **`src/lib/queries/`:** Read-only database queries, can be called from components/pages
- **`src/lib/actions/`:** Mutations and side effects, server actions only

Example:
```typescript
// queries/product.ts (read-only)
export async function getProducts() { /* ... */ }

// actions/product.ts (mutations)
"use server"
export async function createProduct(input: CreateProductInput) { /* ... */ }
```

### 6. Drizzle ORM Schema Relations
Tables define relationships explicitly:
- `products.categoryId` → `categories.id` (with cascade delete)
- `productTags` is a junction table for many-to-many
- Relations defined using `relations()` helper for queries

### 7. Zod Validation Schemas
Every form and API input has a corresponding Zod schema:
- Defined in `src/lib/validations/`
- Used in server actions and API routes
- Error messages included in schema definitions

### 8. Contentlayer for Blog/Static Content
- Blog posts: `src/content/blog/*.mdx` → compiled to JSON
- Authors: `src/content/authors/*.mdx`
- Static pages: `src/content/pages/*.mdx` (about, privacy, terms, contact)
- Computed fields: `slug`, `slugAsParams`, `readingTime`
- Syntax highlighting via Shiki theme (one-dark-pro dark, github-light light)

### 9. Stripe Payment Integration
- **Webhook receiver:** `/api/webhooks/stripe` (requires `STRIPE_WEBHOOK_SECRET`)
- **Checkout flow:** Creates Stripe session or payment intent
- **Subscription management:** Standard and Pro monthly plans with price IDs
- **Customer data sync:** Orders linked to Stripe `customerId` and `stripePaymentId`
- **Confirmation:** Test payments must verify payment intent status

### 10. Image Hosting & Optimization
- Images uploaded via uploadthing stored at `utfs.io`
- Products store image URLs in JSON array in database
- Next.js Image component optimizes utfs.io remote images
- Poster images for hero video in public directory

### 11. Form Patterns with React Hook Form
- `react-hook-form` for client-side form state
- `@hookform/resolvers` for Zod schema integration
- Custom input components (Checkbox, Select, Input) from shadcn/ui
- Error messages displayed per field

### 12. Data Table Implementation
- Custom hook `useDataTable` in `src/hooks/use-data-table.ts`
- Wraps TanStack React Table with sorting, filtering, pagination
- Column definitions use TypeScript for type safety
- Filters support searching by multiple fields via `SearchParams`

### 13. Theme Management
- `next-themes` provider in layout for light/dark mode toggle
- CSS variables (HSL) in `globals.css` for color theming
- Tailwind theme config extends with custom colors (tremor integration)
- Classes applied to `<html>` element for dark mode

## Environment Variables

### Required for Development
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgres://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=your-email@domain.com
UPLOADTHING_TOKEN=your-uploadthing-token
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STD_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
```

### Optional
```
NEXT_PUBLIC_HERO_VIDEO_URL=https://cdn.example.com/hero.mp4
```

### Setup
1. Copy `.env.example` to `.env`
2. Fill in all required values (Clerk keys, Stripe keys, database URL, etc.)
3. For CI, copy to `.env.local`

## Common Development Tasks

### Add a New Product Field
1. Update schema in `src/db/schema/products.ts`
2. Generate migration: `pnpm run db:generate`
3. Apply migration: `pnpm run db:push`
4. Update Zod schema in `src/lib/validations/product.ts`
5. Update form component in `src/components/`
6. Update server action in `src/lib/actions/product.ts`

### Add a New Page
1. Create locale-suffixed directory: `src/app/[locale]/your-page/`
2. Add `page.tsx` (automatic layout inheritance)
3. Use `setRequestLocale(locale)` in async component
4. Get translations with `getTranslations()` from next-intl

### Add Email Template
1. Create component in `src/components/emails/` using React Email
2. Import React Email components (@react-email/components, @react-email/tailwind)
3. Use in server action or API route with Resend
4. Test with: `pnpm run email:dev`

### Add/Remove UI Component from shadcn
```bash
pnpm run shadcn:add button    # Add Button
pnpm run shadcn:add dialog    # Add Dialog
# Components downloaded to src/components/ui/
```

### Test Stripe Integration Locally
1. Get Stripe CLI installed and authenticated
2. Start listener: `pnpm run stripe:listen`
3. Listener forwards webhook events to `http://localhost:3000/api/webhooks/stripe`
4. Use Stripe Dashboard to trigger test events

### Database Inspection
```bash
pnpm run db:studio  # Opens http://localhost:3000/admin/db for visual DB browser
```

## Code Style & Standards

### Import Organization (Prettier Plugin)
Imports are auto-sorted via `prettier-plugin-sort-imports`:
```typescript
// 1. React/Next imports
import * as React from "react"
import { useRouter } from "next/navigation"

// 2. Third-party modules
import { z } from "zod"

// 3. Blank line

// 4. Type imports
import type { Store } from "@/db/schema"

// 5. Config/lib/hooks/components/styles/app
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

// 6. Relative imports
import { someUtil } from "./utils"
```

### TypeScript
- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`, `contentlayer/generated` for Contentlayer
- Prefer type imports: `import type { ... }`
- No unsafe type assertions without justification

### Component Patterns
- Server components by default (async functions in App Router)
- `"use client"` only for interactivity (forms, hooks, animations)
- Use `React.Suspense` for async component fallbacks
- Props passed via `params: { locale: Locale }` in server components

### Naming Conventions
- Components: PascalCase (`ProductCard.tsx`)
- Utilities/hooks: camelCase (`useDataTable.ts`)
- Constants: SCREAMING_SNAKE_CASE (`STORE_ID`)
- Zod schemas: camelCase (`createProductSchema`)
- Database IDs: prefixed with type (`str_`, `cat_`, `prd_`)

## Debugging & Troubleshooting

### Build Fails on TypeScript Errors
- Run `pnpm run typecheck` to see all type errors
- Check `src/env.js` for missing environment variables
- Ensure all imports use correct path aliases

### Database Connection Issues
- Verify `DATABASE_URL` is correct and network reachable
- Run migrations: `pnpm run db:push`
- Check Drizzle logs for SQL errors

### Locale Not Detected
- Middleware in `src/middleware.ts` extracts locale from URL segment
- Invalid locales default to `routing.defaultLocale` (Spanish)
- Test with `/en/products` or `/es/products` explicitly

### Stripe Webhook Not Firing
- Ensure webhook secret matches `STRIPE_WEBHOOK_SECRET`
- Start listener with `pnpm run stripe:listen`
- Check response status (should be 200)
- Webhook handler in `src/app/api/webhooks/stripe/route.ts`

### Email Not Sending
- Verify `RESEND_API_KEY` is valid and registered domain exists
- Check `EMAIL_FROM_ADDRESS` is registered with Resend
- Resend requires domain verification for production

---

## Additional Resources

- **Repository:** https://github.com/sadmann7/skateshop
- **Documentation:** Create-t3-app (https://create.t3.gg)
- **Drizzle Docs:** https://orm.drizzle.team
- **shadcn/ui:** https://ui.shadcn.com
- **next-intl:** https://next-intl-docs.vercel.app
- **Stripe API:** https://stripe.com/docs
- **Contentlayer:** https://www.contentlayer.dev

