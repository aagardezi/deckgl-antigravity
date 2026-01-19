import React, { useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Color Scales
const RISK_COLOR_SCALE = (score) => {
    if (score > 75) return [239, 68, 68]; // Red-500
    if (score > 40) return [234, 179, 8]; // Yellow-500
    return [34, 197, 94]; // Green-500
};

const MapContainer = React.memo(({ data, settings, onHover, viewState, onViewStateChange }) => {
    const filteredData = useMemo(() => {
        return data.filter(d => d.riskScore >= settings.minRiskScore);
    }, [data, settings.minRiskScore]);

    const layers = useMemo(() => [
        settings.showHexagon && new HexagonLayer({
            id: 'hexagon-layer',
            data: filteredData,
            pickable: true,
            extruded: true,
            radius: 750, // Balanced radius
            elevationScale: 1, // 1:1 mapping for meters (height calculated in getElevationValue)
            getPosition: d => d.position,
            getElevationValue: points => {
                // Sum risk scores and cap at 50 meters
                const totalRisk = points.reduce((sum, p) => sum + p.riskScore, 0);
                return Math.min(totalRisk, 50);
            },
            upperPercentile: 100, // Ensure full range is shown
            colorRange: [
                [1, 152, 189],
                [73, 227, 206],
                [216, 254, 181],
                [254, 237, 177],
                [254, 173, 84],
                [209, 55, 78]
            ],
            opacity: 0.4,
            coverage: 0.9,
            material: {
                ambient: 0.64,
                diffuse: 0.6,
                shininess: 32,
                specularColor: [51, 51, 51]
            },
            transitions: {
                elevationScale: 3000
            }
        }),

        settings.showHeatmap && new HeatmapLayer({
            id: 'heatmap-layer',
            data: filteredData,
            pickable: false,
            getPosition: d => d.position,
            getWeight: d => d.riskScore,
            radiusPixels: 50,
            intensity: 1,
            threshold: 0.05,
            colorRange: [
                [255, 255, 178],
                [254, 204, 92],
                [253, 141, 60],
                [240, 59, 32],
                [189, 0, 38]
            ],
            opacity: 0.6
        }),

        settings.showScatter && new ScatterplotLayer({
            id: 'scatterplot-layer',
            data: filteredData,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 6,
            radiusMinPixels: 3,
            radiusMaxPixels: 30,
            lineWidthMinPixels: 1,
            getPosition: d => d.position,
            getFillColor: d => RISK_COLOR_SCALE(d.riskScore),
            getLineColor: [0, 0, 0],
            onHover: info => onHover(info),
            updateTriggers: {
                getFillColor: [settings.minRiskScore]
            }
        })
    ], [filteredData, settings.showHexagon, settings.showHeatmap, settings.showScatter, settings.minRiskScore, onHover]);

    return (
        <DeckGL
            viewState={viewState}
            onViewStateChange={({ viewState }) => onViewStateChange(viewState)}
            controller={true}
            layers={layers}
            getTooltip={({ object }) => object && object.address} // Basic native tooltip fallback
            style={{ width: '100%', height: '100%' }}
        >
            <Map
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                reuseMaps
                attributionControl={false}
            />
        </DeckGL>
    );
});

export default MapContainer;
