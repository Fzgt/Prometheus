import { useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { paths } from '@/config/paths';
import { cn } from '@/utils/cn';

type TagChipProps = {
  tag: string;
  count?: number;
  isActive?: boolean;
  clickable?: boolean;
  className?: string;
};

export function TagChip({
  tag,
  count,
  isActive = false,
  clickable = false,
  className,
}: TagChipProps) {
  const navigate = useNavigate();

  if (!clickable) {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className={className}>
        {tag}
        {count !== undefined && (
          <span className="ml-1 opacity-70">({count})</span>
        )}
      </Badge>
    );
  }

  return (
    <button
      onClick={() => navigate(paths.tag.getHref(tag))}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        isActive
          ? 'border-transparent bg-primary text-primary-foreground'
          : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        className,
      )}
    >
      {tag}
      {count !== undefined && (
        <span className="ml-1 opacity-70">({count})</span>
      )}
    </button>
  );
}
