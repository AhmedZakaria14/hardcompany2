import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, RotateCcw, X } from 'lucide-react';
import { Language } from '../../types';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface FloatingTextEditorProps {
  currentLanguage: Language;
  onLanguageChange?: (lang: Language) => void;
}

const STORAGE_KEY_PREFIX = 'hard_real_estate_page_edits_';

export function FloatingTextEditor({ currentLanguage }: FloatingTextEditorProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAuthorizedAdmin());
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const originalSnapshotRef = useRef<Map<string, string>>(new Map());

  // Listen for login/logout auth state changes
  useEffect(() => {
    const checkAuth = () => {
      const authorized = isAuthorizedAdmin();
      setIsAdmin(authorized);
      if (!authorized && isEditing) {
        setIsEditing(false);
      }
    };

    checkAuth();
    window.addEventListener('cms-auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('cms-auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [isEditing]);

  // Storage key for the active language
  const storageKey = `${STORAGE_KEY_PREFIX}${currentLanguage}`;

  // Helper to generate a stable selector/key for an editable text element
  const getElementKey = (el: HTMLElement, index: number): string => {
    if (el.id) return `#${el.id}`;
    const tagName = el.tagName.toLowerCase();
    const parentId = el.parentElement?.id ? `#${el.parentElement.id} > ` : '';
    return `${parentId}${tagName}[data-edit-idx="${index}"]`;
  };

  // Restore saved edits from localStorage on mount and language switch (only for authorized admin)
  const restoreSavedEdits = () => {
    if (!isAuthorizedAdmin()) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const edits: Record<string, string> = JSON.parse(saved);

      // Apply saved innerText / textContent
      const editableElements = document.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, strong, em, b'
      );

      editableElements.forEach((el, index) => {
        // Skip elements inside our floating tool or script/style
        if (el.closest('#dev-inline-text-editor-tool')) return;
        const key = getElementKey(el, index);
        if (edits[key] !== undefined && el.innerText !== edits[key]) {
          // If the element has only text children, update directly
          if (el.children.length === 0 || el.children.length === 1 && el.firstElementChild?.tagName === 'SPAN') {
            el.innerText = edits[key];
          }
        }
      });
    } catch (e) {
      console.warn('Failed to restore edits', e);
    }
  };

  // Save all modified texts to localStorage
  const handleSave = () => {
    if (!isAuthorizedAdmin()) {
      console.warn('[Authorization Guard] Refused save action for unauthorized user.');
      return;
    }
    try {
      const edits: Record<string, string> = {};
      const editableElements = document.querySelectorAll<HTMLElement>(
        'h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, strong, em, b'
      );

      editableElements.forEach((el, index) => {
        if (el.closest('#dev-inline-text-editor-tool')) return;
        if (el.children.length > 2) return; // avoid outer container blocks
        const text = el.innerText?.trim();
        if (text) {
          const key = getElementKey(el, index);
          edits[key] = text;
        }
      });

      localStorage.setItem(storageKey, JSON.stringify(edits));
      setShowSavedToast(true);
      setHasChanges(false);
      setTimeout(() => setShowSavedToast(false), 2000);
    } catch (e) {
      console.error('Failed to save inline edits', e);
    }
  };

  // Reset all edits back to defaults
  const handleReset = () => {
    if (!isAuthorizedAdmin()) {
      console.warn('[Authorization Guard] Refused reset action for unauthorized user.');
      return;
    }
    try {
      localStorage.removeItem(storageKey);
      window.location.reload();
    } catch (e) {
      console.error('Failed to reset edits', e);
    }
  };

  // Toggle Edit Mode
  const toggleEditMode = () => {
    if (!isAuthorizedAdmin()) {
      console.warn('[Authorization Guard] Refused toggle edit mode for unauthorized user.');
      setIsEditing(false);
      return;
    }
    const nextState = !isEditing;
    setIsEditing(nextState);

    // Apply or remove contenteditable on text elements
    const editableElements = document.querySelectorAll<HTMLElement>(
      'h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, strong, em, b'
    );

    editableElements.forEach((el, index) => {
      if (el.closest('#dev-inline-text-editor-tool')) return;

      // Don't make giant parent wrappers editable, only direct text containers
      if (el.children.length > 3) return;

      if (nextState) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-edit-idx', String(index));
        el.classList.add('inline-editable-target');

        // Prevent links and buttons from navigating while in edit mode
        const preventNav = (e: MouseEvent) => {
          if (nextState) {
            e.stopPropagation();
          }
        };
        (el as any).__preventNav = preventNav;
        el.addEventListener('click', preventNav);

        const handleInput = () => {
          setHasChanges(true);
        };
        (el as any).__handleInput = handleInput;
        el.addEventListener('input', handleInput);
      } else {
        el.removeAttribute('contenteditable');
        el.classList.remove('inline-editable-target');

        if ((el as any).__preventNav) {
          el.removeEventListener('click', (el as any).__preventNav);
        }
        if ((el as any).__handleInput) {
          el.removeEventListener('input', (el as any).__handleInput);
        }
      }
    });

    if (!nextState && hasChanges) {
      handleSave();
    }
  };

  // Restore edits on initial mount or when language changes
  useEffect(() => {
    if (!isAdmin) return;
    // Delay slightly to let React render pages
    const timer = setTimeout(() => {
      restoreSavedEdits();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentLanguage, isAdmin]);

  // Clean up contenteditable if component unmounts or admin status drops
  useEffect(() => {
    return () => {
      document.querySelectorAll<HTMLElement>('.inline-editable-target').forEach((el) => {
        el.removeAttribute('contenteditable');
        el.classList.remove('inline-editable-target');
      });
    };
  }, []);

  // Strict Security Gate: Render NOTHING for anonymous / non-admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      {/* Dynamic CSS styles for inline editable targets */}
      <style>{`
        .inline-editable-target {
          cursor: text !important;
          transition: outline 0.15s ease, background-color 0.15s ease;
        }
        .inline-editable-target:hover {
          outline: 1.5px dashed #006cdb !important;
          outline-offset: 2px;
          background-color: rgba(0, 108, 219, 0.06) !important;
        }
        .inline-editable-target:focus {
          outline: 2px solid #005ec4 !important;
          outline-offset: 2px;
          background-color: rgba(0, 108, 219, 0.1) !important;
        }
      `}</style>

      {/* Floating Small Icon / Bar centered at page bottom */}
      <div
        id="dev-inline-text-editor-tool"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 select-none"
        dir="ltr"
      >
        {!isEditing ? (
          /* Small Floating Icon Button (Click to start editing with cursor) */
          <button
            type="button"
            onClick={toggleEditMode}
            className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-blue-500 shadow-xl flex items-center justify-center transition-all transform hover:scale-110 duration-200 cursor-pointer backdrop-blur-md group"
            title="Click to edit text directly on page with cursor"
          >
            <Edit2 className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
          </button>
        ) : (
          /* Active Editing Toolbar: Small, minimal pill with Save and Close */
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/95 backdrop-blur-xl border border-blue-500/80 rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white text-xs">
            <div className="flex items-center gap-1.5 pe-1.5 border-e border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-slate-200">
                Click any text to edit
              </span>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs shadow transition-all cursor-pointer"
              title="Save text changes"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{showSavedToast ? 'Saved!' : 'Save'}</span>
            </button>

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-full text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset all texts to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Exit Edit Mode */}
            <button
              type="button"
              onClick={toggleEditMode}
              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Exit edit mode"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Saved confirmation badge */}
        {showSavedToast && !isEditing && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-3 h-3" />
            <span>Text Saved</span>
          </div>
        )}
      </div>
    </>
  );
}
