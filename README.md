# SIRA Services Website

A professional freelancing website for ML/AI/Computer Vision services built with Next.js, Convex, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Convex
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Domain**: Cloudflare (for DNS)

## Features

- 📝 Blog with CMS (no code needed to publish posts)
- 📩 Contact form with lead management
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

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click "Add New Project"
2. Import your GitHub repo
3. Add environment variable:
   - `NEXT_PUBLIC_CONVEX_URL` (copy from your .env.local)
4. Click Deploy

### Step 4: Connect Domain (Cloudflare)

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

1. Go to `/admin/posts`
2. Click "New Post"
3. Fill in title, slug, content (HTML), and tags
4. Check "Publish immediately" or save as draft
5. Click "Create Post"

**Or via Claude Code:**
> "Create a new blog post titled 'Introduction to Computer Vision' about the basics of CV, tag it with 'computer-vision' and 'tutorial', and publish it"

### Leads

1. Go to `/admin/leads`
2. View all contact form submissions
3. Update status (New → Contacted → Qualified → Closed)
4. Delete old leads as needed

## Project Structure

```
sira-services/
├── convex/              # Database schema and functions
│   ├── schema.ts        # Data models
│   ├── posts.ts         # Blog post queries/mutations
│   └── leads.ts         # Lead management
├── src/
│   ├── app/             # Next.js pages
│   │   ├── page.tsx     # Home
│   │   ├── services/    # Services page
│   │   ├── blog/        # Blog listing + posts
│   │   ├── about/       # About page
│   │   ├── contact/     # Contact form
│   │   └── admin/       # Admin dashboard
│   └── components/      # Shared components
└── public/              # Static assets
```

## Future Enhancements

- [ ] Add authentication to protect /admin routes
- [ ] Email notifications for new leads
- [ ] Rich text editor for blog posts
- [ ] Analytics integration
- [ ] Case studies / portfolio section

## Using Claude Code

This project is designed to be maintained via Claude Code. Examples:

- "Add a new service offering for 'Data Pipeline Development'"
- "Create a blog post about transfer learning in computer vision"
- "Change the primary color from blue to indigo"
- "Add a testimonials section to the home page"

---

Built with ☕ and Claude
