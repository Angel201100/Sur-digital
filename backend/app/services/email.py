import smtplib
import ssl
from email.message import EmailMessage
from urllib.parse import urlencode

from app.config import settings


def send_password_reset_email(recipient: str, token: str) -> None:
    if not settings.smtp_host or not settings.smtp_from_email:
        raise RuntimeError("Configura SMTP_HOST y SMTP_FROM_EMAIL para enviar correos de recuperación.")

    reset_query = urlencode({"token": token})
    reset_url = f"{settings.frontend_base_url.rstrip('/')}/recuperar-contrasena?{reset_query}"
    message = EmailMessage()
    message["Subject"] = "Recupera tu contraseña de Sur Digital"
    message["From"] = settings.smtp_from_email
    message["To"] = recipient
    message.set_content(
        "Recibimos una solicitud para cambiar la contraseña de tu cuenta de Sur Digital.\n\n"
        f"Abre este enlace dentro de los próximos 30 minutos:\n{reset_url}\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje."
    )

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()
            if settings.smtp_username and settings.smtp_password is not None:
                smtp.login(settings.smtp_username, settings.smtp_password.get_secret_value())
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException) as error:
        raise RuntimeError("No se pudo enviar el correo de recuperación. Inténtalo más tarde.") from error
