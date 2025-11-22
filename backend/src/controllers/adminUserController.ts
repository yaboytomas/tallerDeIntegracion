import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';
import { validateRUT, normalizeRUT } from '../utils/rutValidation';

/**
 * Get all users (admin only)
 */
export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '20', role, search } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { email: new RegExp(search as string, 'i') },
        { firstName: new RegExp(search as string, 'i') },
        { lastName: new RegExp(search as string, 'i') },
        { rut: new RegExp(search as string, 'i') },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum);

    res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

/**
 * Create a new admin user (admin only)
 */
export async function createAdminUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, rut, phone } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !rut || !phone) {
      throw new CustomError('Todos los campos son requeridos', 400);
    }

    // Validate RUT
    const rutValidation = validateRUT(rut);
    if (!rutValidation.isValid) {
      throw new CustomError(rutValidation.error || 'RUT inválido', 400);
    }

    // Validate password length
    if (password.length < 8) {
      throw new CustomError('La contraseña debe tener al menos 8 caracteres', 400);
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

    // Create admin user
    const adminUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      rut: normalizeRUT(rut),
      phone,
      emailVerified: true, // Skip email verification for admin-created users
      role: 'admin',
    });

    res.status(201).json({
      message: 'Usuario administrador creado exitosamente',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create admin user error:', error);
      res.status(500).json({ error: 'Error al crear usuario administrador' });
    }
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
      throw new CustomError('Rol inválido. Debe ser "customer" o "admin"', 400);
    }

    const user = await User.findById(id);

    if (!user) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    // Prevent changing own role
    if (user._id.toString() === req.user?.userId) {
      throw new CustomError('No puedes cambiar tu propio rol', 400);
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Rol actualizado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Error al actualizar rol' });
    }
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user?.userId) {
      throw new CustomError('No puedes eliminar tu propia cuenta', 400);
    }

    // Check if this is the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new CustomError('No puedes eliminar el último administrador', 400);
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }
}
