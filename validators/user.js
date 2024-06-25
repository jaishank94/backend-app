import Joi from "joi";

export const signupValidator = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phoneNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a 10 digit number starting with 6, 7, 8, or 9',
      'string.empty': 'Phone number is required'
  }),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character',
      'string.empty': 'Password is required'
  }),
  address: Joi.string(),
  city: Joi.string(),
  country: Joi.string(),
  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'ZIP code must be a 6-digit number',
      'string.empty': 'ZIP code is required'
  }),
  agentCode: Joi.string(),
  profileType: Joi.string(),
  interests: Joi.string(),
  referralCode: Joi.string(),
  tradeType: Joi.string(),
});

export const loginValidator = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required()
});

export const userUpdateValidator = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }),
  phoneNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      'string.pattern.base': 'Phone number must be a 10 digit number starting with 6, 7, 8, or 9',
      'string.empty': 'Phone number is required'
  }),
  address: Joi.string(),
  city: Joi.string(),
  country: Joi.string(),
  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .messages({
      'string.pattern.base': 'ZIP code must be a 6-digit number',
      'string.empty': 'ZIP code is required'
  }),
  interests: Joi.string(),
  tradeType: Joi.string(),
});

export const passwordUpdateValidator = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
  .pattern(new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
  .required()
  .messages({
    'string.pattern.base': 'Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character',
    'string.empty': 'Password is required'
  }),
});