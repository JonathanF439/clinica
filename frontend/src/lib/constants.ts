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
  'EXAME',
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

export const COLOR_OPTIONS = [
  { key: 'emerald', label: 'Verde',       bg: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50' },
  { key: 'blue',    label: 'Azul',        bg: 'bg-blue-500',    badge: 'text-blue-700 bg-blue-50'       },
  { key: 'purple',  label: 'Roxo',        bg: 'bg-purple-500',  badge: 'text-purple-700 bg-purple-50'   },
  { key: 'red',     label: 'Vermelho',    bg: 'bg-red-500',     badge: 'text-red-700 bg-red-50'         },
  { key: 'orange',  label: 'Laranja',     bg: 'bg-orange-500',  badge: 'text-orange-700 bg-orange-50'   },
  { key: 'amber',   label: 'Âmbar',       bg: 'bg-amber-400',   badge: 'text-amber-700 bg-amber-50'     },
  { key: 'zinc',    label: 'Cinza',       bg: 'bg-zinc-300',    badge: 'text-zinc-600 bg-zinc-100'      },
  { key: 'dark',    label: 'Escuro',      bg: 'bg-zinc-900',    badge: 'text-zinc-100 bg-zinc-800'      },
  { key: 'sky',     label: 'Azul Claro',  bg: 'bg-sky-500',     badge: 'text-sky-700 bg-sky-50'         },
  { key: 'teal',    label: 'Teal',        bg: 'bg-teal-500',    badge: 'text-teal-700 bg-teal-50'       },
  { key: 'rose',    label: 'Rosa',        bg: 'bg-rose-500',    badge: 'text-rose-700 bg-rose-50'       },
  { key: 'indigo',  label: 'Índigo',      bg: 'bg-indigo-500',  badge: 'text-indigo-700 bg-indigo-50'   },
];

export const MARITAL_STATUS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável',
];

export const SEX_OPTIONS = ['Masculino', 'Feminino', 'Outro'];

export const RACE_OPTIONS = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'];
