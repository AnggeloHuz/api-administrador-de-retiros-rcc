import { AppError } from '../../utils/AppError.js';

// Base de datos simulada en memoria para ejemplo inicial
let mockWithdrawals = [
  {
    id: 'ret-101',
    userId: 'usr-001',
    amount: 150.0,
    currency: 'USD',
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ret-102',
    userId: 'usr-002',
    amount: 320.5,
    currency: 'USD',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * Capa de Servicios: Lógica de negocio para administración de retiros.
 */
export const withdrawalsService = {
  async getAll() {
    return mockWithdrawals;
  },

  async getById(id) {
    const withdrawal = mockWithdrawals.find((item) => item.id === id);
    if (!withdrawal) {
      throw new AppError(`Retiro con ID '${id}' no fue encontrado.`, 404);
    }
    return withdrawal;
  },

  async create({ userId, amount, currency = 'USD' }) {
    if (!userId || !amount) {
      throw new AppError('Los campos "userId" y "amount" son obligatorios.', 400);
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError('El monto a retirar debe ser un número positivo.', 400);
    }

    const newWithdrawal = {
      id: `ret-${Date.now().toString().slice(-4)}`,
      userId,
      amount,
      currency,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    mockWithdrawals.unshift(newWithdrawal);
    return newWithdrawal;
  },
};
