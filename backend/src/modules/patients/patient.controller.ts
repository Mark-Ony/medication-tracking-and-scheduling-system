import { Request, Response } from 'express';
import { supabase } from '../../config/supabase.js';

export class PatientController {
  // Get all patients with their medications
  async getAllPatients(req: Request, res: Response) {
    try {
      console.log('Fetching all patients...');
      
      // First get all patients
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('name');
      
      if (patientsError) {
        console.error('Supabase error:', patientsError);
        return res.status(500).json({ 
          success: false, 
          error: patientsError.message 
        });
      }
      
      // Then get all medications
      const { data: medications, error: medsError } = await supabase
        .from('medications')
        .select('*');
      
      if (medsError) {
        console.error('Medications error:', medsError);
        return res.status(500).json({ 
          success: false, 
          error: medsError.message 
        });
      }
      
      // Combine patients with their medications
      const patientsWithMeds = (patients || []).map(patient => ({
        ...patient,
        medications: (medications || []).filter(med => med.patient_id === patient.id)
      }));
      
      console.log(`Found ${patientsWithMeds.length} patients`);
      
      res.json({ 
        success: true, 
        data: patientsWithMeds 
      });
    } catch (error: any) {
      console.error('Controller error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // Get single patient with medications
  async getPatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (patientError) {
        return res.status(500).json({ success: false, error: patientError.message });
      }
      
      const { data: medications, error: medError } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', id);
      
      if (medError) {
        return res.status(500).json({ success: false, error: medError.message });
      }
      
      res.json({ 
        success: true, 
        data: { ...patient, medications: medications || [] } 
      });
    } catch (error: any) {
      console.error('Error in getPatient:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create patient
  async createPatient(req: Request, res: Response) {
    try {
      const { name, room } = req.body;
      
      if (!name || !room) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name and room are required' 
        });
      }
      
      const { data, error } = await supabase
        .from('patients')
        .insert([{ name, room }])
        .select()
        .single();
      
      if (error) {
        console.error('Create patient error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ 
        success: true, 
        data: { ...data, medications: [] } 
      });
    } catch (error: any) {
      console.error('Error in createPatient:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update patient
  async updatePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, room } = req.body;
      
      const { data, error } = await supabase
        .from('patients')
        .update({ name, room, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in updatePatient:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete patient
  async deletePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Delete medication schedules first
      await supabase
        .from('medication_schedules')
        .delete()
        .eq('patient_id', id);
      
      // Delete medications
      await supabase
        .from('medications')
        .delete()
        .eq('patient_id', id);
      
      // Delete patient
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ success: true, message: 'Patient deleted' });
    } catch (error: any) {
      console.error('Error in deletePatient:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Add medication
  async addMedication(req: Request, res: Response) {
    try {
      const { patient_id, name, dosage, instructions, morning, afternoon, evening } = req.body;
      
      if (!patient_id || !name || !dosage) {
        return res.status(400).json({ 
          success: false, 
          error: 'Patient ID, name, and dosage are required' 
        });
      }
      
      const { data, error } = await supabase
        .from('medications')
        .insert([{ 
          patient_id, 
          name, 
          dosage, 
          instructions: instructions || '', 
          morning: morning === true || morning === 'on' || morning === true,
          afternoon: afternoon === true || afternoon === 'on' || afternoon === true,
          evening: evening === true || evening === 'on' || evening === true
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Add medication error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in addMedication:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update medication
  async updateMedication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const { data, error } = await supabase
        .from('medications')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Error in updateMedication:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete medication
  async deleteMedication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Delete related schedules
      await supabase
        .from('medication_schedules')
        .delete()
        .eq('medication_id', id);
      
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ success: true, message: 'Medication deleted' });
    } catch (error: any) {
      console.error('Error in deleteMedication:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get today's schedule
  async getTodaySchedule(req: Request, res: Response) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const hour = new Date().getHours();
      let timeSlot = 'morning';
      if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
      if (hour >= 17) timeSlot = 'evening';
      
      console.log(`Getting schedule for ${timeSlot} on ${today}`);
      
      // Get all patients
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*');
      
      if (patientsError) {
        console.error('Patients error:', patientsError);
        return res.status(500).json({ success: false, error: patientsError.message });
      }
      
      // Get all medications
      const { data: allMedications, error: medError } = await supabase
        .from('medications')
        .select('*');
      
      if (medError) {
        console.error('Medications error:', medError);
        return res.status(500).json({ success: false, error: medError.message });
      }
      
      // Get administered doses for today and this time slot
      const { data: administered, error: adminError } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('date', today)
        .eq('time_slot', timeSlot);
      
      if (adminError) {
        console.error('Administered error:', adminError);
        // Continue even if this fails
      }
      
      // Filter patients who have medications for this time slot
      const schedule = (patients || [])
        .map(patient => {
          const patientMeds = (allMedications || []).filter(med => {
            const medMatches = med.patient_id === patient.id;
            const timeSlotMatches = med[timeSlot] === true;
            return medMatches && timeSlotMatches;
          });
          
          return {
            patient,
            medications: patientMeds
          };
        })
        .filter(item => item.medications.length > 0);
      
      console.log(`Found ${schedule.length} patients with medications for ${timeSlot}`);
      
      res.json({ 
        success: true, 
        data: {
          schedule,
          timeSlot,
          date: today,
          administered: administered || []
        }
      });
    } catch (error: any) {
      console.error('Error in getTodaySchedule:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Mark medication as administered
  async administerMedication(req: Request, res: Response) {
    try {
      const { medication_id, patient_id, time_slot, nurse_name } = req.body;
      const today = new Date().toISOString().split('T')[0];
      
      if (!medication_id || !patient_id || !time_slot) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }
      
      // Check if already administered
      const { data: existing, error: checkError } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('medication_id', medication_id)
        .eq('patient_id', patient_id)
        .eq('date', today)
        .eq('time_slot', time_slot);
      
      if (checkError) {
        console.error('Check error:', checkError);
      }
      
      if (existing && existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Medication already administered for this time slot' 
        });
      }
      
      // Insert new administration record
      const { data, error } = await supabase
        .from('medication_schedules')
        .insert([{
          medication_id,
          patient_id,
          date: today,
          time_slot,
          status: 'administered',
          administered_at: new Date().toISOString(),
          administered_by: nurse_name || 'Unknown'
        }])
        .select();
      
      if (error) {
        console.error('Insert error:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
      
      res.json({ success: true, data: data?.[0] || null });
    } catch (error: any) {
      console.error('Error in administerMedication:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}