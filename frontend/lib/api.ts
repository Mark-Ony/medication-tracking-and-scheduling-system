const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  // Patients
  async getPatients() {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('API Error - getPatients:', error);
      throw error;
    }
  },

  async getPatient(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - getPatient:', error);
      throw error;
    }
  },

  async createPatient(data: { name: string; room: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - createPatient:', error);
      throw error;
    }
  },

  async updatePatient(id: string, data: { name?: string; room?: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - updatePatient:', error);
      throw error;
    }
  },

  async deletePatient(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - deletePatient:', error);
      throw error;
    }
  },

  // Medications
  async addMedication(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - addMedication:', error);
      throw error;
    }
  },

  async updateMedication(id: string, data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - updateMedication:', error);
      throw error;
    }
  },

  async deleteMedication(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - deleteMedication:', error);
      throw error;
    }
  },

  // Schedule
  async getTodaySchedule() {
    try {
      const res = await fetch(`${API_BASE_URL}/schedule/today`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - getTodaySchedule:', error);
      throw error;
    }
  },

  async administerMedication(data: {
    medication_id: string;
    patient_id: string;
    time_slot: string;
    nurse_name: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/medications/administer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('API Error - administerMedication:', error);
      throw error;
    }
  }
};