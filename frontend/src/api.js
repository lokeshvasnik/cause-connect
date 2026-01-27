const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:4000";

function getToken() {
    return localStorage.getItem("authToken");
}

async function apiFetch(
    path,
    { method = "GET", headers = {}, body, auth = false } = {},
) {
    const opts = {
        method,
        headers: { "Content-Type": "application/json", ...headers },
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    if (auth) {
        const token = getToken();
        if (token) opts.headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, opts);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const msg = data?.error?.message || data?.message || res.statusText;
        throw new Error(msg);
    }
    return data;
}

export async function login(email, password) {
    const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
    });
    if (data?.token) localStorage.setItem("authToken", data.token);
    if (data?.user) localStorage.setItem("authUser", JSON.stringify(data.user));
    return data;
}

export async function signup(payload) {
    const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: payload,
    });
    if (data?.token) localStorage.setItem("authToken", data.token);
    if (data?.user) localStorage.setItem("authUser", JSON.stringify(data.user));
    return data;
}

export async function me() {
    return apiFetch("/auth/me", { auth: true });
}

export async function getEvents({
    term,
    location,
    tag,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 12,
    sort = "date:asc",
} = {}) {
    const params = new URLSearchParams();
    if (term) params.set("term", term);
    if (location) params.set("location", location);
    if (tag) params.set("tag", tag);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("sort", sort);
    return apiFetch(`/events?${params.toString()}`);
}

export async function getEvent(id) {
    return apiFetch(`/events/${id}`);
}

export async function registerForEvent(id, payload) {
    return apiFetch(`/events/${id}/registrations`, {
        method: "POST",
        body: payload,
    });
}

export async function hostListEvents({ page = 1, pageSize = 12 } = {}) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    return apiFetch(`/host/events?${params.toString()}`, { auth: true });
}

export async function hostCreateEvent(evt) {
    return apiFetch("/host/events", { method: "POST", body: evt, auth: true });
}

export async function hostUpdateEvent(id, evt) {
    return apiFetch(`/host/events/${id}`, {
        method: "PATCH",
        body: evt,
        auth: true,
    });
}

export async function hostDeleteEvent(id) {
    return apiFetch(`/host/events/${id}`, { method: "DELETE", auth: true });
}

export function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
}

export async function hostListRegistrations(
    eventId,
    { page = 1, pageSize = 12 } = {},
) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    return apiFetch(
        `/host/events/${eventId}/registrations?${params.toString()}`,
        { auth: true },
    );
}

// Admin API functions
export async function adminGetStats() {
    return apiFetch("/admin/stats", { auth: true });
}

export async function adminListEvents({ page = 1, pageSize = 50 } = {}) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    return apiFetch(`/admin/events?${params.toString()}`, { auth: true });
}

export async function adminListHosts({ page = 1, pageSize = 50 } = {}) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    return apiFetch(`/admin/hosts?${params.toString()}`, { auth: true });
}

export async function adminListRegistrations(
    eventId,
    { page = 1, pageSize = 50 } = {},
) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    return apiFetch(
        `/admin/events/${eventId}/registrations?${params.toString()}`,
        { auth: true },
    );
}

export async function adminDeleteEvent(id) {
    return apiFetch(`/admin/events/${id}`, { method: "DELETE", auth: true });
}
