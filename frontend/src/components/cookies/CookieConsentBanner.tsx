import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'jsp_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'jsp_cookie_preferences';

export type CookieConsent = 'accepted' | 'rejected' | null;

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          console.error('Error parsing cookie preferences:', e);
        }
      }
    }
  }, []);

  const saveConsent = (consent: CookieConsent, prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent || 'rejected');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);

    // Dispatch custom event for analytics tracking
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: { consent, preferences: prefs } 
    }));

    console.log('🍪 Cookie consent saved:', { consent, preferences: prefs });
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    saveConsent('accepted', allAccepted);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    saveConsent('rejected', onlyEssential);
  };

  const handleSavePreferences = () => {
    saveConsent('accepted', preferences);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-slide-in-up">
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 text-white shadow-2xl border-t-4 border-purple-400">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {!showPreferences ? (
            // Main Banner
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🍪</span>
                  <h3 className="text-lg font-black">Cookies y Privacidad</h3>
                </div>
                <p className="text-sm text-purple-100 leading-relaxed max-w-2xl">
                  Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales para mejorar tu experiencia.
                  Puedes aceptar todas, rechazarlas o personalizar tus preferencias.{' '}
                  <Link 
                    to="/politicas#cookies" 
                    className="underline hover:text-white transition-colors font-semibold"
                    onClick={() => setIsVisible(false)}
                  >
                    Más información
                  </Link>
                </p>
              </div>

              <div className="flex flex-wrap gap-3 sm:flex-nowrap sm:flex-shrink-0">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
                >
                  ⚙️ Personalizar
                </button>
                <button
                  onClick={handleRejectAll}
                  className="rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
                >
                  ❌ Rechazar
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-black shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  ✅ Aceptar Todas
                </button>
              </div>
            </div>
          ) : (
            // Preferences Panel
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-lg font-black">Preferencias de Cookies</h3>
                </div>
                <p className="text-sm text-purple-100">
                  Selecciona qué tipos de cookies deseas permitir
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border-2 border-white/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🔒</span>
                        <h4 className="font-bold">Cookies Esenciales</h4>
                        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-black">
                          Siempre activas
                        </span>
                      </div>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        Necesarias para el funcionamiento básico del sitio (carrito de compras, sesión de usuario, seguridad). No se pueden desactivar.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-5 w-5 rounded cursor-not-allowed opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border-2 border-white/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📊</span>
                        <h4 className="font-bold">Cookies de Análisis</h4>
                      </div>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        Nos ayudan a entender cómo los visitantes interactúan con el sitio mediante información anónima (Google Analytics, etc.).
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <label className="relative inline-block h-6 w-11 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="absolute inset-0 rounded-full bg-white/20 transition-colors peer-checked:bg-green-500"></span>
                        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border-2 border-white/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🎯</span>
                        <h4 className="font-bold">Cookies de Marketing</h4>
                      </div>
                      <p className="text-xs text-purple-100 leading-relaxed">
                        Utilizadas para mostrarte anuncios relevantes y medir la efectividad de campañas publicitarias.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <label className="relative inline-block h-6 w-11 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="absolute inset-0 rounded-full bg-white/20 transition-colors peer-checked:bg-green-500"></span>
                        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold transition-all duration-300 hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-black shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  ✅ Guardar Preferencias
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export helper functions to check consent
export function getCookieConsent(): CookieConsent {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent as CookieConsent || null;
}

export function getCookiePreferences(): CookiePreferences {
  const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_PREFERENCES;
    }
  }
  return DEFAULT_PREFERENCES;
}

// Helper to check if specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  const prefs = getCookiePreferences();
  return prefs[type] === true;
}

