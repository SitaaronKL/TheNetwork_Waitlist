'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { supabase, WaitlistEntry } from '../lib/supabase';
import ConstellationSphere from '../components/ConstellationSphere';
import JoinPopup from '../components/JoinPopup';

const REFERRAL_TARGET = 3;
const REFERRAL_BASE_URL = 'https://thenetwork.app';

const encodeReferralCode = (value: string) => {
  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(value);
    }
  } catch {
    // Ignore and fallback
  }
  return encodeURIComponent(value);
};

type CitySuggestion = {
  name: string;
  search: string;
};

const CITY_SUGGESTIONS: CitySuggestion[] = [
  { name: 'New York, NY, USA', search: 'new york ny usa united states america' },
  { name: 'Los Angeles, CA, USA', search: 'los angeles la california ca usa united states' },
  { name: 'San Francisco, CA, USA', search: 'san francisco sf california ca usa united states' },
  { name: 'Chicago, IL, USA', search: 'chicago il illinois usa united states' },
  { name: 'Miami, FL, USA', search: 'miami fl florida usa united states' },
  { name: 'Boston, MA, USA', search: 'boston ma massachusetts usa united states' },
  { name: 'Seattle, WA, USA', search: 'seattle wa washington usa united states' },
  { name: 'Austin, TX, USA', search: 'austin tx texas usa united states' },
  { name: 'Denver, CO, USA', search: 'denver co colorado usa united states' },
  { name: 'Atlanta, GA, USA', search: 'atlanta ga georgia usa united states' },
  { name: 'Dallas, TX, USA', search: 'dallas tx texas usa united states' },
  { name: 'Houston, TX, USA', search: 'houston tx texas usa united states' },
  { name: 'San Diego, CA, USA', search: 'san diego california ca usa united states' },
  { name: 'Portland, OR, USA', search: 'portland or oregon usa united states' },
  { name: 'Phoenix, AZ, USA', search: 'phoenix az arizona usa united states' },
  { name: 'Philadelphia, PA, USA', search: 'philadelphia pa pennsylvania usa united states philly' },
  { name: 'Washington, DC, USA', search: 'washington dc district of columbia usa united states' },
  { name: 'Las Vegas, NV, USA', search: 'las vegas nv nevada usa united states' },
  { name: 'Orlando, FL, USA', search: 'orlando fl florida usa united states' },
  { name: 'Tampa, FL, USA', search: 'tampa st petersburg fl florida usa united states' },
  { name: 'Nashville, TN, USA', search: 'nashville tn tennessee usa united states' },
  { name: 'Charlotte, NC, USA', search: 'charlotte nc north carolina usa united states' },
  { name: 'Raleigh, NC, USA', search: 'raleigh nc north carolina usa united states' },
  { name: 'Minneapolis, MN, USA', search: 'minneapolis mn minnesota twin cities usa united states' },
  { name: 'Detroit, MI, USA', search: 'detroit mi michigan usa united states' },
  { name: 'Pittsburgh, PA, USA', search: 'pittsburgh pa pennsylvania usa united states' },
  { name: 'Cleveland, OH, USA', search: 'cleveland oh ohio usa united states' },
  { name: 'Columbus, OH, USA', search: 'columbus oh ohio usa united states' },
  { name: 'Cincinnati, OH, USA', search: 'cincinnati oh ohio usa united states' },
  { name: 'Indianapolis, IN, USA', search: 'indianapolis in indiana usa united states' },
  { name: 'Kansas City, MO, USA', search: 'kansas city mo missouri usa united states' },
  { name: 'St. Louis, MO, USA', search: 'st louis mo missouri usa united states' },
  { name: 'Salt Lake City, UT, USA', search: 'salt lake city utah ut usa united states' },
  { name: 'Sacramento, CA, USA', search: 'sacramento ca california usa united states' },
  { name: 'San Jose, CA, USA', search: 'san jose ca california silicon valley usa united states' },
  { name: 'Milwaukee, WI, USA', search: 'milwaukee wi wisconsin usa united states' },
  { name: 'Madison, WI, USA', search: 'madison wi wisconsin usa united states' },
  { name: 'Omaha, NE, USA', search: 'omaha ne nebraska usa united states' },
  { name: 'Oklahoma City, OK, USA', search: 'oklahoma city ok usa united states' },
  { name: 'New Orleans, LA, USA', search: 'new orleans la louisiana nola usa united states' },
  { name: 'Honolulu, HI, USA', search: 'honolulu hi hawaii oahu usa united states' },
  { name: 'Anchorage, AK, USA', search: 'anchorage ak alaska usa united states' },
  { name: 'Boise, ID, USA', search: 'boise idaho id usa united states' },
  { name: 'Albuquerque, NM, USA', search: 'albuquerque nm new mexico usa united states' },
  { name: 'Richmond, VA, USA', search: 'richmond va virginia usa united states' },
  { name: 'Baltimore, MD, USA', search: 'baltimore md maryland usa united states' },
  { name: 'Hartford, CT, USA', search: 'hartford ct connecticut usa united states' },
  { name: 'Providence, RI, USA', search: 'providence ri rhode island usa united states' },
  { name: 'Burlington, VT, USA', search: 'burlington vt vermont usa united states' },
  { name: 'Santa Fe, NM, USA', search: 'santa fe nm new mexico usa united states' },
  { name: 'London, United Kingdom', search: 'london uk united kingdom england' },
  { name: 'Paris, France', search: 'paris france europe' },
  { name: 'Berlin, Germany', search: 'berlin germany europe' },
  { name: 'Amsterdam, Netherlands', search: 'amsterdam netherlands holland europe' },
  { name: 'Madrid, Spain', search: 'madrid spain europe' },
  { name: 'Barcelona, Spain', search: 'barcelona spain europe' },
  { name: 'Rome, Italy', search: 'rome italy europe' },
  { name: 'Milan, Italy', search: 'milan italy europe' },
  { name: 'Zurich, Switzerland', search: 'zurich switzerland europe' },
  { name: 'Geneva, Switzerland', search: 'geneva switzerland europe' },
  { name: 'Stockholm, Sweden', search: 'stockholm sweden europe' },
  { name: 'Copenhagen, Denmark', search: 'copenhagen denmark europe' },
  { name: 'Oslo, Norway', search: 'oslo norway europe' },
  { name: 'Helsinki, Finland', search: 'helsinki finland europe' },
  { name: 'Dublin, Ireland', search: 'dublin ireland europe' },
  { name: 'Lisbon, Portugal', search: 'lisbon lisboa portugal europe' },
  { name: 'Prague, Czechia', search: 'prague czechia czech republic europe' },
  { name: 'Vienna, Austria', search: 'vienna wien austria europe' },
  { name: 'Budapest, Hungary', search: 'budapest hungary europe' },
  { name: 'Warsaw, Poland', search: 'warsaw poland europe' },
  { name: 'Istanbul, Türkiye', search: 'istanbul turkey türkiye europe asia' },
  { name: 'Athens, Greece', search: 'athens greece europe' },
  { name: 'Dubai, UAE', search: 'dubai uae united arab emirates middle east' },
  { name: 'Abu Dhabi, UAE', search: 'abu dhabi uae united arab emirates middle east' },
  { name: 'Doha, Qatar', search: 'doha qatar middle east' },
  { name: 'Riyadh, Saudi Arabia', search: 'riyadh saudi arabia middle east' },
  { name: 'Tel Aviv, Israel', search: 'tel aviv israel middle east' },
  { name: 'Johannesburg, South Africa', search: 'johannesburg joburg south africa' },
  { name: 'Cape Town, South Africa', search: 'cape town south africa' },
  { name: 'Nairobi, Kenya', search: 'nairobi kenya africa' },
  { name: 'Lagos, Nigeria', search: 'lagos nigeria africa' },
  { name: 'Cairo, Egypt', search: 'cairo egypt africa' },
  { name: 'Casablanca, Morocco', search: 'casablanca morocco africa' },
  { name: 'Mumbai, India', search: 'mumbai bombay india' },
  { name: 'Delhi, India', search: 'delhi new delhi india' },
  { name: 'Bengaluru, India', search: 'bengaluru bangalore india' },
  { name: 'Hyderabad, India', search: 'hyderabad india' },
  { name: 'Chennai, India', search: 'chennai madras india' },
  { name: 'Kolkata, India', search: 'kolkata calcutta india' },
  { name: 'Singapore', search: 'singapore southeast asia' },
  { name: 'Hong Kong', search: 'hong kong hk china' },
  { name: 'Shanghai, China', search: 'shanghai china' },
  { name: 'Beijing, China', search: 'beijing peking china' },
  { name: 'Shenzhen, China', search: 'shenzhen china' },
  { name: 'Tokyo, Japan', search: 'tokyo japan' },
  { name: 'Osaka, Japan', search: 'osaka kansai japan' },
  { name: 'Seoul, South Korea', search: 'seoul south korea' },
  { name: 'Taipei, Taiwan', search: 'taipei taiwan' },
  { name: 'Bangkok, Thailand', search: 'bangkok thailand' },
  { name: 'Kuala Lumpur, Malaysia', search: 'kuala lumpur kl malaysia' },
  { name: 'Jakarta, Indonesia', search: 'jakarta indonesia' },
  { name: 'Manila, Philippines', search: 'manila philippines' },
  { name: 'Ho Chi Minh City, Vietnam', search: 'ho chi minh city saigon vietnam' },
  { name: 'Hanoi, Vietnam', search: 'hanoi vietnam' },
  { name: 'Sydney, Australia', search: 'sydney australia' },
  { name: 'Melbourne, Australia', search: 'melbourne australia' },
  { name: 'Brisbane, Australia', search: 'brisbane australia' },
  { name: 'Auckland, New Zealand', search: 'auckland new zealand' },
  { name: 'Mexico City, Mexico', search: 'mexico city cdmx mexico' },
  { name: 'Guadalajara, Mexico', search: 'guadalajara mexico' },
  { name: 'Monterrey, Mexico', search: 'monterrey mexico' },
  { name: 'Buenos Aires, Argentina', search: 'buenos aires argentina' },
  { name: 'Santiago, Chile', search: 'santiago chile' },
  { name: 'Lima, Peru', search: 'lima peru' },
  { name: 'Bogotá, Colombia', search: 'bogota colombia' },
  { name: 'Medellín, Colombia', search: 'medellin colombia' },
  { name: 'Quito, Ecuador', search: 'quito ecuador' },
  { name: 'Panama City, Panama', search: 'panama city panama' },
  { name: 'San José, Costa Rica', search: 'san jose costa rica' },
  { name: 'Kingston, Jamaica', search: 'kingston jamaica caribbean' },
];

