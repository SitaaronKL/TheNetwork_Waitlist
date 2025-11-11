'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Threads from '../../components/Threads';

export default function Phtogrph() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Back button animation
      gsap.from(backButtonRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Title animation - dramatic entrance
      gsap.from(titleRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.3,
      });

      // Subtitle animation
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        delay: 0.8,
      });

      // Tagline animation
      gsap.from(taglineRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.3,
      });

      // Badge animation
      gsap.from(badgeRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: 1.8,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen flex overflow-hidden" style={{backgroundColor: '#F2F2F2'}}>
      {/* Left Sidebar - Threads Animation (hidden on mobile) */}
      <div className="w-third h-screen relative hide-on-mobile" style={{backgroundColor: '#F2F2F2'}}>
        <Threads
          color={[0, 0, 0]}
          amplitude={2}
          distance={0}
        />
      </div>
      
      {/* Right Side - Content */}
      <div className="w-two-thirds w-full-mobile h-screen overflow-y-auto px-6 py-4 border-l border-gray-300" style={{backgroundColor: '#F2F2F2'}}>
        <div className="max-w-5xl mx-auto text-black">
          {/* Top Spacing */}
          <div style={{height: '40px'}}></div>
          
          {/* Back Button */}
          <div ref={backButtonRef} className="mb-12">
            <a 
              href="/" 
              className="text-base text-gray-600 hover:text-red-700 transition-colors duration-300 font-semibold"
            >
              ← Back to Asteri Memo
            </a>
          </div>
          
          {/* Main Content Container */}
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            
            {/* Animated Title - Much Bigger */}
            <div className="mb-20 text-center">
              <h1 
                ref={titleRef}
                className="text-8xl md:text-9xl font-brand text-black leading-none"
                style={{
                  fontWeight: 400, 
                  letterSpacing: '-0.03em',
                  fontSize: 'clamp(5rem, 15vw, 12rem)'
                }}
              >
                Phtogrph
              </h1>
            </div>
            
            {/* Animated Subtitle */}
            <div className="text-center max-w-5xl mb-16">
              <p 
                ref={subtitleRef}
                className="text-3xl md:text-4xl lg:text-5xl font-ui text-gray-800 leading-tight"
              >
                Reimagining <span className="text-red-700 font-semibold">third spaces</span> and the future of social in third spaces
              </p>
            </div>
            
            {/* Additional tagline */}
            <div className="text-center mb-20">
              <p 
                ref={taglineRef}
                className="text-2xl md:text-3xl font-ui text-gray-600 italic"
              >
                Where memory meets moments
              </p>
            </div>
            
            {/* Coming Soon Badge */}
            <div ref={badgeRef}>
              <div className="inline-block text-black px-10 py-4 text-base font-bold tracking-widest border-2 border-black">
                COMING SOON
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
