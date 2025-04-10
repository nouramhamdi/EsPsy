const { body, validationResult } = require('express-validator');
const moment = require('moment');

const validateUserInput = [
  body('fullname').notEmpty().withMessage('Full name is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid Esprit email format').matches(/@esprit.tn$/).withMessage('Email must be in the format of "example@esprit.tn"'),
  body('number').matches(/^(2|5|7|9)\d{7}$/).withMessage('Invalid Tunisian phone number (must be 8 digits and start with 2, 5, 7, or 9)'),  
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('datebirth')
    .custom((value) => {
      if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
        throw new Error('Invalid birth date format (YYYY-MM-DD required)');
      }
      const birthDate = moment(value, 'YYYY-MM-DD');
      const today = moment();
      const age = today.diff(birthDate, 'years');

      if (age < 16) {
        throw new Error('You must be at least 16 years old');
      }

      return true;
    }),];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validateUserInput, handleValidationErrors };
