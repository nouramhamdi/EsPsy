const { body, validationResult } = require('express-validator');

const validateUserInput = [
<<<<<<< HEAD
  body('fullname').notEmpty().withMessage('Full name is required'),
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email format').matches(/@esprit.tn$/).withMessage('Email must be in the format of "example@esprit.tn"'),
  body('age').isInt({ min: 18 }).withMessage('Age must be at least 18'),
=======
  body('fullname').notEmpty().withMessage('Full name is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid Esprit email format').matches(/@esprit.tn$/).withMessage('Email must be in the format of "example@esprit.tn"'),
>>>>>>> main
  body('number').isMobilePhone().withMessage('Invalid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('datebirth').isDate().withMessage('Invalid birth date format'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validateUserInput, handleValidationErrors };
