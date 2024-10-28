// /api/refills.js
export default async function handler(req, res) {
    const response = await fetch("https://dev.royal-pay.org/api/v1/internal/refills/", {
        method: req.method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": req.headers.authorization,
        },
    });

    const data = await response.json();
    res.status(response.status).json(data);
}
