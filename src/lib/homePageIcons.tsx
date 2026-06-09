import {
  FiAward,
  FiBook,
  FiClock,
  FiHeart,
  FiLayers,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
  type IconType,
} from 'react-icons/fi';

/** Maps stored icon names to react-icons components for the home page */
const ICON_MAP: Record<string, IconType> = {
  FiBook: FiBook,
  FiTarget: FiTarget,
  FiAward: FiAward,
  FiUsers: FiUsers,
  FiLayers: FiLayers,
  FiTrendingUp: FiTrendingUp,
  FiStar: FiStar,
  FiZap: FiZap,
  FiHeart: FiHeart,
  FiClock: FiClock,
};

export function HomePageIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || FiStar;
  return <Icon className={className} />;
}

export const HOME_ICON_OPTIONS = Object.keys(ICON_MAP);
