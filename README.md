# Revolution Commerce

> A story-driven e-commerce experience where every purchase connects you to our mission and people.

## Vision

This isn't just a clothing store—it's an immersive journey into who we are, why we exist, and the people behind every stitch. Customers don't just buy clothes; they become part of our story.

---

## Core Experiences

### 1. The Onboarding Journey (First-Time Visitors)

A cinematic, scrollable introduction that immerses visitors in our world:

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                      ┌─────────┐  │
│  │         │                                      │         │  │
│  │  MODEL  │         "Welcome to [Brand]"         │  MODEL  │  │
│  │  LEFT   │                                      │  RIGHT  │  │
│  │         │       Our story begins here...       │         │  │
│  │ Outfit  │                                      │ Outfit  │  │
│  │   #1    │              [scroll]                │   #1    │  │
│  └─────────┘                                      └─────────┘  │
│                                                                 │
│  ▼ Scroll to continue ▼                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Scroll Sections:**
1. **Hero** - Brand name + tagline with flanking models
2. **Origin Story** - Why we started, parallax text with ambient visuals
3. **Our Mission** - What we stand for, with team preview
4. **The Craft** - How we make our clothes, close-up details
5. **Meet the People** - Quick intro to team members
6. **Enter the Shop** - Transition into main experience

**Design Notes:**
- Models on sides wear complete purchasable outfits
- Each scroll section reveals new outfits on the models
- Subtle click hints on model clothing items
- Progress indicator showing journey position
- Skip option for returning visitors

---

### 2. The Shopping Experience (Model-Centric)

Instead of traditional product grids, customers shop through models:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]    SHOP    ABOUT US    YOUR LOOK    CART               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           ┌─────────────────────────────────┐                   │
│    ┌──┐   │                                 │   ┌──┐            │
│    │▼ │   │                                 │   │▼ │            │
│    │  │   │                                 │   │  │            │
│    │H │   │         MAIN MODEL              │   │J │            │
│    │A │   │                                 │   │A │            │
│    │T │   │    (Your photo or default)      │   │C │            │
│    │  │   │                                 │   │K │            │
│    │☰ │   │         Full outfit shown       │   │E │            │
│    └──┘   │                                 │   │T │            │
│           │                                 │   │  │            │
│    ┌──┐   │                                 │   │☰ │            │
│    │▼ │   │                                 │   └──┘            │
│    │  │   │                                 │                   │
│    │P │   └─────────────────────────────────┘   ┌──┐            │
│    │A │                                         │▼ │            │
│    │N │   ┌──────────────────────────────┐      │  │            │
│    │T │   │ ☰ More options (fading)      │      │S │            │
│    │S │   └──────────────────────────────┘      │H │            │
│    │  │                                         │O │            │
│    │☰ │                                         │E │            │
│    └──┘                                         │S │            │
│                                                 │  │            │
│                                                 │☰ │            │
│                                                 └──┘            │
└─────────────────────────────────────────────────────────────────┘

Legend: ▼ = dropdown selector   ☰ = more options (fades on idle)
```

**Interaction Behavior:**
- Selection menus appear on hover/tap, fade after 2-3 seconds of inactivity
- Dropdowns show alternative items for each clothing category
- Real-time outfit preview as selections change
- Each item shows price, name, and "Add to Cart" option
- Smooth transitions between clothing changes

---

### 3. Virtual Try-On ("Be The Model")

Users upload their photo to become the model:

```
┌─────────────────────────────────────────────────────────────────┐
│                     "BE THE MODEL"                              │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐     │
│   │                                                       │     │
│   │      [Upload your photo]                              │     │
│   │                                                       │     │
│   │      • Front-facing photo works best                  │     │
│   │      • Good lighting recommended                      │     │
│   │      • We'll show you in any outfit                   │     │
│   │                                                       │     │
│   │      [📷 Take Photo]    [📁 Upload]                   │     │
│   │                                                       │     │
│   └───────────────────────────────────────────────────────┘     │
│                                                                 │
│   Privacy: Your photos are processed locally and never stored  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Technical Approach:**
- AI-powered virtual try-on (integration with try-on APIs or on-device ML)
- Privacy-first: client-side processing when possible
- Fallback to professional model if try-on unavailable
- Save "My Look" for future visits

