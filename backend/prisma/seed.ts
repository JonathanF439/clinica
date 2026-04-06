import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default permission matrix
// ADMIN is a superuser — not stored, checked in guard
const DEFAULT_PERMISSIONS: { role: UserRole; resource: string; action: string; allowed: boolean }[] = [
  // RECEPCIONISTA
  { role: UserRole.RECEPCIONISTA, resource: 'appointment', action: 'create',        allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'appointment', action: 'read',          allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'appointment', action: 'update',        allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'appointment', action: 'change_status', allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'patient',     action: 'create',        allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'patient',     action: 'read',          allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'patient',     action: 'update',        allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'doctor',      action: 'create',        allowed: false },
  { role: UserRole.RECEPCIONISTA, resource: 'doctor',      action: 'read',          allowed: true  },
  { role: UserRole.RECEPCIONISTA, resource: 'doctor',      action: 'update',        allowed: false },
  { role: UserRole.RECEPCIONISTA, resource: 'user',        action: 'create',        allowed: false },
  { role: UserRole.RECEPCIONISTA, resource: 'user',        action: 'read',          allowed: false },
  // ENFERMAGEM
  { role: UserRole.ENFERMAGEM,    resource: 'appointment', action: 'create',        allowed: false },
  { role: UserRole.ENFERMAGEM,    resource: 'appointment', action: 'read',          allowed: true  },
  { role: UserRole.ENFERMAGEM,    resource: 'appointment', action: 'update',        allowed: false },
  { role: UserRole.ENFERMAGEM,    resource: 'appointment', action: 'change_status', allowed: true  },
  { role: UserRole.ENFERMAGEM,    resource: 'patient',     action: 'create',        allowed: false },
  { role: UserRole.ENFERMAGEM,    resource: 'patient',     action: 'read',          allowed: true  },
  { role: UserRole.ENFERMAGEM,    resource: 'patient',     action: 'update',        allowed: true  },
  { role: UserRole.ENFERMAGEM,    resource: 'doctor',      action: 'create',        allowed: false },
  { role: UserRole.ENFERMAGEM,    resource: 'doctor',      action: 'read',          allowed: true  },
  { role: UserRole.ENFERMAGEM,    resource: 'doctor',      action: 'update',        allowed: false },
  { role: UserRole.ENFERMAGEM,    resource: 'user',        action: 'create',        allowed: false },
  { role: UserRole.ENFERMAGEM,    resource: 'user',        action: 'read',          allowed: false },
  // MEDICO
  { role: UserRole.MEDICO,        resource: 'appointment', action: 'create',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'appointment', action: 'read',          allowed: true  },
  { role: UserRole.MEDICO,        resource: 'appointment', action: 'update',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'appointment', action: 'change_status', allowed: false },
  { role: UserRole.MEDICO,        resource: 'patient',     action: 'create',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'patient',     action: 'read',          allowed: true  },
  { role: UserRole.MEDICO,        resource: 'patient',     action: 'update',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'doctor',      action: 'create',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'doctor',      action: 'read',          allowed: true  },
  { role: UserRole.MEDICO,        resource: 'doctor',      action: 'update',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'user',        action: 'create',        allowed: false },
  { role: UserRole.MEDICO,        resource: 'user',        action: 'read',          allowed: false },
];

const PROCEDURES = [
  { code: '1',  name: 'Consulta' },
  { code: '2',  name: 'Teste do Olhinho' },
  { code: '3',  name: 'Campimetria' },
  { code: '4',  name: 'Pterigio' },
  { code: '5',  name: 'Tonometria' },
  { code: '6',  name: 'Fundoscopia' },
  { code: '7',  name: 'Gonioscopia' },
  { code: '8',  name: 'Mapeamento de Retina' },
  { code: '9',  name: 'Microscopia Especular de Córnea' },
  { code: '10', name: 'Paquimetria Ultrassonica' },
  { code: '11', name: 'Reposicionamento de LIO' },
  { code: '12', name: 'Hernia de Iris' },
  { code: '13', name: 'Potencial da Acuidade Visual' },
  { code: '14', name: 'Ceratoscopia (topografia de cornea' },
  { code: '15', name: 'CDT (CDPO)' },
  { code: '16', name: 'Teste Visao de Cores' },
  { code: '17', name: 'Retinografia' },
  { code: '18', name: 'Laudo Endocrinologista' },
  { code: '19', name: 'Cauterização de Sinal' },
  { code: '20', name: 'Blefaroplastia' },
  { code: '21', name: 'Xantelasma' },
  { code: '22', name: 'Calazio' },
  { code: '23', name: 'Ultrassonografia de Globo Ocular' },
  { code: '24', name: 'Dextro (glicemia)' },
  { code: '25', name: 'OCT' },
  { code: '26', name: 'Laudo Retinologo' },
  { code: '27', name: 'Avaliação Catarata' },
  { code: '28', name: 'Retorno' },
  { code: '29', name: 'Yag Laser' },
  { code: '30', name: 'Retorno de Cirurgia' },
  { code: '31', name: 'Retorno de Consulta' },
  { code: '32', name: 'Retorno de Yag Laser' },
  { code: '33', name: 'Retorno Laudo' },
  { code: '34', name: 'Retorno para Oculos' },
  { code: '35', name: 'Retorno Dilatação' },
  { code: '36', name: 'Retorno consulta D Social' },
  { code: '37', name: 'Catarata' },
  { code: '38', name: 'Ceratometria' },
  { code: '39', name: 'Remoção de Ponto' },
  { code: '40', name: 'Retorno Verificar Oculos' },
  { code: '41', name: 'Medida de Pressão Intraocular' },
  { code: '42', name: 'Aspiração' },
  { code: '43', name: 'Refração' },
  { code: '44', name: 'Retorno Pterígio' },
  { code: '45', name: 'Biometria Ultrassonica' },
  { code: '46', name: 'Biomicroscopia' },
  { code: '47', name: 'Retorno Medicação' },
  { code: '48', name: 'Retorno Catarata' },
  { code: '49', name: 'Retorno Calazio' },
  { code: '50', name: 'Exames' },
];

