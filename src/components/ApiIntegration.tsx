import { useState } from 'react';
import { useLanguage } from '../i18n';

interface ApiIntegrationProps {
  onFetchData: (token: string, urn: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function ApiIntegration({ onFetchData, isLoading, error }: ApiIntegrationProps) {
  // Use English text directly for now since we haven't updated i18n completely for these new fields
  const [token, setToken] = useState('');
  const [urn, setUrn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token && urn) {
      onFetchData(token, urn);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="bg-[#10B981] px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5l-5-5 1.41-1.41L11 13.67l7.59-7.59L20 7.5l-9 9z" />
            </svg>
            Auto Fetch Data Manager
          </h2>
          <p className="text-emerald-100 text-sm mt-0.5 hidden sm:block">
            Connect directly to LinkedIn API to magically populate data instead of manual entry.
          </p>
        </div>
      </div>
      <div className="p-4 md:p-6 bg-emerald-50/30">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn Bearer Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9..."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-1">Post URN</label>
            <input
              type="text"
              required
              value={urn}
              onChange={(e) => setUrn(e.target.value)}
              placeholder="urn:li:share:7325786486870552578"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="flex items-end">
             <button
              type="submit"
              disabled={isLoading || !token || !urn}
              className="w-full md:w-auto px-6 py-2.5 bg-[#10B981] text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  Fetching...
                </span>
              ) : 'Fetch Analytics'}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-red-500">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
