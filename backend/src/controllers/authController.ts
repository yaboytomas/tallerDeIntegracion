import { Request, Response } from 'express';
import { User } from '../models/User';
import { EmailVerification } from '../models/EmailVerification';
import { PasswordReset } from '../models/PasswordReset';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { validateRUT, normalizeRUT } from '../utils/rutValidation';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { generateToken, generateExpirationDate } from '../utils/token';
import { CustomError } from '../middleware/errorHandler';

/**
 * Register new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, rut, phone, agreeTerms } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !rut || !phone) {
      throw new CustomError('Todos los campos son requeridos', 400);
    }

    if (!agreeTerms) {
      throw new CustomError('Debes aceptar los términos y condiciones', 400);
    }

    // Validate RUT
    const rutValidation = validateRUT(rut);
    if (!rutValidation.isValid) {
      throw new CustomError(rutValidation.error || 'RUT inválido', 400);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new CustomError(passwordValidation.errors.join(', '), 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { rut: normalizeRUT(rut) }],
    });

    if (existingUser) {
      throw new CustomError('El email o RUT ya está registrado', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      rut: normalizeRUT(rut),
      phone,
      emailVerified: false,
    });

    // Generate verification token
    const verificationToken = generateToken();
    await EmailVerification.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: generateExpirationDate(24 * 60), // 24 hours
    });

    // Send verification email
    await sendVerificationEmail(user._id.toString(), user.email, verificationToken);

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      throw new CustomError('Email y contraseña son requeridos', 400);
    }

    // Find user with password hash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user) {
      throw new CustomError('Credenciales inválidas', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new CustomError('Credenciales inválidas', 401);
    }

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000, // 7 days or 15 minutes
    };

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new CustomError('Refresh token requerido', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new CustomError('Refresh token inválido o expirado', 401);
    }

    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    // Generate new access token
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al refrescar token' });
    }
  }
}

/**
 * Verify email
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new CustomError('Token de verificación requerido', 400);
    }

    const verification = await EmailVerification.findOne({ token });

    if (!verification) {
      throw new CustomError('Token de verificación inválido', 400);
    }

    if (verification.expiresAt < new Date()) {
      throw new CustomError('Token de verificación expirado', 400);
    }

    // Update user
    await User.findByIdAndUpdate(verification.userId, { emailVerified: true });

    // Delete verification token
    await EmailVerification.deleteOne({ _id: verification._id });

    res.json({ message: 'Correo electrónico verificado exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al verificar correo' });
    }
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      throw new CustomError('Email requerido', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists for security
      res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
      return;
    }

    // Generate reset token
    const resetToken = generateToken();
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt: generateExpirationDate(15), // 15 minutes
    });

    // Send reset email
    await sendPasswordResetEmail(user._id.toString(), user.email, resetToken);

    res.json({ message: 'Si el email existe, se enviará un enlace de recuperación' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
}

/**
 * Reset password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new CustomError('Token y nueva contraseña son requeridos', 400);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new CustomError(passwordValidation.errors.join(', '), 400);
    }

    const reset = await PasswordReset.findOne({ token });

    if (!reset) {
      throw new CustomError('Token de recuperación inválido', 400);
    }

    if (reset.expiresAt < new Date()) {
      throw new CustomError('Token de recuperación expirado', 400);
    }

    // Update password
    const passwordHash = await hashPassword(password);
    await User.findByIdAndUpdate(reset.userId, { passwordHash });

    // Delete reset token
    await PasswordReset.deleteOne({ _id: reset._id });

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al restablecer contraseña' });
    }
  }
}

/**
 * Logout
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Sesión cerrada exitosamente' });
}

