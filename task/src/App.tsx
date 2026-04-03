/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Plus, 
  Search, 
  User as UserIcon, 
  LogOut, 
  X, 
  Printer, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_DOCTORS, CATEGORIES, APPOINTMENT_TYPES, PROCEDURES } from './constants';
import { Patient, Appointment, User, UserRole, Category, AppointmentType, Doctor, AppointmentStatus } from './types';
import { validateCPF, formatCPF } from './utils/validation';

// Mock Initial Data
const INITIAL_PATIENTS: Patient[] = [
  { id: '1', name: 'NATHANAEL KALEB DE OLIVEIRA CONRADO', cpf: '123.456.789-00', susCard: '89800542651', phoneResidencial: '92988542651' }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2026-03-13',
    time: '08:30',
    category: 'SUS',
    type: 'CONSULTA',
    procedureCode: '0',
    procedureName: 'CONSULTA',
    value: 0,
    status: 'Aguardando',
    obsAgenda: 'Paciente com dor ocular',
    obsTratamento: '',
    isRegistered: true
  }
];

const USERS: User[] = [
  { id: 'medico', name: 'Médico', role: 'DOCTOR', password: '123' },
  { id: 'recepcao', name: 'Recepção', role: 'RECEPTIONIST', password: '123' },
  { id: 'enfermagem', name: 'Enfermagem', role: 'NURSE', password: '123' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'new-appointment' | 'doctors'>('appointments');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientEditTab, setPatientEditTab] = useState<'principal' | 'complemento' | 'antecedentes' | 'historico'>('principal');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDoctorTab, setSelectedDoctorTab] = useState<string>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAgendaApptId, setSelectedAgendaApptId] = useState<string | null>(null);
  
  // Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Form States
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({ 
    name: '', 
    cpf: '', 
    susCard: '',
    birthDate: '',
    maritalStatus: 'Casado(a)',
    sex: 'Masculino',
    race: 'Parda',
    naturality: '',
    nationality: 'Brasileira',
    rg: '',
    profession: '',
    workplace: '',
    phone: '',
    phoneResidencial: '',
    phoneComercial: '',
    email: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      cep: '',
      city: 'MANAUS',
      uf: 'AM',
      ibgeCode: ''
    },
    reference: '',
    stars: 0,
    entryDate: new Date().toISOString().split('T')[0],
    personType: 'Física'
  });
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({ name: '', crm: '', specialty: '', cpf: '', phone: '', email: '' });
  const [newAppt, setNewAppt] = useState<Partial<Appointment>>({
    patientId: '',
    doctorId: INITIAL_DOCTORS[0].id,
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    category: 'PARTICULAR' as Category,
    type: 'CONSULTA' as AppointmentType,
    procedureCode: '',
    procedureName: '',
    obsAgenda: '',
    obsTratamento: '',
    status: 'Aguardando',
    receptionist: 'LOURIVANIA',
    arrivalTime: '',
    wait: ''
  });

  const [procedureSearch, setProcedureSearch] = useState('');
  const [showProcedureResults, setShowProcedureResults] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);

  const [cpfError, setCpfError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-login removed for real login area
  useEffect(() => {
    // No auto-login
  }, []);

  useEffect(() => {
    if (activeTab !== 'new-appointment' && !editingAppointment) {
      setProcedureSearch('');
      setShowProcedureResults(false);
      setPatientSearch('');
      setShowPatientResults(false);
    } else if (editingAppointment) {
      const patient = patients.find(p => p.id === editingAppointment.patientId);
      if (patient) {
        setPatientSearch(patient.name.toUpperCase());
      }
    }
  }, [activeTab, editingAppointment, patients]);

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.cpf || !validateCPF(newPatient.cpf)) {
      setCpfError('CPF Inválido');
      return;
    }
    const patient: Patient = {
      ...newPatient as Patient,
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      name: newPatient.name || '',
      cpf: formatCPF(newPatient.cpf),
      stars: newPatient.stars || 0,
      entryDate: newPatient.entryDate || new Date().toISOString().split('T')[0],
      personType: newPatient.personType || 'Física'
    };
    setPatients([...patients, patient]);
    setNewPatient({ 
      name: '', 
      cpf: '', 
      susCard: '',
      birthDate: '',
      maritalStatus: 'Casado(a)',
      sex: 'Masculino',
      race: 'Parda',
      naturality: '',
      nationality: 'Brasileira',
      rg: '',
      profession: '',
      workplace: '',
      phone: '',
      phoneResidencial: '',
      phoneComercial: '',
      email: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        cep: '',
        city: 'MANAUS',
        uf: 'AM',
        ibgeCode: ''
      },
      reference: '',
      stars: 0,
      entryDate: new Date().toISOString().split('T')[0],
      personType: 'Física'
    });
    setCpfError(null);
    setIsAddingPatient(false);
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const doctor: Doctor = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      name: newDoctor.name || '',
      crm: newDoctor.crm || '',
      specialty: newDoctor.specialty || '',
      cpf: newDoctor.cpf || '',
      phone: newDoctor.phone || '',
      email: newDoctor.email || '',
    };
    setDoctors([...doctors, doctor]);
    setNewDoctor({ name: '', crm: '', specialty: '', cpf: '', phone: '', email: '' });
  };

  const handleUpdatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    if (!validateCPF(editingPatient.cpf)) {
      setCpfError('CPF Inválido');
      return;
    }
    setPatients(patients.map(p => p.id === editingPatient.id ? { ...editingPatient, cpf: formatCPF(editingPatient.cpf) } : p));
    setEditingPatient(null);
    setCpfError(null);
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setDoctors(doctors.map(d => d.id === editingDoctor.id ? editingDoctor : d));
    setEditingDoctor(null);
  };

  const handleUpdateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setAppointments(appointments.map(a => a.id === editingAppointment.id ? editingAppointment : a));
    setEditingAppointment(null);
    setProcedureSearch('');
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const appt: Appointment = {
      ...newAppt as Appointment,
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      patientId: newAppt.patientId || '',
      doctorId: newAppt.doctorId || '',
      date: newAppt.date || '',
      time: newAppt.time || '',
      category: newAppt.category as Category,
      type: newAppt.type as AppointmentType,
      procedureCode: newAppt.procedureCode || '',
      procedureName: newAppt.procedureName || '',
      value: 0,
      status: 'Aguardando',
      obsAgenda: newAppt.obsAgenda || '',
      obsTratamento: newAppt.obsTratamento || '',
      isRegistered: true,
      receptionist: 'LOURIVANIA',
      arrivalTime: '',
      wait: ''
    };
    setAppointments([...appointments, appt]);
    setActiveTab('appointments');
    setNewAppt({
      patientId: '',
      doctorId: INITIAL_DOCTORS[0].id,
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
      category: 'PARTICULAR' as Category,
      type: 'CONSULTA' as AppointmentType,
      procedureCode: '',
      procedureName: '',
      obsAgenda: '',
      obsTratamento: '',
      status: 'Aguardando',
      receptionist: 'LOURIVANIA'
    });
    setProcedureSearch('');
  };

  const updateObservations = (apptId: string, field: 'obsAgenda' | 'obsTratamento', value: string) => {
    // Rule: Nurse Paula can edit surgery observations (obsTratamento)
    // Rule: After registration, observations cannot be changed by normal users
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;

    const canEdit = currentUser?.role === 'ADMIN' || (currentUser?.role === 'NURSE' && field === 'obsTratamento');
    
    if (!canEdit && appt.isRegistered) {
      alert('Alteração não permitida após o cadastro para este campo.');
      return;
    }

    setAppointments(appointments.map(a => a.id === apptId ? { ...a, [field]: value } : a));
  };

  const filteredAppointments = appointments.filter(a => {
    const patient = patients.find(p => p.id === a.patientId);
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         patient?.cpf.includes(searchTerm);
    const matchesDate = a.date === selectedDate;
    const matchesDoctor = selectedDoctorTab === 'all' || a.doctorId === selectedDoctorTab;
    return matchesSearch && matchesDate && matchesDoctor;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.id === loginForm.username.toLowerCase() && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginError(null);
    } else {
      setLoginError('Usuário ou senha incorretos');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl border border-zinc-100 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight">CLÍNICA TAYAH</h1>
            <p className="text-sm text-zinc-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Usuário</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Ex: medico, recepcao..."
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {loginError && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold text-center"
              >
                {loginError}
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              Entrar no Sistema
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest mb-4">Usuários para teste (Senha: 123)</p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-[9px] font-bold text-zinc-500">medico</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-zinc-500">recepcao</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-zinc-500">enfermagem</p>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-zinc-400 mt-8 uppercase tracking-widest">
            Gestão Oftalmológica • 2026
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 relative`}>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 bg-white border border-zinc-200 rounded-full p-1 shadow-sm hover:bg-zinc-50 z-20"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 border-b border-zinc-100 ${isSidebarCollapsed ? 'items-center px-2' : ''} flex flex-col`}>
          <h1 className={`${isSidebarCollapsed ? 'text-xs' : 'text-xl'} font-bold text-blue-900 tracking-tight transition-all`}>
            {isSidebarCollapsed ? 'CT' : 'CLÍNICA TAYAH'}
          </h1>
          {!isSidebarCollapsed && <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Gestão Oftalmológica</p>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            active={activeTab === 'appointments'} 
            onClick={() => setActiveTab('appointments')}
            icon={<Calendar size={20} />}
            label="Agenda"
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem 
            active={activeTab === 'patients'} 
            onClick={() => setActiveTab('patients')}
            icon={<Users size={20} />}
            label="Pacientes"
            isCollapsed={isSidebarCollapsed}
          />
          <NavItem 
            active={activeTab === 'doctors'} 
            onClick={() => setActiveTab('doctors')}
            icon={<Stethoscope size={20} />}
            label="Médicos"
            isCollapsed={isSidebarCollapsed}
          />
          <button 
            onClick={() => setActiveTab('new-appointment')}
            className={`w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 ${isSidebarCollapsed ? 'px-0' : ''}`}
          >
            <Plus size={20} />
            {!isSidebarCollapsed && <span className="font-semibold text-sm">Novo Agendamento</span>}
          </button>
        </nav>

        <div className={`p-4 border-t border-zinc-100 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 p-3 bg-zinc-50 rounded-xl ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <UserIcon size={20} />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{currentUser.role}</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setCurrentUser(null)}
                className="text-zinc-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
          
          {/* Role Switcher removed */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-800">
              {activeTab === 'appointments' && 'Agenda Médica'}
              {activeTab === 'patients' && 'Cadastro de Pacientes'}
              {activeTab === 'doctors' && 'Corpo Clínico'}
              {activeTab === 'new-appointment' && 'Novo Agendamento'}
            </h2>
            <p className="text-sm text-zinc-500">Bem-vindo ao sistema da Clínica de Olhos Dr. David Tayah</p>
          </div>
          
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar paciente ou CPF..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'appointments' && (
            <motion.div 
              key="appointments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Calendar Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    Calendário
                  </h3>
                  <MiniCalendar 
                    selectedDate={selectedDate} 
                    onDateSelect={setSelectedDate} 
                    appointments={appointments}
                  />
                </div>

                <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
                    {selectedDoctorTab === 'all' ? 'Todos os Médicos' : doctors.find(d => d.id === selectedDoctorTab)?.name}
                  </p>
                  <p className="text-xl font-bold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <p className="text-xs font-medium">{filteredAppointments.length} agendamentos</p>
                  </div>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="lg:col-span-3 space-y-6">
                {/* Doctor Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedDoctorTab('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedDoctorTab === 'all' 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    Todos
                  </button>
                  {doctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctorTab(doctor.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedDoctorTab === doctor.id 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {doctor.name}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Lista de Pacientes</h3>
                    <button 
                      onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                      className="text-[10px] font-bold text-blue-600 uppercase hover:underline"
                    >
                      Ir para hoje
                    </button>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Hora</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Paciente</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Telefone</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Procedimento</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Recepcionista</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Hora cheg.</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Espera</th>
                        <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map(appt => {
                            const patient = patients.find(p => p.id === appt.patientId);
                            
                            const getStatusColor = (status: string) => {
                              switch(status) {
                                case 'Confirmado': return 'bg-emerald-500';
                                case 'Aguardando': return 'bg-blue-500';
                                case 'Atendido': return 'bg-purple-500';
                                case 'Não compareceu': return 'bg-red-500';
                                case 'Paciente cancelou': return 'bg-orange-500';
                                case 'Sem cadastro': return 'bg-zinc-300';
                                case 'Cadast.incompleto': return 'bg-amber-400';
                                case 'Horário bloqueado': return 'bg-zinc-900';
                                default: return 'bg-zinc-200';
                              }
                            };

                            return (
                              <tr 
                                key={appt.id} 
                                className={`hover:bg-zinc-50/50 transition-colors group cursor-pointer ${selectedAgendaApptId === appt.id ? 'bg-blue-50/50' : ''}`}
                                onClick={() => setSelectedAgendaApptId(appt.id === selectedAgendaApptId ? null : appt.id)}
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(appt.status)}`} />
                                    <p className="text-sm font-bold text-blue-600">{appt.time}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="font-bold text-sm uppercase">{patient?.name}</p>
                                  <p className="text-[10px] text-zinc-400">{patient?.cpf}</p>
                                </td>
                                <td className="p-4 text-sm text-zinc-600">
                                  {patient?.phone || patient?.phoneResidencial || '-'}
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase">
                                    {appt.category}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <p className="text-xs font-medium uppercase">{appt.procedureName || '-'}</p>
                                  <p className="text-[9px] text-zinc-400">{appt.procedureCode}</p>
                                </td>
                                <td className="p-4 text-xs text-zinc-500 uppercase">
                                  {appt.receptionist || 'LOURIVANIA'}
                                </td>
                                <td className="p-4 text-xs text-zinc-500">
                                  {appt.arrivalTime || '-'}
                                </td>
                                <td className="p-4 text-xs text-zinc-500">
                                  {appt.wait || '-'}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAppointment(appt);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 text-[10px] font-bold text-left uppercase"
                                    >
                                      Detalhes
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingAppointment(appt);
                                        setProcedureSearch(appt.procedureCode ? `${appt.procedureCode} - ${appt.procedureName}` : '');
                                      }}
                                      className="text-zinc-600 hover:text-zinc-800 text-[10px] font-bold text-left uppercase"
                                    >
                                      Alterar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={9} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-zinc-400">
                              <Calendar size={40} strokeWidth={1} />
                              <p className="text-sm font-medium">Nenhum agendamento para esta data.</p>
                              <button 
                                onClick={() => setActiveTab('new-appointment')}
                                className="mt-2 text-blue-600 text-xs font-bold hover:underline"
                              >
                                Criar novo agendamento
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <AnimatePresence>
                  {selectedAgendaApptId && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText size={16} className="text-blue-600" />
                          <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">
                            Observações do Agendamento
                          </h4>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                          <p className="text-xs text-zinc-600 leading-relaxed italic">
                            {appointments.find(a => a.id === selectedAgendaApptId)?.obsAgenda || 'Nenhuma observação registrada para este agendamento.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Indicators (Legend) */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Confirmado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Aguardando</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Atendido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Não compareceu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Paciente cancelou</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-300" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Sem cadastro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Cadast.incompleto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-900" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Horário bloqueado</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'patients' && (
            <motion.div 
              key="patients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Lista de Pacientes
                </h3>
                <button 
                  onClick={() => setIsAddingPatient(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Plus size={18} />
                  Novo Paciente
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Nome</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">CPF</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Cartão SUS</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {patients.map(p => (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-zinc-50/50 transition-colors cursor-pointer ${selectedPatientId === p.id ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setSelectedPatientId(p.id === selectedPatientId ? null : p.id)}
                      >
                        <td className="p-4 font-bold text-xs">{p.name.toUpperCase()}</td>
                        <td className="p-4 text-xs text-zinc-600">{p.cpf}</td>
                        <td className="p-4 text-xs text-zinc-600">{p.susCard || '-'}</td>
                        <td className="p-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPatient(p);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-[10px] font-bold"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AnimatePresence>
                {selectedPatientId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                      <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14} className="text-blue-600" />
                        Histórico de Observações
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointments.filter(a => a.patientId === selectedPatientId).length > 0 ? (
                          appointments
                            .filter(a => a.patientId === selectedPatientId)
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .map(a => (
                              <div key={a.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase">
                                      {new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {a.time}
                                    </span>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                                      {doctors.find(d => d.id === a.doctorId)?.name}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase">
                                    {a.type}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-600 italic leading-relaxed">
                                  {a.obsAgenda || 'Nenhuma observação registrada.'}
                                </p>
                              </div>
                            ))
                        ) : (
                          <div className="col-span-full py-8 text-center bg-white rounded-xl border border-dashed border-zinc-200">
                            <p className="text-xs text-zinc-400 italic">Nenhum agendamento encontrado para este paciente.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'doctors' && (
            <motion.div 
              key="doctors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Plus size={20} className="text-blue-600" />
                  Cadastrar Médico
                </h3>
                <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome do Médico</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">CRM</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      value={newDoctor.crm}
                      onChange={(e) => setNewDoctor({...newDoctor, crm: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Especialidade</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                      value={newDoctor.specialty}
                      onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">CPF</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      value={newDoctor.cpf || ''}
                      onChange={(e) => setNewDoctor({...newDoctor, cpf: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Telefone</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      value={newDoctor.phone || ''}
                      onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none lowercase"
                      value={newDoctor.email || ''}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
                      Cadastrar Médico
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Nome</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">CRM</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Especialidade</th>
                      <th className="p-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {doctors.map(d => (
                      <tr key={d.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 font-bold text-sm">{d.name}</td>
                        <td className="p-4 text-sm text-zinc-600">{d.crm}</td>
                        <td className="p-4 text-sm text-zinc-600">{d.specialty}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => setEditingDoctor(d)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'new-appointment' && (
            <motion.div 
              key="new-appointment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
                <form onSubmit={handleAddAppointment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-1 relative">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Paciente</label>
                      <div className="relative">
                        <input 
                          required
                          type="text"
                          placeholder="Pesquisar por nome ou CPF..."
                          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          value={patientSearch}
                          onChange={(e) => {
                            setPatientSearch(e.target.value);
                            setShowPatientResults(true);
                            if (e.target.value === '') {
                              setNewAppt({...newAppt, patientId: ''});
                            }
                          }}
                          onFocus={() => setShowPatientResults(true)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      </div>
                      
                      <AnimatePresence>
                        {showPatientResults && patientSearch && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                          >
                            {patients
                              .filter(p => 
                                p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
                                p.cpf.includes(patientSearch)
                              )
                              .map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className="w-full text-left p-3 hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors"
                                  onClick={() => {
                                    setNewAppt({...newAppt, patientId: p.id});
                                    setPatientSearch(p.name.toUpperCase());
                                    setShowPatientResults(false);
                                  }}
                                >
                                  <div className="font-bold text-sm">{p.name.toUpperCase()}</div>
                                  <div className="text-[10px] text-zinc-500">CPF: {p.cpf} | ID: {p.id}</div>
                                </button>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Médico Oftalmologista</label>
                      <select 
                        required
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={newAppt.doctorId}
                        onChange={(e) => setNewAppt({...newAppt, doctorId: e.target.value})}
                      >
                        <option value="">Selecione um médico...</option>
                        {doctors.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Data</label>
                      <input 
                        required
                        type="date" 
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={newAppt.date}
                        onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Horário</label>
                      <input 
                        required
                        type="time" 
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={newAppt.time}
                        onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Categoria / Convênio</label>
                      <select 
                        required
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={newAppt.category}
                        onChange={(e) => setNewAppt({...newAppt, category: e.target.value as Category})}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Tipo de Atendimento</label>
                      <select 
                        required
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={newAppt.type}
                        onChange={(e) => setNewAppt({...newAppt, type: e.target.value as AppointmentType})}
                      >
                        {APPOINTMENT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 space-y-1 relative">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Procedimento (Código ou Nome)</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Digite o código (ex: 112) ou nome do procedimento..."
                          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          value={procedureSearch || (newAppt.procedureCode ? `${newAppt.procedureCode} - ${newAppt.procedureName}` : '')}
                          onChange={(e) => {
                            setProcedureSearch(e.target.value);
                            setShowProcedureResults(true);
                            if (e.target.value === '') {
                              setNewAppt({...newAppt, procedureCode: '', procedureName: ''});
                            }
                          }}
                          onFocus={() => setShowProcedureResults(true)}
                        />
                        {showProcedureResults && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {PROCEDURES.filter(p => 
                              !procedureSearch || 
                              p.code.includes(procedureSearch) || 
                              p.name.toLowerCase().includes(procedureSearch.toLowerCase())
                            ).map(p => (
                              <button
                                key={p.code + p.name}
                                type="button"
                                className="w-full text-left p-3 hover:bg-zinc-50 text-sm border-b border-zinc-100 last:border-0"
                                onClick={() => {
                                  setNewAppt({
                                    ...newAppt, 
                                    procedureCode: p.code, 
                                    procedureName: p.name
                                  });
                                  setProcedureSearch(`${p.code} - ${p.name}`);
                                  setShowProcedureResults(false);
                                }}
                              >
                                <span className="font-bold text-blue-600 mr-2">{p.code}</span>
                                {p.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Recepcionista</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                        value={newAppt.receptionist || 'LOURIVANIA'}
                        onChange={(e) => setNewAppt({...newAppt, receptionist: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status Inicial</label>
                      <select 
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={newAppt.status}
                        onChange={(e) => setNewAppt({...newAppt, status: e.target.value as Appointment['status']})}
                      >
                        <option value="Aguardando">Aguardando</option>
                        <option value="Confirmado">Confirmado</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Observações Agenda</label>
                    <textarea 
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none h-24 resize-none"
                      value={newAppt.obsAgenda}
                      onChange={(e) => setNewAppt({...newAppt, obsAgenda: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                    <button 
                      type="button" 
                      onClick={() => {
                        setActiveTab('agenda');
                        setNewAppt({
                          patientId: '',
                          doctorId: '',
                          date: new Date().toISOString().split('T')[0],
                          time: '',
                          status: 'Aguardando',
                          type: 'Consulta',
                          category: 'Particular'
                        });
                        setProcedureSearch('');
                      }}
                      className="px-6 py-3 rounded-xl font-bold text-sm text-zinc-500 hover:bg-zinc-100 transition-all"
                    >
                      Sair
                    </button>
                    <button 
                      type="submit" 
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      Gravar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-blue-900 text-white">
                <div>
                  <h3 className="text-lg font-bold">Detalhes do Agendamento</h3>
                  <p className="text-[10px] opacity-70 uppercase tracking-widest">Protocolo: {selectedAppointment.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Informações do Paciente</h4>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <p className="font-bold text-sm">{patients.find(p => p.id === selectedAppointment.patientId)?.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">CPF: {patients.find(p => p.id === selectedAppointment.patientId)?.cpf}</p>
                      <p className="text-xs text-zinc-500">SUS: {patients.find(p => p.id === selectedAppointment.patientId)?.susCard || 'Não informado'}</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Dados da Consulta</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Data</p>
                        <p className="text-sm font-bold">{new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Hora</p>
                        <p className="text-sm font-bold">{selectedAppointment.time}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Médico e Atendimento</h4>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <p className="font-bold text-sm">{doctors.find(d => d.id === selectedAppointment.doctorId)?.name}</p>
                      <p className="text-xs text-blue-600 font-bold mt-1">{selectedAppointment.type}</p>
                      {selectedAppointment.procedureCode && (
                        <p className="text-xs font-medium mt-1">
                          <span className="text-blue-600 font-bold">{selectedAppointment.procedureCode}</span> - {selectedAppointment.procedureName}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">{selectedAppointment.category}</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Observações</h4>
                    <div className="space-y-3">
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Agenda</p>
                        <p className="text-xs italic text-zinc-600">{selectedAppointment.obsAgenda || 'Sem observações'}</p>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase">Tratamento/Cirurgia</p>
                        <p className="text-xs italic text-zinc-600">{selectedAppointment.obsTratamento || 'Sem observações'}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:bg-zinc-200 rounded-xl text-sm font-bold transition-all"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Patient Modal */}
      <AnimatePresence>
        {isAddingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-blue-900 text-white">
                <h3 className="text-lg font-bold">Pacientes - Inclusão</h3>
                <button onClick={() => setIsAddingPatient(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPatient} className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Entrada</label>
                      <input 
                        type="date" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.entryDate || ''}
                        onChange={(e) => setNewPatient({...newPatient, entryDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Pessoa</label>
                      <div className="flex gap-4 p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input 
                            type="radio" 
                            name="newPersonType" 
                            checked={newPatient.personType === 'Física'} 
                            onChange={() => setNewPatient({...newPatient, personType: 'Física'})}
                          />
                          Física
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input 
                            type="radio" 
                            name="newPersonType" 
                            checked={newPatient.personType === 'Jurídica'} 
                            onChange={() => setNewPatient({...newPatient, personType: 'Jurídica'})}
                          />
                          Jurídica
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome Completo</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Nascimento</label>
                      <input 
                        type="date" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.birthDate || ''}
                        onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Estado Civil</label>
                      <select 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.maritalStatus || ''}
                        onChange={(e) => setNewPatient({...newPatient, maritalStatus: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Sexo</label>
                      <select 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.sex || ''}
                        onChange={(e) => setNewPatient({...newPatient, sex: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Raça / Cor</label>
                      <select 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.race || ''}
                        onChange={(e) => setNewPatient({...newPatient, race: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Branca">Branca</option>
                        <option value="Preta">Preta</option>
                        <option value="Parda">Parda</option>
                        <option value="Amarela">Amarela</option>
                        <option value="Indígena">Indígena</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Naturalidade</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                        value={newPatient.naturality || ''}
                        onChange={(e) => setNewPatient({...newPatient, naturality: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Nacionalidade</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                        value={newPatient.nationality || 'BRASILEIRA'}
                        onChange={(e) => setNewPatient({...newPatient, nationality: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">CPF</label>
                      <input 
                        required
                        type="text" 
                        className={`w-full p-2 bg-zinc-50 border ${cpfError ? 'border-red-500' : 'border-zinc-200'} rounded-lg text-sm`}
                        value={newPatient.cpf}
                        onChange={(e) => {
                          setNewPatient({...newPatient, cpf: formatCPF(e.target.value)});
                          if (cpfError) setCpfError(null);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">RG</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.rg || ''}
                        onChange={(e) => setNewPatient({...newPatient, rg: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Profissão</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                        value={newPatient.profession || ''}
                        onChange={(e) => setNewPatient({...newPatient, profession: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Local de Trabalho</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                        value={newPatient.workplace || ''}
                        onChange={(e) => setNewPatient({...newPatient, workplace: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Celular (1)</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.phone || ''}
                        onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Celular (2)</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.phone2 || ''}
                        onChange={(e) => setNewPatient({...newPatient, phone2: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Fone Residencial</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.phoneResidencial || ''}
                        onChange={(e) => setNewPatient({...newPatient, phoneResidencial: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Fone Comercial</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                        value={newPatient.phoneComercial || ''}
                        onChange={(e) => setNewPatient({...newPatient, phoneComercial: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">E-Mail</label>
                    <input 
                      type="email" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm lowercase"
                      value={newPatient.email || ''}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase border-b border-zinc-200 pb-2">Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Logradouro</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                          value={newPatient.address?.street || ''}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), street: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Número</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm"
                          value={newPatient.address?.number || ''}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), number: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">CEP</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm"
                          value={newPatient.address?.cep || ''}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), cep: e.target.value}})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Bairro</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                          value={newPatient.address?.neighborhood || ''}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), neighborhood: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Cidade</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                          value={newPatient.address?.city || 'MANAUS'}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), city: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">UF</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                          value={newPatient.address?.uf || 'AM'}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), uf: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Complemento</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                          value={newPatient.address?.complement || ''}
                          onChange={(e) => setNewPatient({...newPatient, address: {...(newPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), complement: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Referência</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                      value={newPatient.reference || ''}
                      onChange={(e) => setNewPatient({...newPatient, reference: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-100">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingPatient(false)}
                    className="px-6 py-2 text-zinc-500 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-all"
                  >
                    Sair
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Gravar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Patient Modal */}
      <AnimatePresence>
        {editingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-blue-900 text-white">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold">Pacientes - Alteração | {editingPatient.id}</h3>
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-[10px] font-bold">
                    <span>Estrelas:</span>
                    <span className="text-yellow-400">{editingPatient.stars?.toFixed(2) || '0,00'}</span>
                  </div>
                </div>
                <button onClick={() => setEditingPatient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-2 bg-zinc-100 border-b border-zinc-200 overflow-x-auto">
                {[
                  { id: 'principal', label: 'Principal' },
                  { id: 'complemento', label: 'Complemento' },
                  { id: 'antecedentes', label: 'Antecedentes' },
                  { id: 'historico', label: 'Histórico' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPatientEditTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      patientEditTab === tab.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleUpdatePatient} className="flex-1 overflow-y-auto p-6 min-h-0">
                {patientEditTab === 'principal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Código</label>
                        <input disabled value={editingPatient.id} className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Entrada</label>
                        <input 
                          type="date" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.entryDate || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, entryDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Pessoa</label>
                        <div className="flex gap-4 p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                            <input 
                              type="radio" 
                              name="personType" 
                              checked={editingPatient.personType === 'Física'} 
                              onChange={() => setEditingPatient({...editingPatient, personType: 'Física'})}
                            />
                            Física
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                            <input 
                              type="radio" 
                              name="personType" 
                              checked={editingPatient.personType === 'Jurídica'} 
                              onChange={() => setEditingPatient({...editingPatient, personType: 'Jurídica'})}
                            />
                            Jurídica
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome Completo</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                        value={editingPatient.name}
                        onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Nascimento</label>
                        <input 
                          type="date" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.birthDate || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, birthDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Estado Civil</label>
                        <select 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.maritalStatus || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, maritalStatus: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          <option value="Solteiro(a)">Solteiro(a)</option>
                          <option value="Casado(a)">Casado(a)</option>
                          <option value="Divorciado(a)">Divorciado(a)</option>
                          <option value="Viúvo(a)">Viúvo(a)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Sexo</label>
                        <select 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.sex || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, sex: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Raça / Cor</label>
                        <select 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.race || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, race: e.target.value})}
                        >
                          <option value="">Selecione...</option>
                          <option value="Branca">Branca</option>
                          <option value="Preta">Preta</option>
                          <option value="Parda">Parda</option>
                          <option value="Amarela">Amarela</option>
                          <option value="Indígena">Indígena</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Naturalidade</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                          value={editingPatient.naturality || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, naturality: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Nacionalidade</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                          value={editingPatient.nationality || 'BRASILEIRA'}
                          onChange={(e) => setEditingPatient({...editingPatient, nationality: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">CPF</label>
                        <input 
                          required
                          type="text" 
                          className={`w-full p-2 bg-zinc-50 border ${cpfError ? 'border-red-500' : 'border-zinc-200'} rounded-lg text-sm`}
                          value={editingPatient.cpf}
                          onChange={(e) => {
                            setEditingPatient({...editingPatient, cpf: formatCPF(e.target.value)});
                            if (cpfError) setCpfError(null);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">RG</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.rg || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, rg: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Profissão</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                          value={editingPatient.profession || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, profession: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Local de Trabalho</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                          value={editingPatient.workplace || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, workplace: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Celular (1)</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.phone || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Celular (2)</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.phone2 || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, phone2: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Fone Residencial</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.phoneResidencial || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, phoneResidencial: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Fone Comercial</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                          value={editingPatient.phoneComercial || ''}
                          onChange={(e) => setEditingPatient({...editingPatient, phoneComercial: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">E-Mail</label>
                      <input 
                        type="email" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm lowercase"
                        value={editingPatient.email || ''}
                        onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase border-b border-zinc-200 pb-2">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Logradouro</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                            value={editingPatient.address?.street || ''}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), street: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Número</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm"
                            value={editingPatient.address?.number || ''}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), number: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">CEP</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm"
                            value={editingPatient.address?.cep || ''}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), cep: e.target.value}})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Bairro</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                            value={editingPatient.address?.neighborhood || ''}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), neighborhood: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Cidade</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                            value={editingPatient.address?.city || 'MANAUS'}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), city: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">UF</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                            value={editingPatient.address?.uf || 'AM'}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), uf: e.target.value}})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Complemento</label>
                          <input 
                            type="text" 
                            className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-sm uppercase"
                            value={editingPatient.address?.complement || ''}
                            onChange={(e) => setEditingPatient({...editingPatient, address: {...(editingPatient.address || { street: '', number: '', complement: '', neighborhood: '', city: 'MANAUS', uf: 'AM', cep: '', ibgeCode: '' }), complement: e.target.value}})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Referência</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm uppercase"
                        value={editingPatient.reference || ''}
                        onChange={(e) => setEditingPatient({...editingPatient, reference: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {patientEditTab !== 'principal' && (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                    <p className="text-sm font-medium">Esta aba ({patientEditTab}) está em desenvolvimento.</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingPatient(null)}
                    className="px-6 py-2 text-zinc-500 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-all"
                  >
                    Sair
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Gravar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Doctor Modal */}
      <AnimatePresence>
        {editingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-blue-900 text-white">
                <h3 className="text-lg font-bold">Editar Médico</h3>
                <button onClick={() => setEditingDoctor(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateDoctor} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome do Médico</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                      value={editingDoctor.name}
                      onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">CRM</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      value={editingDoctor.crm}
                      onChange={(e) => setEditingDoctor({...editingDoctor, crm: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Especialidade</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase"
                      value={editingDoctor.specialty}
                      onChange={(e) => setEditingDoctor({...editingDoctor, specialty: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">CPF</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      value={editingDoctor.cpf || ''}
                      onChange={(e) => setEditingDoctor({...editingDoctor, cpf: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Telefone</label>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      value={editingDoctor.phone || ''}
                      onChange={(e) => setEditingDoctor({...editingDoctor, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none lowercase"
                      value={editingDoctor.email || ''}
                      onChange={(e) => setEditingDoctor({...editingDoctor, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingDoctor(null)}
                    className="px-6 py-2 text-zinc-500 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-all"
                  >
                    Sair
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Gravar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Appointment Modal */}
      <AnimatePresence>
        {editingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-blue-900 text-white">
                <h3 className="text-lg font-bold">Agendamentos - Alteração | {editingAppointment.id}</h3>
                <button onClick={() => setEditingAppointment(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateAppointment} className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-1 relative">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Cliente</label>
                    <div className="relative">
                      <input 
                        required
                        type="text"
                        placeholder="Pesquisar por nome ou CPF..."
                        className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientResults(true);
                          if (e.target.value === '') {
                            setEditingAppointment({...editingAppointment, patientId: ''});
                          }
                        }}
                        onFocus={() => setShowPatientResults(true)}
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    </div>
                    
                    <AnimatePresence>
                      {showPatientResults && patientSearch && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                        >
                          {patients
                            .filter(p => 
                              p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
                              p.cpf.includes(patientSearch)
                            )
                            .map(p => (
                              <button
                                key={p.id}
                                type="button"
                                className="w-full text-left p-3 hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors"
                                onClick={() => {
                                  setEditingAppointment({...editingAppointment, patientId: p.id});
                                  setPatientSearch(p.name.toUpperCase());
                                  setShowPatientResults(false);
                                }}
                              >
                                <div className="font-bold text-sm text-zinc-900">{p.name.toUpperCase()}</div>
                                <div className="text-[10px] text-zinc-500">CPF: {p.cpf} | ID: {p.id}</div>
                              </button>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Controle</label>
                    <input disabled value={editingAppointment.id.toString().padStart(6, '0')} className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm font-mono" />
                  </div>
                </div>

                {(() => {
                  const patient = patients.find(p => p.id === editingAppointment.patientId);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Celular</label>
                        <input disabled value={patient?.phone || ''} className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Fone Residencial</label>
                        <input disabled value={patient?.phoneResidencial || ''} className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Fone Comercial</label>
                        <input disabled value={patient?.phoneComercial || ''} className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg text-sm" />
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Categoria / Convênio</label>
                    <select 
                      required
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                      value={editingAppointment.category}
                      onChange={(e) => setEditingAppointment({...editingAppointment, category: e.target.value as Category})}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Tipo de Atendimento</label>
                    <select 
                      required
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                      value={editingAppointment.type}
                      onChange={(e) => setEditingAppointment({...editingAppointment, type: e.target.value as AppointmentType})}
                    >
                      {APPOINTMENT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase">Data</th>
                        <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase">Hora</th>
                        <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase">Procedimento</th>
                        <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase">Médico</th>
                        <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase">Valor</th>
                        <th className="p-2 text-[10px] font-bold text-zinc-500 uppercase">Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-100">
                        <td className="p-2">
                          <input 
                            type="date" 
                            className="w-full p-1 text-xs border border-zinc-200 rounded"
                            value={editingAppointment.date}
                            onChange={(e) => setEditingAppointment({...editingAppointment, date: e.target.value})}
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            type="time" 
                            className="w-full p-1 text-xs border border-zinc-200 rounded"
                            value={editingAppointment.time}
                            onChange={(e) => setEditingAppointment({...editingAppointment, time: e.target.value})}
                          />
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Cód/Nome..."
                              className="w-full p-1 text-xs border border-zinc-200 rounded"
                              value={procedureSearch || (editingAppointment.procedureCode ? `${editingAppointment.procedureCode} - ${editingAppointment.procedureName}` : '')}
                              onChange={(e) => {
                                setProcedureSearch(e.target.value);
                                setShowProcedureResults(true);
                              }}
                              onFocus={() => setShowProcedureResults(true)}
                            />
                            {showProcedureResults && (
                              <div className="absolute z-20 w-64 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                                {PROCEDURES.filter(p => 
                                  !procedureSearch ||
                                  p.code.includes(procedureSearch) || 
                                  p.name.toLowerCase().includes(procedureSearch.toLowerCase())
                                ).map(p => (
                                  <button
                                    key={p.code}
                                    type="button"
                                    className="w-full text-left p-2 hover:bg-zinc-50 text-[10px] border-b border-zinc-100 last:border-0"
                                    onClick={() => {
                                      setEditingAppointment({
                                        ...editingAppointment, 
                                        procedureCode: p.code, 
                                        procedureName: p.name
                                      });
                                      setProcedureSearch(`${p.code} - ${p.name}`);
                                      setShowProcedureResults(false);
                                    }}
                                  >
                                    <span className="font-bold text-blue-600 mr-1">{p.code}</span>
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <select 
                            className="w-full p-1 text-xs border border-zinc-200 rounded"
                            value={editingAppointment.doctorId}
                            onChange={(e) => setEditingAppointment({...editingAppointment, doctorId: e.target.value})}
                          >
                            {doctors.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="text" className="w-full p-1 text-xs border border-zinc-200 rounded text-right" placeholder="0,00" />
                        </td>
                        <td className="p-2">
                          <select 
                            className="w-full p-1 text-xs border border-zinc-200 rounded"
                            value={editingAppointment.status}
                            onChange={(e) => setEditingAppointment({...editingAppointment, status: e.target.value as AppointmentStatus})}
                          >
                            <option value="Confirmado">Confirmado</option>
                            <option value="Aguardando">Aguardando</option>
                            <option value="Atendido">Atendido</option>
                            <option value="Não compareceu">Não compareceu</option>
                            <option value="Paciente cancelou">Paciente cancelou</option>
                            <option value="Sem cadastro">Sem cadastro</option>
                            <option value="Cadast.incompleto">Cadast.incompleto</option>
                            <option value="Horário bloqueado">Horário bloqueado</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Observações Agenda</label>
                    <textarea 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm h-24 resize-none"
                      value={editingAppointment.obsAgenda || ''}
                      onChange={(e) => setEditingAppointment({...editingAppointment, obsAgenda: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Observações Tratamento</label>
                    <textarea 
                      className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm h-24 resize-none"
                      value={editingAppointment.obsTratamento || ''}
                      onChange={(e) => setEditingAppointment({...editingAppointment, obsTratamento: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingAppointment(null)}
                    className="px-6 py-2 text-zinc-500 hover:bg-zinc-100 rounded-xl text-sm font-bold transition-all"
                  >
                    Sair
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Gravar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, isCollapsed }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isCollapsed?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-600 font-bold' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'} ${isCollapsed ? 'justify-center px-0' : ''}`}
      title={isCollapsed ? label : ''}
    >
      {icon}
      {!isCollapsed && <span className="text-sm">{label}</span>}
      {active && !isCollapsed && <motion.div layoutId="active-nav" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
    </button>
  );
}

function MiniCalendar({ selectedDate, onDateSelect, appointments }: { selectedDate: string, onDateSelect: (date: string) => void, appointments: Appointment[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate + 'T00:00:00'));
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day: number) => {
    const date = new Date(selectedDate + 'T00:00:00');
    return date.getDate() === day && date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  const hasAppointments = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.some(a => a.date === dateStr);
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase text-zinc-500">
          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
          <span key={d} className="text-[8px] font-bold text-zinc-300">{d}</span>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {padding.map(i => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const active = isSelected(day);
          const today = isToday(day);
          const hasAppts = hasAppointments(day);

          return (
            <button
              key={day}
              onClick={() => onDateSelect(dateStr)}
              className={`
                relative h-7 w-7 flex items-center justify-center rounded-lg text-[10px] font-medium transition-all
                ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'hover:bg-zinc-100 text-zinc-600'}
                ${today && !active ? 'text-blue-600 font-bold ring-1 ring-blue-100' : ''}
              `}
            >
              {day}
              {hasAppts && !active && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

