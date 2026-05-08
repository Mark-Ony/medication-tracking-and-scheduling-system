import { supabase } from '../config/supabase';

export interface IPatient {
  id: string;
  name: string;
  room: string;
  created_at: string;
  updated_at: string;
}

export interface IMedication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  instructions: string;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  created_at: string;
  updated_at: string;
}

export interface IMedicationSchedule {
  id: string;
  medication_id: string;
  patient_id: string;
  date: string;
  time_slot: 'morning' | 'afternoon' | 'evening';
  status: 'pending' | 'administered' | 'skipped';
  administered_at: string | null;
  administered_by: string | null;
}

export class PatientModel {
  // Patient methods
  static async findAll() {
    const { data, error } = await supabase
      .from('patients')
      .select('*, medications(*)')
      .order('name');
    if (error) throw error;
    return data;
  }

  static async findById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*, medications(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(patientData: { name: string; room: string }) {
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, patientData: Partial<IPatient>) {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Medication methods
  static async addMedication(medicationData: Omit<IMedication, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('medications')
      .insert([medicationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateMedication(id: string, medicationData: Partial<IMedication>) {
    const { data, error } = await supabase
      .from('medications')
      .update(medicationData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteMedication(id: string) {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Schedule methods
  static async getTodaySchedule(timeSlot: string, date: string) {
    // Get patients with medications for this time slot
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select(`
        *,
        medications!inner(*)
      `);
    
    if (patientsError) throw patientsError;

    const filtered = patients?.map(patient => ({
      ...patient,
      medications: patient.medications.filter((med: any) => med[timeSlot])
    })).filter(p => p.medications.length > 0);

    // Get administered doses
    const { data: administered, error: adminError } = await supabase
      .from('medication_schedules')
      .select('*')
      .eq('date', date)
      .eq('time_slot', timeSlot);
    
    if (adminError) throw adminError;

    return { schedule: filtered, administered: administered || [] };
  }

  static async administerMedication(data: {
    medication_id: string;
    patient_id: string;
    date: string;
    time_slot: string;
    administered_by: string;
  }) {
    // Check if already administered
    const { data: existing } = await supabase
      .from('medication_schedules')
      .select('*')
      .eq('medication_id', data.medication_id)
      .eq('patient_id', data.patient_id)
      .eq('date', data.date)
      .eq('time_slot', data.time_slot)
      .single();

    if (existing) {
      throw new Error('Medication already administered for this time slot');
    }

    const { data: result, error } = await supabase
      .from('medication_schedules')
      .insert([{
        ...data,
        status: 'administered',
        administered_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return result;
  }
}