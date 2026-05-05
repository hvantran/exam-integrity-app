import React from 'react';

export interface ScrollAreaProps {
  children: React.ReactNode;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  className?: string;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  rootMargin?: string;
}

const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  className,
  loader,
  endMessage,
  rootMargin = '160px',
}) => {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, rootMargin]);

  return (
    <div className={className}>
      {children}

      {hasMore && (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      )}

      <div className="flex justify-center mt-6 min-h-6 text-sm text-on-surfaceVariant">
        {isLoading ? loader ?? <span>Loading more…</span> : !hasMore ? endMessage ?? null : null}
      </div>
    </div>
  );
};

export default ScrollArea;
