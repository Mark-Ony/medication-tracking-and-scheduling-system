import { Router } from 'express';
import { PatientController } from './patient.controller.js';

const router = Router();
const controller = new PatientController();

// Patient routes
router.get('/patients', (req, res) => controller.getAllPatients(req, res));
router.get('/patients/:id', (req, res) => controller.getPatient(req, res));
router.post('/patients', (req, res) => controller.createPatient(req, res));
router.put('/patients/:id', (req, res) => controller.updatePatient(req, res));
router.delete('/patients/:id', (req, res) => controller.deletePatient(req, res));

// Medication routes
router.post('/medications', (req, res) => controller.addMedication(req, res));
router.put('/medications/:id', (req, res) => controller.updateMedication(req, res));
router.delete('/medications/:id', (req, res) => controller.deleteMedication(req, res));

// Schedule routes
router.get('/schedule/today', (req, res) => controller.getTodaySchedule(req, res));
router.post('/medications/administer', (req, res) => controller.administerMedication(req, res));

export default router;