import React from 'react';

export default function Tooltip({ info }) {
    if (!info || !info.object) return null;

    const { object, x, y } = info;

    return (
        <div
            className="absolute z-50 min-w-[240px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-4 overflow-hidden"
            style={{ left: x, top: y }}
        >
            {/* Header with Risk Indicator */}
            <div className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center ${object.riskScore > 75 ? 'bg-red-50' : object.riskScore > 40 ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                <div>
                    <div className="font-bold text-gray-900 text-base">{object.address}</div>
                    <div className="text-xs text-gray-500">{object.city}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${object.riskScore > 75 ? 'bg-red-100 text-red-600' : object.riskScore > 40 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                    }`}>
                    {object.riskScore.toFixed(0)}
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-500">
                    <span className="text-xs uppercase tracking-wider text-brand-primary">TIV</span>
                    <span className="font-mono font-medium text-gray-900 text-right">
                        ${(object.tiv / 1000000).toFixed(2)}M
                    </span>

                    <span className="text-xs uppercase tracking-wider text-brand-primary">Primary Risk</span>
                    <span className="font-medium text-gray-900 text-right">{object.primaryRisk}</span>
                </div>

                {object.claimsCount > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-brand-primary"></div>
                            CLAIMS HISTORY
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span className="text-gray-500">Count</span>
                            <span className="text-gray-900 text-right">{object.claimsCount}</span>
                            <span className="text-gray-500">Total Loss</span>
                            <span className="text-brand-primary font-mono text-right">${(object.totalClaimAmount / 1000).toFixed(1)}k</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
