import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Tag,
  Settings2,
  Lock,
  Mail,
  RefreshCw,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  Send,
} from 'lucide-react';
import { Language } from '../../types';
import { CustomerFormType } from '../../lib/forms/formSubmissionService';
import { useDraftAutosave } from '../../lib/cms/useDraftAutosave';
import { DraftStatusBadge } from '../components/DraftStatusBadge';
import { PublishValidationModal } from '../components/PublishValidationModal';
import { PublisherUser } from '../../lib/cms/publicationTypes';
import {
  FormSchemaConfig,
  FormFieldConfig,
  ALLOWED_FIELD_TYPES,
  AllowedFieldType,
  getFormSchemaConfig,
  saveFormSchemaConfig,
  DEFAULT_FORM_SCHEMAS,
} from '../../lib/forms/formSchemaService';

interface CMSFormSchemaEditorProps {
  language: Language;
  currentAdminEmail?: string;
}

const FORM_TYPES_LIST: { id: CustomerFormType; labelAr: string; labelEn: string; iconName: string }[] = [
  { id: 'general_contact', labelAr: 'استفسار عام (المقر الرئيسي)', labelEn: 'General Inquiry (Group HQ)', iconName: 'Mail' },
  { id: 'property_inquiry', labelAr: 'استفسار عن عقار', labelEn: 'Property Inquiry', iconName: 'Building' },
  { id: 'list_property', labelAr: 'عرض عقار للبيع / الإيجار', labelEn: 'List Property', iconName: 'Tag' },
  { id: 'valuation_request', labelAr: 'طلب تقييم عقاري', labelEn: 'Valuation Request', iconName: 'Calculator' },
  { id: 'book_viewing', labelAr: 'حجز معاينة ميدانية', labelEn: 'Book Viewing', iconName: 'Clock' },
  { id: 'project_inquiry', labelAr: 'استفسار عن مشاريع التطوير', labelEn: 'Project Inquiry', iconName: 'Layers' },
  { id: 'construction_quote', labelAr: 'تسعير مقاولات وبناء', labelEn: 'Construction Quote', iconName: 'FileText' },
  { id: 'hvac_service', labelAr: 'طلب خدمات التكييف HVAC', labelEn: 'HVAC Service', iconName: 'Settings2' },
  { id: 'newsletter_signup', labelAr: 'النشرة البريدية', labelEn: 'Newsletter Signup', iconName: 'Send' },
];

