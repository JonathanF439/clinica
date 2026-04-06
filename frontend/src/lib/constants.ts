export const CATEGORIES: string[] = [
  'SUS',
  'PARTICULAR',
  'UNIMED',
  "D'SOCIAL",
  'WALDEMIRO LUSTOZA (WPL)',
  'WAIMIRI ATROARI',
  'CORTESIA',
];

export const APPOINTMENT_TYPES: string[] = [
  'CONSULTA',
  'RETORNO',
  'TRATAMENTO',
  'AVALIAÇÃO',
  'CIRURGIA',
];

export const APPOINTMENT_STATUSES: string[] = [
  'Confirmado',
  'Aguardando',
  'Atendido',
  'Não compareceu',
  'Paciente cancelou',
  'Sem cadastro',
  'Cadast.incompleto',
  'Horário bloqueado',
];

export const STATUS_COLORS: Record<string, string> = {
  Confirmado: 'bg-emerald-500',
  Aguardando: 'bg-blue-500',
  Atendido: 'bg-purple-500',
  'Não compareceu': 'bg-red-500',
  'Paciente cancelou': 'bg-orange-500',
  'Sem cadastro': 'bg-zinc-300',
  'Cadast.incompleto': 'bg-amber-400',
  'Horário bloqueado': 'bg-zinc-900',
};

export const STATUS_TEXT_COLORS: Record<string, string> = {
  Confirmado: 'text-emerald-700 bg-emerald-50',
  Aguardando: 'text-blue-700 bg-blue-50',
  Atendido: 'text-purple-700 bg-purple-50',
  'Não compareceu': 'text-red-700 bg-red-50',
  'Paciente cancelou': 'text-orange-700 bg-orange-50',
  'Sem cadastro': 'text-zinc-600 bg-zinc-100',
  'Cadast.incompleto': 'text-amber-700 bg-amber-50',
  'Horário bloqueado': 'text-zinc-100 bg-zinc-800',
};

export const MARITAL_STATUS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável',
];

export const SEX_OPTIONS = ['Masculino', 'Feminino', 'Outro'];

export const RACE_OPTIONS = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'];
