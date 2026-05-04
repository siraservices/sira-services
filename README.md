# SIRA Services Website

A professional freelancing website for ML/AI/Computer Vision services built with Next.js, Convex, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Convex
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Domain**: Cloudflare (for DNS)

## Features

- 📝 Blog with CMS and rich text editor (Tiptap — bold, italic, headings, lists, links, code blocks)
- 📩 Contact form with lead management and email notifications (Resend)
- 🔐 Authentication protecting /admin routes (WorkOS AuthKit)
- 📊 Google Analytics 4 integration
- 💼 Case studies / portfolio section with admin management
- 📱 Fully responsive design
- ⚡ Real-time updates via Convex
- 🔍 SEO optimized

## Setup Instructions

### Prerequisites

1. [Node.js](https://nodejs.org/) (v18 or later)
2. [GitHub account](https://github.com)
3. [Vercel account](https://vercel.com) (free tier)
4. [Convex account](https://convex.dev) (free tier)

### Step 1: Create GitHub Repo

```bash
# Create a new repo on GitHub called 'sira-services'
# Clone it locally, then copy these files into it
git add .
git commit -m "Initial setup"
git push origin main
```

### Step 2: Set Up Convex

```bash
# Install dependencies
npm install

# Initialize Convex (follow the prompts to create a new project)
npx convex dev

# This will:
# - Create a new Convex project
# - Generate a .env.local file with NEXT_PUBLIC_CONVEX_URL
# - Start syncing your schema
```

### Step 3: Configure Environment Variables

Create a `.env.local` file with:

```bash
# Convex (required)
NEXT_PUBLIC_CONVEX_URL=           # from `npx convex dev`

# WorkOS AuthKit — admin authentication (required for /admin)
WORKOS_CLIENT_ID=
WORKOS_API_KEY=
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
WORKOS_COOKIE_PASSWORD=           # 32+ char random string

# Resend — email notifications for new leads (optional)
RESEND_API_KEY=
ADMIN_EMAIL=                      # receives lead notification emails

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=    # e.g. G-XXXXXXXXXX
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import your GitHub repo
3. Add the environment variables listed above
4. Click Deploy

### Step 5: Connect Domain (Cloudflare)

1. Transfer sira.services to Cloudflare (or add it)
2. In Vercel, go to Settings → Domains → Add `sira.services`
3. Copy the DNS records Vercel provides
4. Add those records in Cloudflare DNS settings
5. Set SSL/TLS to "Full (strict)" in Cloudflare

## Local Development

```bash
# Install dependencies
npm install

# Start both Next.js and Convex dev servers
npm run dev

# Open http://localhost:3000
```

## Managing Content

### Blog Posts

1. Sign in at `/signin` (WorkOS AuthKit)
2. Go to `/admin/posts`
3. Click "New Post"
4. Use the rich text editor (Tiptap) for formatting — bold, italic, headings, lists, links, code blocks
5. Fill in title, slug, and tags
6. Check "Publish immediately" or save as draft
7. Click "Create Post"

**Or via Claude Code:**
> "Create a new blog post titled 'Introduction to Computer Vision' about the basics of CV, tag it with 'computer-vision' and 'tutorial', and publish it"

### Leads

1. Go to `/admin/leads`
2. View all contact form submissions
3. Update status (New → Contacted → Qualified → Closed)
4. Delete old leads as needed
5. New leads trigger automatic email notifications to ADMIN_EMAIL (via Resend)

### Case Studies

1. Go to `/admin/case-studies`
2. Create case studies with title, slug, client name, description, challenge/solution/results, technologies used, and optional images
3. Published case studies appear at `/case-studies` and individual pages at `/case-studies/[slug]`

## Project Structure

```
sira-services/
├── convex/              # Database schema and functions
│   ├── schema.ts        # Data models (posts, leads, caseStudies)
│   ├── posts.ts         # Blog post queries/mutations
│   ├── leads.ts         # Lead management
│   ├── caseStudies.ts   # Case study queries/mutations
│   ├── email.ts         # Resend email notifications
│   └── auth.config.ts   # WorkOS auth configuration
├── src/
│   ├── app/             # Next.js pages
│   │   ├── page.tsx     # Home
│   │   ├── services/    # Services page
│   │   ├── blog/        # Blog listing + posts
│   │   ├── about/       # About page
│   │   ├── contact/     # Contact form
│   │   ├── case-studies/ # Portfolio / case studies
│   │   ├── signin/      # WorkOS sign-in page
│   │   ├── callback/    # OAuth callback handler
│   │   └── admin/       # Admin dashboard (auth-protected)
│   │       ├── posts/   # Blog post management
│   │       ├── leads/   # Lead management
│   │       └── case-studies/ # Case study management
│   └── components/      # Shared components
│       ├── RichTextEditor.tsx  # Tiptap editor
│       ├── Navigation.tsx
│       ├── Footer.tsx
│       └── home/        # Home page sections
└── public/              # Static assets
```

## Completed Enhancements

- [x] Add authentication to protect /admin routes (WorkOS AuthKit)
- [x] Email notifications for new leads (Resend)
- [x] Rich text editor for blog posts (Tiptap)
- [x] Analytics integration (Google Analytics 4)
- [x] Case studies / portfolio section

## Using Claude Code

This project is designed to be maintained via Claude Code. Examples:

- "Add a new service offering for 'Data Pipeline Development'"
- "Create a blog post about transfer learning in computer vision"
- "Change the primary color from blue to indigo"
- "Add a testimonials section to the home page"

---

Built with ☕ and Claude
