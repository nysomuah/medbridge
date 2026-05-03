export default async function handler(req, res) {
  // Allow requests from your Vercel app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { org, country, contact, email, items } = req.body;

  const itemRows = items.map(it =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${it.item_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280;">${it.category || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280;">${it.quantity || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280;">${it.notes || '—'}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
      <div style="background:#1D9E75;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;font-size:20px;margin:0;font-weight:600;">New supply request</h1>
        <p style="color:#E1F5EE;margin:6px 0 0;font-size:14px;">MedBridge alert</p>
      </div>
      <div style="padding:28px 32px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">A facility has submitted a new supply request:</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:7px 0;font-size:13px;color:#6b7280;width:120px;">Facility</td><td style="padding:7px 0;font-size:14px;font-weight:600;">${org}</td></tr>
          <tr><td style="padding:7px 0;font-size:13px;color:#6b7280;">Country</td><td style="padding:7px 0;font-size:14px;">${country}</td></tr>
          ${contact ? `<tr><td style="padding:7px 0;font-size:13px;color:#6b7280;">Contact</td><td style="padding:7px 0;font-size:14px;">${contact}</td></tr>` : ''}
          ${email ? `<tr><td style="padding:7px 0;font-size:13px;color:#6b7280;">Email</td><td style="padding:7px 0;font-size:14px;"><a href="mailto:${email}" style="color:#1D9E75;">${email}</a></td></tr>` : ''}
        </table>
        <h2 style="font-size:14px;font-weight:600;margin:0 0 10px;">Items requested (${items.length})</h2>
        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Item</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Category</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Qty</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:500;">Notes</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top:24px;padding:16px;background:#E1F5EE;border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#0F6E56;">Log in to your MedBridge admin panel to check for matches and coordinate logistics.</p>
        </div>
      </div>
      <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f0f0f0;border-radius:0 0 12px 12px;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Sent automatically by MedBridge when a new supply request is submitted.</p>
      </div>
    </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'MedBridge Alerts <onboarding@resend.dev>',
        to: ['nana@continuumef.com'],
        subject: `New supply request — ${org}, ${country}`,
        html
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Email error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