---

### 4. About Us / Team Page (Lando Norris Style)

Inspired by landonorris.com - personal, visual, human:

```
┌─────────────────────────────────────────────────────────────────┐
│                        WHO WE ARE                               │
│                                                                 │
│  "Every person here has a story. Every story shapes our brand."│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │     [FULL SCREEN TEAM MEMBER PHOTO]                       │  │
│  │                                                           │  │
│  │     Sarah Chen                                            │  │
│  │     Founder & Creative Director                           │  │
│  │                                                           │  │
│  │     "I started this company in my garage with            │  │
│  │      a sewing machine and a dream..."                     │  │
│  │                                                           │  │
│  │     ▼ Read more                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │     │ │     │ │     │ │     │ │     │ │     │ │     │       │
│  │ CEO │ │ CTO │ │ DEV │ │ DES │ │ MKT │ │ OPS │ │ JAN │       │
│  │     │ │     │ │     │ │     │ │     │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                                                 │
│  ← Team Member Navigation →                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Bio Page Features (per team member):**
- Full-screen hero image with parallax
- Personal quote/tagline
- Story in their own words
- Fun facts / interests
- Role in the company
- Gallery of candid moments
- Social links (optional)
- Smooth scroll to next team member
- "Yes, even the janitor gets a page"

---

## Technical Architecture

### Tech Stack

```
Frontend:
├── Next.js 14 (App Router)
├── TypeScript
├── Tailwind CSS
├── Framer Motion (animations)
├── GSAP (scroll animations)
├── Three.js (optional 3D elements)
└── React Query (data fetching)

Backend:
├── Next.js API Routes
├── Prisma (ORM)
├── PostgreSQL (database)
└── Stripe (payments)

AI/ML:
├── Virtual Try-On API (TBD)
├── Background removal
└── Image processing

Infrastructure:
├── Vercel (hosting)
├── Cloudinary (image management)
├── Sentry (error tracking)
└── Analytics
```

### Project Structure

```
/
├── app/
│   ├── (onboarding)/
│   │   └── welcome/
│   │       └── page.tsx          # First-time visitor intro
│   │
│   ├── (main)/
│   │   ├── layout.tsx            # Main app layout with nav
│   │   ├── page.tsx              # Shop home (model view)
│   │   ├── shop/
│   │   │   ├── page.tsx          # Browse all outfits
│   │   │   └── [category]/
│   │   │       └── page.tsx      # Category view
│   │   │
│   │   ├── try-on/
│   │   │   └── page.tsx          # Virtual try-on experience
│   │   │
│   │   ├── about/
│   │   │   ├── page.tsx          # Team overview
│   │   │   └── [member]/
│   │   │       └── page.tsx      # Individual bio pages
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx          # Shopping cart
│   │   │
│   │   └── checkout/
│   │       └── page.tsx          # Checkout flow
│   │
│   ├── api/
│   │   ├── products/
│   │   ├── team/
│   │   ├── try-on/
│   │   └── checkout/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── onboarding/
│   │   ├── ScrollSection.tsx
│   │   ├── ModelDisplay.tsx
│   │   ├── StoryText.tsx
│   │   └── ProgressIndicator.tsx
│   │
│   ├── shop/
│   │   ├── ModelViewer.tsx
│   │   ├── ClothingSelector.tsx
│   │   ├── FadingMenu.tsx
│   │   ├── OutfitPreview.tsx
│   │   └── AddToCart.tsx
│   │
│   ├── try-on/
│   │   ├── PhotoUpload.tsx
│   │   ├── TryOnPreview.tsx
│   │   └── PrivacyNotice.tsx
│   │
│   ├── about/
│   │   ├── TeamMemberCard.tsx
│   │   ├── BioHero.tsx
│   │   ├── PersonalStory.tsx
│   │   └── TeamNavigation.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── ... (common components)
│
├── lib/
│   ├── db.ts
│   ├── stripe.ts
│   ├── try-on.ts
│   └── utils.ts
│
├── hooks/
│   ├── useScrollProgress.ts
│   ├── useFadeOnIdle.ts
│   ├── useFirstVisit.ts
│   └── useVirtualTryOn.ts
│
├── types/
│   ├── product.ts
│   ├── team.ts
│   └── cart.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   ├── images/
│   │   ├── models/
│   │   ├── products/
│   │   └── team/
│   └── ...
│
└── content/
    ├── story.md                  # Brand story content
    └── team/
        ├── founder.md
        ├── cto.md
        └── ...
