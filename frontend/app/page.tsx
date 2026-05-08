'use client';

import { useState, useEffect, useRef } from 'react';
import { medicationService, Patient, TodaySchedule } from '@/services/medication.service';

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddMed, setShowAddMed] = useState<string | null>(null);
  const [nurseName, setNurseName] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'patients'>('schedule');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // IMPORTANT: Use ref to track if data has been loaded
  const hasLoaded = useRef(false);

  useEffect(() => {
    // ONLY load once when component mounts
    if (!hasLoaded.current) {
      const name = medicationService.getNurseName();
      setNurseName(name);
      loadData();
      hasLoaded.current = true;
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading data once...');
      const [patientsData, scheduleData] = await Promise.all([
        medicationService.getAllPatients(),
        medicationService.getTodaySchedule()
      ]);
      setPatients(patientsData || []);
      setSchedule(scheduleData);
      console.log('Data loaded successfully');
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh only when button is clicked
  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    setLoading(true);
    try {
      const [patientsData, scheduleData] = await Promise.all([
        medicationService.getAllPatients(),
        medicationService.getTodaySchedule()
      ]);
      setPatients(patientsData || []);
      setSchedule(scheduleData);
    } catch (err: any) {
      console.error('Error refreshing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setActionLoading('add-patient');
    try {
      await medicationService.createPatient(
        formData.get('name') as string,
        formData.get('room') as string
      );
      setShowAddPatient(false);
      // Refresh after adding
      await handleRefresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setActionLoading('add-med');
    try {
      await medicationService.addMedication(
        showAddMed!,
        formData.get('name') as string,
        formData.get('dosage') as string,
        formData.get('instructions') as string,
        formData.get('morning') === 'on',
        formData.get('afternoon') === 'on',
        formData.get('evening') === 'on'
      );
      setShowAddMed(null);
      await handleRefresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminister = async (medicationId: string, patientId: string, timeSlot: string) => {
    setActionLoading(`admin-${medicationId}`);
    try {
      await medicationService.administerMedication(medicationId, patientId, timeSlot);
      await handleRefresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (confirm('Delete this patient?')) {
      setActionLoading(`delete-patient-${id}`);
      try {
        await medicationService.deletePatient(id);
        await handleRefresh();
      } catch (error: any) {
        alert(error.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (confirm('Delete this medication?')) {
      setActionLoading(`delete-med-${id}`);
      try {
        await medicationService.deleteMedication(id);
        await handleRefresh();
      } catch (error: any) {
        alert(error.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getTimeSlotColor = () => {
    const slot = schedule?.timeSlot;
    switch(slot) {
      case 'morning': return 'from-yellow-400 to-orange-500';
      case 'afternoon': return 'from-orange-400 to-red-500';
      case 'evening': return 'from-indigo-400 to-purple-500';
      default: return 'from-blue-400 to-blue-500';
    }
  };

  const getTimeSlotIcon = () => {
    const slot = schedule?.timeSlot;
    switch(slot) {
      case 'morning': return '🌅';
      case 'afternoon': return '🌞';
      case 'evening': return '🌙';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading medication data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">💊</div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Medication Management
                </h1>
                <p className="text-xs text-gray-500">Patient Care Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Welcome,</p>
              <p className="font-semibold text-gray-700 text-sm">{nurseName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Total Meds</p>
            <p className="text-2xl font-bold text-gray-800">
              {patients.reduce((acc, p) => acc + (p.medications?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Today's Pending</p>
            <p className="text-2xl font-bold text-orange-600">
              {schedule?.schedule?.reduce((acc, item) => acc + item.medications.length, 0) || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Current Time</p>
            <p className="text-lg font-bold text-gray-800">
              {schedule?.timeSlot?.toUpperCase() || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Quick Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddPatient(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
            >
              + Add Patient
            </button>
            <button
              onClick={handleRefresh}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all text-sm ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Today's Schedule
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all text-sm ${
              activeTab === 'patients'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Patient Management ({patients.length})
          </button>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className={`bg-gradient-to-r ${getTimeSlotColor()} rounded-xl shadow-lg p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Current Time Slot</p>
                  <h2 className="text-2xl font-bold mt-1">
                    {getTimeSlotIcon()} {schedule?.timeSlot?.toUpperCase() || 'MORNING'}
                  </h2>
                  <p className="text-xs opacity-90 mt-1">{schedule?.date || new Date().toISOString().split('T')[0]}</p>
                </div>
                <div className="text-5xl opacity-20">{getTimeSlotIcon()}</div>
              </div>
            </div>

            {schedule?.schedule && schedule.schedule.length > 0 ? (
              <div className="space-y-4">
                {schedule.schedule.map((item) => (
                  <div key={item.patient.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.patient.name}</h3>
                          <p className="text-xs text-gray-500">Room: {item.patient.room}</p>
                        </div>
                        <div className="text-xl">🏥</div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {item.medications.map((med) => {
                        const isAdministered = schedule.administered?.some(
                          (a: any) => a.medication_id === med.id
                        );
                        const adminRecord = schedule.administered?.find(
                          (a: any) => a.medication_id === med.id
                        );
                        const isLoading = actionLoading === `admin-${med.id}`;
                        
                        return (
                          <div key={med.id} className="p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-medium text-gray-800 text-sm">{med.name}</span>
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                    {med.dosage}
                                  </span>
                                </div>
                                {med.instructions && (
                                  <p className="text-xs text-gray-500">{med.instructions}</p>
                                )}
                              </div>
                              
                              {!isAdministered ? (
                                <button
                                  onClick={() => handleAdminister(med.id, item.patient.id, schedule.timeSlot)}
                                  disabled={isLoading}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                                >
                                  {isLoading ? '⏳' : '✓'} Give
                                </button>
                              ) : (
                                <div className="text-right">
                                  <div className="text-green-600 text-xs font-medium">✓ Given</div>
                                  <div className="text-xs text-gray-400">{adminRecord?.administered_by}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-semibold text-gray-800">No Medications</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No medications scheduled for {schedule?.timeSlot || 'this time slot'}.
                </p>
                <button
                  onClick={() => setActiveTab('patients')}
                  className="mt-4 text-blue-600 text-sm hover:underline"
                >
                  Add medications to patients →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {patients.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Patients Yet</h3>
                <p className="text-gray-500">Click "Add Patient" to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                  <div key={patient.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                      <div className="flex justify-between items-start">
                        <div className="text-white">
                          <h3 className="font-semibold text-base">{patient.name}</h3>
                          <p className="text-xs text-blue-100">Room {patient.room}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowAddMed(patient.id)}
                            className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs"
                          >
                            + Med
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-white px-2 py-1 rounded text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Medications ({patient.medications?.length || 0})
                      </p>
                      {patient.medications && patient.medications.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {patient.medications.map((med) => (
                            <div key={med.id} className="bg-gray-50 rounded-lg p-2">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-gray-800 text-xs">{med.name}</span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                      {med.dosage}
                                    </span>
                                  </div>
                                  {med.instructions && (
                                    <p className="text-xs text-gray-500 mt-0.5">{med.instructions}</p>
                                  )}
                                  <div className="flex gap-2 mt-1">
                                    <span className={`text-xs ${med.morning ? 'text-green-600' : 'text-gray-400'}`}>🌅</span>
                                    <span className={`text-xs ${med.afternoon ? 'text-green-600' : 'text-gray-400'}`}>🌞</span>
                                    <span className={`text-xs ${med.evening ? 'text-green-600' : 'text-gray-400'}`}>🌙</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteMedication(med.id)}
                                  className="text-red-400 hover:text-red-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-400 text-xs">No medications</p>
                          <button
                            onClick={() => setShowAddMed(patient.id)}
                            className="text-blue-600 text-xs mt-1 hover:underline"
                          >
                            + Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl px-5 py-3">
              <h3 className="text-lg font-bold text-white">Add New Patient</h3>
            </div>
            <form onSubmit={handleAddPatient}>
              <div className="p-5 space-y-3">
                <input name="name" placeholder="Full Name" required className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input name="room" placeholder="Room Number" required className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl">
                <button type="button" onClick={() => setShowAddPatient(false)} className="px-3 py-1.5 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl px-5 py-3">
              <h3 className="text-lg font-bold text-white">Add Medication</h3>
            </div>
            <form onSubmit={handleAddMedication}>
              <div className="p-5 space-y-3">
                <input name="name" placeholder="Medication Name" required className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input name="dosage" placeholder="Dosage" required className="w-full border rounded-lg px-3 py-2 text-sm" />
                <textarea name="instructions" placeholder="Instructions" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <div className="space-y-2">
                  <label className="flex items-center gap-2"><input type="checkbox" name="morning" /> Morning</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="afternoon" /> Afternoon</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="evening" /> Evening</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl">
                <button type="button" onClick={() => setShowAddMed(null)} className="px-3 py-1.5 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}