const SUGGESTION_LIMIT = 8;
const MIN_LOCATION_CHARS = 2;

// Live Counter Component
function LiveCounter({ realCount }: { realCount: number }) {
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const driftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestRealCountRef = useRef(realCount);
  const introRafRef = useRef<number | null>(null);

  const animateChange = useCallback(() => {
    setIsAnimating(true);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const startSmoothSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    syncIntervalRef.current = setInterval(() => {
      setDisplayCount(prev => {
        const target = latestRealCountRef.current;
        if (prev === target) {
          if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
          }
          return prev;
        }
        const direction = target > prev ? 1 : -1;
        animateChange();
        return prev + direction;
      });
    }, 600);
  }, [animateChange]);

  const scheduleSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    syncTimeoutRef.current = setTimeout(() => {
      startSmoothSync();
      scheduleSync();
    }, 5 * 60 * 1000);
  }, [startSmoothSync]);

  useEffect(() => {
    latestRealCountRef.current = realCount;
    if (!introFinished) return;
    setDisplayCount(prev => {
      if (prev === realCount) return prev;
      // Real count only moves upward, so direct sync is fine.
      animateChange();
      return realCount;
    });
    scheduleSync();
  }, [realCount, animateChange, scheduleSync, introFinished]);

  useEffect(() => {
    if (introFinished) return;

    let start: number | null = null;
    const duration = 1700;

    const animateIntro = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const target = latestRealCountRef.current;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic for satisfying finish
      setDisplayCount(Math.round(target * eased));
      if (progress < 1) {
        introRafRef.current = requestAnimationFrame(animateIntro);
      } else {
        setDisplayCount(target);
        setIntroFinished(true);
      }
    };

    introRafRef.current = requestAnimationFrame(animateIntro);

    return () => {
      if (introRafRef.current) {
        cancelAnimationFrame(introRafRef.current);
      }
    };
  }, [introFinished]);

  useEffect(() => {
    if (!introFinished) return;

    const scheduleDrift = () => {
      const delay = 15000 + Math.random() * 15000;
      driftTimeoutRef.current = setTimeout(() => {
        setDisplayCount(prev => {
          const increment = Math.random() > 0.5 ? 2 : 1;
          animateChange();
          return prev + increment;
        });
        scheduleDrift();
      }, delay);
    };

    scheduleDrift();

    return () => {
      if (driftTimeoutRef.current) {
        clearTimeout(driftTimeoutRef.current);
      }
    };
  }, [animateChange, introFinished]);

  useEffect(() => {
    if (!introFinished) return;
    scheduleSync();

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [introFinished, scheduleSync]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (driftTimeoutRef.current) {
        clearTimeout(driftTimeoutRef.current);
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="text-center mb-4">
      <div className={`text-4xl md:text-6xl font-bold text-white transition-all duration-300 ${isAnimating ? 'scale-110 opacity-100' : 'scale-100 opacity-90'}`}>
        {displayCount.toLocaleString()}
      </div>
      <p className="text-lg md:text-xl text-gray-300 mt-2">joined the waitlist</p>
    </div>
  );
}

// Animated Word Switcher Component
function AnimatedWord({ isDark = false }: { isDark?: boolean }) {
  const words: Array<{
    text: string;
    fontStyle: string;
    gradient: string | null;
    scale: string;
  }> = [
    { text: 'people', fontStyle: 'font-bold uppercase', gradient: null, scale: 'scale-x-60' },
    { text: 'friends ', fontStyle: 'font-semibold italic', gradient: null, scale: 'scale-x-95' },
    { text: 'creators', fontStyle: 'font-bold underline', gradient: null, scale: 'scale-x-95' },
    { text: 'dreamers', fontStyle: 'font-medium italic', gradient: null, scale: 'scale-x-95' },
    { text: 'thinkers', fontStyle: 'font-medium', gradient: null, scale: 'scale-x-100' },
    { text: 'leaders', fontStyle: 'font-bold underline', gradient: null, scale: 'scale-x-95' },
    { text: 'artists', fontStyle: 'font-medium italic', gradient: null, scale: 'scale-x-95' },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % words.length);
        setIsFadingOut(false);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentWord = words[currentIndex];

  const getGradientStyle = () => {
    if (!currentWord.gradient) return {};
    if (currentWord.gradient === 'from-blue-500 to-purple-500') {
      return { backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7)' };
    } else if (currentWord.gradient === 'from-pink-500 to-red-500') {
      return { backgroundImage: 'linear-gradient(to right, #ec4899, #ef4444)' };
    } else if (currentWord.gradient === 'from-green-500 to-teal-500') {
      return { backgroundImage: 'linear-gradient(to right, #10b981, #14b8a6)' };
    } else {
      return { backgroundImage: 'linear-gradient(to right, #f97316, #eab308)' };
    }
  };

  const hasGradient = currentWord.gradient !== null;

  return (
    <div
      className="relative flex items-center justify-center text-center"
      style={{ width: 'min(20ch, 90%)' }}
    >
      <span
        className={`inline-block origin-center ${currentWord.scale} ${currentWord.fontStyle} transition-opacity duration-500 ease-out`}
        style={{
          opacity: isFadingOut ? 0 : 1,
          ...(hasGradient ? {
            ...getGradientStyle(),
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          } : {
            color: isDark ? '#000000' : '#ffffff',
          }),
        }}
      >
        {currentWord.text}
      </span>
    </div>
  );
}

// Animated Gradient Text Component
function AnimatedGradientText({ text, isDark = false }: { text: string; isDark?: boolean }) {
  const gradients = [
    { gradient: 'from-pink-500 to-red-500', style: { backgroundImage: 'linear-gradient(to right, #ec4899, #ef4444)' } },
    { gradient: 'from-green-500 to-teal-500', style: { backgroundImage: 'linear-gradient(to right, #10b981, #14b8a6)' } },
    { gradient: 'from-orange-500 to-yellow-500', style: { backgroundImage: 'linear-gradient(to right, #f97316, #eab308)' } },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start cross-fade: fade out current while fading in next
      setNextIndex((currentIndex + 1) % gradients.length);
      setOpacity(0);
      // After cross-fade completes, switch to next gradient
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % gradients.length);
        setOpacity(1);
      }, 1500); // Match transition duration
    }, 4000); // Interval between transitions
    return () => clearInterval(interval);
  }, [currentIndex, gradients.length]);

  const currentGradient = gradients[currentIndex];
  const nextGradient = gradients[nextIndex];

  return (
    <span 
      className="inline-block relative"
      style={{
        lineHeight: '1.2',
        paddingBottom: '0.1em',
        overflow: 'visible',
      }}
    >
      {/* Current gradient - fading out */}
      <span
        className="inline-block"
        style={{
          opacity: opacity,
          transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          ...currentGradient.style,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          lineHeight: '1.2',
          paddingBottom: '0.1em',
          overflow: 'visible',
        }}
      >
        {text}
      </span>
      {/* Next gradient - fading in */}
      <span
        className="absolute top-0 left-0 inline-block"
        style={{
          opacity: 1 - opacity,
          transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          ...nextGradient.style,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          lineHeight: '1.2',
          paddingBottom: '0.1em',
          overflow: 'visible',
        }}
      >
        {text}
      </span>
    </span>
  );
}

