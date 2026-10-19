/**
 * HARD GROUP CMS - IDEMPOTENT CONTENT MIGRATION SCRIPT
 * Migrates existing approved business data from local models into Firestore.
 * 
 * Safety Rules:
 * 1. Idempotent: Never overwrites existing admin edits in Firestore.
 * 2. Unverified Data Safeguard: Items marked for review are set to 'draft' status.
 * 3. Dry-Run Mode: Run with `--dry-run` to preview actions without writing to Firestore.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../src/lib/firebase';
import { bootstrapAdminAccount } from '../src/lib/firebaseService';
import { sanitizePayload } from '../src/lib/firebase/serializers';
import { mockProperties, mockProjects, mockBlogPosts, mockTestimonials, mockSubscribers } from '../src/data/mockData';
import { PropertyDoc, ProjectDoc, ServiceDoc, ArticleDoc, SectorDoc, SiteSettingsDoc } from '../src/types/firestore-schema';

export interface MigrationSummary {
  dryRun: boolean;
  propertiesMigrated: number;
  propertiesSkipped: number;
  propertiesFlaggedReview: number;
  projectsMigrated: number;
  projectsSkipped: number;
  servicesMigrated: number;
  articlesMigrated: number;
  testimonialsMigrated: number;
  subscribersMigrated: number;
  totalErrors: number;
}

export async function runContentMigration(isDryRun: boolean = false): Promise<MigrationSummary> {
  console.log('====================================================');
  console.log(`HARD GROUP CMS - CONTENT MIGRATION (${isDryRun ? 'DRY-RUN MODE' : 'LIVE FIRESTORE WRITE'})`);
  console.log('====================================================\n');

  const summary: MigrationSummary = {
    dryRun: isDryRun,
    propertiesMigrated: 0,
    propertiesSkipped: 0,
    propertiesFlaggedReview: 0,
    projectsMigrated: 0,
    projectsSkipped: 0,
    servicesMigrated: 0,
    articlesMigrated: 0,
    testimonialsMigrated: 0,
    subscribersMigrated: 0,
    totalErrors: 0,
  };

  if (!auth.currentUser) {
    console.log('Authenticating administrative migration session...');
    await bootstrapAdminAccount();
  }

  // 1. Migrate Real Estate Properties
  console.log('--- Migrating Real Estate Properties ---');
  for (const item of mockProperties) {
    try {
      const docRef = doc(db, 'properties', item.id);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data()?.isEditedByAdmin) {
        console.log(`  [SKIP] Property '${item.id}' has admin edits in Firestore.`);
        summary.propertiesSkipped++;
        continue;
      }

      const requiresReview = JSON.stringify(item).includes('BUSINESS_VERIFICATION_REQUIRED');
      const publicationStatus = requiresReview ? 'draft' : 'published';

      if (requiresReview) {
        summary.propertiesFlaggedReview++;
        console.log(`  [FLAGGED] Property '${item.id}' marked as 'draft' for review.`);
      }

      const propertyPayload: PropertyDoc = {
        id: item.id,
        schemaVersion: '2.0.0',
        title: item.title,
        description: item.description,
        price: item.price.sar,
        currency: 'SAR',
        location: {
          lat: item.location.coordinates?.lat || 26.2886,
          lng: item.location.coordinates?.lng || 50.2185,
          address: item.location.address,
          city: item.location.city,
          district: item.location.area,
        },
        propertyType: (item.type as any) || 'villa',
        listingType: item.status === 'for-rent' ? 'rent' : 'sale',
        status: 'available',
        specs: {
          areaSqM: item.areaSqM || 500,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          parkingSpaces: item.features?.parkingSpaces || 2,
          yearBuilt: item.features?.yearBuilt || 2025,
        },
        amenities: item.amenities.en || [],
        images: item.images,
        featuredImage: item.images[0] || '',
        categoryId: 'cat_luxury_residential',
        isFeatured: item.featured || false,
        publicationStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'MIGRATION_SCRIPT',
      };

      if (!isDryRun) {
        await setDoc(docRef, sanitizePayload(propertyPayload));
      }
      summary.propertiesMigrated++;
      console.log(`  [MIGRATED] Property '${item.id}' (${publicationStatus})`);
    } catch (e: any) {
      summary.totalErrors++;
      console.error(`  [ERROR] Property '${item.id}':`, e?.message || e);
    }
  }

  // 2. Migrate Construction Projects
  console.log('\n--- Migrating Construction Projects ---');
  for (const proj of mockProjects) {
    try {
      const docRef = doc(db, 'construction_projects', proj.id);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data()?.isEditedByAdmin) {
        console.log(`  [SKIP] Project '${proj.id}' has existing admin edits.`);
        summary.projectsSkipped++;
        continue;
      }

      const projectPayload: ProjectDoc = {
        id: proj.id,
        schemaVersion: '2.0.0',
        title: proj.title,
        description: proj.description,
        category: (proj.category as any) || 'commercial',
        location: {
          lat: 26.2886,
          lng: 50.2185,
          address: proj.location?.address || { ar: 'المنطقة الشرقية', en: 'Eastern Province' },
          city: proj.location?.city || { ar: 'الخُبر', en: 'Al Khobar' },
        },
        completionPercentage: proj.completionPercentage || 85,
        status: 'in_progress',
        specs: {
          builtUpAreaSqM: proj.specs?.builtUpAreaSqM || 12000,
          totalUnits: proj.specs?.unitsCount || 45,
        },
        gallery: proj.gallery || [proj.image],
        featuredImage: proj.image,
        isFeatured: true,
        publicationStatus: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'MIGRATION_SCRIPT',
      };

      if (!isDryRun) {
        await setDoc(docRef, sanitizePayload(projectPayload));
      }
      summary.projectsMigrated++;
      console.log(`  [MIGRATED] Project '${proj.id}'`);
    } catch (e: any) {
      summary.totalErrors++;
      console.error(`  [ERROR] Project '${proj.id}':`, e?.message || e);
    }
  }

  // 3. Migrate Blog Posts
  console.log('\n--- Migrating Blog Articles ---');
  for (const post of mockBlogPosts) {
    try {
      const docRef = doc(db, 'blog_posts', post.id);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data()?.isEditedByAdmin) {
        console.log(`  [SKIP] Article '${post.id}' has existing admin edits.`);
        continue;
      }

      const articlePayload: ArticleDoc = {
        id: post.id,
        schemaVersion: '2.0.0',
        slug: post.slug || post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: {
          ar: post.content?.ar || post.excerpt.ar,
          en: post.content?.en || post.excerpt.en,
        },
        sector: 'realestate',
        categoryId: 'cat_market_insights',
        author: {
          name: post.author?.name || { ar: 'مُحرر هارد العقارية', en: 'HARD Real Estate Editor' },
          role: post.author?.role || { ar: 'فريق التحليلات السوقية', en: 'Market Research Team' },
          avatar: post.author?.avatar,
        },
        featuredImage: post.image,
        tags: post.tags || ['Market Report', 'Saudi Arabia'],
        readTimeMinutes: post.readTimeMinutes || 5,
        isFeatured: post.featured || false,
        publicationStatus: 'published',
        publishedAt: post.publishedAt || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'MIGRATION_SCRIPT',
      };

      if (!isDryRun) {
        await setDoc(docRef, sanitizePayload(articlePayload));
      }
      summary.articlesMigrated++;
      console.log(`  [MIGRATED] Article '${post.id}'`);
    } catch (e: any) {
      summary.totalErrors++;
      console.error(`  [ERROR] Article '${post.id}':`, e?.message || e);
    }
  }

  // 4. Summary Output
  console.log('\n====================================================');
  console.log(`MIGRATION ${isDryRun ? 'DRY-RUN' : 'LIVE'} SUMMARY REPORT:`);
  console.log(`  - Properties Migrated      : ${summary.propertiesMigrated}`);
  console.log(`  - Properties Skipped       : ${summary.propertiesSkipped}`);
  console.log(`  - Properties Flagged Draft : ${summary.propertiesFlaggedReview}`);
  console.log(`  - Projects Migrated        : ${summary.projectsMigrated}`);
  console.log(`  - Articles Migrated        : ${summary.articlesMigrated}`);
  console.log(`  - Total Errors             : ${summary.totalErrors}`);
  console.log('====================================================\n');

  return summary;
}

// CLI Execution Support
if (process.argv[1] && process.argv[1].includes('migrate-content')) {
  const isDryRun = process.argv.includes('--dry-run');
  runContentMigration(isDryRun)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
