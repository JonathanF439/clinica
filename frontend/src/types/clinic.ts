export type UserRole = 'ADMIN' | 'MEDICO' | 'RECEPCIONISTA' | 'ENFERMAGEM';

export type Category =
  | 'SUS'
  | 'PARTICULAR'
  | 'UNIMED'
  | "D'SOCIAL"
  | 'WALDEMIRO LUSTOZA (WPL)'
  | 'WAIMIRI ATROARI';

export type AppointmentType = 'CONSULTA' | 'RETORNO' | 'TRATAMENTO' | 'AVALIAÇÃO';

export type AppointmentStatus =
  | 'Confirmado'
  | 'Aguardando'
  | 'Atendido'
  | 'Não compareceu'
  | 'Paciente cancelou'
  | 'Sem cadastro'
  | 'Cadast.incompleto'
  | 'Horário bloqueado';

export interface Procedure {
  id: string;
  code: string;
  name: string;
  isCirurgia?: boolean;
}

export interface AppointmentStatusConfig {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  crm?: string;
  specialty?: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf?: string;
  cadastroIncompleto?: boolean;
  susCard?: string;
  birthDate?: string;
  maritalStatus?: string;
  sex?: string;
  race?: string;
  naturality?: string;
  nationality?: string;
  rg?: string;
  profession?: string;
  workplace?: string;
  phone?: string;
  phone2?: string;
  phoneResidencial?: string;
  phoneComercial?: string;
  email?: string;
  addrStreet?: string;
  addrNumber?: string;
  addrComplement?: string;
  addrNeighborhood?: string;
  addrCep?: string;
  addrCity?: string;
  addrUf?: string;
  addrIbgeCode?: string;
  reference?: string;
  stars?: number;
  entryDate?: string;
  personType?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  category: string;
  type: string;
  procedureCode?: string;
  procedureName?: string;
  value: number;
  status: string;
  obsAgenda?: string;
  obsTratamento?: string;
  isRegistered: boolean;
  isActive?: boolean;
  callOrder?: number;
  receptionist?: string;
  arrivalTime?: string;
  wait?: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface User {
  id: string;
  name: string;
  login: string;
  role: UserRole;
  createdAt?: string;
}

export interface Permission {
  id: string;
  role: UserRole;
  resource: string;
  action: string;
  allowed: boolean;
}

export interface CreateUserPayload {
  name: string;
  login: string;
  password: string;
  role: 'RECEPCIONISTA' | 'ENFERMAGEM';
}
