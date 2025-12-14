import { useState } from 'react';
import api from '../services/api';

/**
 * PIN Entry Modal for unlocking full admin access in demo mode.
 * Stores the verified PIN in sessionStorage for the current session.
 */
export default function PinModal({ isOpen, onClose, onSuccess }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/verify-pin', { pin });
            if (response.data.success) {
                // Store PIN in sessionStorage for this session
                sessionStorage.setItem('adminPin', pin);
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid PIN');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-bounce-in">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🔐</div>
                    <h2 className="text-xl font-bold">Admin PIN Required</h2>
                    <p className="text-sm text-base-content/60 mt-2">
                        Enter the admin PIN to unlock full access
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-control">
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter 5-digit PIN"
                            className={`input input-bordered text-center text-2xl tracking-widest font-mono ${error ? 'input-error' : ''}`}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                            maxLength={5}
                            autoFocus
                        />
                        {error && (
                            <label className="label">
                                <span className="label-text-alt text-error">{error}</span>
                            </label>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            className="btn btn-ghost flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
                            disabled={pin.length !== 5 || loading}
                        >
                            {loading ? 'Verifying...' : 'Unlock'}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-center text-base-content/40 mt-4">
                    This PIN unlocks admin modifications for this session only
                </p>
            </div>
        </div>
    );
}