const INITIAL_DOCTORS = [
  { name: 'DR. DAVID TAYAH', crm: '12345-AM', specialty: 'Oftalmologia Geral' },
  { name: 'DRA. ALINE CANDIDO', crm: '23456-AM', specialty: 'Retina' },
  { name: 'DRA. SAMARA QUEIROZ', crm: '34567-AM', specialty: 'Glaucoma' },
  { name: 'DRA. ROSEANE BENTES', crm: '45678-AM', specialty: 'Catarata' },
];

async function main() {
  console.log('Iniciando seed...');

  // Procedures
  for (const proc of PROCEDURES) {
    await prisma.procedure.upsert({
      where: { code: proc.code },
      update: {},
      create: proc,
    });
  }
  console.log(`${PROCEDURES.length} procedimentos criados`);

  // Doctors — seed first without userId, then link medico user after users are created
  const doctorRecords: Record<string, string> = {};
  for (const doc of INITIAL_DOCTORS) {
    const created = await prisma.doctor.upsert({
      where: { crm: doc.crm },
      update: {},
      create: doc,
    });
    doctorRecords[doc.crm] = created.id;
  }
  console.log('4 médicos criados');

  // Users
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedMedico = await bcrypt.hash('medico123', 10);
  const hashedRecepcao = await bcrypt.hash('recepcao123', 10);
  const hashedEnfermagem = await bcrypt.hash('enfermagem123', 10);

  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: { name: 'Administrador', login: 'admin', password: hashedAdmin, role: UserRole.ADMIN },
  });
  const medicoUser = await prisma.user.upsert({
    where: { login: 'medico' },
    update: {},
    create: { name: 'DR. DAVID TAYAH', login: 'medico', password: hashedMedico, role: UserRole.MEDICO },
  });
  await prisma.user.upsert({
    where: { login: 'recepcao' },
    update: {},
    create: { name: 'LOURIVANIA', login: 'recepcao', password: hashedRecepcao, role: UserRole.RECEPCIONISTA },
  });
  await prisma.user.upsert({
    where: { login: 'enfermagem' },
    update: {},
    create: { name: 'Enfermagem', login: 'enfermagem', password: hashedEnfermagem, role: UserRole.ENFERMAGEM },
  });
  console.log('4 usuários criados');

  // Link DR. DAVID TAYAH doctor record to the medico user account
  const davidDoctorId = doctorRecords['12345-AM'];
  await prisma.doctor.update({
    where: { id: davidDoctorId },
    data: { userId: medicoUser.id },
  });
  console.log('Médico vinculado ao usuário');

  // Seed default permissions
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { role_resource_action: { role: perm.role, resource: perm.resource, action: perm.action } },
      update: { allowed: perm.allowed },
      create: perm,
    });
  }
  console.log(`${DEFAULT_PERMISSIONS.length} permissões criadas`);

  // Sample patient
  const patient = await prisma.patient.upsert({
    where: { cpf: '123.456.789-00' },
    update: {},
    create: {
      name: 'NATHANAEL KALEB DE OLIVEIRA CONRADO',
      cpf: '123.456.789-00',
      susCard: '89800542651',
      phone: '(92) 99999-0000',
      addrCity: 'MANAUS',
      addrUf: 'AM',
    },
  });
  console.log('1 paciente criado');

  // Sample appointment
  const today = new Date().toISOString().split('T')[0];
  const davidId = doctorRecords['12345-AM'];

  const existingAppt = await prisma.appointment.findFirst({
    where: { patientId: patient.id, doctorId: davidId, date: today },
  });

  if (!existingAppt) {
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: davidId,
        date: today,
        time: '08:30',
        category: 'SUS',
        type: 'CONSULTA',
        procedureCode: '007',
        procedureName: 'Consulta',
        value: 0,
        status: 'Aguardando',
        receptionist: 'LOURIVANIA',
      },
    });
    console.log('1 agendamento exemplo criado');
  }

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
