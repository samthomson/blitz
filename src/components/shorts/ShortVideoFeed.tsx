import { useState, useRef, useEffect, useCallback } from 'react';
import { ShortVideoCard } from './ShortVideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ShortVideo } from '@/hooks/useShorts';

interface ShortVideoFeedProps {
  shorts: ShortVideo[];
  isLoading?: boolean;
  className?: string;
}

export function ShortVideoFeed({ shorts, isLoading, className }: ShortVideoFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Handle scroll to determine active video
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < shorts.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, shorts.length]);

  // Snap to nearest video on scroll end (debounced)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: number;
    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        if (isScrollingRef.current) return;
        
        const itemHeight = container.clientHeight;
        const targetScroll = activeIndex * itemHeight;

        isScrollingRef.current = true;
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });

        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
      }, 150);
    };

    container.addEventListener('scroll', handleScrollEnd);
    return () => {
      container.removeEventListener('scroll', handleScrollEnd);
      clearTimeout(scrollTimeout);
    };
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, shorts.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shorts.length]);

  // Scroll to active index when it changes via keyboard
  useEffect(() => {
    if (!containerRef.current) return;

    const itemHeight = containerRef.current.clientHeight;
    const targetScroll = activeIndex * itemHeight;

    isScrollingRef.current = true;
    containerRef.current.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 300);
  }, [activeIndex]);

  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full", className)}>
        <Skeleton className="w-full max-w-md aspect-[9/16] rounded-lg" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground", className)}>
        <p className="text-lg">No shorts yet</p>
        <p className="text-sm mt-1">Be the first to post a short video!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide",
        className
      )}
      onScroll={handleScroll}
    >
      {shorts.map((short, index) => (
        <div
          key={short.id}
          className="h-full w-full snap-start snap-always flex items-center justify-center"
        >
          <div className="h-full w-full max-w-md">
            <ShortVideoCard
              short={short}
              isActive={index === activeIndex}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

