import {
    BarChart3, Bot,
    Brain,
    ChevronDown,
    Database,
    Lock,
    Minus,
    Plus,
    RotateCcw,
    Unlock
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// --- HIGHLY DETAILED RPG-INSPIRED SVG ICONS ---

const TargetEyeIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12C2 12 7 5 12 5C17 5 22 12 22 12C22 12 17 19 12 19C7 19 2 12 2 12Z" fill="currentColor" fillOpacity="0.15" />
        <path d="M2 12C2 12 7 5 12 5C17 5 22 12 22 12C22 12 17 19 12 19C7 19 2 12 2 12Z" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4.5" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3" strokeWidth="2" strokeLinecap="square" />
        <path d="M4.93 4.93l2.12 2.12 M16.95 16.95l2.12 2.12 M4.93 19.07l2.12-2.12 M16.95 7.05l2.12-2.12" strokeWidth="1" strokeDasharray="1 3" />
    </svg>
);

const SoundRipplesIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12c0 2 1.5 4 3 4V8c-1.5 0-3 2-3 4z" fill="currentColor" />
        <path d="M9 7a5 5 0 010 10 M12 4a8 8 0 010 16 M15 1a11 11 0 010 22" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.5 8.5a3 3 0 010 7 M13.5 5.5a6 6 0 010 13" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <circle cx="18" cy="8" r="1.5" fill="currentColor" />
        <circle cx="21" cy="12" r="2" fill="currentColor" />
        <circle cx="19" cy="16" r="1.5" fill="currentColor" />
    </svg>
);

const RapidArrowIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 18L21 3" strokeWidth="2" />
        <path d="M14 3h7v7" strokeWidth="2.5" />
        <path d="M6 18l-3 3 M4 15l-3 3 M9 20l-3 3" strokeWidth="1.5" />

        <path d="M2 14l11-11" strokeWidth="1.5" opacity="0.5" />
        <path d="M9 3h4v4" strokeWidth="1.5" opacity="0.5" />
        <path d="M2 14l-2 2 M1 11l-2 2 M5 15l-2 2" strokeWidth="1" opacity="0.5" />

        <path d="M10 22l11-11" strokeWidth="1.5" opacity="0.5" />
        <path d="M17 11h4v4" strokeWidth="1.5" opacity="0.5" />
        <path d="M10 22l-2 2 M9 19l-2 2 M13 23l-2 2" strokeWidth="1" opacity="0.5" />

        <path d="M3 5l2-2 M6 8l2-2" strokeWidth="1" opacity="0.4" />
    </svg>
);

const RigorPotionIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 2h6v2H9z" fill="currentColor" />
        <path d="M11 4v5L6 17c-1 1.5 0 3 2 3h8c2 0 3-1.5 2-3l-5-8V4" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <path d="M7 14h10" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="10" cy="17" r="1" fill="currentColor" />
        <circle cx="13" cy="18" r="0.5" fill="currentColor" />
        <circle cx="14" cy="16" r="1" fill="currentColor" />
        <path d="M3 14l-2 1 M21 14l2 1 M4 18l-2 1 M20 18l2 1" strokeWidth="1" opacity="0.6" />
    </svg>
);

const FlameCoreIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22c4 0 8-3.5 8-8 0-4.5-3-7-6-11 1 3 0 5-2 6-2-4-4-5-6-5 0 3-1 5-2 7-1 2-2 4-2 6 0 4.5 4 8 8 8z" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 20c-2.5 0-4.5-2-4.5-4.5 0-3 2-4.5 4.5-7.5 2.5 3 4.5 4.5 4.5 7.5 0 2.5-2 4.5-4.5 4.5z" fill="currentColor" />
        <circle cx="6" cy="10" r="1.5" fill="currentColor" />
        <circle cx="17" cy="8" r="1.5" fill="currentColor" />
        <circle cx="14" cy="4" r="1" fill="currentColor" />
        <path d="M12 14v2" strokeWidth="1.5" stroke="white" opacity="0.5" />
    </svg>
);

const BookAuraIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <path d="M6 5h12 M6 8h12 M6 11h12 M6 14h8" strokeWidth="1" opacity="0.5" />
        <path d="M15 2v7l-2-2-2 2V2" fill="currentColor" />
        <path d="M2 3l1 1-1 1-1-1z M22 5l1 1-1 1-1-1z M20 11l1.5 1.5-1.5 1.5-1.5-1.5z M3 10l1 1-1 1-1-1z" fill="currentColor" />
    </svg>
);

const CloudStrikeIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18.5 16A4.5 4.5 0 0 0 19 7h-1.3A7.5 7.5 0 1 0 4.5 13.5" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <path d="M13 14l-4 5h5l-2 5" strokeWidth="2.5" fill="currentColor" strokeLinejoin="miter" />
        <path d="M7 15l-2 3h3l-1 2 M20 13l-2 3h3l-1 2" strokeWidth="1.5" />
        <circle cx="5" cy="21" r="1" fill="currentColor" />
        <circle cx="19" cy="19" r="1.5" fill="currentColor" />
        <circle cx="16" cy="23" r="1" fill="currentColor" />
    </svg>
);

const BlastMineIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 1L14 8L21 10L15 14L17 21L12 17L7 21L9 14L3 10L10 8Z" fill="currentColor" fillOpacity="0.25" strokeWidth="1" />
        <circle cx="12" cy="14" r="5" strokeWidth="2" fill="currentColor" fillOpacity="0.5" />
        <path d="M12 9v-2 M15.5 10.5l1.5-1.5 M17 14h2 M15.5 17.5l1.5 1.5 M12 19v2 M8.5 17.5l-1.5 1.5 M7 14H5 M8.5 10.5l-1.5-1.5" strokeWidth="2.5" />
        <path d="M12 9c0-3 3-4 4-6" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="16" cy="3" r="1.5" fill="currentColor" />
    </svg>
);

const DialoguePathsIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 10h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2l-3 3v-3h-1" strokeWidth="1.5" opacity="0.5" />
        <path d="M14 14H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <path d="M8 14v4l3-4" strokeWidth="2" />
        <path d="M6 6h5 M6 9h7 M6 12h4" strokeWidth="1.5" />
        <circle cx="16" cy="13" r="1.5" fill="currentColor" />
        <circle cx="19" cy="14" r="1.5" fill="currentColor" />
        <circle cx="17.5" cy="16" r="1.5" fill="currentColor" />
        <path d="M16 13l3 1 -1.5 2z" strokeWidth="0.5" opacity="0.6" />
    </svg>
);

const TrapNodeIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="7" strokeWidth="1.5" strokeDasharray="2 3" />
        <circle cx="12" cy="12" r="9" strokeWidth="1" opacity="0.4" />
        <path d="M12 5l-2-3h4z M12 19l-2 3h4z M5 12l-3-2v4z M19 12l3-2v4z M7 7l-3-3 4 1z M17 17l3 3-4-1z M17 7l3-3-4 1z M7 17l-3 3 4-1z" fill="currentColor" />
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);

const FalconFocusIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 16c3-5 8-8 14-8 1.5 0 3 .5 4 1-1 1-2 3-2 5s1 4 2 5c-1 .5-2.5 1-4 1-5 0-10-2-14-4z" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
        <path d="M17 8c2 0 4 .5 5 1-1 1.5-2 3-3 4" strokeWidth="1.5" fill="currentColor" fillOpacity="0.4" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        <path d="M12 7v-2 M12 17v2 M7 12H5" strokeWidth="2" />
        <path d="M4 14c2-1 4-1 6-1 M5 16c2-1 4-1 5-.5" strokeWidth="1.5" opacity="0.6" />
        <path d="M22 6l-3 3 M20 4l-2 2" strokeWidth="1" opacity="0.5" />
    </svg>
);

const ShipWheelIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="8" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="12" r="4" strokeWidth="2" />
        <path d="M12 4V1 M12 23v-3 M4 12H1 M23 12h-3 M6.3 6.3L4.2 4.2 M19.8 19.8l-2.1-2.1 M6.3 17.7l-2.1 2.1 M19.8 4.2l-2.1 2.1" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        <path d="M12 8v-4 M12 20v-4 M8 12H4 M20 12h-4 M9.2 9.2l-2.8-2.8 M17.6 17.6l-2.8-2.8 M9.2 14.8l-2.8 2.8 M17.6 6.4l-2.8 2.8" strokeWidth="1.5" />
    </svg>
);

const StreamFlowIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12C6 8 10 16 14 12C18 8 22 16 22 12" strokeWidth="2.5" />
        <path d="M2 7C6 3 10 11 14 7C18 3 22 11 22 7" strokeWidth="1.5" opacity="0.5" />
        <path d="M2 17C6 13 10 21 14 17C18 13 22 21 22 17" strokeWidth="1.5" opacity="0.5" />
        <rect x="7" y="7" width="3.5" height="3.5" fill="currentColor" transform="rotate(45 8.75 8.75)" />
        <rect x="15" y="11" width="4.5" height="4.5" fill="currentColor" transform="rotate(45 17.25 13.25)" />
        <rect x="10" y="16" width="3.5" height="3.5" fill="currentColor" transform="rotate(45 11.75 17.75)" />
        <path d="M18 13l2 2-2 2" strokeWidth="2" />
    </svg>
);

const NetworkBurstIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2V6 M12 18v4 M2 12h4 M18 12h4 M5 5l3 3 M16 16l3 3 M5 19l3-3 M16 8l3-3" strokeWidth="2.5" />
        <polygon points="12 8 16 12 12 16 8 12" fill="currentColor" />
        <rect x="2" y="10" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="18" y="10" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="10" y="2" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.8" />
        <rect x="10" y="18" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.8" />
        <circle cx="12" cy="12" r="6" strokeWidth="1.5" strokeDasharray="1 3" opacity="0.8" />
        <circle cx="12" cy="12" r="8.5" strokeWidth="1" opacity="0.4" />
    </svg>
);


// --- APP CONFIGURATION ---

const INITIAL_TIERS = [
    { id: 'tF', name: 'Foundational', threshold: 0, theme: 'slate' },
    { id: 't1', name: 'Tier 1', threshold: 10, theme: 'emerald' },
    { id: 't2', name: 'Tier 2', threshold: 20, theme: 'blue' },
    { id: 't25', name: 'Tier 2.5', threshold: 30, theme: 'indigo' },
    { id: 't3', name: 'Tier 3', threshold: 40, theme: 'purple' },
    { id: 't4', name: 'Tier 4', threshold: 50, theme: 'rose' }
];

const TIER_THEMES = {
    slate: { tab: 'bg-slate-600 text-white', hover: 'hover:bg-slate-100', text: 'text-slate-600', bg: 'from-slate-100 to-transparent', border: 'border-slate-200' },
    emerald: { tab: 'bg-emerald-500 text-white', hover: 'hover:bg-emerald-50', text: 'text-emerald-600', bg: 'from-emerald-100/80 to-transparent', border: 'border-emerald-200' },
    blue: { tab: 'bg-blue-600 text-white', hover: 'hover:bg-blue-50', text: 'text-blue-600', bg: 'from-blue-100/80 to-transparent', border: 'border-blue-200' },
    indigo: { tab: 'bg-indigo-500 text-white', hover: 'hover:bg-indigo-50', text: 'text-indigo-600', bg: 'from-indigo-100/80 to-transparent', border: 'border-indigo-200' },
    purple: { tab: 'bg-purple-500 text-white', hover: 'hover:bg-purple-50', text: 'text-purple-600', bg: 'from-purple-100/80 to-transparent', border: 'border-purple-200' },
    rose: { tab: 'bg-rose-500 text-white', hover: 'hover:bg-rose-50', text: 'text-rose-600', bg: 'from-rose-100/80 to-transparent', border: 'border-rose-200' },
};

