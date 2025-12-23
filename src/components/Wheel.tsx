import { useState, useRef, useMemo } from 'react';

interface WheelProps {
    players: string[];
    onSpinEnd: (winner: string) => void;
}

const COLORS = [
    '#6366F1', // Indigo 靛蓝
    '#F472B6', // Pink 粉色
    '#34D399', // Emerald 翡翠绿
    '#FBBF24', // Amber 琥珀
    '#A78BFA', // Violet 紫罗兰
    '#38BDF8', // Sky 天蓝
    '#FB923C', // Orange 橙色
    '#4ADE80', // Green 草绿
    '#F87171', // Red 珊瑚红
    '#22D3EE', // Cyan 青色
    '#E879F9', // Fuchsia 洋红
    '#A3E635', // Lime 青柠
];

const TOTAL_SEGMENTS = 100; // 总共100份

// 使用基于种子的随机数生成器，确保同一组玩家的分布是一致的
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// 生成不均匀分布的分段
const generateSegments = (players: string[]) => {
    if (players.length === 0) return [];

    // 为每个玩家创建分段
    const segments: number[] = [];

    // 初始分配：交错但有一定随机性
    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
        // 基本的交错分配
        const basePlayer = i % players.length;
        segments.push(basePlayer);
    }

    // 使用 Fisher-Yates 洗牌算法打乱顺序，但使用基于玩家名的种子
    const seed = players.join('').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = segments.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [segments[i], segments[j]] = [segments[j], segments[i]];
    }

    return segments;
};

export const Wheel = ({ players, onSpinEnd }: WheelProps) => {
    const [spinning, setSpinning] = useState(false);
    const rotationRef = useRef(0);
    const wheelRef = useRef<HTMLDivElement>(null);

    // 生成100个不均匀分布的分段
    const segments = useMemo(() => generateSegments(players), [players]);

    const segmentSize = 360 / TOTAL_SEGMENTS; // 每个分段的角度

    const spin = () => {
        if (spinning) return;
        setSpinning(true);

        // 增加旋转圈数到约15-20圈 (5400-7200度)，让转盘转得更快更多圈
        const newRotation = rotationRef.current + 5400 + Math.random() * 1800;
        rotationRef.current = newRotation;

        if (wheelRef.current) {
            // 使用更自然的减速缓动：前期快，后期慢慢停下来
            wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.0, 0.4, 0.2, 1)';
            wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
        }

        setTimeout(() => {
            setSpinning(false);

            // 计算停在哪个分段
            const normalizedRotation = ((360 - (newRotation % 360)) % 360);
            const segmentIndex = Math.floor(normalizedRotation / segmentSize);
            const playerIndex = segments[segmentIndex];

            onSpinEnd(players[playerIndex]);
        }, 5000);
    };

    // 生成100份的渐变色
    const wheelStyle = {
        background: `conic-gradient(
            ${segments.map((playerIndex, i) =>
            `${COLORS[playerIndex % COLORS.length]} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`
        ).join(', ')}
        )`
    };

    return (
        <div className="wheel-container">
            <div className="wheel-pointer">▼</div>
            <div
                className="wheel"
                ref={wheelRef}
                style={wheelStyle}
            >
                {/* 由于分段太多，不再显示每个分段的标签 */}
                {/* 可以在中心显示玩家列表或者用图例说明 */}
            </div>
            <button className="spin-btn" onClick={spin} disabled={spinning}>
                {spinning ? '...' : 'SPIN'}
            </button>
            {/* 显示玩家颜色图例 */}
            <div className="wheel-legend">
                {players.map((player, i) => (
                    <div key={i} className="legend-item">
                        <span
                            className="legend-color"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="legend-name">{player}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
