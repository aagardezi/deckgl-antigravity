import React from 'react';
import { Layers, MapPin, Activity, AlertTriangle, DollarSign, Database } from 'lucide-react';

const ControlPanel = React.memo(({ settings, handleChange, onCityChange, dataStats }) => {

    return (
        <div className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl p-5 text-gray-900 z-40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    {/* Official Hiscox Logo */}
                    <svg viewBox="0 450.8 595.2 289.6" className="h-10 w-auto" xmlSpace="preserve">
                        <path fill="#DA291C" d="M296.2,573.4c3.6-35.1,22.6-55.9,22.6-76.2c0-14.7-5.5-27.3-22.6-46.4c-17.2,19-22.6,31.6-22.6,46.4
                            C273.4,517.4,292.6,538.2,296.2,573.4z M259.1,568.9c-9.1,8-26.7,2.9-26.7-16.5c0-10.9,11.4-20.3,22.4-20.3
                            c21.8,0,31.7,23.2,32.3,33.9c0.4,8.5-3.4,21.9-17.5,22.1c6.6-3.3,8.9-11.2,8.2-16.9c-0.7-6.7-5.1-15.5-14.5-15.5
                            c-5.2,0-9.2,3.4-9.2,7C254,566,256,568.8,259.1,568.9L259.1,568.9z M333.2,568.9c9.1,8,26.7,2.9,26.7-16.5
                            c0-10.9-11.4-20.3-22.4-20.3c-21.8,0-31.7,23.2-32.3,33.9c-0.4,8.5,3.4,21.9,17.5,22.1c-6.6-3.3-8.9-11.2-8.2-16.9
                            c0.7-6.7,5.1-15.5,14.5-15.5c5.2,0,9.2,3.4,9.2,7C338.2,566,336.2,568.8,333.2,568.9L333.2,568.9z"/>
                        <path fill="#1e293b" d="M141.7,738.8h-16.2V625.1h16.2V738.8z M100,738.8H83.8v-49.6H16.2v49.6H0V625.1h16.2v49.6h67.7v-49.6h16.2L100,738.8
                            L100,738.8z M546.7,679.9l48.5,58.8h-19.7l-38.7-47l-39.2,47h-19.9l49.1-58.8L481.3,625h19.9l35.8,43.4l35.5-43.3h19.7L546.7,679.9z
                            "/>
                        <path fill="#1e293b" d="M422.2,623.6c37.5,0,61.2,26.7,61.2,58.3c0,30.7-23,58.3-61.5,58.3c-37.2,0-60.7-27.5-60.7-58.3
                            C361.2,650.4,385.4,623.6,422.2,623.6z M422.2,725.3c25.5,0,44.4-18.5,44.4-43.3c0-25-18.9-43.3-44.4-43.3
                            c-25.4,0-44.2,18.4-44.2,43.3C378.1,706.8,396.8,725.3,422.2,725.3z M346.2,710c-8,9.5-20.2,15.3-34.5,15.3
                            c-25.4,0-44.2-18.5-44.2-43.3c0-25,18.9-43.3,44.2-43.3c13.9,0,25.8,5.4,33.8,14.4l8.6-14.4c-10.5-9.3-24.9-15.1-42.3-15.1
                            c-36.8,0-61,26.8-61,58.3c0,30.8,23.6,58.3,60.7,58.3c18.2,0,32.9-6.2,43.4-15.9L346.2,710L346.2,710z M230.1,646.3
                            c-9.1-7.8-20.2-9.4-27.8-9.4c-11.5,0-21.7,5.1-21.7,14.8c0,21.8,58.1,21.9,58.1,58.1c0,23.6-24.1,31.4-42.5,30.5
                            c-12.5-0.6-22-3.1-32-9.7v-16.2c10,6.4,19.2,9.9,29.8,10.7c11.8,0.9,28.9-1.8,28.9-15.8c0-23.5-58.6-24.2-58.6-55.4
                            c0-18.5,16.4-30.4,36.3-30.4c12.8,0,21.4,2.8,29.7,7.4v15.4H230.1z"/>
                    </svg>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                    {dataStats.count} Properties
                </div>
            </div>

            <div className="space-y-6">
                {/* Data Source Section */}
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary mb-3 uppercase tracking-wider">
                        <Database size={14} />
                        <span>Data Source</span>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => settings.setDataSource('mock')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${settings.dataSource === 'mock'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Simulated
                        </button>
                        <button
                            onClick={() => settings.setDataSource('bigquery')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${settings.dataSource === 'bigquery'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Live (BQ)
                        </button>
                    </div>
                </div>

                {/* Locations Section */}
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary mb-3 uppercase tracking-wider">
                        <MapPin size={14} />
                        <span>Locations</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onCityChange('SF')}
                            className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm transition-colors text-left flex flex-col shadow-sm"
                        >
                            <span className="font-bold text-gray-900">San Francisco</span>
                            <span className="text-xs text-gray-500">USA</span>
                        </button>
                        <button
                            onClick={() => onCityChange('LDN')}
                            className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm transition-colors text-left flex flex-col shadow-sm"
                        >
                            <span className="font-bold text-gray-900">London</span>
                            <span className="text-xs text-gray-500">UK</span>
                        </button>
                    </div>
                </div>

                {/* Layers Section */}
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary mb-3 uppercase tracking-wider">
                        <Layers size={14} />
                        <span>Layers</span>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                Properties (Scatter)
                            </span>
                            <input
                                type="checkbox"
                                checked={settings.showScatter}
                                onChange={(e) => handleChange('showScatter', e.target.checked)}
                                className="accent-blue-500"
                            />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                                Risk Density (Hex)
                            </span>
                            <input
                                type="checkbox"
                                checked={settings.showHexagon}
                                onChange={(e) => handleChange('showHexagon', e.target.checked)}
                                className="accent-brand-primary"
                            />
                        </label>
                        <label className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                Heatmap
                            </span>
                            <input
                                type="checkbox"
                                checked={settings.showHeatmap}
                                onChange={(e) => handleChange('showHeatmap', e.target.checked)}
                                className="accent-orange-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Filters Section */}
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary mb-3 uppercase tracking-wider">
                        <Activity size={14} />
                        <span>Risk Filter</span>
                    </div>
                    <div className="px-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Min Score: {settings.minRiskScore}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.minRiskScore}
                            onChange={(e) => handleChange('minRiskScore', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        />
                    </div>
                </div>

                {/* Stats / Legend */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <AlertTriangle size={12} /> High Risk
                            </div>
                            <div className="text-lg font-bold text-brand-primary">
                                {dataStats.highRiskCount}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                <DollarSign size={12} /> Avg TIV
                            </div>
                            <div className="text-lg font-bold text-green-600">
                                ${(dataStats.avgTiv / 1000000).toFixed(1)}M
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ControlPanel;
