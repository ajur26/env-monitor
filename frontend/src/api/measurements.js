const API_URL = "http://127.0.0.1:8000/api";
const API_TOKEN = "super-secret-token";

export async function fetchLastestMeasurement() {
    const res = await fetch((`${API_URL}/measurements/?page=1`))
    if(!res.ok) throw new Error("Failed to detch measurements");
    const data = await res.json();
    return data.results[0];
}

export async function fetchStats() {
    const res = await fetch(`${API_URL}/measurements/stats/`);
    if (!res.ok) throw new Error("Failed to fetch stats");
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