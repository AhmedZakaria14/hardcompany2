import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Link,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRightLeft,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Home,
  HardHat,
  ThermometerSnowflake,
  Search,
} from 'lucide-react';
import { Language } from '../../types';
import { getLocalizedText } from '../../lib/utils';
import { SectorId } from '../../types/firestore-schema';
import {
  NavItem,
  NavigationDoc,
  RedirectDoc,
  KNOWN_INTERNAL_DESTINATIONS,
  INFRASTRUCTURE_ROUTES,
  isValidExternalUrl,
  isProtectedInfrastructureRoute,
  isValidSlug,
  getNavigationDoc,
  saveNavigationDoc,
  createUrlRedirect,
  getAllRedirects,
  deleteRedirect,
} from '../../lib/cmsNavigationManager';

interface CMSNavigationManagerProps {
  language: Language;
}

const SECTORS: { id: SectorId; nameAr: string; nameEn: string; icon: any }[] = [
  { id: 'portal', nameAr: 'المجموعة القابضة', nameEn: 'HARD Group Portal', icon: Building2 },
  { id: 'realestate', nameAr: 'قطاع العقارات', nameEn: 'Real Estate Sector', icon: Home },
  { id: 'construction', nameAr: 'قطاع المقاولات', nameEn: 'Construction Sector', icon: HardHat },
  { id: 'hvac', nameAr: 'قطاع التكييف', nameEn: 'HVAC Engineering', icon: ThermometerSnowflake },
];

const DEFAULT_HEADER_ITEMS: NavItem[] = [
  { id: 'nav-1', label: { ar: 'الرئيسية', en: 'Home' }, type: 'internal', targetPath: '/', isVisible: true, order: 1 },
  { id: 'nav-2', label: { ar: 'العقارات والكتالوج', en: 'Properties' }, type: 'internal', targetPath: '/realestate/properties', isVisible: true, order: 2 },
  { id: 'nav-3', label: { ar: 'المشاريع التطويرية', en: 'Projects' }, type: 'internal', targetPath: '/realestate/projects', isVisible: true, order: 3 },
  { id: 'nav-4', label: { ar: 'عن هارد', en: 'About Us' }, type: 'internal', targetPath: '/realestate/about', isVisible: true, order: 4 },
  { id: 'nav-5', label: { ar: 'اتصل بنا', en: 'Contact' }, type: 'internal', targetPath: '/realestate/contact', isVisible: true, order: 5 },
];

