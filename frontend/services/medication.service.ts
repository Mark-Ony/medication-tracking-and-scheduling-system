import { api } from '@/lib/api';

export interface Patient {
  id: string;
  name: string;
  room: string;
  medications: Medication[];
  created_at?: string;
  updated_at?: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  instructions: string;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleItem {
  patient: Patient;
  medications: Medication[];
}

export interface TodaySchedule {
  schedule: ScheduleItem[];
  timeSlot: string;
  date: string;
  administered: any[];
}

class MedicationService {
  private nurseName: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      let name = localStorage.getItem('nurseName');
      if (!name) {
        name = prompt('Enter your name:') || 'Nurse';
        localStorage.setItem('nurseName', name);
      }
      this.nurseName = name;
    }
  }

  async getAllPatients(): Promise<Patient[]> {
    try {
      const response = await api.getPatients();
      console.log('API Response - getAllPatients:', response);
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error in getAllPatients:', error);
      throw error;
    }
  }

  async createPatient(name: string, room: string): Promise<Patient> {
    try {
      const response = await api.createPatient({ name, room });
      console.log('API Response - createPatient:', response);
      
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to create patient');
    } catch (error) {
      console.error('Error in createPatient:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      const response = await api.deletePatient(id);
      console.log('API Response - deletePatient:', response);
      
      if (!response.success) {
        throw new Error('Failed to delete patient');
      }
    } catch (error) {
      console.error('Error in deletePatient:', error);
      throw error;
    }
  }

  async addMedication(
    patientId: string,
    name: string,
    dosage: string,
    instructions: string,
    morning: boolean,
    afternoon: boolean,
    evening: boolean
  ): Promise<Medication> {
    try {
      const response = await api.addMedication({
        patient_id: patientId,
        name,
        dosage,
        instructions,
        morning,
        afternoon,
        evening
      });
      console.log('API Response - addMedication:', response);
      
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to add medication');
    } catch (error) {
      console.error('Error in addMedication:', error);
      throw error;
    }
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      const response = await api.deleteMedication(id);
      console.log('API Response - deleteMedication:', response);
      
      if (!response.success) {
        throw new Error('Failed to delete medication');
      }
    } catch (error) {
      console.error('Error in deleteMedication:', error);
      throw error;
    }
  }

  async getTodaySchedule(): Promise<TodaySchedule> {
    try {
      const response = await api.getTodaySchedule();
      console.log('API Response - getTodaySchedule:', response);
      
      if (response.success && response.data) {
        return {
          schedule: response.data.schedule || [],
          timeSlot: response.data.timeSlot || 'morning',
          date: response.data.date || new Date().toISOString().split('T')[0],
          administered: response.data.administered || []
        };
      }
      return {
        schedule: [],
        timeSlot: this.getCurrentTimeSlot(),
        date: new Date().toISOString().split('T')[0],
        administered: []
      };
    } catch (error) {
      console.error('Error in getTodaySchedule:', error);
      return {
        schedule: [],
        timeSlot: this.getCurrentTimeSlot(),
        date: new Date().toISOString().split('T')[0],
        administered: []
      };
    }
  }

  async administerMedication(
    medicationId: string,
    patientId: string,
    timeSlot: string
  ): Promise<void> {
    try {
      const response = await api.administerMedication({
        medication_id: medicationId,
        patient_id: patientId,
        time_slot: timeSlot,
        nurse_name: this.nurseName
      });
      console.log('API Response - administerMedication:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to administer medication');
      }
    } catch (error) {
      console.error('Error in administerMedication:', error);
      throw error;
    }
  }

  getNurseName(): string {
    return this.nurseName;
  }

  getCurrentTimeSlot(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}

export const medicationService = new MedicationService();