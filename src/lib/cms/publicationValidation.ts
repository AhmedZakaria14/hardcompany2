/**
 * HARD GROUP - CMS PRE-PUBLICATION POLICY VALIDATION ENGINE
 * 
 * Validates required fields, bilingual translation completeness, reference integrity,
 * and media asset validity before allowing content publication.
 */

import { PublishValidationError, PublishValidationResult, PolicyCategory } from './publicationTypes';
import { PageDocument, PageSection } from '../sectionSchemas';
import { FormSchemaConfig } from '../forms/formSchemaService';

const VALID_SECTORS = ['portal', 'realestate', 'construction', 'hvac', 'global'];

function isValidUrl(urlString?: string): boolean {
  if (!urlString) return false;
  if (urlString.startsWith('data:image/')) return true; // Data URL support
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates structured Page Document section stack
 */
export function validatePageDocumentForPublish(pageDoc: PageDocument): PublishValidationResult {
  const errors: PublishValidationError[] = [];
  const warnings: string[] = [];

  // 1. Required Fields Policy
  if (!pageDoc.id || pageDoc.id.trim().length === 0) {
    errors.push({
      field: 'id',
      category: 'required_fields',
      messageAr: 'معرف الصفحة مطلوب.',
      messageEn: 'Page document ID is required.',
    });
  }

  if (!pageDoc.slug || pageDoc.slug.trim().length === 0) {
    errors.push({
      field: 'slug',
      category: 'required_fields',
      messageAr: 'مسار الرمز (slug) مطلوب.',
      messageEn: 'Page URL slug is required.',
    });
  }

  if (!pageDoc.sections || !Array.isArray(pageDoc.sections) || pageDoc.sections.length === 0) {
    errors.push({
      field: 'sections',
      category: 'required_fields',
      messageAr: 'يجب أن تحتوي الصفحة على قسم واحد على الأقل قبل النشر.',
      messageEn: 'Page must contain at least one section before publishing.',
    });
  }

  // 2. Bilingual Translations Policy
  if (!pageDoc.title?.ar || pageDoc.title.ar.trim().length < 3) {
    errors.push({
      field: 'title.ar',
      category: 'translations',
      messageAr: 'عنوان الصفحة بالعربية مطلوب ويجب ألا يقل عن 3 أحرف.',
      messageEn: 'Arabic page title is required and must be at least 3 characters.',
    });
  }

  if (!pageDoc.title?.en || pageDoc.title.en.trim().length < 3) {
    errors.push({
      field: 'title.en',
      category: 'translations',
      messageAr: 'عنوان الصفحة بالإنجليزية مطلوب ويجب ألا يقل عن 3 أحرف.',
      messageEn: 'English page title is required and must be at least 3 characters.',
    });
  }

  // Section level translation and media inspection
  if (pageDoc.sections && Array.isArray(pageDoc.sections)) {
    pageDoc.sections.forEach((sec: PageSection, idx: number) => {
      const secNum = idx + 1;

      if (!sec.title?.ar || sec.title.ar.trim().length < 2) {
        errors.push({
          field: `sections[${idx}].title.ar`,
          category: 'translations',
          messageAr: `عنوان القسم رقم ${secNum} بالعربية مفقود أو غير مكتمل.`,
          messageEn: `Section #${secNum} Arabic title is missing or too short.`,
        });
      }

      if (!sec.title?.en || sec.title.en.trim().length < 2) {
        errors.push({
          field: `sections[${idx}].title.en`,
          category: 'translations',
          messageAr: `عنوان القسم رقم ${secNum} بالإنجليزية مفقود أو غير مكتمل.`,
          messageEn: `Section #${secNum} English title is missing or too short.`,
        });
      }

      // Check section content media
      if (sec.content && typeof sec.content === 'object') {
        const c = sec.content as any;
        if (c.bgImageUrl && !isValidUrl(c.bgImageUrl)) {
          errors.push({
            field: `sections[${idx}].bgImageUrl`,
            category: 'media',
            messageAr: `رابط الصورة الخلفية في القسم رقم ${secNum} غير صالحة.`,
            messageEn: `Section #${secNum} background image URL is invalid.`,
          });
        }
      }
    });
  }

  // 3. References Integrity
  if (pageDoc.sector && !VALID_SECTORS.includes(pageDoc.sector)) {
    errors.push({
      field: 'sector',
      category: 'references',
      messageAr: `القطاع المرجعي '${pageDoc.sector}' غير معتمد.`,
      messageEn: `Referenced sector '${pageDoc.sector}' is invalid.`,
    });
  }

  const translationsPassed = !errors.some((e) => e.category === 'translations');
  const referencesPassed = !errors.some((e) => e.category === 'references');
  const mediaPassed = !errors.some((e) => e.category === 'media');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      requiredFieldsCount: errors.filter((e) => e.category === 'required_fields').length,
      translationsPassed,
      referencesPassed,
      mediaPassed,
    },
  };
}

/**
 * Validates Real Estate Property listing
 */
