const API_URL = "http://127.0.0.1:8000/api";
const API_TOKEN = "super-secret-token";


export async function fetchLatestMeasurement() {
    const res = await fetch(`${API_URL}/measurements/?page=1`);

    if (!res.ok) throw new Error("Failed to fetch measurements");

    const data = await res.json();
    return data.results[0];
}


export async function fetchStats() {
    const res = await fetch(`${API_URL}/measurements/stats/`);

    if (!res.ok) throw new Error("Failed to fetch stats");

    return await res.json();
}


export async function fetchRecentMeasurements(period = "1h", point = null) {
    let url = `${API_URL}/measurements/recent/?period=${period}`;

    if (point) {
        url += `&point=${point}`;
    }

    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed to fetch recent measurements");

    return await res.json();
}


export async function fetchAlarms() {
    const res = await fetch(`${API_URL}/measurements/alarms/`);

    if (!res.ok) throw new Error("Failed to fetch alarms");

    return await res.json();
}


export async function addMeasurement(payload) {
    const res = await fetch(`${API_URL}/measurements/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": API_TOKEN,
        },
        body: JSON.stringify(payload),
    });

    if (res.status === 401) {
        throw new Error("Unauthorized");
    }

    return await res.json();
}