export const CMSFormSchemaEditor: React.FC<CMSFormSchemaEditorProps> = ({
  language,
  currentAdminEmail = 'admin@hardgp.com',
}) => {
  const isAr = language === 'ar';
  const [selectedFormType, setSelectedFormType] = useState<CustomerFormType>('general_contact');
  const [schemaConfig, setSchemaConfig] = useState<FormSchemaConfig>(DEFAULT_FORM_SCHEMAS.general_contact);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'fields' | 'copy' | 'workflow'>('fields');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const draftState = useDraftAutosave({
    entityType: 'form_schema',
    entityId: selectedFormType,
    currentData: schemaConfig,
    userEmail: currentAdminEmail,
    debounceMs: 1500,
    onDraftLoaded: (record) => {
      if (record.data && record.data.fields) {
        setSchemaConfig(record.data);
      }
    },
  });

  // Load active form schema when form type changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setSaveStatus(null);

    getFormSchemaConfig(selectedFormType)
      .then((loaded) => {
        if (isMounted) {
          setSchemaConfig(loaded);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load form schema:', err);
        if (isMounted) {
          setSchemaConfig(DEFAULT_FORM_SCHEMAS[selectedFormType]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFormType]);

  // Update a top-level field in schema
  const handleUpdateTopLevel = (key: keyof FormSchemaConfig, value: any) => {
    setSchemaConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Update localized text (title, description, confirmationCopy)
  const handleUpdateLocalized = (
    parentKey: 'title' | 'description' | 'confirmationTitle' | 'confirmationMessage',
    langKey: 'ar' | 'en',
    value: string
  ) => {
    setSchemaConfig((prev) => {
      if (parentKey === 'title') {
        return { ...prev, title: { ...prev.title, [langKey]: value } };
      }
      if (parentKey === 'description') {
        return { ...prev, description: { ...prev.description, [langKey]: value } };
      }
      if (parentKey === 'confirmationTitle') {
        return {
          ...prev,
          confirmationCopy: {
            ...prev.confirmationCopy,
            title: { ...prev.confirmationCopy.title, [langKey]: value },
          },
        };
      }
      if (parentKey === 'confirmationMessage') {
        return {
          ...prev,
          confirmationCopy: {
            ...prev.confirmationCopy,
            message: { ...prev.confirmationCopy.message, [langKey]: value },
          },
        };
      }
      return prev;
    });
  };

  // Update workflow settings
  const handleUpdateWorkflow = (key: keyof FormSchemaConfig['workflowSettings'], value: any) => {
    setSchemaConfig((prev) => ({
      ...prev,
      workflowSettings: {
        ...prev.workflowSettings,
        [key]: value,
      },
    }));
  };

  // Field Array Management
  const handleUpdateField = (index: number, fieldUpdates: Partial<FormFieldConfig>) => {
    setSchemaConfig((prev) => {
      const newFields = [...prev.fields];
      newFields[index] = { ...newFields[index], ...fieldUpdates };
      return { ...prev, fields: newFields };
    });
  };

  const handleAddField = () => {
    const newFieldId = `field_${Date.now().toString(36)}`;
    const newField: FormFieldConfig = {
      id: newFieldId,
      type: 'text',
      label: { ar: 'حقل جديد', en: 'New Field' },
      placeholder: { ar: '', en: '' },
      helpText: { ar: '', en: '' },
      required: false,
      isSystemCritical: false,
    };
    setSchemaConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleRemoveField = (index: number) => {
    const target = schemaConfig.fields[index];
    if (target?.isSystemCritical) {
      alert(
        isAr
          ? 'لا يمكن حذف حقل النظام الأساسي لحماية هيكل البيانات المطلوب.'
          : 'System critical fields cannot be deleted to preserve core data validation.'
      );
      return;
    }
    setSchemaConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  // Save Config to Firestore via Server Validation Service
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const result = await saveFormSchemaConfig(selectedFormType, schemaConfig, currentAdminEmail);
    setIsSaving(false);

    if (result.success) {
      setSaveStatus({
        success: true,
        message: isAr
          ? `تم تحديث نموذج الخدمة بنجاح وحفظ الإصدار الجديد (v${result.newVersion})`
          : `Form schema saved successfully as version v${result.newVersion}`,
      });
      // Refresh local view
      setSchemaConfig((prev) => ({ ...prev, schemaVersion: result.newVersion }));
    } else {
      setSaveStatus({
        success: false,
        message:
          (result.errors && result.errors.join(' | ')) ||
          (isAr ? 'حدث خطأ أثناء حفظ التعديلات.' : 'An error occurred while saving.'),
      });
    }
  };

  return (
    <div className="space-y-8 text-start font-ui-sans">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدارة النماذج والتحقق البرمجي' : 'Controlled Form Schema Engine'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display-serif">
            {isAr ? 'إعداد نصوص وحقول نماذج العملاء' : 'Customer Form Builder & Schemas'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            {isAr
              ? 'تخصيص المسميات، نصوص المساعدة، خيارات التوجيه، وحقول النماذج مع الحفاظ على المعايير الأمنية وإصدارات السجل.'
              : 'Configure localized labels, help texts, workflow rules, and validated field schemas without risking arbitrary script injection.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DraftStatusBadge
            status={draftState.saveStatus}
            revision={draftState.revision}
            lastSavedAt={draftState.lastSavedAt}
            errorMessage={draftState.errorMessage}
            isOffline={draftState.isOffline}
            conflictRemoteRecord={draftState.conflictRemoteRecord}
            language={language}
            onForceSave={draftState.forceSave}
            onResolveUseRemote={draftState.resolveConflictUseRemote}
            onResolveForceOverwrite={draftState.resolveConflictForceOverwrite}
          />

          <button
            onClick={() => setIsPublishModalOpen(true)}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isAr ? 'حفظ التغييرات والنشر' : 'Save & Publish Schema'}</span>
          </button>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
            saveStatus.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {saveStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="font-semibold">{saveStatus.message}</div>
        </div>
      )}

      {/* Form Selector Grid */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {isAr ? 'اختر نموذج الخدمة للتعديل' : 'Select Customer Form to Configure'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FORM_TYPES_LIST.map((formItem) => {
            const isSelected = selectedFormType === formItem.id;
            return (
              <button
                key={formItem.id}
                onClick={() => setSelectedFormType(formItem.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-bold shadow-xs'
                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/80 text-slate-700 font-medium'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs block truncate">
                    {isAr ? formItem.labelAr : formItem.labelEn}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {formItem.id}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Schema Workspace */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        {/* Schema Status Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display-serif">
                {isAr ? (schemaConfig.title?.ar || schemaConfig.title?.en || '') : (schemaConfig.title?.en || schemaConfig.title?.ar || '')}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {isAr ? 'نوع النموذج:' : 'Form Type:'} {schemaConfig.formType} | {isAr ? 'القطاع:' : 'Sector:'} {schemaConfig.sector}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-xs border border-slate-300">
              v{schemaConfig.schemaVersion || '1.0.0'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'آخر تحديث:' : 'Updated:'} {new Date(schemaConfig.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Editor Sub-Tabs Navigation */}
        <div className="border-b border-slate-200 px-6 bg-white flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('fields')}
            className={`py-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'fields'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'حقول النموذج وشروط التحقق' : 'Fields & Validation Rules'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('copy')}
            className={`py-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'copy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'العناوين ونصوص التأكيد' : 'Localized Titles & Copy'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('workflow')}
            className={`py-4 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'workflow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isAr ? 'إعدادات التوجيه والبريد' : 'Workflow & Notification Rules'}</span>
          </button>
        </div>

        {/* SUB-TAB 1: FIELDS & VALIDATION */}
        {activeSubTab === 'fields' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isAr ? 'قائمة الحقول المدعومة القابلة للتحديد' : 'Form Fields & Schema Configuration'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'الحقول المعلمة بعلامة القفل هي حقول أساسية بالنظام ولا يمكن إزالة إلزاميتها.'
                    : 'System critical fields marked with a lock icon cannot have required validation disabled.'}
                </p>
              </div>

              <button
                onClick={handleAddField}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة حقل جديد' : 'Add Custom Field'}</span>
              </button>
            </div>

            {/* Field Rows List */}
            <div className="space-y-4">
              {schemaConfig.fields.map((field, idx) => (
                <div
                  key={field.id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      {field.isSystemCritical ? (
                        <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800" title="System Critical Field">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                          <Tag className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="font-mono text-xs font-bold text-slate-800">
                        ID: {field.id}
                      </span>
                      {field.isSystemCritical && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                          {isAr ? 'حقل أمني أساسي' : 'System Critical'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Field Type Select (Whitelisted) */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 font-medium">{isAr ? 'نوع الحقل:' : 'Type:'}</span>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleUpdateField(idx, { type: e.target.value as AllowedFieldType })
                          }
                          disabled={field.isSystemCritical}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ALLOWED_FIELD_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Required Checkbox */}
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          disabled={field.isSystemCritical}
                          onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{isAr ? 'مطلوب (إجباري)' : 'Required'}</span>
                      </label>

                      {/* Remove Button */}
                      {!field.isSystemCritical && (
                        <button
                          onClick={() => handleRemoveField(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title={isAr ? 'حذف الحقل' : 'Delete Field'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Localized Labels Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isAr ? 'العنوان بالعربية (Label AR)' : 'Arabic Label'}
                      </label>
                      <input
                        type="text"
                        value={field.label?.ar || ''}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            label: { ...field.label, ar: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        {isAr ? 'العنوان بالإنجليزية (Label EN)' : 'English Label'}
                      </label>
                      <input
                        type="text"
                        value={field.label?.en || ''}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            label: { ...field.label, en: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Localized Placeholders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">
                        {isAr ? 'النص الإرشادي (Placeholder AR)' : 'Arabic Placeholder'}
                      </label>
                      <input
                        type="text"
                        value={field.placeholder?.ar || ''}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            placeholder: {
                              ar: e.target.value,
                              en: field.placeholder?.en || '',
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">
                        {isAr ? 'النص الإرشادي (Placeholder EN)' : 'English Placeholder'}
                      </label>
                      <input
                        type="text"
                        value={field.placeholder?.en || ''}
                        onChange={(e) =>
                          handleUpdateField(idx, {
                            placeholder: {
                              ar: field.placeholder?.ar || '',
                              en: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: LOCALIZED TITLES & COPY */}
        {activeSubTab === 'copy' && (
          <div className="p-6 space-y-6 text-xs">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-display-serif">
                {isAr ? 'عناوين ووصف النموذج' : 'Form Titles & Subtitles'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'عنوان النموذج (عربي)' : 'Form Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={schemaConfig.title?.ar || ''}
                    onChange={(e) => handleUpdateLocalized('title', 'ar', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'عنوان النموذج (إنجليزي)' : 'Form Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={schemaConfig.title?.en || ''}
                    onChange={(e) => handleUpdateLocalized('title', 'en', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'وصف النموذج (عربي)' : 'Form Subtitle (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={schemaConfig.description?.ar || ''}
                    onChange={(e) => handleUpdateLocalized('description', 'ar', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'وصف النموذج (إنجليزي)' : 'Form Subtitle (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={schemaConfig.description?.en || ''}
                    onChange={(e) => handleUpdateLocalized('description', 'en', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-display-serif">
                {isAr ? 'رسالة التأكيد والنجاح بعد الإرسال' : 'Post-Submission Confirmation Copy'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'عنوان نجاح الإرسال (عربي)' : 'Success Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={schemaConfig.confirmationCopy?.title?.ar || ''}
                    onChange={(e) => handleUpdateLocalized('confirmationTitle', 'ar', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'عنوان نجاح الإرسال (إنجليزي)' : 'Success Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={schemaConfig.confirmationCopy?.title?.en || ''}
                    onChange={(e) => handleUpdateLocalized('confirmationTitle', 'en', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'نص رسالة النجاح (عربي)' : 'Success Message (Arabic)'}
                  </label>
                  <textarea
                    rows={3}
                    value={schemaConfig.confirmationCopy?.message?.ar || ''}
                    onChange={(e) => handleUpdateLocalized('confirmationMessage', 'ar', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    {isAr ? 'نص رسالة النجاح (إنجليزي)' : 'Success Message (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={schemaConfig.confirmationCopy.message.en}
                    onChange={(e) => handleUpdateLocalized('confirmationMessage', 'en', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: WORKFLOW & NOTIFICATION RULES */}
        {activeSubTab === 'workflow' && (
          <div className="p-6 space-y-6 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">
                  {isAr ? 'ضوابط توجيه البيانات والأمان' : 'Data Destination & Dispatch Protection'}
                </span>
                <p className="leading-relaxed text-[11px]">
                  {isAr
                    ? 'يجب أن يكون البريد الإلكتروني للتنبيهات ضمن النطاقات المعتمدة للمؤسسة (@hardgp.com أو @hard.com.sa) لمنع إعادة توجيه بيانات العملاء إلى جهات خارجية.'
                    : 'Notification recipient email must strictly belong to approved company domains (@hardgp.com or @hard.com.sa) to prevent leaking private customer data.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {isAr ? 'بادئة رمز التتبع (Tracking Code Prefix)' : 'Tracking Code Prefix'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={schemaConfig.workflowSettings.trackingPrefix}
                  onChange={(e) => handleUpdateWorkflow('trackingPrefix', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {isAr ? 'القسم أو الإدارة المسؤولة' : 'Dispatch Department'}
                </label>
                <input
                  type="text"
                  value={schemaConfig.workflowSettings.dispatchDepartment}
                  onChange={(e) => handleUpdateWorkflow('dispatchDepartment', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {isAr ? 'بريد استقبال التنبيهات المعتمد' : 'Approved Notification Email'}
                </label>
                <input
                  type="email"
                  value={schemaConfig.workflowSettings.notificationEmail}
                  onChange={(e) => handleUpdateWorkflow('notificationEmail', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schemaConfig.workflowSettings.autoResponseEnabled}
                    onChange={(e) => handleUpdateWorkflow('autoResponseEnabled', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{isAr ? 'تفعيل التتبع التلقائي والرد' : 'Enable Automated Dispatch & Tracking'}</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Publication Audit & Validation Modal */}
      <PublishValidationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={(v) => {
          setSaveStatus({
            success: true,
            message: isAr
              ? `تم تحديث ونشر نموذج الخدمة بنجاح (v${v})`
              : `Form schema published successfully as version v${v}`,
          });
          setSchemaConfig((prev) => ({ ...prev, schemaVersion: String(v) }));
        }}
        entityType="form_schema"
        entityId={selectedFormType}
        sector="global"
        draftData={schemaConfig}
        publisherUser={{
          uid: 'admin-1',
          email: currentAdminEmail,
          role: 'superadmin',
        }}
        language={language}
      />
    </div>
  );
};
