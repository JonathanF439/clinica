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
  { code: '001', name: 'Aspiração' },
  { code: '002', name: 'Avaliação' },
  { code: '003', name: 'Biometria Ultrassônica' },
  { code: '004', name: 'Catarata' },
  { code: '005', name: 'Ceratometria' },
  { code: '006', name: 'Campimetria' },
  { code: '007', name: 'Consulta' },
  { code: '008', name: 'CTD' },
  { code: '009', name: 'Fundoscopia' },
  { code: '010', name: 'Gonioscopia' },
  { code: '011', name: 'OCT' },
  { code: '012', name: 'Retinografia' },
  { code: '013', name: 'Topografia de Córnea' },
  { code: '014', name: 'Yag Laser' },
  { code: '015', name: 'Laser Argônio' },
  { code: '016', name: 'Acuidade Visual' },
  { code: '017', name: 'Adaptação de Lente de Contato' },
  { code: '018', name: 'Angiografia' },
  { code: '019', name: 'Biometria Óptica' },
  { code: '020', name: 'Blefaroplastia' },
  { code: '021', name: 'Calázio' },
  { code: '022', name: 'Catarata Congênita' },
  { code: '023', name: 'Ceratocone' },
  { code: '024', name: 'Ceratoplastia' },
  { code: '025', name: 'Cirurgia de Glaucoma' },
  { code: '026', name: 'Cirurgia de Pterígio' },
  { code: '027', name: 'Cirurgia de Retina' },
  { code: '028', name: 'Cirurgia Refrativa' },
  { code: '029', name: 'Conjuntivite' },
  { code: '030', name: 'Dacriocistorrinostomia' },
  { code: '031', name: 'Eletrorretinograma' },
  { code: '032', name: 'Enucleação' },
  { code: '033', name: 'Evisceração' },
  { code: '034', name: 'Exame de Fundo de Olho' },
  { code: '035', name: 'Extração de Corpo Estranho' },
  { code: '036', name: 'Facoemulsificação' },
  { code: '037', name: 'Fotocoagulação' },
  { code: '038', name: 'Glaucoma' },
  { code: '039', name: 'Implante de IOL' },
  { code: '040', name: 'Injeção Intravítrea' },
  { code: '041', name: 'Medida de Pressão Intraocular' },
  { code: '042', name: 'Pterígio' },
  { code: '043', name: 'Refração' },
  { code: '044', name: 'Retinose Pigmentar' },
  { code: '045', name: 'Sequência de Catarata' },
  { code: '046', name: 'Sutura de Córnea' },
  { code: '047', name: 'Vitrectomia' },
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
    where: { email: 'admin@clinica.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@clinica.com', password: hashedAdmin, role: UserRole.ADMIN },
  });
  const medicoUser = await prisma.user.upsert({
    where: { email: 'medico@clinica.com' },
    update: {},
    create: { name: 'DR. DAVID TAYAH', email: 'medico@clinica.com', password: hashedMedico, role: UserRole.MEDICO },
  });
  await prisma.user.upsert({
    where: { email: 'recepcao@clinica.com' },
    update: {},
    create: { name: 'LOURIVANIA', email: 'recepcao@clinica.com', password: hashedRecepcao, role: UserRole.RECEPCIONISTA },
  });
  await prisma.user.upsert({
    where: { email: 'enfermagem@clinica.com' },
    update: {},
    create: { name: 'Enfermagem', email: 'enfermagem@clinica.com', password: hashedEnfermagem, role: UserRole.ENFERMAGEM },
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