export const CMSNavigationManager: React.FC<CMSNavigationManagerProps> = ({ language }) => {
  const isAr = language === 'ar';

  const [activeSector, setActiveSector] = useState<SectorId>('portal');
  const [menuType, setMenuType] = useState<'header' | 'footer' | 'sector_bar'>('header');
  const [activeTab, setActiveTab] = useState<'menus' | 'redirects' | 'diagnostics'>('menus');

  const [items, setItems] = useState<NavItem[]>(DEFAULT_HEADER_ITEMS);
  const [redirects, setRedirects] = useState<RedirectDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Item State
  const [newItemLabelAr, setNewItemLabelAr] = useState('');
  const [newItemLabelEn, setNewItemLabelEn] = useState('');
  const [newItemType, setNewItemType] = useState<'internal' | 'external'>('internal');
  const [newItemPath, setNewItemPath] = useState('/');

  // New Redirect State
  const [redirectSource, setRedirectSource] = useState('');
  const [redirectTarget, setRedirectTarget] = useState('');
  const [redirectError, setRedirectError] = useState<string | null>(null);

  const docId = `${menuType}_${activeSector}`;

  // Load menu document
  useEffect(() => {
    async function loadMenu() {
      setIsLoading(true);
      const navDoc = await getNavigationDoc(docId);
      if (navDoc && navDoc.items && navDoc.items.length > 0) {
        setItems(navDoc.items.sort((a, b) => a.order - b.order));
      } else {
        setItems(DEFAULT_HEADER_ITEMS);
      }
      setIsLoading(false);
    }
    loadMenu();
  }, [docId]);

  // Load redirects
  useEffect(() => {
    async function loadRedirs() {
      const list = await getAllRedirects();
      setRedirects(list);
    }
    loadRedirs();
  }, []);

  const handleAddItem = () => {
    if (!newItemLabelAr.trim() || !newItemLabelEn.trim()) {
      setStatusMessage({ type: 'error', text: isAr ? 'يرجى إدخال التسمية بالعربية والإنجليزية' : 'Please fill both Arabic and English labels' });
      return;
    }

    if (newItemType === 'external' && !isValidExternalUrl(newItemPath)) {
      setStatusMessage({ type: 'error', text: isAr ? 'رابط خارجي غير صالح أو يحوي مخاطر تحويل مفتوح' : 'Invalid external URL or potential open redirect hazard' });
      return;
    }

    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: { ar: newItemLabelAr.trim(), en: newItemLabelEn.trim() },
      type: newItemType,
      targetPath: newItemPath.trim(),
      isVisible: true,
      order: items.length + 1,
    };

    setItems([...items, newItem]);
    setNewItemLabelAr('');
    setNewItemLabelEn('');
    setNewItemPath('/');
    setStatusMessage({ type: 'success', text: isAr ? 'تمت إضافة العنصر للقائمة' : 'Item added to menu' });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, isVisible: !item.isVisible } : item))
    );
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) {
      return;
    }
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Re-assign order numbers
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
  };

  const handleSaveMenu = async () => {
    setStatusMessage(null);
    try {
      const navDoc: NavigationDoc = {
        id: docId,
        sector: activeSector,
        menuType,
        items,
        updatedAt: new Date().toISOString(),
      };
      await saveNavigationDoc(navDoc);
      setStatusMessage({ type: 'success', text: isAr ? 'تم حفظ الترتيب والقوائم بنجاح في Firestore!' : 'Navigation menu saved to Firestore!' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e?.message || (isAr ? 'فشل حفظ القائمة' : 'Failed to save menu') });
    }
  };

  const handleCreateRedirect = async () => {
    setRedirectError(null);
    if (!redirectSource.trim() || !redirectTarget.trim()) {
      setRedirectError(isAr ? 'يرجى إدخال الرابط القديم والرابط الجديد' : 'Source and target slugs required');
      return;
    }

    if (isProtectedInfrastructureRoute(redirectSource)) {
      setRedirectError(isAr ? 'غير مسموح بتحويل مسارات النظام والبنية التحتية (/admin, /api)' : 'Cannot redirect infrastructure routes (/admin, /api)');
      return;
    }

    try {
      const created = await createUrlRedirect(redirectSource, redirectTarget, activeSector);
      setRedirects([created, ...redirects]);
      setRedirectSource('');
      setRedirectTarget('');
      setStatusMessage({ type: 'success', text: isAr ? 'تم إنشاء التوجيه بنجاح (301 Redirect)' : 'Redirect created successfully' });
    } catch (e: any) {
      setRedirectError(e?.message || (isAr ? 'فشل إنشاء التوجيه' : 'Failed to create redirect'));
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    await deleteRedirect(id);
    setRedirects(redirects.filter((r) => r.id !== id));
  };

  // Diagnostic check for broken references
  const brokenLinks = items.filter((item) => {
    if (item.type === 'external') return !isValidExternalUrl(item.targetPath);
    return !KNOWN_INTERNAL_DESTINATIONS.some((d) => d.path === item.targetPath) && !item.targetPath.startsWith('/realestate/') && !item.targetPath.startsWith('/construction/') && !item.targetPath.startsWith('/hvac/');
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 font-bold">
            <Menu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display-serif">
              {isAr ? 'إدارة القوائم والتوجيه وروابط القطاعات' : 'Navigation, Menus & URL Redirects'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'إدارة روابط الهيدر والفوتر، ترتيب العناصر، فحص الروابط المكسورة، وإنشاء التوجيهات تلقائياً (301)'
                : 'Manage header/footer menus, reorder items, check broken links, and configure 301 URL redirects'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('menus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'menus' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'القوائم والترتيب' : 'Menus & Ordering'}
          </button>
          <button
            onClick={() => setActiveTab('redirects')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'redirects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'التوجيه التلقائي (301)' : '301 Redirects'}
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'diagnostics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isAr ? 'تشخيص الروابط' : 'Diagnostics'}</span>
            {brokenLinks.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'menus' && (
        <div className="space-y-6">
          {/* Sector & Menu Selector Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sector Picker */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{isAr ? 'القطاع المستهدف:' : 'Sector:'}</span>
              <div className="flex gap-1 overflow-x-auto w-full">
                {SECTORS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSector(sec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeSector === sec.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isAr ? sec.nameAr : sec.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Type Picker */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{isAr ? 'نوع القائمة:' : 'Menu Type:'}</span>
              <div className="flex gap-1 overflow-x-auto w-full">
                {[
                  { id: 'header', labelAr: 'القائمة العلوية (Header)', labelEn: 'Header Navbar' },
                  { id: 'footer', labelAr: 'قائمة الفوتر (Footer)', labelEn: 'Footer Links' },
                  { id: 'sector_bar', labelAr: 'مبدل القطاعات', labelEn: 'Sector Bar' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMenuType(m.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      menuType === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isAr ? m.labelAr : m.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Item Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'إضافة عنصر جديد للقائمة' : 'Add New Navigation Item'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'التسمية (بالعربية)' : 'Label (Arabic)'}</label>
                <input
                  type="text"
                  value={newItemLabelAr}
                  onChange={(e) => setNewItemLabelAr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  placeholder="مثال: العقارات"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'التسمية (بالإنجليزية)' : 'Label (English)'}</label>
                <input
                  type="text"
                  value={newItemLabelEn}
                  onChange={(e) => setNewItemLabelEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  placeholder="e.g. Properties"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'نوع الرابط' : 'Link Type'}</label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                >
                  <option value="internal">{isAr ? 'داخلي (Internal Destination)' : 'Internal Destination'}</option>
                  <option value="external">{isAr ? 'خارجي (Validated External)' : 'Validated External'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الوجهة / المسار' : 'Destination Path'}</label>
                {newItemType === 'internal' ? (
                  <select
                    value={newItemPath}
                    onChange={(e) => setNewItemPath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                  >
                    {KNOWN_INTERNAL_DESTINATIONS.map((dest) => (
                      <option key={dest.path} value={dest.path}>
                        {dest.path} ({isAr ? dest.labelAr : dest.labelEn})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newItemPath}
                    onChange={(e) => setNewItemPath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                    placeholder="https://..."
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة إلى القائمة' : 'Add Item'}</span>
            </button>
          </div>

          {/* Menu Reordering List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {isAr ? 'ترتيب وإدارة عناصر القائمة الحالية' : 'Current Menu Items & Ordering'}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {items.length} {isAr ? 'عناصر' : 'items'}
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                    item.isVisible ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                      {item.order}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{getLocalizedText(item.label, language)}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          item.type === 'internal' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block truncate">{item.targetPath}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Move Up/Down */}
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveUp className="w-3 h-3 text-slate-700" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveDown className="w-3 h-3 text-slate-700" />
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      onClick={() => handleToggleVisibility(item.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        item.isVisible ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-200 border-slate-300 text-slate-500'
                      }`}
                    >
                      {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Action Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {statusMessage && (
                <span className={`text-xs font-bold ${statusMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {statusMessage.text}
                </span>
              )}

              <button
                onClick={handleSaveMenu}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ التغييرات في Firestore' : 'Save Navigation to Firestore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 301 Redirects Tab */}
      {activeTab === 'redirects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'إنشاء تحويل مسار تلقائي (301 Permanent Redirect)' : 'Create 301 URL Redirect'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الرابط القديم (Source Slug)' : 'Source Slug (Old URL)'}</label>
                <input
                  type="text"
                  value={redirectSource}
                  onChange={(e) => setRedirectSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                  placeholder="/realestate/properties/old-listing-slug"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isAr ? 'الرابط الجديد (Target Slug)' : 'Target Slug (New URL)'}</label>
                <input
                  type="text"
                  value={redirectTarget}
                  onChange={(e) => setRedirectTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono"
                  placeholder="/realestate/properties/new-listing-slug"
                />
              </div>
            </div>

            {redirectError && (
              <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{redirectError}</span>
              </p>
            )}

            <button
              onClick={handleCreateRedirect}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة التوجيه' : 'Create Redirect Rule'}</span>
            </button>
          </div>

          {/* Active Redirects Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              {isAr ? 'قواعد التوجيه المفعلة حالياً' : 'Active URL Redirect Rules'}
            </h3>

            {redirects.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">{isAr ? 'لا توجد قواعد توجيه مسجلة بعد' : 'No redirects recorded yet'}</p>
            ) : (
              <div className="space-y-2">
                {redirects.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono text-slate-800 truncate">
                      <span className="text-rose-600 line-through">{r.sourceSlug}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-emerald-600 font-bold">{r.targetSlug}</span>
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">301</span>
                    </div>

                    <button
                      onClick={() => handleDeleteRedirect(r.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>{isAr ? 'تشخيص سلامة القوائم ومسارات البنية التحتية' : 'Navigation Integrity & Security Diagnostics'}</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">
                {isAr ? 'حماية مسارات البنية التحتية (Protected Infrastructure Routes)' : 'Protected Infrastructure Routes'}
              </span>
              <div className="flex flex-wrap gap-2">
                {INFRASTRUCTURE_ROUTES.map((route) => (
                  <span key={route} className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg font-mono text-[11px] font-bold">
                    🔒 {route}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isAr ? 'يتم حظر تعديل أو إعادة توجيه هذه المسارات لحماية سلامة النظام وعمل لوحة التحكم' : 'These infrastructure routes are protected to prevent broken admin flows or open redirects.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <span className="font-bold text-amber-900 block">
                {isAr ? 'نتائج فحص الروابط المكسورة (Broken References Check)' : 'Broken References Check'}
              </span>
              {brokenLinks.length === 0 ? (
                <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'جميع روابط القوائم الحالية سليمة ومتصلة بوجهات سارية!' : 'All menu items point to valid destinations!'}</span>
                </p>
              ) : (
                <div className="space-y-1">
                  {brokenLinks.map((b) => (
                    <div key={b.id} className="text-amber-900 font-mono text-[11px]">
                      ⚠️ {getLocalizedText(b.label, language)} ➔ <span className="underline">{b.targetPath}</span> ({isAr ? 'وجهة غير معروفة' : 'Unknown target'})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
