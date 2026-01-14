import { Request, Response } from 'express';
import { PatientRepository } from '../repositories/patient.repository';
import { z } from 'zod';

const repo = new PatientRepository();

const patientSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  phone: z.string(),
  birthDate: z.string() // ISO Date
});

export const createPatient = async (req: Request, res: Response) => {
  try {
    // Validar Body
    const data = patientSchema.parse(req.body);
    
    // Executar (tenantId vem garantido do middleware)
    const newPatient = await repo.create(req.user!.tenantId, data);
    
    return res.status(201).json(newPatient);
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message });
  }
};

export const listPatients = async (req: Request, res: Response) => {
  const patients = await repo.findAll(req.user!.tenantId);
  return res.json(patients);
};