const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phonePattern = /^\+?[0-9]{7,15}$/
const documentPattern = /^[A-Za-z0-9.-]{5,30}$/

export function validateEmail(value) {
  return emailPattern.test(value.trim())
}

export function validatePhone(value) {
  return phonePattern.test(value.trim())
}

export function validateDocument(value) {
  return documentPattern.test(value.trim())
}

export function getPasswordRequirements(password, firstName = '', lastName = '') {
  const normalized = password.toLocaleLowerCase()
  return [
    { label: 'Al menos 10 caracteres', valid: password.length >= 10 },
    { label: 'Una letra mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Un número', valid: /\d/.test(password) },
    { label: 'Un carácter especial', valid: /[^A-Za-z0-9]/.test(password) },
    {
      label: 'No incluye tu nombre ni apellido',
      valid:
        (!firstName.trim() || !normalized.includes(firstName.trim().toLocaleLowerCase())) &&
        (!lastName.trim() || !normalized.includes(lastName.trim().toLocaleLowerCase())),
    },
  ]
}

export function validPassword(password, firstName = '', lastName = '') {
  return getPasswordRequirements(password, firstName, lastName).every((item) => item.valid)
}

export function isValidRegistration(values) {
  return (
    values.first_name.trim().length >= 2 &&
    values.last_name.trim().length >= 2 &&
    Boolean(values.document_type) &&
    validateDocument(values.document_number) &&
    values.address.trim().length >= 5 &&
    validatePhone(values.phone) &&
    validateEmail(values.email) &&
    validPassword(values.password, values.first_name, values.last_name) &&
    values.password === values.password_confirmation &&
    values.accepted_data_policy
  )
}
