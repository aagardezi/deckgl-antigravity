import { scaleLinear } from 'd3-scale';

// Center around San Francisco
const SF_LAT = 37.7749;
const SF_LON = -122.4194;

// Center around London
const LDN_LAT = 51.5074;
const LDN_LON = -0.1278;

const LAT_VARIANCE = 0.1;
const LON_VARIANCE = 0.1;

const RISK_TYPES = ['Flood', 'Fire', 'Wind', 'Theft'];
const CLAIM_TYPES = ['Water Damage', 'Fire', 'Windstorm', 'Burglary', 'Liability'];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max));
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a "hotspot" for higher risk
const HOTSPOTS = [
    // SF Hotspots
    { lat: 37.75, lon: -122.45, radius: 0.03, riskBoost: 40, type: 'Flood' },
    { lat: 37.80, lon: -122.40, radius: 0.02, riskBoost: 30, type: 'Fire' },
    // London Hotspots
    { lat: 51.50, lon: -0.11, radius: 0.02, riskBoost: 45, type: 'Flood' }, // Near Thames
    { lat: 51.51, lon: -0.09, radius: 0.015, riskBoost: 35, type: 'Theft' }, // City center
];

function isOnLand(lat, lon, city) {
    if (city === 'San Francisco') {
        // Simple bounding box/exclusion for SF water
        if (lon > -122.39) return false;
        if (lat > 37.81) return false;
        if (lon < -122.51) return false;
        return true;
    }
    return true;
}

export function generateData(count = 5000) {
    const properties = [];
    let generatedCount = 0;

    while (generatedCount < count) {
        // 50/50 split between SF and London
        const isLondon = Math.random() > 0.5;
        const centerLat = isLondon ? LDN_LAT : SF_LAT;
        const centerLon = isLondon ? LDN_LON : SF_LON;
        const city = isLondon ? 'London' : 'San Francisco';

        let lat = random(centerLat - LAT_VARIANCE, centerLat + LAT_VARIANCE);
        let lon = random(centerLon - LON_VARIANCE, centerLon + LON_VARIANCE);

        if (!isOnLand(lat, lon, city)) {
            continue;
        }

        generatedCount++;

        // Apply hotspot logic
        let riskScore = random(10, 60); // Base risk
        let primaryRisk = 'General';

        HOTSPOTS.forEach(spot => {
            const dist = Math.sqrt(Math.pow(lat - spot.lat, 2) + Math.pow(lon - spot.lon, 2));
            if (dist < spot.radius) {
                riskScore += spot.riskBoost * (1 - dist / spot.radius);
                if (Math.random() > 0.5) primaryRisk = spot.type;
            }
        });

        riskScore = Math.min(100, Math.max(0, riskScore));

        const tiv = random(200000, 5000000); // Total Insured Value

        // Simulate claims
        const claims = [];
        if (riskScore > 50 && Math.random() > 0.6) {
            const numClaims = randomInt(1, 4);
            for (let j = 0; j < numClaims; j++) {
                claims.push({
                    id: `clm-${generatedCount}-${j}`,
                    date: new Date(Date.now() - random(0, 1000 * 60 * 60 * 24 * 365 * 2)).toISOString().split('T')[0],
                    amount: random(1000, tiv * 0.1),
                    type: randomChoice(CLAIM_TYPES)
                });
            }
        }

        const streetNames = isLondon
            ? ['High St', 'Station Rd', 'London Rd', 'Church St', 'Main St', 'Park Rd']
            : ['Market', 'Mission', 'Valencia', 'Geary', 'California', 'Powell'];

        const streetSuffix = isLondon ? '' : 'St';

        properties.push({
            id: `prop-${generatedCount}`,
            position: [lon, lat],
            address: `${randomInt(1, 9999)} ${randomChoice(streetNames)} ${streetSuffix}`.trim(),
            tiv: tiv,
            riskScore: riskScore,
            primaryRisk: primaryRisk,
            yearBuilt: randomInt(1900, 2023),
            claims: claims,
            claimsCount: claims.length,
            totalClaimAmount: claims.reduce((sum, c) => sum + c.amount, 0),
            city: city
        });
    }

    return properties;
}