const INITIAL_SKILLS = [
    // Foundational
    { id: 'calc', tier: 'tF', label: 'Calculus & Statistics', type: 'math', max: 5, current: 0, deps: [], icon: TargetEyeIcon },
    { id: 'eng_f', tier: 'tF', label: 'English Phonemes & Grammar', type: 'comm', max: 5, current: 0, deps: [], icon: SoundRipplesIcon },
    { id: 'algo', tier: 'tF', label: 'LeetCode Katas', type: 'coding', max: 10, current: 0, deps: [], icon: RapidArrowIcon },

    // Tier 1
    { id: 'sci_rigor', tier: 't1', label: 'Scientific Rigor vs Eng', type: 'math', max: 5, current: 0, deps: ['calc'], icon: RigorPotionIcon },
    { id: 'pt_base', tier: 't1', label: 'PyTorch Basics', type: 'ml', max: 5, current: 0, deps: ['calc'], icon: FlameCoreIcon },
    { id: 'eng_t1', tier: 't1', label: 'English Basic (B1-B2) Professional Register', type: 'comm', max: 5, current: 0, deps: ['eng_f'], icon: BookAuraIcon },

    // Tier 2
    { id: 'aws', tier: 't2', label: 'AWS Specialty', type: 'cloud', max: 5, current: 0, deps: ['algo'], icon: CloudStrikeIcon },
    { id: 'spark', tier: 't2', label: 'Apache Spark Data Pipelines', type: 'data', max: 5, current: 0, deps: ['sci_rigor'], icon: BlastMineIcon },
    { id: 'eng_t2', tier: 't2', label: 'English Intermediate (C1-C2) Adv. Nuance', type: 'comm', max: 5, current: 0, deps: ['eng_t1'], icon: DialoguePathsIcon },

    // Tier 2.5
    { id: 'sys_design', tier: 't25', label: 'Distributed System Design', type: 'cloud', max: 5, current: 0, deps: ['aws'], icon: TrapNodeIcon },
    { id: 'pt_adv', tier: 't25', label: 'Advanced PyTorch Mechanics', type: 'ml', max: 5, current: 0, deps: ['pt_base'], icon: FalconFocusIcon },

    // Tier 3
    { id: 'k8s', tier: 't3', label: 'Kubernetes (k8s) Roadmap', type: 'cloud', max: 5, current: 0, deps: ['sys_design'], icon: ShipWheelIcon },
    { id: 'kafka', tier: 't3', label: 'Kafka Event Streams', type: 'data', max: 5, current: 0, deps: ['spark'], icon: StreamFlowIcon },

    // Tier 4
    { id: 'dist_train', tier: 't4', label: 'Distributed Training & Inference', type: 'ml', max: 5, current: 0, deps: ['pt_adv', 'k8s'], icon: NetworkBurstIcon },
];

const TYPE_COLORS = {
    math: { bg: 'from-amber-400 to-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-200' },
    comm: { bg: 'from-emerald-400 to-teal-500', border: 'border-teal-500', shadow: 'shadow-teal-200' },
    coding: { bg: 'from-indigo-400 to-violet-500', border: 'border-violet-500', shadow: 'shadow-violet-200' },
    ml: { bg: 'from-pink-400 to-rose-500', border: 'border-rose-500', shadow: 'shadow-rose-200' },
    cloud: { bg: 'from-blue-400 to-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-200' },
    data: { bg: 'from-cyan-400 to-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-200' }
};

const ROLES = [
    { id: 'mle', label: 'MLE', icon: Brain, active: true },
    { id: 'ds', label: 'DS', icon: BarChart3, active: false },
    { id: 'de', label: 'DE', icon: Database, active: false },
    { id: 'aie', label: 'AIE', icon: Bot, active: false },
];