// Rotating Info Text
function RotatingInfo({ isDark = false }: { isDark?: boolean }) {
  const messages = [
    "Beta opening soon",
    "Limited early access",
    "Join before it's too late",
    "Be among the first",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className={`text-sm md:text-base animate-fade-in ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      {messages[currentIndex]}
    </p>
  );
}

// Form Modal Component
function FormModal({ 
  isOpen, 
  onClose, 
  formData, 
  handleInputChange, 
  handleSubmit, 
  isSubmitting, 
  error,
  locationSuggestions,
  showLocationSuggestions,
  onSelectLocation,
  onLocationFocus,
  onLocationBlur
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: WaitlistEntry;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  error: string;
  locationSuggestions: string[];
  showLocationSuggestions: boolean;
  onSelectLocation: (value: string) => void;
  onLocationFocus: () => void;
  onLocationBlur: () => void;
}) {
  if (!isOpen) return null;

  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
  const pressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const emailFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (emailFocusTimeoutRef.current) {
      clearTimeout(emailFocusTimeoutRef.current);
    }
    emailFocusTimeoutRef.current = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 200);

    return () => {
      if (emailFocusTimeoutRef.current) {
        clearTimeout(emailFocusTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const handleSubmitPress = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    setIsSubmitPressed(true);
    pressTimeoutRef.current = setTimeout(() => {
      setIsSubmitPressed(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-black">Join the Waitlist</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            placeholder="Name"
          />
          
          <input
            ref={emailInputRef}
            id="emailInput"
            type="email"
            inputMode="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            placeholder="Email"
          />
          
          <div className="relative">
            <input
              type="text"
              name="school"
              value={formData.school || ''}
              onChange={handleInputChange}
              onFocus={onLocationFocus}
              onBlur={onLocationBlur}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              placeholder="Location (optional)"
              autoComplete="off"
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {locationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSelectLocation(suggestion);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 mr-2"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the terms and conditions
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmitPress}
            className={`btn-pulse w-full px-8 py-4 bg-black text-white rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out hover:bg-gray-800 ${
              isSubmitPressed
                ? 'scale-[0.96] btn-pulse-active btn-glow-active'
                : 'scale-100 hover:scale-105 btn-glow'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
          </button>
        </form>
      </div>
    </div>
  );
}

// CTA Button Component
function CTAButton({ onClick, isDark = false }: { onClick: () => void; isDark?: boolean }) {
  return (
    <div className="text-center">
      <button
        onClick={onClick}
        className={`px-8 py-5 sm:py-4 rounded-xl transition-transform duration-200 text-lg font-semibold shadow-xl hover:shadow-lg transform hover:scale-105 active:scale-95 ${
          isDark 
            ? 'bg-black text-white hover:bg-gray-800' 
            : 'bg-white text-black hover:bg-gray-100'
        }`}
      >
        Join Waitlist - Beta Opening Soon
      </button>
      <p
        className={`mt-2 text-sm ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}
      >
        No spam. Just your invite.
      </p>
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState<WaitlistEntry>({
    name: '',
    email: '',
    school: '',
  });
  const [realCount, setRealCount] = useState(1050);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [userRank, setUserRank] = useState(4000); // Placeholder rank
  const [referralLink, setReferralLink] = useState('');
  const [isDarkSection, setIsDarkSection] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [invitedCount, setInvitedCount] = useState(0);
  const [invitePulse, setInvitePulse] = useState(false);
  const heroSectionRef = useRef<HTMLElement>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const hideSuggestionsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invitePulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInvitePulseMountedRef = useRef(false);

  const updateLocationSuggestions = useCallback((query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < MIN_LOCATION_CHARS) {
      setLocationSuggestions([]);
      return;
    }
    const matches = CITY_SUGGESTIONS.filter((city) => {
      const searchMatch = city.search.includes(trimmed);
      const nameMatch = city.name.toLowerCase().includes(trimmed);
      return searchMatch || nameMatch;
    })
      .slice(0, SUGGESTION_LIMIT)
      .map((city) => city.name);
    setLocationSuggestions(matches);
  }, []);

  const handleSelectLocation = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, school: value }));
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  }, []);

  const handleLocationFocus = useCallback(() => {
    if (hideSuggestionsTimeout.current) {
      clearTimeout(hideSuggestionsTimeout.current);
      hideSuggestionsTimeout.current = null;
    }
    const currentValue = formData.school?.trim() ?? '';
    updateLocationSuggestions(formData.school || '');
    setShowLocationSuggestions(currentValue.length >= MIN_LOCATION_CHARS);
  }, [formData.school, updateLocationSuggestions]);

  const handleLocationBlur = useCallback(() => {
    if (hideSuggestionsTimeout.current) {
      clearTimeout(hideSuggestionsTimeout.current);
    }
    hideSuggestionsTimeout.current = setTimeout(() => {
      setShowLocationSuggestions(false);
    }, 120);
  }, []);

  const handleSuccessfulSubmission = useCallback(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const baseUrl = origin && origin.includes('localhost') ? origin : REFERRAL_BASE_URL;
    const encoded = encodeReferralCode(formData.email.trim().toLowerCase());
    const link = `${baseUrl}?ref=${encoded}`;
    setReferralLink(link);
    setUserRank(realCount + 1);
    setIsSuccess(true);
    setIsModalOpen(false);
  }, [formData.email, realCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setSessionToken(token);
    localStorage.setItem('refSessionToken', token);
    localStorage.setItem('refVisits', '0');

    return () => {
      if (invitePulseTimeoutRef.current) {
        clearTimeout(invitePulseTimeoutRef.current);
      }
      localStorage.removeItem('refSessionToken');
      localStorage.removeItem('refVisits');
    };
  }, []);

  useEffect(() => {
    if (!sessionToken || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get('ref');
    if (referralCode) {
      const currentVisits = parseInt(localStorage.getItem('refVisits') || '0', 10) || 0;
      const nextVisits = Math.min(REFERRAL_TARGET, currentVisits + 1);
      localStorage.setItem('refVisits', String(nextVisits));
      setInvitedCount(nextVisits);
    }
  }, [sessionToken]);

  useEffect(() => {
    if (!sessionToken || typeof window === 'undefined') return;
    const syncVisits = () => {
      const stored = parseInt(localStorage.getItem('refVisits') || '0', 10);
      setInvitedCount(Number.isNaN(stored) ? 0 : Math.min(REFERRAL_TARGET, Math.max(0, stored)));
    };

    syncVisits();
    const interval = setInterval(syncVisits, 1000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  useEffect(() => {
    if (!hasInvitePulseMountedRef.current) {
      hasInvitePulseMountedRef.current = true;
      return;
    }
    setInvitePulse(true);
    if (invitePulseTimeoutRef.current) {
      clearTimeout(invitePulseTimeoutRef.current);
    }
    invitePulseTimeoutRef.current = setTimeout(() => setInvitePulse(false), 500);
  }, [invitedCount]);

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      if (!supabase) {
        console.log('Supabase not configured, showing default 1050');
        if (isMounted) setRealCount(1050);
        return;
      }

      try {
        const { data, error } = await supabase.from('waitlist').select('id');

        if (!error && data && isMounted) {
          setRealCount(1050 + data.length);
        } else if (error) {
          console.error('Error fetching waitlist count:', error);
        }
      } catch (err) {
        console.error('Error fetching waitlist count:', err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hideSuggestionsTimeout.current) {
        clearTimeout(hideSuggestionsTimeout.current);
      }
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'school') {
      updateLocationSuggestions(value);
      setShowLocationSuggestions(value.trim().length >= MIN_LOCATION_CHARS);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: supabaseError } = await supabase.from('waitlist').insert([
        {
          name: formData.name,
          email: formData.email,
          school: formData.school || null,
        },
      ]);

      if (supabaseError) throw supabaseError;

      handleSuccessfulSubmission();
    } catch (err: any) {
      // Handle duplicate email error
      if (err.message && err.message.includes('duplicate key') && err.message.includes('email')) {
        setError('This email is already registered on the waitlist.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = useCallback(async (text: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (!text) return;
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const performAlert = (message: string) => {
      window.alert(message);
    };

    const fallbackCopy = () => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        throw err;
      }
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy();
      }

      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
      const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

      if (canShare && isMobile) {
        try {
          await navigator.share({
            title: 'Join me on TheNetwork',
            text: "I'm on TheNetwork — join my circle before it goes live!",
            url: text,
          });
        } catch (shareErr: any) {
          if (shareErr?.name !== 'AbortError') {
            console.error('Share failed:', shareErr);
            performAlert('Invite link copied!');
          }
        }
      } else {
        performAlert('Invite link copied!');
      }
    } catch (err) {
      console.error('Copy failed:', err);
      performAlert('Could not copy link');
    }
  }, []);

  // Scroll detection for color flip animation
  useEffect(() => {
    const currentRef = heroSectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsDarkSection(true);
          } else if (entry.boundingClientRect.top > 0) {
            // Only reset if scrolling back up past the section
            setIsDarkSection(false);
          }
        });
      },
      {
        threshold: 0.1, // Trigger earlier - when only 10% is visible
        rootMargin: '-200px 0px', // Trigger well before the section enters viewport
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Success Page
  if (isSuccess) {
    const inviteProgress = Math.min(100, (invitedCount / REFERRAL_TARGET) * 100);
    const invitesRemaining = Math.max(0, REFERRAL_TARGET - invitedCount);
    const fallbackLink =
      referralLink ||
      (typeof window !== 'undefined'
        ? `${(window.location.origin.includes('localhost') ? window.location.origin : REFERRAL_BASE_URL)}?ref=${encodeReferralCode(formData.email.trim().toLowerCase())}`
        : `${REFERRAL_BASE_URL}?ref=${encodeReferralCode(formData.email.trim().toLowerCase())}`);
    return (
      <main className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="max-w-xl w-full text-center text-white rounded-3xl border border-white/20 px-8 py-12 shadow-[0_20px_70px_rgba(0,0,0,0.35)] animate-fade-in space-y-8">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            Welcome to TheNetwork
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold font-brand">
            You're #{(userRank ?? realCount).toLocaleString()} / 10,000 on the waitlist.
          </h1>
          <p className="text-lg text-gray-200">
            Invite 3 friends → skip the line.
          </p>
          <button
            type="button"
            onClick={(event) => copyToClipboard(fallbackLink, event)}
            className="inline-flex items-center justify-center w-full max-w-sm mx-auto gap-2 rounded-2xl bg-white text-black font-semibold py-4 px-6 hover:bg-gray-100 transition-colors"
          >
            Copy invite link
          </button>
          <div className="w-full max-w-sm mx-auto text-left text-white/90 space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-gray-400">
              <span className="transition-opacity duration-500 ease-out">You've invited</span>
              <span
                className={`font-semibold text-white transition-colors duration-500 ease-out ${invitePulse ? 'text-pink-200' : ''}`}
              >
                {invitedCount} / {REFERRAL_TARGET} friends
              </span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-500 ease-out ${invitePulse ? 'animate-pulse' : ''}`}
                style={{ width: `${inviteProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-300 transition-opacity duration-500 ease-out">
              {invitedCount >= REFERRAL_TARGET
                ? "Nice! You're ready to skip the line."
                : `Invite ${invitesRemaining} more friend${invitesRemaining === 1 ? '' : 's'} to skip the line.`}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#F2F2F2' }}>
      <JoinPopup />
      {/* Initial Landing Section - Full Screen */}
      <section className="relative h-100svh flex items-center justify-center px-4 sm:px-6 bg-black overflow-hidden">
        <ConstellationSphere />
        <div className="text-center w-full max-w-full relative z-10">
          <h1 
            className="font-bold mb-8 text-white font-brand text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[202px] whitespace-nowrap"
            style={{ 
              letterSpacing: '-0.05em'
            }}
          >
            TheNetwork
          </h1>
          
          <div className="mb-6">
            <LiveCounter realCount={realCount} />
          </div>
          
          <div className="mt-8">
            <CTAButton onClick={() => setIsModalOpen(true)} isDark={false} />
          </div>
        </div>
      </section>

      {/* Scroll Content Section */}
      <div className={`py-12 px-6 transition-all duration-700 ease-in-out ${isDarkSection ? '' : 'bg-black'}`} style={{ minHeight: !isDarkSection ? '100vh' : 'auto' }}>
        {/* Hero Section */}
        <section 
          ref={heroSectionRef}
          className="max-w-4xl mx-auto text-center mb-4 py-16"
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 font-brand transition-all duration-700 ease-in-out ${isDarkSection ? 'text-black' : 'text-white'} leading-normal sm:leading-tight md:leading-tight`}>
            <div className="flex flex-wrap items-baseline justify-center gap-2 mb-1 sm:mb-0 text-center no-ligatures">
              <span className="whitespace-nowrap">Meet</span>
              <div className="flex items-baseline justify-center gap-2">
                <span>the</span>
                <AnimatedWord isDark={isDarkSection} />
                <span>your</span>
              </div>
            </div>
            <div className="whitespace-nowrap mb-1 sm:mb-0"><AnimatedGradientText text="algorithm already knows" isDark={isDarkSection} /></div>
            <div className="whitespace-nowrap">you'll love</div>
          </h2>
          
          <RotatingInfo isDark={!isDarkSection} />
        </section>

      {/* Credibility Badges */}
      <section className="max-w-4xl mx-auto text-center mb-12" style={{ marginTop: '-77px' }}>
        <p className={`text-sm transition-all duration-700 ease-in-out ${isDarkSection ? 'text-gray-600' : 'text-gray-300'} mb-4`}>Built by ex-Google, Coinbase, Meta, & Ivies.</p>
      </section>

      {/* Catchline Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h2 className={`text-4xl md:text-5xl font-bold mb-6 font-brand transition-all duration-700 ease-in-out ${isDarkSection ? 'text-black' : 'text-white'}`}>
          Join the network before it becomes <span className="italic">The Network</span>
        </h2>
      </section>

      {/* Testimonials */}
      {/* <section className="max-w-4xl mx-auto mb-16">
        <h3 className={`text-2xl font-bold text-center mb-8 transition-all duration-700 ease-in-out ${isDarkSection ? 'text-black' : 'text-white'}`}>What Early Adopters Say</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg shadow-md transition-all duration-700 ease-in-out ${isDarkSection ? 'bg-white' : 'bg-gray-900 border border-gray-800'}`}>
            <p className={`italic mb-4 transition-all duration-700 ease-in-out ${isDarkSection ? 'text-gray-700' : 'text-gray-300'}`}>"[Placeholder testimonial text]"</p>
            <p className={`text-sm font-semibold transition-all duration-700 ease-in-out ${isDarkSection ? 'text-black' : 'text-white'}`}>- Testimonial Author</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md transition-all duration-700 ease-in-out ${isDarkSection ? 'bg-white' : 'bg-gray-900 border border-gray-800'}`}>
            <p className={`italic mb-4 transition-all duration-700 ease-in-out ${isDarkSection ? 'text-gray-700' : 'text-gray-300'}`}>"[Placeholder testimonial text]"</p>
            <p className={`text-sm font-semibold transition-all duration-700 ease-in-out ${isDarkSection ? 'text-black' : 'text-white'}`}>- Testimonial Author</p>
          </div>
          <div className={`p-6 rounded-lg shadow-md transition-all duration-700 ease-in-out ${isDarkSection ? 'bg-white' : 'bg-gray-900 border border-gray-800'}`}>
            <p className={`italic mb-4 transition-all duration-700 ease-in-out ${isDarkSection ? 'text-gray-700' : 'text-gray-300'}`}>"[Placeholder testimonial text]"</p>
            <p className={`text-sm font-semibold transition-all duration-700 ease-in-out ${isDarkSection ? 'text-black' : 'text-white'}`}>- Testimonial Author</p>
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="max-w-4xl mx-auto text-center">
        <p className={`text-xl mb-6 transition-all duration-700 ease-in-out ${isDarkSection ? 'text-gray-700' : 'text-gray-200'}`}>
          Don't miss out on being part of the future. Join now.
        </p>
        <CTAButton onClick={() => setIsModalOpen(true)} isDark={isDarkSection} />
      </section>
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        locationSuggestions={locationSuggestions}
        showLocationSuggestions={showLocationSuggestions}
        onSelectLocation={handleSelectLocation}
        onLocationFocus={handleLocationFocus}
        onLocationBlur={handleLocationBlur}
      />
    </main>
  );
}
