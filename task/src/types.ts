export type Procedure = {
  code: string;
  name: string;
};

export type Doctor = {
  id: string;
  name: string;
  crm: string;
  specialty: string;
  cpf?: string;
  phone?: string;
  email?: string;
};

export type Category = 'SUS' | 'PARTICULAR' | 'UNIMED' | 'D\'SOCIAL' | 'WALDEMIRO LUSTOZA (WPL)' | 'WAIMIRI ATROARI';

export type AppointmentType = 'CONSULTA' | 'RETORNO' | 'TRATAMENTO' | 'AVALIAÇÃO';

export type Patient = {
  id: string;
  name: string;
  cpf: string;
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
  phoneResidencial?: string;
  phoneComercial?: string;
  email?: string;
  address?: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    cep: string;
    city: string;
    uf: string;
    ibgeCode: string;
  };
  reference?: string;
  stars?: number;
  entryDate?: string;
  personType?: 'Física' | 'Jurídica';
};

export type AppointmentStatus = 
  | 'Confirmado' 
  | 'Aguardando' 
  | 'Atendido' 
  | 'Não compareceu' 
  | 'Paciente cancelou' 
  | 'Sem cadastro' 
  | 'Cadast.incompleto' 
  | 'Horário bloqueado';

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  category: Category;
  type: AppointmentType;
  procedureCode?: string;
  procedureName?: string;
  value: number;
  status: AppointmentStatus;
  obsAgenda: string;
  obsTratamento: string;
  isRegistered: boolean;
  receptionist?: string;
  arrivalTime?: string;
  wait?: string;
};

export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';

export type User = {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
};
