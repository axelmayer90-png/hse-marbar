// Recordatorio semanal por mail: tareas vencidas y que vencen en los próximos 7 días.
// Lo ejecuta Vercel Cron todos los lunes (ver vercel.json). Cada inspector recibe
// primero los equipos que visitó en los últimos 30 días y después el resto.
//
// Variables de entorno necesarias en Vercel (Settings > Environment Variables):
//   VITE_SUPABASE_URL           (ya existe)
//   SUPABASE_SERVICE_ROLE_KEY   Supabase > Project Settings > API > service_role (¡nunca en el frontend!)
//   SMTP_HOST, SMTP_PORT        ej. smtp.gmail.com / 465   u   smtp.office365.com / 587
//   SMTP_USER, SMTP_PASS        cuenta que envía (en Gmail: contraseña de aplicación)
//   MAIL_FROM                   ej. "HSE MARBAR <tu-cuenta@gmail.com>"
//   CRON_SECRET                 texto largo al azar; Vercel lo manda solo en las ejecuciones programadas
//   APP_URL                     https://hse-marbar.vercel.app
//
// Prueba manual sin enviar mails:  /api/weekly-reminder?preview=1&key=<CRON_SECRET>
// Envío de prueba solo a una casilla: /api/weekly-reminder?only=mail@x.com&key=<CRON_SECRET>

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { timingSafeEqual } from 'node:crypto';

const DAY = 24 * 60 * 60 * 1000;

const fmt = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = String(iso).split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const todayAR = () => {
  // Fecha de hoy en Argentina (UTC-3) en formato YYYY-MM-DD
  const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return now.toISOString().split('T')[0];
};

const addDays = (iso, n) => new Date(new Date(iso + 'T00:00:00Z').getTime() + n * DAY).toISOString().split('T')[0];

// Comparación en tiempo constante del secreto (evita adivinarlo midiendo tiempos de respuesta)
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
};

