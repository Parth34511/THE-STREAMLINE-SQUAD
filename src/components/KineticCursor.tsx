import React, { useEffect, useState, useRef } from 'react';

export const KineticCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [cursorState, setCursorState] = useState<'default' | 'drag' | 'form' | 'emergency' | 'social'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      setTargetPos({ x: e.clientX, y: e.clientY });

      // Inspect hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorAttr = target.closest('[data-cursor]')?.getAttribute('data-cursor');
      const isButton = target.closest('button, a, input, select, textarea, [role="button"]');
      const isEmergency = target.closest('[data-emergency="true"]');
      const isSocial = target.closest('[data-social="true"]');
      const isMarquee = target.closest('[data-marquee="true"]');

      if (cursorAttr === 'drag' || isMarquee) {
        setCursorState('drag');
      } else if (isEmergency) {
        setCursorState('emergency');
      } else if (isSocial) {
        setCursorState('social');
        // Magnetic pull toward social button center
        const socialEl = target.closest('[data-social="true"]') as HTMLElement;
        if (socialEl) {
          const rect = socialEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          setMagneticOffset({
            x: (centerX - e.clientX) * 0.35,
            y: (centerY - e.clientY) * 0.35,
          });
        }
      } else if (isButton || cursorAttr === 'form') {
        setCursorState('form');
        setMagneticOffset({ x: 0, y: 0 });
      } else {
        setCursorState('default');
        setMagneticOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Smooth lerp / spring lag
  useEffect(() => {
    let animId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const render = () => {
      setPos((prev) => ({
        x: lerp(prev.x, targetPos.x + magneticOffset.x, 0.22),
        y: lerp(prev.y, targetPos.y + magneticOffset.y, 0.22),
      }));
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [targetPos, magneticOffset]);

  useEffect(() => {
    // Add custom-cursor-active class to body on desktop
    if (window.innerWidth >= 1024) {
      document.body.classList.add('custom-cursor-active');
    }
    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  if (!isVisible) return null;

  // Render different cursor states
  const renderCursorContent = () => {
    switch (cursorState) {
      case 'drag':
        return (
          <div className="w-24 h-24 rounded-full bg-[#38BDF8]/20 backdrop-blur-md border border-[#38BDF8]/60 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all duration-300">
            <span className="text-[10px] font-mono tracking-widest text-[#F8FAFC] font-bold text-center px-1">
              DRAG / EXPLORE
            </span>
          </div>
        );
      case 'form':
        return (
          <div className="w-10 h-10 rounded-full border-2 border-[#10B981] bg-[#10B981]/15 shadow-[0_0_20px_rgba(16,185,129,0.6)] flex items-center justify-center transition-all duration-300 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
        );
      case 'emergency':
        return (
          <div className="w-12 h-12 rounded-full border-2 border-[#EF4444] bg-[#EF4444]/25 shadow-[0_0_30px_rgba(239,68,68,0.8)] flex items-center justify-center transition-all duration-200 animate-bounce">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          </div>
        );
      case 'social':
        return (
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#38BDF8]/30 via-[#10B981]/30 to-[#EF4444]/30 border border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all duration-300">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-[#38BDF8]/60 backdrop-blur-sm border border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.8)] flex items-center justify-center transition-all duration-200">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        );
    }
  };

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden lg:block transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
      }}
    >
      {renderCursorContent()}
    </div>
  );
};
