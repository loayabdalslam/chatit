import { useTranslation } from '../i18n/useTranslation';

export function LanguageSelector() {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as 'en')}
        className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
}