const escapeHtml =(s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function taskRows(list, today) {
  return list.map(t => {
    const overdue = t.scheduled_date < today;
    const daysLate = overdue ? Math.round((new Date(today) - new Date(t.scheduled_date)) / DAY) : 0;
    return `<tr>
      <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0">${escapeHtml(t.title)}${t.is_persistent ? ' <span style="color:#7e22ce">(campaña)</span>' : ''}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;white-space:nowrap">${fmt(t.scheduled_date)}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;white-space:nowrap;color:${overdue ? '#dc2626' : '#b45309'};font-weight:bold">
        ${overdue ? `Vencida hace ${daysLate} d` : 'Próxima'}
      </td>
    </tr>`;
  }).join('');
}

function rigBlocks(rigNames, byRig, today) {
  return rigNames.map(name => `
    <h3 style="margin:16px 0 4px;font-size:14px;color:#0f172a">🚜 ${escapeHtml(name)}</h3>
    <table style="border-collapse:collapse;width:100%;font-size:13px">${taskRows(byRig[name], today)}</table>
  `).join('');
}

function buildEmail({ name, myRigs, otherRigs, byRig, today, appUrl, totals }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;color:#334155">
    <h2 style="color:#0f172a;margin-bottom:4px">Resumen semanal HSE · ${fmt(today)}</h2>
    <p style="margin-top:0">Hola ${escapeHtml(name)}, este es el estado de las tareas del plan:
      <strong style="color:#dc2626">${totals.overdue} vencidas</strong> y
      <strong style="color:#b45309">${totals.upcoming} que vencen en los próximos 7 días</strong>.</p>
    ${myRigs.length ? `<h2 style="font-size:15px;border-bottom:2px solid #d97706;padding-bottom:4px">Equipos que visitaste en los últimos 30 días</h2>${rigBlocks(myRigs, byRig, today)}` : ''}
    ${otherRigs.length ? `<h2 style="font-size:15px;border-bottom:2px solid #94a3b8;padding-bottom:4px">${myRigs.length ? 'Resto de los equipos' : 'Todos los equipos'}</h2>${rigBlocks(otherRigs, byRig, today)}` : ''}
    <p style="margin-top:24px"><a href="${appUrl}" style="background:#d97706;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-weight:bold">Abrir la app</a></p>
    <p style="font-size:11px;color:#94a3b8">Mensaje automático de la app HSE MARBAR. Se envía todos los lunes.</p>
  </div>`;
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  const key = req.query?.key;
  if (!secret || (!safeEqual(auth, `Bearer ${secret}`) && !safeEqual(key, secret))) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const today = todayAR();
  const limit = addDays(today, 7);

  // Tareas abiertas que vencen hasta dentro de 7 días (incluye vencidas)
  const { data: tasks, error: tErr } = await supabase
    .from('tasks')
    .select('id, title, scheduled_date, status, is_persistent, rig_id, rig_locations ( is_current, rig_id, rigs ( id, name ) ), rigs ( id, name )')
    .neq('status', 'Completada')
    .lte('scheduled_date', limit)
    .order('scheduled_date', { ascending: true });
  if (tErr) return res.status(500).json({ error: tErr.message });

  // Mismo criterio que la vista consolidada: locación vigente o campañas abiertas
  const relevant = (tasks || []).filter(t => t.rig_locations?.is_current || t.is_persistent);

  const byRig = {};
  const rigIdByName = {};
  relevant.forEach(t => {
    const rig = t.rig_locations?.rigs || t.rigs;
    const name = rig?.name || 'Equipo';
    (byRig[name] = byRig[name] || []).push(t);
    if (rig?.id) rigIdByName[name] = rig.id;
  });

  const totals = {
    overdue: relevant.filter(t => t.scheduled_date < today).length,
    upcoming: relevant.filter(t => t.scheduled_date >= today).length
  };

  if (relevant.length === 0 && !req.query?.preview) {
    return res.status(200).json({ ok: true, sent: 0, motivo: 'Sin tareas vencidas ni próximas' });
  }

  // Inspectores y equipos que visitó cada uno en los últimos 30 días
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, role, approved');
  const { data: logs } = await supabase
    .from('daily_logs')
    .select('user_id, rig_id, extra_rig_ids')
    .gte('log_date', addDays(today, -30));

  const visitedByUser = {};
  (logs || []).forEach(l => {
    const set = (visitedByUser[l.user_id] = visitedByUser[l.user_id] || new Set());
    [l.rig_id, ...(Array.isArray(l.extra_rig_ids) ? l.extra_rig_ids : [])].filter(Boolean).forEach(id => set.add(id));
  });

  const allRigNames = Object.keys(byRig).sort();
  const appUrl = process.env.APP_URL || 'https://hse-marbar.vercel.app';

  const recipients = (profiles || [])
    .filter(p => p.email)
    .filter(p => p.approved !== false && p.role !== 'base' && p.role !== 'informes')
    .filter(p => !req.query?.only || p.email.toLowerCase() === String(req.query.only).toLowerCase());

  const emails = recipients.map(p => {
    const visited = visitedByUser[p.id] || new Set();
    const myRigs = allRigNames.filter(n => visited.has(rigIdByName[n]));
    const otherRigs = allRigNames.filter(n => !myRigs.includes(n));
    return {
      to: p.email,
      subject: `HSE · ${totals.overdue} vencidas y ${totals.upcoming} próximas (semana del ${fmt(today)})`,
      html: buildEmail({ name: p.full_name || p.email, myRigs, otherRigs, byRig, today, appUrl, totals })
    };
  });

  if (req.query?.preview) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(emails[0]?.html || '<p>Sin destinatarios</p>');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const results = [];
  for (const mail of emails) {
    try {
      await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, ...mail });
      results.push({ to: mail.to, ok: true });
    } catch (err) {
      results.push({ to: mail.to, ok: false, error: err.message });
    }
  }

  return res.status(200).json({ ok: true, sent: results.filter(r => r.ok).length, results });
}
