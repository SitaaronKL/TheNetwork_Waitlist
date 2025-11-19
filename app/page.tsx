'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { supabase, WaitlistEntry } from '../lib/supabase';
import ConstellationSphere from '../components/ConstellationSphere';
import JoinPopup from '../components/JoinPopup';
import InstagramFloat from '../components/InstagramFloat';
import { useRouter } from 'next/navigation';

const REFERRAL_TARGET = 3;
const REFERRAL_BASE_URL = 'https://thenetwork.life';

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

const COMMUNITY_IMAGES = [
  '/Community Images/1.png',
  '/Community Images/2.png',
  '/Community Images/3.png',
  '/Community Images/46453c202eca84241474bc57055aad3d.jpeg',
  '/Community Images/839acc6269cd3937057864303f84d87e.jpeg',
  '/Community Images/89da90158f96d252627fb061a5502f46.jpeg',
  '/Community Images/b5e87c57a5bfe48c5f712da2782fdad3.jpeg',
];

// Live Counter Component
function LiveCounter({ realCount }: { realCount: number }) {
  const STORAGE_KEY = 'waitlistDisplayCount';

  // Always render a value that won't cause hydration mismatch
  const [displayCount, setDisplayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const driftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introRafRef = useRef<number | null>(null);
  const [introDone, setIntroDone] = useState(false);

  const saveToStorage = useCallback((count: number) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, String(count));
    } catch {
      // ignore
    }
  }, []);

  const animateChange = useCallback(() => {
    setIsAnimating(true);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 300);
  }, []);

  // Restore from localStorage once on mount (sticky max) with a light intro count-up from 0
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? parseInt(raw, 10) : NaN;
      const startValue = 0; // always animate from 0 for perceived legitimacy
      // Choose target as the stored max if it exists, otherwise use realCount
      const target = Number.isNaN(stored) ? realCount : Math.max(stored, realCount);

      // If no stored value yet, initialize storage and ensure UI shows at least realCount
      if (Number.isNaN(stored)) {
        saveToStorage(target);
        // fall through to animate from 0 -> target
      }

      // Animate from startValue → target after hydration to avoid SSR mismatch
      if (target > startValue) {
        const duration = 1200;
        let start: number | null = null;
        const step = (ts: number) => {
          if (start === null) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const next = Math.round(startValue + (target - startValue) * eased);
          setDisplayCount(next);
          if (progress < 1) {
            introRafRef.current = requestAnimationFrame(step);
          } else {
            // Persist the final target so refresh keeps the higher value
            saveToStorage(target);
            setIntroDone(true);
          }
        };
        introRafRef.current = requestAnimationFrame(step);
      } else {
        // Nothing to animate; make sure display and storage are aligned
        setDisplayCount(target);
        if (target !== stored) saveToStorage(target);
        setIntroDone(true);
      }
    } catch {
      // ignore
    }
    return () => {
      if (introRafRef.current) cancelAnimationFrame(introRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // When the real server count rises, stick to the max and persist
  useEffect(() => {
    if (!introDone) return; // wait until intro finishes
    setDisplayCount(prev => {
      const next = Math.max(prev, realCount);
      if (next !== prev) {
        animateChange();
        saveToStorage(next);
      }
      return next;
    });
  }, [realCount, introDone, animateChange, saveToStorage]);

  // Gentle drift up over time, persisting after each increment
  useEffect(() => {
    const schedule = () => {
      const delay = 15000 + Math.random() * 15000; // 15–30s
      driftTimeoutRef.current = setTimeout(() => {
        setDisplayCount(prev => {
          const increment = Math.random() > 0.5 ? 2 : 1;
          const next = prev + increment;
          animateChange();
          saveToStorage(next);
          return next;
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      if (driftTimeoutRef.current) clearTimeout(driftTimeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [animateChange, saveToStorage]);

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
  const EGG_TEXT = 'CLICK HERE RIGHT NOW!!!';
  const messages = [
    "Beta opening soon",
    "Limited early access",
    "Join before it's too late",
    "Be among the first",
    "Invite-only beta",
    "Secure your spot",
    EGG_TEXT,
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEggClicking, setIsEggClicking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isEggClicking) {
        setCurrentIndex(prev => (prev + 1) % messages.length);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isEggClicking, messages.length]);

  const handleEggClick = () => {
    if (isEggClicking) return;
    setIsEggClicking(true);
    setTimeout(() => {
      router.push('/memo');
    }, 1000);
  };

  return (
    <p className={`text-sm md:text-base animate-fade-in ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      {messages[currentIndex] === EGG_TEXT ? (
        <button
          type="button"
          onClick={handleEggClick}
          className={`underline ${isDark ? 'text-white' : 'text-black'} font-bold tracking-wide cursor-pointer`}
          style={{ textTransform: 'uppercase' }}
        >
          {EGG_TEXT}
        </button>
      ) : (
        messages[currentIndex]
      )}
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

export function Home({ source }: { source?: string }) {
  const [formData, setFormData] = useState<WaitlistEntry>({
    name: '',
    email: '',
    school: '',
    source: source,
  });
  const [realCount, setRealCount] = useState(1050);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [userRank, setUserRank] = useState(4000); // Placeholder rank
  const [referralLink, setReferralLink] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [invitedCount, setInvitedCount] = useState(0);
  const [invitePulse, setInvitePulse] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const hideSuggestionsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invitePulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInvitePulseMountedRef = useRef(false);
  const transitionSectionRef = useRef<HTMLElement>(null);
  const gallerySectionRef = useRef<HTMLElement>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if token already exists in localStorage
    let token = localStorage.getItem('refSessionToken');
    
    if (!token) {
      // Only create new token if one doesn't exist
      token =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      localStorage.setItem('refSessionToken', token);
    }
    
    // Initialize refVisits if it doesn't exist
    if (!localStorage.getItem('refVisits')) {
      localStorage.setItem('refVisits', '0');
    }
    
    setSessionToken(token);

    return () => {
      if (invitePulseTimeoutRef.current) {
        clearTimeout(invitePulseTimeoutRef.current);
      }
      // Don't remove from localStorage on unmount - we want it to persist
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

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          school: formData.school || null,
          source: formData.source || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 3600;
          const minutes = Math.ceil(retryAfter / 60);
          setError(`Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`);
        } else if (response.status === 409) {
          setError('This email is already registered on the waitlist.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      handleSuccessfulSubmission();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError('Something went wrong. Please try again.');
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

  const signalHeading = (
    <>
      WE RUN ON <span className="border-b-[3px] border-black pb-2 inline-block sm:inline">SIGNAL INTELLIGENCE.</span>
    </>
  );

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
        <InstagramFloat />
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

  // Checkerboard transition scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const section = transitionSectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through the section (0 to 1)
      const scrollProgress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)));

      // Find all transition stages
      const stage1 = section.querySelector('.transition-stage-1') as HTMLElement;
      const stage2 = section.querySelector('.transition-stage-2') as HTMLElement;
      const stage3 = section.querySelector('.transition-stage-3') as HTMLElement;
      const stage4 = section.querySelector('.transition-stage-4') as HTMLElement;
      const stage5 = section.querySelector('.transition-stage-5') as HTMLElement;
      const stage6 = section.querySelector('.transition-stage-6') as HTMLElement;
      const stage7 = section.querySelector('.transition-stage-7') as HTMLElement;
      const stage8 = section.querySelector('.transition-stage-8') as HTMLElement;

      if (!stage1 || !stage2 || !stage3 || !stage4 || !stage5 || !stage6 || !stage7 || !stage8) return;

      // Animate through 8 stages based on scroll progress
      const stageWidth = 1 / 8;
      
      if (scrollProgress < stageWidth) {
        // Stage 1
        const progress = scrollProgress / stageWidth;
        stage1.style.opacity = String(progress);
        stage2.style.opacity = '0';
        stage3.style.opacity = '0';
        stage4.style.opacity = '0';
        stage5.style.opacity = '0';
        stage6.style.opacity = '0';
        stage7.style.opacity = '0';
        stage8.style.opacity = '0';
      } else if (scrollProgress < stageWidth * 2) {
        // Stage 2
        const progress = (scrollProgress - stageWidth) / stageWidth;
        stage1.style.opacity = String(1 - progress);
        stage2.style.opacity = String(progress);
        stage3.style.opacity = '0';
        stage4.style.opacity = '0';
        stage5.style.opacity = '0';
        stage6.style.opacity = '0';
        stage7.style.opacity = '0';
        stage8.style.opacity = '0';
      } else if (scrollProgress < stageWidth * 3) {
        // Stage 3
        const progress = (scrollProgress - stageWidth * 2) / stageWidth;
        stage1.style.opacity = '0';
        stage2.style.opacity = String(1 - progress);
        stage3.style.opacity = String(progress);
        stage4.style.opacity = '0';
        stage5.style.opacity = '0';
        stage6.style.opacity = '0';
        stage7.style.opacity = '0';
        stage8.style.opacity = '0';
      } else if (scrollProgress < stageWidth * 4) {
        // Stage 4
        const progress = (scrollProgress - stageWidth * 3) / stageWidth;
        stage1.style.opacity = '0';
        stage2.style.opacity = '0';
        stage3.style.opacity = String(1 - progress);
        stage4.style.opacity = String(progress);
        stage5.style.opacity = '0';
        stage6.style.opacity = '0';
        stage7.style.opacity = '0';
        stage8.style.opacity = '0';
      } else if (scrollProgress < stageWidth * 5) {
        // Stage 5
        const progress = (scrollProgress - stageWidth * 4) / stageWidth;
        stage1.style.opacity = '0';
        stage2.style.opacity = '0';
        stage3.style.opacity = '0';
        stage4.style.opacity = String(1 - progress);
        stage5.style.opacity = String(progress);
        stage6.style.opacity = '0';
        stage7.style.opacity = '0';
        stage8.style.opacity = '0';
      } else if (scrollProgress < stageWidth * 6) {
        // Stage 6
        const progress = (scrollProgress - stageWidth * 5) / stageWidth;
        stage1.style.opacity = '0';
        stage2.style.opacity = '0';
        stage3.style.opacity = '0';
        stage4.style.opacity = '0';
        stage5.style.opacity = String(1 - progress);
        stage6.style.opacity = String(progress);
        stage7.style.opacity = '0';
        stage8.style.opacity = '0';
      } else if (scrollProgress < stageWidth * 7) {
        // Stage 7
        const progress = (scrollProgress - stageWidth * 6) / stageWidth;
        stage1.style.opacity = '0';
        stage2.style.opacity = '0';
        stage3.style.opacity = '0';
        stage4.style.opacity = '0';
        stage5.style.opacity = '0';
        stage6.style.opacity = String(1 - progress);
        stage7.style.opacity = String(progress);
        stage8.style.opacity = '0';
      } else {
        // Stage 8 - final stage
        const progress = (scrollProgress - stageWidth * 7) / stageWidth;
        stage1.style.opacity = '0';
        stage2.style.opacity = '0';
        stage3.style.opacity = '0';
        stage4.style.opacity = '0';
        stage5.style.opacity = '0';
        stage6.style.opacity = '0';
        stage7.style.opacity = String(1 - progress);
        stage8.style.opacity = String(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gallery section visibility observer and scroll handler
  useEffect(() => {
    if (isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !galleryVisible) {
            setGalleryVisible(true);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    if (gallerySectionRef.current) {
      observer.observe(gallerySectionRef.current);
    }

    // Scroll handler for horizontal scrolling and background transitions
    const handleGalleryScroll = () => {
      const section = gallerySectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through the section (0 to 1)
      // Only start when section reaches top of viewport
      const scrollProgress = Math.max(0, Math.min(1, -rect.top / (sectionHeight - windowHeight)));

      // Find the scroll containers
      const scrollContainer = section.querySelector('.gallery-scroll-container') as HTMLElement;
      const textContainer = section.querySelector('.gallery-text-container') as HTMLElement;

      if (scrollContainer && textContainer) {
        // Delay horizontal scrolling until 30% through the section
        // This ensures "THIS COULD BE YOU!" is fully visible before scrolling starts
        if (scrollProgress < 0.3) {
          // Keep everything locked in place
          scrollContainer.style.transform = 'translateX(0)';
          textContainer.style.transform = 'translateX(0)';
        } else {
          // Start horizontal scrolling after delay
          const adjustedProgress = (scrollProgress - 0.3) / 0.7; // Normalize to 0-1 after delay
          const maxScroll = scrollContainer.scrollWidth - window.innerWidth;
          const horizontalOffset = adjustedProgress * maxScroll * 1.3; // Adjusted for 2 text repetitions
          
          scrollContainer.style.transform = `translateX(-${horizontalOffset}px)`;
          textContainer.style.transform = `translateX(-${horizontalOffset}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleGalleryScroll);
    handleGalleryScroll(); // Initial check

    return () => {
      if (gallerySectionRef.current) {
        observer.unobserve(gallerySectionRef.current);
      }
      window.removeEventListener('scroll', handleGalleryScroll);
    };
  }, [galleryVisible, isMobile]);

  return (
    <main style={{ backgroundColor: '#FFFFFF', paddingBottom: '80px' }}>
      <JoinPopup />
      {/* Initial Landing Section - Full Screen */}
      <section className="relative h-100svh bg-black overflow-hidden">
        {/* Constellation Sphere Background */}
        <ConstellationSphere />
        
        {/* Top Left - THE NETWORK. */}
        <div className="absolute top-8 left-8 z-20">
          <h1 className="text-white font-brand text-4xl sm:text-5xl md:text-6xl font-bold" style={{ letterSpacing: '-0.02em' }}>
            THE<br />NETWORK.
          </h1>
        </div>
      </section>

      {/* Fixed Bottom Navigation - for all sections */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none mix-blend-normal md:mix-blend-difference"
      >
        <div className="relative w-full h-28 pointer-events-auto">
          {/* Network Icon - Positioned to cross the line */}
          <div className="absolute bottom-8 right-8 z-20 w-16 h-16">
            <img 
              src="/app_icon.svg" 
              alt="Network Icon" 
              className="w-full h-full text-black md:brightness-0 md:invert" 
            />
          </div>

          {/* Horizontal Line with Gap for Icon */}
          <div className="absolute bottom-16 left-0 right-28 z-10 px-8">
            <div className="h-[1px] bg-black md:bg-white opacity-70 md:opacity-30"></div>
          </div>
          
          {/* Bottom Left - TheNetwork text */}
          <div className="absolute bottom-4 left-8 z-20">
            <p className="text-sm font-ui text-black md:text-white">TheNetwork</p>
          </div>
          
          {/* Bottom Right - Navigation Links */}
          <div className="absolute bottom-4 right-8 z-20 flex gap-4">
            <button onClick={() => setIsModalOpen(true)} className="text-sm font-ui text-black md:text-white hover:opacity-70 transition-opacity">Join</button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="text-sm font-ui text-black md:text-white hover:opacity-70 transition-opacity"
            >
              Home
            </button>
            <button 
              onClick={() => {
                const signalSection = document.getElementById('signal-intelligence');
                if (signalSection) {
                  signalSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-sm font-ui text-black md:text-white hover:opacity-70 transition-opacity"
            >
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Transition Section - Animated checkerboard from black to white */}
      <section 
        ref={transitionSectionRef}
        className="relative min-h-screen overflow-hidden"
        id="checkerboard-transition"
        style={{ 
          background: 'black',
        }}
      >
        {/* Stage 1: Small white circles */}
        <div 
          className="absolute inset-0 transition-stage-1"
          style={{
            backgroundImage: 'radial-gradient(circle, white 3px, transparent 3px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 2: Medium circles */}
        <div 
          className="absolute inset-0 transition-stage-2"
          style={{
            backgroundImage: 'radial-gradient(circle, white 8px, transparent 8px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 3: Large circles */}
        <div 
          className="absolute inset-0 transition-stage-3"
          style={{
            backgroundImage: 'radial-gradient(circle, white 13px, transparent 13px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 4: Circles grow corners to become squares */}
        <div 
          className="absolute inset-0 transition-stage-4"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'8\' y=\'8\' width=\'24\' height=\'24\' rx=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 5: Larger squares */}
        <div 
          className="absolute inset-0 transition-stage-5"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'4\' y=\'4\' width=\'32\' height=\'32\' rx=\'2\' fill=\'white\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 6: Much larger squares, fully overlapping */}
        <div 
          className="absolute inset-0 transition-stage-6"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'0\' y=\'0\' width=\'40\' height=\'40\' rx=\'0\' fill=\'white\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 7: Keep growing */}
        <div 
          className="absolute inset-0 transition-stage-7"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'-2\' y=\'-2\' width=\'44\' height=\'44\' fill=\'white\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
        
        {/* Stage 8: Even bigger - final stage */}
        <div 
          className="absolute inset-0 transition-stage-8"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'-5\' y=\'-5\' width=\'50\' height=\'50\' fill=\'white\'/%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: 0,
          }}
        />
      </section>

      {/* Combined Section - Text, Images, and Horizontal Scroll Transition */}
      {!isMobile ? (
        <section ref={gallerySectionRef} className="relative bg-white overflow-hidden" style={{ minHeight: '200vh' }}>
          <div className="sticky top-0 min-h-screen flex flex-col justify-between py-12 px-6 md:px-12 overflow-hidden" style={{ paddingTop: '80px', paddingBottom: '30px' }}>
            {/* Top Heading Text - Always visible */}
            <div className="w-full mb-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight text-left max-w-7xl md:whitespace-nowrap">
                We turn your digital DNA into a personalized <br className="hidden lg:block" />
                feed of people, moments, and opportunities that feel unnervingly right.
              </h2>
            </div>

            {/* Horizontal Scrolling Images Container */}
            <div className="flex-1 flex items-center w-full overflow-hidden">
              <div className="gallery-scroll-container flex items-center gap-6" style={{ transform: 'translateX(0)' }}>
                {COMMUNITY_IMAGES.map((src) => (
                  <div className="flex-shrink-0" style={{ width: '350px', height: '440px' }} key={src}>
                    <div className="aspect-[4/5] bg-gray-300 rounded-2xl overflow-hidden w-full h-full">
                      <img 
                        src={src} 
                        alt="Community moment" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bottom Scrolling Text - "THIS COULD BE YOU!" repeating */}
            <div className="w-full overflow-hidden mt-8">
              <div className="gallery-text-container flex items-center gap-12" style={{ transform: 'translateX(0)', whiteSpace: 'nowrap' }}>
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-black leading-none tracking-tight inline-block" style={{ fontSize: 'clamp(3.2rem, 9.6vw, 9.6rem)' }}>
                  THIS COULD BE YOU!
                </h2>
                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-black leading-none tracking-tight inline-block" style={{ fontSize: 'clamp(3.2rem, 9.6vw, 9.6rem)' }}>
                  THIS COULD BE YOU!
                </h2>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section ref={gallerySectionRef} className="bg-white px-6 py-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-black leading-tight">
              We turn your digital DNA into a personalized feed of people, moments, and opportunities that feel unnervingly right.
            </h2>
            <p className="text-base text-black leading-relaxed">
              Scroll sideways through the moments our community is living right now.
            </p>
          </div>
          <div className="overflow-x-auto flex gap-4 snap-x snap-mandatory pb-2">
            {COMMUNITY_IMAGES.map((src) => (
              <div 
                key={`mobile-${src}`} 
                className="rounded-3xl overflow-hidden snap-start min-w-[260px]"
              >
                <img src={src} alt="Community moment" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-bold text-black">THIS COULD BE YOU!</h2>
        </section>
      )}

      {/* Signal Intelligence Section */}
      {!isMobile ? (
        <section 
          id="signal-intelligence"
          className="relative bg-white overflow-hidden flex items-start"
          style={{ 
            minHeight: '120vh',
            zIndex: 10,
            marginTop: '-30vh',
          }}
        >
          <div 
            className="sticky top-0 bg-white z-20 flex items-start w-full"
            style={{
              minHeight: '100vh',
              paddingTop: '90px',
              paddingBottom: '10px',
              paddingLeft: '38px',
              paddingRight: '38px',
            }}
          >
            {/* Content */}
            <div style={{ width: '100%' }}>
              <h2
                className="font-bold text-black mb-24 leading-none md:whitespace-nowrap"
                style={{
                  // Scale with viewport so it stays one line across the top (desktop/tablet),
                  // while still readable on smaller screens.
                  fontSize: 'clamp(1.5rem, 5vw, 9rem)',
                }}
              >
                {signalHeading}
              </h2>
              
              <div className="max-w-2xl mb-8 space-y-6">
                <p className="text-xl md:text-2xl text-black leading-relaxed font-medium">
                  Signal intelligence is defining the next generation of consumer platforms, and TheNetwork is developing the infrastructure to capture, structure, and route meaning from your digital life.
                </p>
                <p className="text-xl md:text-2xl text-black leading-relaxed font-medium">
                  This enables accurate discovery today — and lays the foundation for what comes next.
                </p>
              </div>
              
              {/* <button className="px-8 py-3 bg-black text-white rounded-full text-lg font-bold hover:bg-gray-800 transition-colors">
                Learn more
              </button> */}
            </div>
          </div>
        </section>
      ) : (
        <section 
          id="signal-intelligence"
          className="bg-white px-6 py-12 space-y-8"
          style={{ marginTop: '0' }}
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-black leading-tight">
              {signalHeading}
            </h2>
            <p className="text-lg text-black leading-relaxed">
              Signal intelligence is defining the next generation of consumer platforms, and TheNetwork is developing the infrastructure to capture, structure, and route meaning from your digital life.
            </p>
            <p className="text-lg text-black leading-relaxed">
              This enables accurate discovery today — and lays the foundation for what comes next.
            </p>
          </div>
        </section>
      )}

      {/* Join Us Section */}
      <section
        className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center px-6"
        style={{ marginBottom: '-40px', paddingTop: '40px', paddingBottom: '20px' }}
      >
        {/* Content */}
        <div className="text-center">
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-black mb-12 leading-none">
            JOIN US
          </h2>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 bg-black text-white rounded-full text-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Connect to TheNetwork
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-white py-6 z-30">
        <div className="px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-black whitespace-nowrap mb-3">Our Features</h2>
          <div className="border-b border-black/60 mb-6"></div>
          
          <div className="flex flex-wrap gap-10 text-sm text-black leading-tight items-start">
            {/* TheNetwork */}
            <div className="min-w-[150px] space-y-1">
              <p className="font-bold">TheNetwork</p>
              <p>Your world revealed.</p>
              <p>Meaning from signals.</p>
              <p>Identity, understood.</p>
            </div>
            
            {/* Digital DNA */}
            <div className="min-w-[150px] space-y-1">
              <p className="font-bold">Digital DNA</p>
              <p>Who you are.</p>
              <p>How you change.</p>
              <p>All in one place.</p>
            </div>
            
            {/* Feed 1 */}
            <div className="min-w-[150px] space-y-1">
              <p className="font-bold">Feed 1</p>
              <p>Real affinity.</p>
              <p>Effortless chemistry.</p>
              <p>No swipes needed.</p>
            </div>
            
            {/* Feed 2 */}
            <div className="min-w-[150px] space-y-1">
              <p className="font-bold">Feed 2</p>
              <p>Right place.</p>
              <p>Right people.</p>
              <p>Right moment.</p>
            </div>
            
            {/* Gaia */}
            <div className="min-w-[150px] space-y-1">
              <p className="font-bold">Gaia</p>
              <p>Learns you deeply.</p>
              <p>Thinks with you.</p>
              <p>Moves life forward.</p>
            </div>
            <div className="min-w-[150px] space-y-1 font-bold text-black">
              <a
                href="https://instagram.com/join.thenetwork/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70 transition-opacity block"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/the-network-life/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-70 transition-opacity block"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>


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

export default function HomePage() {
  return <Home />;
}
