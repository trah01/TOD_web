import { useState } from 'react';

interface PlayerSetupProps {
    players: string[];
    setPlayers: (players: string[]) => void;
    onStart: () => void;
}

export const PlayerSetup = ({ players, setPlayers, onStart }: PlayerSetupProps) => {
    const [newName, setNewName] = useState('');

    const addPlayer = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newName.trim()) {
            setPlayers([...players, newName.trim()]);
            setNewName('');
        }
    };

    const removePlayer = (index: number) => {
        setPlayers(players.filter((_, i) => i !== index));
    };

    return (
        <div className="setup-container">
            <h2 className="section-title">添加玩家</h2>
            <div className="player-list">
                {players.map((p, i) => (
                    <div key={i} className="player-tag">
                        <span>{p}</span>
                        <button onClick={() => removePlayer(i)} className="remove-btn">×</button>
                    </div>
                ))}
            </div>

            <form onSubmit={addPlayer} className="input-group">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="输入名字..."
                    className="name-input"
                    autoFocus
                />
                <button type="submit" className="add-btn" disabled={!newName.trim()}>+</button>
            </form>

            <div className="setup-footer">
                <p className="hint-text">至少需要2名玩家</p>
                <button
                    className="start-game-btn"
                    onClick={onStart}
                    disabled={players.length < 2}
                >
                    开始游戏
                </button>
            </div>
        </div>
    );
};
