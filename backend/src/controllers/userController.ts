import { Response } from 'express';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { AuthRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { validateRUT, normalizeRUT } from '../utils/rutValidation';
import { hashPassword, validatePasswordStrength } from '../utils/password';

/**
 * Get user profile
 */
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');

    if (!user) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    res.json(user);
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const { firstName, lastName, phone, rut } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    if (rut) {
      const rutValidation = validateRUT(rut);
      if (!rutValidation.isValid) {
        throw new CustomError(rutValidation.error || 'RUT inválido', 400);
      }

      // Check if RUT is already taken by another user
      const existingUser = await User.findOne({
        rut: normalizeRUT(rut),
        _id: { $ne: req.user.userId },
      });

      if (existingUser) {
        throw new CustomError('RUT ya está en uso', 409);
      }

      updateData.rut = normalizeRUT(rut);
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    res.json({
      message: 'Perfil actualizado exitosamente',
      user,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  }
}

/**
 * Change password
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new CustomError('Contraseña actual y nueva contraseña son requeridas', 400);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new CustomError(passwordValidation.errors.join(', '), 400);
    }

    // Get user with password
    const user = await User.findById(req.user.userId).select('+passwordHash');
    if (!user) {
      throw new CustomError('Usuario no encontrado', 404);
    }

    // Verify current password
    const { comparePassword } = await import('../utils/password');
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new CustomError('Contraseña actual incorrecta', 401);
    }

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await User.findByIdAndUpdate(req.user.userId, { passwordHash });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  }
}

/**
 * Get user addresses
 */
export async function getAddresses(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const addresses = await Address.find({ userId: req.user.userId }).sort({ isDefault: -1, createdAt: -1 });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
}

/**
 * Add address
 */
export async function addAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const { region, comuna, street, number, apartment, reference, phone, isDefault } = req.body;

    if (!region || !comuna || !street || !number || !phone) {
      throw new CustomError('Todos los campos requeridos deben ser completados', 400);
    }

    // If this is set as default, unset others
    if (isDefault) {
      await Address.updateMany({ userId: req.user.userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user.userId,
      region,
      comuna,
      street,
      number,
      apartment,
      reference,
      phone,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      message: 'Dirección agregada exitosamente',
      address,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al agregar dirección' });
    }
  }
}

/**
 * Update address
 */
export async function updateAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const { id } = req.params;
    const { region, comuna, street, number, apartment, reference, phone, isDefault } = req.body;

    const address = await Address.findOne({ _id: id, userId: req.user.userId });

    if (!address) {
      throw new CustomError('Dirección no encontrada', 404);
    }

    // If setting as default, unset others
    if (isDefault) {
      await Address.updateMany({ userId: req.user.userId, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, {
      region: region || address.region,
      comuna: comuna || address.comuna,
      street: street || address.street,
      number: number || address.number,
      apartment: apartment !== undefined ? apartment : address.apartment,
      reference: reference !== undefined ? reference : address.reference,
      phone: phone || address.phone,
      isDefault: isDefault !== undefined ? isDefault : address.isDefault,
    });

    await address.save();

    res.json({
      message: 'Dirección actualizada exitosamente',
      address,
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al actualizar dirección' });
    }
  }
}

/**
 * Delete address
 */
export async function deleteAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError('No autorizado', 401);
    }

    const { id } = req.params;

    const result = await Address.deleteOne({ _id: id, userId: req.user.userId });

    if (result.deletedCount === 0) {
      throw new CustomError('Dirección no encontrada', 404);
    }

    res.json({ message: 'Dirección eliminada exitosamente' });
  } catch (error: any) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al eliminar dirección' });
    }
  }
}

