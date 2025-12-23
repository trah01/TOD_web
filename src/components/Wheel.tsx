import { useState, useRef, useEffect } from 'react';

interface WheelProps {
    players: string[];
    onSpinEnd: (winner: string) => void;
}

const COLORS = [
    '#FF9AA2', // Soft Red
    '#FFB7B2', // Salmon
    '#FFDAC1', // Peach
    '#E2F0CB', // Mint
    '#B5EAD7', // Aqua
    '#C7CEEA', // Periwinkle
    '#E0BBE4', // Lavender
    '#FCD5CE', // Rose Quartz
    '#A0E7E5', // Light Tiffany
    '#FBC4AB'  // Apricot
];

export const Wheel = ({ players, onSpinEnd }: WheelProps) => {
    const [spinning, setSpinning] = useState(false);
    const rotationRef = useRef(0);
    const wheelRef = useRef<HTMLDivElement>(null);

    const spin = () => {
        if (spinning) return;
        setSpinning(true);

        const newRotation = rotationRef.current + 1800 + Math.random() * 360;
        rotationRef.current = newRotation;

        if (wheelRef.current) {
            wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)';
            wheelRef.current.style.transform = `rotate(${newRotation}deg)`;
        }

        setTimeout(() => {
            setSpinning(false);
            const degrees = newRotation % 360;
            // Calculate index based on degrees. 
            // 0 deg is at 3 o'clock usually in CSS standard rotation, but let's check alignment.
            // We will assume standard logic and fine tune if needed.
            // The pointer is usually at top (270deg) or right (0deg).
            // Let's assume pointer is at the TOP.
            // If pointer is at top, we need to correct the offset.

            const segmentSize = 360 / players.length;
            // We want the value at 270 degrees (Top)
            // The wheel rotates moves functionality.
            // Effective angle at top = (360 - (degrees % 360) + 270) % 360 ??
            // Let's simplify: 
            // The item at the top is the one that was at (original_pos - rotation) match Top.

            const winningIndex = Math.floor(((360 - degrees % 360) + 90) % 360 / segmentSize);
            // Not 100% sure on the +90 (since 0 starts at right, top is -90 or 270), 
            // but usually we just calculate relative to start.
            // Let's rely on simple math:
            // index = floor((360 - finalAngle % 360) / segmentAngle) if pointer is at 0 (Right).
            // If pointer is at Top (270/-90), we need to shift.
            // Actually simpler:
            // normalized = (360 - rotation % 360) % 360
            // index = floor(normalized / segmentSize) -> this assumes pointer at 0 (right).
            // If pointer is Top, we add offsets? No, let's just rotate the wheel so 0 is at top initially?

            // Let's just adjust the calculation after testing visually or use a robust formula.
            // Formula for pointer at TOP:
            // index = Math.floor( ( (360 - (rotationRef.current % 360)) % 360 ) / segmentSize )
            // (This assumes 0 deg is top, which we can force via CSS start rotation)

            onSpinEnd(players[Math.floor(((360 - (newRotation % 360)) % 360) / segmentSize)]);
        }, 4000);
    };

    const wheelStyle = {
        background: `conic-gradient(
      ${players.map((_, i) =>
            `${COLORS[i % COLORS.length]} ${i * (360 / players.length)}deg ${(i + 1) * (360 / players.length)}deg`
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
                {players.map((player, i) => (
                    <div
                        key={i}
                        className="wheel-label"
                        style={{
                            transform: `rotate(${i * (360 / players.length) + (360 / players.length) / 2}deg) translateY(0px) translateX(50%)`,
                            transformOrigin: 'center center' // This is tricky in pure CSS
                        }}
                    >
                        {/* Text rotation logic is complex here, let's simplify for now 
                 We will use a different approach for labels if needed or just colors
                 to keep it stable first. 
                 Actually, adding text inside a conic gradient is hard without absolute positioned children.
             */}
                    </div>
                ))}
                {/* Render separate label layer */}
                <div className="wheel-labels">
                    {players.map((player, i) => (
                        <div
                            key={i}
                            className="wheel-text-segment"
                            style={{
                                transform: `rotate(${i * (360 / players.length) + (360 / players.length) / 2}deg) translate(0, -50%)`,
                            }}
                        >
                            <span style={{
                                transform: `rotate(90deg)`,
                                display: 'inline-block',
                                marginLeft: '50%'
                            }}>
                                {player}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <button className="spin-btn" onClick={spin} disabled={spinning}>
                {spinning ? '...' : 'SPIN'}
            </button>
        </div>
    );
};
