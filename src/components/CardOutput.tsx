import React, { useState } from 'react';
import { Copy, Check, Edit2, RotateCw, Save, X, Sparkles, Hash } from 'lucide-react';

interface CardOutputProps {
  title: string;
  fieldKey: string;
  value: string | string[];
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  isList?: boolean;
  onSave: (fieldKey: string, newValue: string | string[]) => void;
  onRegenerate: (fieldKey: string) => Promise<void>;
  isRegenerating?: boolean;
  characterLimit?: number;
}

export const CardOutput: React.FC<CardOutputProps> = ({
  title,
  fieldKey,
  value,
  description,
  icon,
  badge,
  isList = false,
  onSave,
  onRegenerate,
  isRegenerating = false,
  characterLimit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editText, setEditText] = useState(() => {
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    return String(value || '');
  });

  // Sync internal edit buffer when prop changes
  React.useEffect(() => {
    if (Array.isArray(value)) {
      setEditText(value.join('\n'));
    } else {
      setEditText(String(value || ''));
    }
  }, [value]);

  const handleCopy = async () => {
    let textToCopy = '';
    if (Array.isArray(value)) {
      textToCopy = value.join('\n');
    } else {
      textToCopy = String(value || '');
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSave = () => {
    if (isList) {
      const items = editText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      onSave(fieldKey, items);
    } else {
      onSave(fieldKey, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (Array.isArray(value)) {
      setEditText(value.join('\n'));
    } else {
      setEditText(String(value || ''));
    }
    setIsEditing(false);
  };

  const currentLength = Array.isArray(value) ? value.join(' ').length : (value?.length || 0);

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Card Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              {badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons: Copy, Edit, Regenerate */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Copy</span>
              </>
            )}
          </button>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit content"
              className="p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Edit</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onRegenerate(fieldKey)}
            disabled={isRegenerating}
            title="Regenerate this specific section with AI"
            className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              isRegenerating
                ? 'opacity-60 cursor-not-allowed bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 md:p-5 flex-1">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              rows={isList ? 6 : fieldKey === 'fullDescription' ? 10 : 4}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 text-xs md:text-sm rounded-xl border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
              placeholder={isList ? 'One item per line...' : 'Enter content...'}
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {isList ? 'Tip: Place each bullet item on a new line.' : `${editText.length} characters`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Visual Content Display */}
            {fieldKey === 'seoKeywords' && Array.isArray(value) ? (
              <div className="flex flex-wrap gap-2">
                {value.map((kw, i) => (
                  <span
                    key={i}
                    onClick={async () => {
                      await navigator.clipboard.writeText(kw);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    title="Click to copy keyword"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    <Hash className="w-3 h-3 text-slate-400" />
                    {kw}
                  </span>
                ))}
              </div>
            ) : fieldKey === 'keyFeatures' && Array.isArray(value) ? (
              <ul className="space-y-2">
                {value.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : fieldKey === 'socialMediaCaption' ? (
              <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                {String(value || '')}
              </div>
            ) : fieldKey === 'fullDescription' ? (
              <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                {String(value || '')}
              </div>
            ) : (
              <p className="text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {String(value || '')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Info */}
      {characterLimit && !isEditing && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Target length: ~{characterLimit} characters</span>
          <span className={currentLength > characterLimit ? 'text-amber-500 font-bold' : ''}>
            {currentLength} chars
          </span>
        </div>
      )}
    </div>
  );
};