export function validatePropertyForPublish(property: any): PublishValidationResult {
  const errors: PublishValidationError[] = [];
  const warnings: string[] = [];

  // Required
  if (!property.title?.ar || property.title.ar.trim().length < 5) {
    errors.push({
      field: 'title.ar',
      category: 'translations',
      messageAr: 'عنوان العقار بالعربية مطلوب (5 أحرف على الأقل).',
      messageEn: 'Arabic property title is required (at least 5 chars).',
    });
  }
  if (!property.title?.en || property.title.en.trim().length < 5) {
    errors.push({
      field: 'title.en',
      category: 'translations',
      messageAr: 'عنوان العقار بالإنجليزية مطلوب (5 أحرف على الأقل).',
      messageEn: 'English property title is required (at least 5 chars).',
    });
  }

  if (!property.priceSAR || Number(property.priceSAR) <= 0) {
    errors.push({
      field: 'priceSAR',
      category: 'required_fields',
      messageAr: 'السعر بالريال السعودي يجب أن يكون رقماً أكبر من صفر.',
      messageEn: 'Price in SAR must be a positive number.',
    });
  }

  if (!property.propertyType) {
    errors.push({
      field: 'propertyType',
      category: 'required_fields',
      messageAr: 'نوع العقار مطلوب.',
      messageEn: 'Property type is required.',
    });
  }

  // Media validation
  if (!property.images || !Array.isArray(property.images) || property.images.length === 0) {
    errors.push({
      field: 'images',
      category: 'media',
      messageAr: 'يجب تقديم صورة واحدة على الأقل للعقار قبل النشر.',
      messageEn: 'At least one property image is required before publishing.',
    });
  } else {
    property.images.forEach((img: string, i: number) => {
      if (!isValidUrl(img)) {
        errors.push({
          field: `images[${i}]`,
          category: 'media',
          messageAr: `رابط الصورة رقم ${i + 1} غير صالح.`,
          messageEn: `Image URL #${i + 1} is invalid.`,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      requiredFieldsCount: errors.filter((e) => e.category === 'required_fields').length,
      translationsPassed: !errors.some((e) => e.category === 'translations'),
      referencesPassed: !errors.some((e) => e.category === 'references'),
      mediaPassed: !errors.some((e) => e.category === 'media'),
    },
  };
}

/**
 * Validates Development/Construction Project
 */
export function validateProjectForPublish(project: any): PublishValidationResult {
  const errors: PublishValidationError[] = [];
  const warnings: string[] = [];

  if (!project.title?.ar || project.title.ar.trim().length < 5) {
    errors.push({
      field: 'title.ar',
      category: 'translations',
      messageAr: 'اسم المشروع بالعربية مطلوب (5 أحرف على الأقل).',
      messageEn: 'Arabic project name is required (at least 5 chars).',
    });
  }
  if (!project.title?.en || project.title.en.trim().length < 5) {
    errors.push({
      field: 'title.en',
      category: 'translations',
      messageAr: 'اسم المشروع بالإنجليزية مطلوب (5 أحرف على الأقل).',
      messageEn: 'English project name is required (at least 5 chars).',
    });
  }

  if (!project.category) {
    errors.push({
      field: 'category',
      category: 'required_fields',
      messageAr: 'تصنيف المشروع مطلوب.',
      messageEn: 'Project category is required.',
    });
  }

  if (project.completionPercentage !== undefined && (project.completionPercentage < 0 || project.completionPercentage > 100)) {
    errors.push({
      field: 'completionPercentage',
      category: 'required_fields',
      messageAr: 'نسبة الإنجاز يجب أن تكون بين 0% و 100%.',
      messageEn: 'Completion percentage must be between 0% and 100%.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      requiredFieldsCount: errors.filter((e) => e.category === 'required_fields').length,
      translationsPassed: !errors.some((e) => e.category === 'translations'),
      referencesPassed: !errors.some((e) => e.category === 'references'),
      mediaPassed: !errors.some((e) => e.category === 'media'),
    },
  };
}

/**
 * Validates Customer Form Schema
 */
export function validateFormSchemaForPublish(schema: FormSchemaConfig): PublishValidationResult {
  const errors: PublishValidationError[] = [];
  const warnings: string[] = [];

  if (!schema.formType) {
    errors.push({
      field: 'formType',
      category: 'required_fields',
      messageAr: 'نوع النموذج مطلوب.',
      messageEn: 'Form type identifier is required.',
    });
  }

  if (!schema.title?.ar || schema.title.ar.trim().length < 3) {
    errors.push({
      field: 'title.ar',
      category: 'translations',
      messageAr: 'عنوان النموذج بالعربية مطلوب.',
      messageEn: 'Arabic form title is required.',
    });
  }
  if (!schema.title?.en || schema.title.en.trim().length < 3) {
    errors.push({
      field: 'title.en',
      category: 'translations',
      messageAr: 'عنوان النموذج بالإنجليزية مطلوب.',
      messageEn: 'English form title is required.',
    });
  }

  if (!schema.fields || !Array.isArray(schema.fields) || schema.fields.length === 0) {
    errors.push({
      field: 'fields',
      category: 'required_fields',
      messageAr: 'يجب إضافة حقل واحد على الأقل للنموذج.',
      messageEn: 'Form must contain at least one field before publishing.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      requiredFieldsCount: errors.filter((e) => e.category === 'required_fields').length,
      translationsPassed: !errors.some((e) => e.category === 'translations'),
      referencesPassed: !errors.some((e) => e.category === 'references'),
      mediaPassed: !errors.some((e) => e.category === 'media'),
    },
  };
}

/**
 * Main router validator
 */
export function validateEntityForPublish(entityType: string, draftData: any): PublishValidationResult {
  switch (entityType) {
    case 'page_document':
      return validatePageDocumentForPublish(draftData as PageDocument);
    case 'property':
      return validatePropertyForPublish(draftData);
    case 'project':
      return validateProjectForPublish(draftData);
    case 'form_schema':
      return validateFormSchemaForPublish(draftData as FormSchemaConfig);
    default:
      // Basic fallback
      return {
        isValid: Boolean(draftData),
        errors: draftData ? [] : [{ field: 'root', category: 'required_fields', messageAr: 'البيانات مفقودة', messageEn: 'Data payload is missing' }],
        warnings: [],
        summary: { requiredFieldsCount: 0, translationsPassed: true, referencesPassed: true, mediaPassed: true },
      };
  }
}
