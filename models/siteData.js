// ---------------------------------------------------------------------------
// siteData.js
// A lightweight in-memory data layer for ServeConnect.
//
// In a production app these arrays would live in a database (Postgres, Mongo,
// etc.) and each getter would run a real query. We wrap them in `async`
// functions on purpose so the rest of the app talks to the data layer the
// same way it eventually will against a database: `const orgs = await getOrganizations()`.
// Swapping the implementation later requires zero changes in the routes.
// ---------------------------------------------------------------------------

const organizations = [
  {
    id: 'riverside-food-bank',
    name: 'Riverside Food Bank',
    image: 'riverside-food-bank.svg',
    location: 'Rexburg, ID',
    description:
      'Distributes fresh groceries and hot meals to families across the valley, powered entirely by weekend volunteers.'
  },
  {
    id: 'green-trails-collective',
    name: 'Green Trails Collective',
    image: 'green-trails-collective.svg',
    location: 'Idaho Falls, ID',
    description:
      'Restores hiking trails, plants native trees, and runs river clean-ups to keep public lands healthy for everyone.'
  },
  {
    id: 'brightstart-tutoring',
    name: 'BrightStart Tutoring',
    image: 'brightstart-tutoring.svg',
    location: 'Pocatello, ID',
    description:
      'Pairs college mentors with K-12 students for free after-school tutoring in reading, math, and study skills.'
  }
];

const projects = [
  {
    id: 'saturday-meal-prep',
    title: 'Saturday Meal Prep',
    organization: 'Riverside Food Bank',
    category: 'Community Service',
    date: 'Every Saturday, 8:00 AM',
    description: 'Pack and hand out grocery boxes to 200+ families in a single morning.'
  },
  {
    id: 'canyon-trail-restoration',
    title: 'Canyon Trail Restoration',
    organization: 'Green Trails Collective',
    category: 'Environmental',
    date: 'June 21, 2026',
    description: 'Clear brush, rebuild switchbacks, and plant 150 native saplings along the canyon rim.'
  },
  {
    id: 'reading-buddies',
    title: 'Reading Buddies',
    organization: 'BrightStart Tutoring',
    category: 'Educational',
    date: 'Weekdays, 3:30 PM',
    description: 'Spend an hour reading one-on-one with an elementary student who needs extra practice.'
  },
  {
    id: 'community-wellness-fair',
    title: 'Community Wellness Fair',
    organization: 'Riverside Food Bank',
    category: 'Health and Wellness',
    date: 'July 12, 2026',
    description: 'Run booths for free health screenings, nutrition advice, and mental-health resources.'
  }
];

const categories = [
  {
    name: 'Environmental',
    description: 'Trail work, clean-ups, tree planting, and conservation projects that protect the outdoors.'
  },
  {
    name: 'Educational',
    description: 'Tutoring, mentoring, and literacy work that helps students learn and grow.'
  },
  {
    name: 'Community Service',
    description: 'Food drives, shelter support, and neighbor-to-neighbor help where it is needed most.'
  },
  {
    name: 'Health and Wellness',
    description: 'Health fairs, wellness checks, and programs that support physical and mental health.'
  }
];

// Async getters. Each returns a Promise, so callers use `await`.
export const getOrganizations = async () => organizations;

export const getProjects = async () => projects;

export const getCategories = async () => categories;