```

---

## Data Models

### Product Schema

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  images      Image[]
  variants    Variant[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id       String    @id @default(cuid())
  name     String    // "Hats", "Jackets", "Pants", "Shoes", etc.
  slot     String    // "head", "top", "bottom", "feet"
  products Product[]
}

model Variant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id])
  size      String
  color     String
  stock     Int
  sku       String  @unique
}

model Image {
  id        String  @id @default(cuid())
  url       String
  alt       String
  type      String  // "product", "model", "lifestyle"
  productId String?
  product   Product? @relation(fields: [productId], references: [id])
}
```

### Team Member Schema

```prisma
model TeamMember {
  id          String   @id @default(cuid())
  name        String
  role        String
  title       String
  quote       String
  bio         String   @db.Text
  funFacts    String[] 
  heroImage   String
  gallery     String[]
  socialLinks Json?
  order       Int      // Display order
  joinedAt    DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Key Features Deep Dive

### 1. Fading Selection Menus

```typescript
// hooks/useFadeOnIdle.ts
export function useFadeOnIdle(timeout = 2000) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = () => {
    setIsVisible(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, timeout);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return { isVisible, show, hide };
}
```

### 2. First Visit Detection

```typescript
// hooks/useFirstVisit.ts
export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  
  useEffect(() => {
    const visited = localStorage.getItem('hasVisited');
    if (visited) {
      setIsFirstVisit(false);
    }
  }, []);

  const markVisited = () => {
    localStorage.setItem('hasVisited', 'true');
    setIsFirstVisit(false);
  };

  return { isFirstVisit, markVisited };
}
```

### 3. Scroll Progress for Onboarding

```typescript
// hooks/useScrollProgress.ts
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setProgress(progress);
      
      // Calculate current section based on scroll position
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress, currentSection };
}
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Database schema and setup
- [ ] Basic UI components
- [ ] Navigation structure
- [ ] Static team member pages

### Phase 2: Onboarding Experience
- [ ] Scrollable intro sections
- [ ] Parallax effects and animations
- [ ] Model display component
- [ ] First-visit detection
- [ ] Progress indicator

### Phase 3: Shop Experience
- [ ] Model-centric shopping view
- [ ] Clothing category system
- [ ] Fading selection menus
- [ ] Product switching/preview
- [ ] Shopping cart

### Phase 4: Virtual Try-On
- [ ] Photo upload interface
- [ ] Try-on API integration
- [ ] Privacy-first processing
- [ ] Save/share looks

### Phase 5: Checkout & Polish
- [ ] Stripe integration
- [ ] Order management
- [ ] Email notifications
- [ ] Performance optimization
- [ ] Accessibility audit

---

## Design Principles

1. **Story First** - Every element tells part of our story
2. **Human Connection** - Real people, real stories, real impact
3. **Intuitive Discovery** - The UI fades away; the experience remains
4. **Privacy Respected** - User data handled with care and transparency
5. **Inclusive Design** - Accessible to all, welcoming to everyone

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Next Steps

1. Review this framework and provide feedback
2. Define brand identity (name, colors, typography)
3. Gather initial content (story, team bios, product images)
4. Begin Phase 1 implementation

---

*Built with passion. Worn with purpose.*