export default function SkillTreeApp() {
    const [skills, setSkills] = useState(INITIAL_SKILLS);
    const [tiers, setTiers] = useState(INITIAL_TIERS);
    const [spentPoints, setSpentPoints] = useState(0);
    const [activeTier, setActiveTier] = useState('tF');
    const [lines, setLines] = useState([]);
    const [tierBackgrounds, setTierBackgrounds] = useState([]);
    const [isUnlockedMode, setIsUnlockedMode] = useState(false);

    const scrollContainerRef = useRef(null);
    const nodeRefs = useRef({});
    const tierRefs = useRef({});

    const TOTAL_CAP = 60;

    // Derived states
    const activeTiers = tiers.map(t => ({
        ...t,
        state: (isUnlockedMode || spentPoints >= t.threshold) ? 'active' : 'locked',
        isCurrentView: t.id === activeTier
    }));

    const getTierIndex = (tierId) => tiers.findIndex(t => t.id === tierId);

    // Check if a skill meets prerequisite dependencies
    const areDependenciesMet = (skillId) => {
        if (isUnlockedMode) return true;
        const skill = skills.find(s => s.id === skillId);
        if (!skill || !skill.deps || skill.deps.length === 0) return true;

        return skill.deps.every(depId => {
            const depSkill = skills.find(s => s.id === depId);
            return depSkill && depSkill.current > 0;
        });
    };

    // Handle adding points
    const addPoint = (skillId) => {
        if (!isUnlockedMode && spentPoints >= TOTAL_CAP) return;

        setSkills(prev => {
            const skill = prev.find(s => s.id === skillId);
            const tierDef = tiers.find(t => t.id === skill.tier);

            if (!isUnlockedMode) {
                if (spentPoints < tierDef.threshold) return prev;

                const depsMet = skill.deps.every(depId => {
                    const depSkill = prev.find(s => s.id === depId);
                    return depSkill && depSkill.current > 0;
                });
                if (!depsMet) return prev;
            }

            if (skill.current >= skill.max) return prev;
            return prev.map(s => s.id === skillId ? { ...s, current: s.current + 1 } : s);
        });
    };

    // Handle removing points
    const removePoint = (skillId) => {
        setSkills(prev => {
            const skill = prev.find(s => s.id === skillId);
            if (skill.current <= 0) return prev;

            if (!isUnlockedMode && skill.current === 1) {
                const hasDependentChildren = prev.some(child =>
                    child.deps.includes(skillId) && child.current > 0
                );
                if (hasDependentChildren) return prev;
            }

            return prev.map(s => s.id === skillId ? { ...s, current: s.current - 1 } : s);
        });
    };

    const handleAddTier = () => {
        const lastTier = tiers[tiers.length - 1];
        const nextThreshold = lastTier ? lastTier.threshold + 10 : 0;
        const newId = `t${Date.now()}`;

        const themeKeys = Object.keys(TIER_THEMES);
        const nextTheme = themeKeys[tiers.length % themeKeys.length];

        const newTier = {
            id: newId,
            name: `Tier ${tiers.length}`,
            threshold: nextThreshold,
            theme: nextTheme
        };
        setTiers([...tiers, newTier]);
    };

    const resetPoints = () => {
        setSkills(prev => prev.map(s => ({ ...s, current: 0 })));
    };

    // Update global spent points when skills change
    useEffect(() => {
        const total = skills.reduce((acc, curr) => acc + curr.current, 0);
        setSpentPoints(total);
    }, [skills]);

    // Draw dependency lines and calculate tier background boxes
    const updateLayout = useCallback(() => {
        if (!scrollContainerRef.current) return;
        const scrollRect = scrollContainerRef.current.getBoundingClientRect();

        // 1. Calculate Tier Backgrounds
        const newBackgrounds = tiers.map(tier => {
            const el = tierRefs.current[tier.id];
            if (!el) return null;

            const rect = el.getBoundingClientRect();
            return {
                id: tier.id,
                theme: tier.theme,
                top: rect.top - scrollRect.top + scrollContainerRef.current.scrollTop,
                height: rect.height,
                width: rect.width,
                left: el.offsetLeft
            };
        }).filter(Boolean);
        setTierBackgrounds(newBackgrounds);

        // 2. Calculate Lines
        const newLines = [];
        skills.forEach(child => {
            if (!child.deps || child.deps.length === 0) return;

            const childEl = nodeRefs.current[child.id];
            const childTierIdx = getTierIndex(child.tier);
            if (!childEl) return;

            const childRect = childEl.getBoundingClientRect();
            const cx = childRect.left - scrollRect.left + childRect.width / 2;
            const cy = childRect.top - scrollRect.top + scrollContainerRef.current.scrollTop;

            child.deps.forEach(parentId => {
                const parentEl = nodeRefs.current[parentId];
                const parentNode = skills.find(s => s.id === parentId);

                if (!parentEl || !parentNode) return;

                const parentTierIdx = getTierIndex(parentNode.tier);

                const parentRect = parentEl.getBoundingClientRect();
                const px = parentRect.left - scrollRect.left + parentRect.width / 2;
                const py = parentRect.bottom - scrollRect.top + scrollContainerRef.current.scrollTop;

                const isMet = parentNode.current > 0 || isUnlockedMode;
                const strokeColor = isMet ? "#64748b" : "#cbd5e1";
                const strokeDash = isMet ? "none" : "6 6";

                const isSkipTier = (childTierIdx - parentTierIdx) > 1;

                if (isSkipTier) {
                    const isRightSide = cx > scrollRect.width / 2;
                    const busX = isRightSide ? scrollRect.width - 40 : 40;
                    const drop = 35;
                    const rise = 35;

                    newLines.push({
                        path: `M ${px} ${py} L ${px} ${py + drop} L ${busX} ${py + drop} L ${busX} ${cy - rise} L ${cx} ${cy - rise} L ${cx} ${cy}`,
                        color: strokeColor,
                        dash: strokeDash
                    });
                } else {
                    const midY = py + (cy - py) / 2;
                    newLines.push({
                        path: `M ${px} ${py} L ${px} ${midY} L ${cx} ${midY} L ${cx} ${cy}`,
                        color: strokeColor,
                        dash: strokeDash
                    });
                }
            });
        });
        setLines(newLines);
    }, [skills, isUnlockedMode, tiers]);

    useEffect(() => {
        const timer = setTimeout(updateLayout, 100);
        window.addEventListener('resize', updateLayout);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateLayout);
        };
    }, [updateLayout]);

    // Setup Intersection Observer for Scroll Spy
    useEffect(() => {
        const observerOptions = {
            root: scrollContainerRef.current,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveTier(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        tiers.forEach(t => {
            if (tierRefs.current[t.id]) {
                observer.observe(tierRefs.current[t.id]);
            }
        });

        return () => observer.disconnect();
    }, [tiers]);

    const scrollToTier = (tierId) => {
        if (tierRefs.current[tierId]) {
            tierRefs.current[tierId].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">

            {/* COLUMN 1: Role Tabs (Left Sidebar) */}
            <div className="w-20 md:w-24 border-r border-slate-200/80 bg-white/80 backdrop-blur-md flex flex-col items-center py-8 gap-6 z-50 shadow-sm shrink-0">
                {ROLES.map((role) => (
                    <button
                        key={role.id}
                        className={`group relative flex flex-col items-center gap-1.5 transition-all ${role.active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${role.active
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                : 'bg-slate-100 group-hover:bg-slate-200'
                            }`}>
                            <role.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold tracking-wider uppercase">
                            {role.label}
                        </span>
                    </button>
                ))}

                <div className="w-8 h-px bg-slate-200 my-2"></div>

                <button className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-all">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-transparent group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-300">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase">Add</span>
                </button>
            </div>

            {/* COLUMN 2: Dynamic Skill Canvas (Center) */}
            <div className="flex-1 h-full flex flex-col relative min-w-0">

                {/* Top Navigation Row */}
                <div className="sticky top-0 z-50 flex flex-col border-b border-slate-200 bg-white/80 backdrop-blur-xl">

                    <div className="flex items-center justify-between px-8 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-slate-700 font-extrabold tracking-tight">Path Progression</h2>
                        <button
                            onClick={() => setIsUnlockedMode(!isUnlockedMode)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${isUnlockedMode
                                    ? 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
                                    : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                                }`}
                        >
                            {isUnlockedMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {isUnlockedMode ? 'Mode: Free Sandbox' : 'Mode: Strict Path'}
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-8 py-4">
                        {activeTiers.map(t => {
                            const theme = TIER_THEMES[t.theme] || TIER_THEMES.slate;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => scrollToTier(t.id)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all shrink-0 border border-transparent ${t.isCurrentView
                                            ? `${theme.tab} shadow-md scale-105`
                                            : t.state === 'active'
                                                ? `bg-white ${theme.text} ${theme.hover} shadow-sm border-slate-200`
                                                : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    {t.state === 'locked' && <Lock className="w-3.5 h-3.5" />}
                                    {t.name}
                                    {t.state === 'locked' && (
                                        <span className="w-5 h-5 bg-red-400/90 text-white rounded-full text-[10px] flex items-center justify-center ml-1 shadow-sm">
                                            {t.threshold}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        <button
                            onClick={handleAddTier}
                            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shrink-0 border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                </div>

                {/* Skill Nodes Canvas */}
                <div className="flex-1 overflow-y-auto relative px-8 pb-40 scroll-smooth isolate" ref={scrollContainerRef}>

                    {/* Layer 1: Bottom Layer - Tier Background Gradients */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {tierBackgrounds.map((bg, idx) => {
                            const isLocked = tiers[idx] && tiers[idx].threshold > spentPoints && !isUnlockedMode;
                            const theme = TIER_THEMES[bg.theme] || TIER_THEMES.slate;
                            return (
                                <div
                                    key={`bg-${bg.id}`}
                                    className={`absolute bg-gradient-to-b ${theme.bg} rounded-[3rem] border ${theme.border} shadow-sm transition-opacity duration-500 ${isLocked ? 'opacity-30 grayscale' : 'opacity-100'}`}
                                    style={{
                                        top: `${bg.top + 16}px`,
                                        left: '0px',
                                        width: '100%',
                                        height: `${bg.height - 32}px`,
                                        zIndex: 0
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Layer 2: Middle Layer - Connection Lines SVG */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                        {lines.map((line, i) => (
                            <path
                                key={i}
                                d={line.path}
                                stroke={line.color}
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray={line.dash}
                                className="opacity-90 transition-all duration-300 drop-shadow-sm"
                            />
                        ))}
                    </svg>

                    {/* Layer 3: Top Layer - Skill Nodes */}
                    <div className="flex flex-col relative z-20 w-full max-w-5xl mx-auto">
                        {activeTiers.map((tier) => {
                            const tierSkills = skills.filter(s => s.tier === tier.id);
                            const isLocked = tier.state === 'locked';

                            return (
                                <div key={tier.id} id={tier.id} ref={el => tierRefs.current[tier.id] = el}
                                    className={`relative w-full py-16 my-4 transition-all duration-500 ${isLocked ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>

                                    <div className="flex flex-wrap justify-center gap-x-16 gap-y-24">
                                        {tierSkills.map(skill => {
                                            const typeStyle = TYPE_COLORS[skill.type] || TYPE_COLORS.math;
                                            const depsMet = areDependenciesMet(skill.id);
                                            const isAccessible = !isLocked && depsMet;

                                            return (
                                                <div key={skill.id} className={`relative flex flex-col items-center group transition-all duration-300 ${!isAccessible ? 'opacity-60 grayscale-[50%]' : ''}`} ref={el => nodeRefs.current[skill.id] = el}>

                                                    {/* Highly Styled Squircle Node Base */}
                                                    <div className={`relative w-[96px] h-[96px] rounded-[2.5rem] flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:-translate-y-1 ${skill.current === skill.max
                                                            ? 'bg-gradient-to-br from-amber-200 to-amber-500 shadow-xl shadow-amber-200/50 scale-105'
                                                            : skill.current > 0
                                                                ? `bg-gradient-to-br from-slate-200 to-slate-400 shadow-lg ${typeStyle.shadow}`
                                                                : 'bg-white border-[3px] border-slate-200 shadow-sm'
                                                        }`}>

                                                        {/* Inner Circular Custom SVG Icon */}
                                                        <div className={`w-full h-full rounded-[2.2rem] flex items-center justify-center relative overflow-hidden ${skill.current > 0
                                                                ? `bg-gradient-to-br ${typeStyle.bg}`
                                                                : 'bg-slate-50'
                                                            }`}>
                                                            <skill.icon className={`w-12 h-12 ${skill.current > 0 ? 'text-white drop-shadow-md' : 'text-slate-400'}`} />

                                                            {skill.current > 0 && (
                                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/60 opacity-60 pointer-events-none" />
                                                            )}
                                                        </div>

                                                        {/* Progress Badge */}
                                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-extrabold shadow-md ring-2 ring-white z-10 ${skill.current === skill.max
                                                                ? 'bg-amber-500 text-white'
                                                                : skill.current > 0
                                                                    ? `bg-gradient-to-r ${typeStyle.bg} text-white`
                                                                    : 'bg-slate-200 text-slate-500'
                                                            }`}>
                                                            {skill.current}/{skill.max}
                                                        </div>

                                                        {/* Minus / Refund Button */}
                                                        {skill.current > 0 && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removePoint(skill.id); }}
                                                                className="absolute top-1/2 -left-3 -translate-y-1/2 w-7 h-7 bg-slate-800 rounded-xl text-white flex items-center justify-center shadow-lg hover:bg-slate-900 hover:scale-110 active:scale-95 transition-all z-20 border-2 border-white"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {/* Quick Add Button */}
                                                        {skill.current < skill.max && isAccessible && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); addPoint(skill.id); }}
                                                                className={`absolute top-1/2 -right-3 -translate-y-1/2 w-7 h-7 rounded-xl text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-20 border-2 border-white ${isUnlockedMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                                                                    }`}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Full Title Label Container */}
                                                    <div className="mt-4 bg-slate-800/90 backdrop-blur px-4 py-2.5 rounded-xl text-white text-[11px] font-bold shadow-lg max-w-[160px] min-w-[120px] text-center leading-snug border border-slate-700/50">
                                                        {skill.label}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {tierSkills.length === 0 && (
                                            <div className="w-full max-w-sm h-32 border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center text-slate-400 bg-white/50 backdrop-blur-sm shadow-sm">
                                                <span className="text-sm font-semibold tracking-wide">Empty Tier Region</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Chevron Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none text-slate-400 animate-bounce">
                    <ChevronDown className="w-8 h-8 opacity-60" />
                </div>
            </div>

            {/* COLUMN 3: Role Summary Banner (Right Panel) */}
            <div className="hidden md:flex w-[25%] lg:w-[22%] h-full relative p-6 flex-col items-center border-l border-slate-200/80 bg-white/80 backdrop-blur-sm shrink-0 shadow-sm z-10">
                <div className="w-full max-w-[280px] h-[85%] bg-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center pt-14 pb-10 transition-all duration-500 rounded-bl-[4rem] rounded-br-[4rem] border-b-4 border-slate-900">

                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)',
                            backgroundSize: '24px 24px',
                            backgroundPosition: '0 0, 12px 12px'
                        }}
                    />

                    <div className="bg-slate-900/80 rounded-full px-5 py-2 z-10 text-white font-bold tracking-wider text-xs uppercase shadow-inner text-center border border-slate-700">
                        Machine Learning Engineer
                    </div>

                    <div className="mt-8 bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-[2rem] border-[3px] border-white z-10 shadow-2xl">
                        <Brain className="w-16 h-16 text-white drop-shadow-md" />
                    </div>

                    <span className="mt-6 text-slate-400 uppercase tracking-widest text-[10px] font-bold z-10">
                        Skill Progression
                    </span>

                    <div className="mt-auto relative w-36 h-36 flex items-center justify-center z-10 mb-6">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                            <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                            <circle cx="72" cy="72" r="60" fill="none" stroke="url(#blue-gradient)" strokeWidth="12"
                                strokeDasharray="377"
                                strokeDashoffset={377 - (377 * (spentPoints / TOTAL_CAP))}
                                className="transition-all duration-1000 ease-out"
                                strokeLinecap="round" />
                            <defs>
                                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-white text-3xl font-extrabold tracking-tight">{spentPoints}</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest -mt-1">/ {TOTAL_CAP}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={resetPoints}
                    className="mt-6 flex items-center gap-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 px-5 py-3 rounded-full font-bold text-sm shadow-sm transition-all border border-slate-200 hover:border-rose-200"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Points
                </button>
            </div>
        </div>
    );
}