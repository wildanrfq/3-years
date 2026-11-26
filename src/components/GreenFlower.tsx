interface GreenFlowerProps {
  variant?: 'bloom' | 'sprig' | 'rosette';
  className?: string;
}

/**
 * Botanical sage-green flower ornaments using theme CSS variables so they blend
 * softly in both light and dark mode.
 */
export function GreenFlower({ variant = 'bloom', className = '' }: GreenFlowerProps) {
  if (variant === 'sprig') {
    return (
      <svg
        viewBox="0 0 96 96"
        fill="none"
        aria-hidden="true"
        className={className}
      >
        {/* Melengkung halus tangkai */}
        <path
          d="M16 82 C32 62, 46 44, 72 18"
          stroke="var(--sage-500)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Daun kanan & kiri */}
        <path
          d="M34 60 C22 54, 18 42, 24 34 C34 38, 38 48, 34 60 Z"
          fill="var(--sage-300)"
          stroke="var(--sage-600)"
          strokeWidth="1.6"
        />
        <path
          d="M44 50 C58 54, 68 48, 72 38 C60 36, 50 40, 44 50 Z"
          fill="var(--sage-400)"
          stroke="var(--sage-600)"
          strokeWidth="1.6"
        />
        {/* Bunga utama di ujung tangkai */}
        <g transform="translate(68 22)">
          <ellipse cx="0" cy="-9" rx="5.5" ry="8" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.4" />
          <ellipse cx="8.5" cy="-2.5" rx="5.5" ry="8" transform="rotate(72 8.5 -2.5)" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.4" />
          <ellipse cx="5.2" cy="7.5" rx="5.5" ry="8" transform="rotate(144 5.2 7.5)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.4" />
          <ellipse cx="-5.2" cy="7.5" rx="5.5" ry="8" transform="rotate(216 -5.2 7.5)" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.4" />
          <ellipse cx="-8.5" cy="-2.5" rx="5.5" ry="8" transform="rotate(288 -8.5 -2.5)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="4.2" fill="var(--sage-500)" />
          <circle cx="0" cy="0" r="1.8" fill="var(--cream)" />
        </g>
        {/* Kuncup kecil di tengah tangkai */}
        <g transform="translate(46 40) scale(0.62)">
          <circle cx="0" cy="-7" r="5" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.8" />
          <circle cx="6.5" cy="2" r="5" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.8" />
          <circle cx="-6.5" cy="2" r="5" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="3" fill="var(--sage-500)" />
        </g>
      </svg>
    );
  }

  if (variant === 'rosette') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className={className}
      >
        <g transform="translate(32 32)">
          <ellipse cx="0" cy="-14" rx="7" ry="11" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.6" />
          <ellipse cx="12.1" cy="-7" rx="7" ry="11" transform="rotate(60 12.1 -7)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.6" />
          <ellipse cx="12.1" cy="7" rx="7" ry="11" transform="rotate(120 12.1 7)" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.6" />
          <ellipse cx="0" cy="14" rx="7" ry="11" transform="rotate(180 0 14)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.6" />
          <ellipse cx="-12.1" cy="7" rx="7" ry="11" transform="rotate(240 -12.1 7)" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.6" />
          <ellipse cx="-12.1" cy="-7" rx="7" ry="11" transform="rotate(300 -12.1 -7)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.6" />
          <circle cx="0" cy="0" r="6.5" fill="var(--sage-500)" stroke="var(--sage-700)" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="2.6" fill="var(--cream)" />
        </g>
      </svg>
    );
  }

  // 'bloom' default: bunga sage 5 kelopak dengan dua daun lembut
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Dua daun penyangga di bawah bunga */}
      <path
        d="M24 68 C14 58, 12 44, 22 36 C32 44, 34 56, 24 68 Z"
        fill="var(--sage-400)"
        stroke="var(--sage-600)"
        strokeWidth="1.6"
      />
      <path
        d="M72 68 C82 58, 84 44, 74 36 C64 44, 62 56, 72 68 Z"
        fill="var(--sage-300)"
        stroke="var(--sage-600)"
        strokeWidth="1.6"
      />
      {/* Kelopak bunga 5 sisi */}
      <g transform="translate(48 48)">
        <ellipse cx="0" cy="-18" rx="11" ry="15" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.7" />
        <ellipse cx="17" cy="-5.5" rx="11" ry="15" transform="rotate(72 17 -5.5)" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.7" />
        <ellipse cx="10.5" cy="14.5" rx="11" ry="15" transform="rotate(144 10.5 14.5)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.7" />
        <ellipse cx="-10.5" cy="14.5" rx="11" ry="15" transform="rotate(216 -10.5 14.5)" fill="var(--sage-300)" stroke="var(--sage-600)" strokeWidth="1.7" />
        <ellipse cx="-17" cy="-5.5" rx="11" ry="15" transform="rotate(288 -17 -5.5)" fill="var(--sage-200)" stroke="var(--sage-600)" strokeWidth="1.7" />
        <circle cx="0" cy="0" r="9.5" fill="var(--sage-500)" stroke="var(--sage-700)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill="var(--cream)" opacity="0.9" />
      </g>
    </svg>
  );
}
