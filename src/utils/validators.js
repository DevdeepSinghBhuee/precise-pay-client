// src/utils/validators.js
import { z } from 'zod'

const requiredString = (fieldName) =>
  z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, `${fieldName} is required.`)
  )

export const loginSchema = z.object({
  email: requiredString('Email')
    .pipe(z.string().email('Please enter a valid email address.')),
  password: requiredString('Password'),
})

export const registerSchema = z.object({
  fullName: requiredString('Full name')
    .pipe(z.string().min(2, 'Full name must be at least 2 characters.')),
  email: requiredString('Email')
    .pipe(z.string().email('Please enter a valid email address.')),
  password: requiredString('Password')
    .pipe(z.string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Must contain uppercase, lowercase, number and special character.'
      )
    ),
  confirmPassword: requiredString('Confirm password'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match.', path: ['confirmPassword'] }
)