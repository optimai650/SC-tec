const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Plataforma de Voluntarios <onboarding@resend.dev>';

function formatDateES(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

async function sendVolunteerConfirmation({ volunteer, opportunity, organization }) {
  const volunteerName = volunteer.firstName
    ? `${volunteer.firstName}${volunteer.lastName ? ' ' + volunteer.lastName : ''}`
    : volunteer.email;

  const startDate = formatDateES(opportunity.startDate);
  const endDate = formatDateES(opportunity.endDate);
  const slotsLeft = opportunity.remainingSlots;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmación de Registro</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8 0%,#34a853 100%);padding:40px 40px 32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🌱</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">¡Registro Confirmado!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Tu inscripción como voluntario ha sido registrada</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#3d4a5c;font-size:16px;">Hola, <strong>${volunteerName}</strong> 👋</p>
              <p style="margin:0 0 28px;color:#5a6778;font-size:15px;line-height:1.6;">
                ¡Gracias por unirte como voluntario! Tu registro para la siguiente oportunidad ha sido confirmado exitosamente.
              </p>

              <!-- Opportunity Card -->
              <div style="background:#f8faff;border:1px solid #dce8ff;border-left:4px solid #1a73e8;border-radius:8px;padding:24px;margin-bottom:28px;">
                <h2 style="margin:0 0 4px;color:#1a73e8;font-size:20px;">${opportunity.title}</h2>
                <p style="margin:0 0 16px;color:#34a853;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${organization.name}</p>
                <p style="margin:0 0 20px;color:#5a6778;font-size:14px;line-height:1.7;">${opportunity.description}</p>

                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom:12px;">
                      <span style="display:inline-flex;align-items:center;gap:6px;">
                        <span style="font-size:16px;">📍</span>
                        <span style="color:#3d4a5c;font-size:14px;"><strong>Ubicación:</strong> ${opportunity.location}</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:12px;">
                      <span style="display:inline-flex;align-items:center;gap:6px;">
                        <span style="font-size:16px;">🗓️</span>
                        <span style="color:#3d4a5c;font-size:14px;"><strong>Inicio:</strong> ${startDate}</span>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:${slotsLeft !== undefined ? '12' : '0'}px;">
                      <span style="display:inline-flex;align-items:center;gap:6px;">
                        <span style="font-size:16px;">🏁</span>
                        <span style="color:#3d4a5c;font-size:14px;"><strong>Fin:</strong> ${endDate}</span>
                      </span>
                    </td>
                  </tr>
                  ${slotsLeft !== undefined ? `
                  <tr>
                    <td>
                      <span style="display:inline-flex;align-items:center;gap:6px;">
                        <span style="font-size:16px;">👥</span>
                        <span style="color:#3d4a5c;font-size:14px;"><strong>Cupos disponibles:</strong> ${slotsLeft}</span>
                      </span>
                    </td>
                  </tr>` : ''}
                </table>
              </div>

              <p style="margin:0 0 8px;color:#5a6778;font-size:14px;line-height:1.6;">
                Si tienes alguna pregunta, puedes contactar directamente a <strong>${organization.name}</strong>.
              </p>
              <p style="margin:0;color:#5a6778;font-size:14px;line-height:1.6;">
                ¡Gracias por hacer una diferencia! 💚
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e8f0fe;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9aa5b4;font-size:12px;">
                Plataforma de Voluntarios · Este email fue enviado automáticamente, por favor no respondas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: volunteer.email,
      subject: `✅ Confirmación: Quedaste registrado en "${opportunity.title}"`,
      html,
    });
  } catch (err) {
    console.error('[emailService] Error enviando confirmación al voluntario:', err.message);
  }
}

async function sendOrgNewVolunteer({ volunteer, opportunity, organization }) {
  const volunteerName = volunteer.firstName
    ? `${volunteer.firstName}${volunteer.lastName ? ' ' + volunteer.lastName : ''}`
    : volunteer.email;

  const registeredAt = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nuevo Voluntario Registrado</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8 0%,#34a853 100%);padding:40px 40px 32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🙋</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">¡Nuevo Voluntario!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Se ha registrado un nuevo voluntario en tu oportunidad</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#3d4a5c;font-size:16px;">Hola, equipo de <strong>${organization.name}</strong> 👋</p>
              <p style="margin:0 0 28px;color:#5a6778;font-size:15px;line-height:1.6;">
                Un nuevo voluntario se ha registrado en la siguiente oportunidad:
              </p>

              <!-- Opportunity Title -->
              <div style="background:#f8faff;border:1px solid #dce8ff;border-left:4px solid #1a73e8;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;color:#1a73e8;font-size:18px;font-weight:700;">${opportunity.title}</p>
              </div>

              <!-- Volunteer Info Card -->
              <h3 style="margin:0 0 16px;color:#3d4a5c;font-size:16px;font-weight:600;">Datos del Voluntario</h3>
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8faf9;border:1px solid #d3ecd8;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e8f5e9;">
                    <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">Nombre completo</span>
                    <span style="color:#1f2937;font-size:15px;font-weight:600;">${volunteerName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e8f5e9;">
                    <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">Correo electrónico</span>
                    <a href="mailto:${volunteer.email}" style="color:#1a73e8;font-size:15px;text-decoration:none;">${volunteer.email}</a>
                  </td>
                </tr>
                ${volunteer.phone ? `
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e8f5e9;">
                    <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">Teléfono</span>
                    <span style="color:#1f2937;font-size:15px;">${volunteer.phone}</span>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:14px 20px;">
                    <span style="color:#6b7280;font-size:13px;display:block;margin-bottom:2px;">Fecha de registro</span>
                    <span style="color:#1f2937;font-size:15px;">${registeredAt}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e8f0fe;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9aa5b4;font-size:12px;">
                Plataforma de Voluntarios · Este email fue enviado automáticamente, por favor no respondas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: organization.contactEmail,
      subject: `🙋 Nuevo voluntario en "${opportunity.title}": ${volunteerName}`,
      html,
    });
  } catch (err) {
    console.error('[emailService] Error enviando notificación a la organización:', err.message);
  }
}

module.exports = { sendVolunteerConfirmation, sendOrgNewVolunteer };
