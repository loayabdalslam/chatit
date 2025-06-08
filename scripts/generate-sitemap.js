#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DOMAIN = process.env.DOMAIN || 'https://yourdomain.com';
const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// Define your site structure
const pages = [
  {
    url: '/',
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '1.0',
    description: 'Home Page'
  },
  {
    url: '/contact',
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.8',
    description: 'Contact Page'
  },
  {
    url: '/pricing',
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.9',
    description: 'Pricing/Payment Page'
  },
  {
    url: '/features',
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.7',
    description: 'Features Page'
  },
  {
    url: '/docs',
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.6',
    description: 'Documentation'
  },
  {
    url: '/help',
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.6',
    description: 'Help Page'
  },
  {
    url: '/about',
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.5',
    description: 'About Page'
  },
  {
    url: '/blog',
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.7',
    description: 'Blog'
  },
  {
    url: '/api-docs',
    lastmod: currentDate,
    changefreq: 'monthly',
    priority: '0.4',
    description: 'API Documentation'
  },
  {
    url: '/privacy',
    lastmod: currentDate,
    changefreq: 'yearly',
    priority: '0.3',
    description: 'Privacy Policy'
  },
  {
    url: '/terms',
    lastmod: currentDate,
    changefreq: 'yearly',
    priority: '0.3',
    description: 'Terms of Service'
  }
];

// Generate XML sitemap
function generateSitemap() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `
  <!-- ${page.description} -->
  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}

</urlset>`;

  return xml;
}

// Generate robots.txt
function generateRobots() {
  return `User-agent: *
Allow: /

# Allow access to main pages
${pages.map(page => `Allow: ${page.url}`).join('\n')}

# Disallow admin and user-specific pages
Disallow: /admin*
Disallow: /dashboard*
Disallow: /auth*
Disallow: /payment*
Disallow: /widget/*

# Disallow API endpoints
Disallow: /api/*

# Allow CSS and JS files
Allow: /*.css$
Allow: /*.js$

# Sitemap location
Sitemap: ${DOMAIN}/sitemap.xml

# Crawl delay (optional - adjust as needed)
Crawl-delay: 1`;
}

// Write files
function writeSitemap() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write sitemap.xml
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, generateSitemap());
  console.log(`✅ Sitemap generated: ${sitemapPath}`);

  // Write robots.txt
  const robotsPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(robotsPath, generateRobots());
  console.log(`✅ Robots.txt generated: ${robotsPath}`);

  console.log(`\n📊 Generated sitemap with ${pages.length} pages`);
  console.log(`🌐 Domain: ${DOMAIN}`);
  console.log(`📅 Last updated: ${currentDate}`);
}

// Add this script to package.json:
function updatePackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['generate-sitemap'] = 'node scripts/generate-sitemap.js';
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Added 'generate-sitemap' script to package.json`);
  }
}

// Main execution - always run when file is executed directly
console.log('🚀 Generating sitemap and robots.txt...\n');
writeSitemap();
updatePackageJson();

console.log('\n📝 Usage:');
console.log('  npm run generate-sitemap');
console.log('  DOMAIN=https://yoursite.com npm run generate-sitemap');

export {
  generateSitemap,
  generateRobots,
  pages
}; 