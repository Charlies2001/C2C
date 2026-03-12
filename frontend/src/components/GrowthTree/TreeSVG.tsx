import type { TreeStage } from '../../types/problem';

interface TreeSVGProps {
  stage: TreeStage;
  size?: 'sm' | 'lg';
}

export default function TreeSVG({ stage, size = 'sm' }: TreeSVGProps) {
  const px = size === 'sm' ? 24 : 120;

  return (
    <svg
      viewBox="0 0 100 100"
      width={px}
      height={px}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <ellipse cx="50" cy="90" rx="30" ry="6" fill="#5C4033" opacity="0.6" />

      {stage === 'seed' && <Seed />}
      {stage === 'sprout' && <Sprout />}
      {stage === 'seedling' && <Seedling />}
      {stage === 'small-tree' && <SmallTree />}
      {stage === 'big-tree' && <BigTree />}
      {stage === 'flowering' && <FloweringTree />}
    </svg>
  );
}

function Seed() {
  return (
    <>
      <ellipse cx="50" cy="82" rx="8" ry="6" fill="#8B6914" />
      <ellipse cx="50" cy="81" rx="6" ry="4" fill="#A0842B" />
    </>
  );
}

function Sprout() {
  return (
    <>
      <line x1="50" y1="84" x2="50" y2="68" stroke="#6B8E23" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="46" cy="68" rx="6" ry="4" fill="#90EE90" transform="rotate(-20 46 68)" className="leaf-sway" />
      <ellipse cx="54" cy="72" rx="5" ry="3" fill="#7CCD7C" transform="rotate(15 54 72)" className="leaf-sway" style={{ animationDelay: '0.3s' }} />
    </>
  );
}

function Seedling() {
  return (
    <>
      <line x1="50" y1="85" x2="50" y2="55" stroke="#6B8E23" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="42" cy="60" rx="10" ry="5" fill="#90EE90" transform="rotate(-25 42 60)" className="leaf-sway" />
      <ellipse cx="58" cy="55" rx="10" ry="5" fill="#7CCD7C" transform="rotate(25 58 55)" className="leaf-sway" style={{ animationDelay: '0.4s' }} />
      <ellipse cx="45" cy="50" rx="7" ry="4" fill="#98FB98" transform="rotate(-15 45 50)" className="leaf-sway" style={{ animationDelay: '0.2s' }} />
    </>
  );
}

function SmallTree() {
  return (
    <>
      {/* Trunk */}
      <rect x="47" y="55" width="6" height="32" rx="2" fill="#8B6914" />
      {/* Crown */}
      <ellipse cx="50" cy="45" rx="20" ry="18" fill="#228B22" />
      <ellipse cx="42" cy="40" rx="12" ry="10" fill="#2E8B57" />
      <ellipse cx="58" cy="42" rx="10" ry="9" fill="#32CD32" opacity="0.7" />
    </>
  );
}

function BigTree() {
  return (
    <>
      {/* Trunk */}
      <rect x="44" y="50" width="12" height="38" rx="3" fill="#8B6914" />
      <rect x="42" y="70" width="4" height="12" rx="2" fill="#7A5B12" transform="rotate(-20 42 70)" />
      {/* Crown */}
      <ellipse cx="50" cy="38" rx="28" ry="24" fill="#228B22" />
      <ellipse cx="38" cy="32" rx="16" ry="14" fill="#2E8B57" />
      <ellipse cx="62" cy="35" rx="14" ry="12" fill="#32CD32" opacity="0.7" />
      <ellipse cx="50" cy="25" rx="12" ry="10" fill="#3CB371" />
    </>
  );
}

function FloweringTree() {
  return (
    <>
      {/* Trunk */}
      <rect x="44" y="50" width="12" height="38" rx="3" fill="#8B6914" />
      <rect x="42" y="70" width="4" height="12" rx="2" fill="#7A5B12" transform="rotate(-20 42 70)" />
      {/* Crown */}
      <ellipse cx="50" cy="38" rx="28" ry="24" fill="#228B22" />
      <ellipse cx="38" cy="32" rx="16" ry="14" fill="#2E8B57" />
      <ellipse cx="62" cy="35" rx="14" ry="12" fill="#32CD32" opacity="0.7" />
      <ellipse cx="50" cy="25" rx="12" ry="10" fill="#3CB371" />
      {/* Flowers */}
      <circle cx="35" cy="28" r="4" fill="#DDA0DD" className="bloom-pulse" />
      <circle cx="55" cy="22" r="3.5" fill="#EE82EE" className="bloom-pulse" style={{ animationDelay: '0.3s' }} />
      <circle cx="65" cy="32" r="3" fill="#DA70D6" className="bloom-pulse" style={{ animationDelay: '0.6s' }} />
      <circle cx="45" cy="20" r="3" fill="#FF69B4" className="bloom-pulse" style={{ animationDelay: '0.9s' }} />
      <circle cx="58" cy="42" r="3.5" fill="#DDA0DD" className="bloom-pulse" style={{ animationDelay: '0.2s' }} />
      <circle cx="40" cy="38" r="2.5" fill="#EE82EE" className="bloom-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="50" cy="15" r="3" fill="#FF69B4" className="bloom-pulse" style={{ animationDelay: '0.8s' }} />
    </>
  );
}
