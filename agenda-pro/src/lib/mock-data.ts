import { BusinessConfig, Service, Client, Appointment, CashRegister } from './types';

export const initialConfig: BusinessConfig = {
  name: "Letícia Hermann Unhas e Cursos",
  ownerName: "Letícia Hermann",
  phone: "47988340478",
  slug: "leticia",
  instagram: "@leticiahermann.unhas",
  address: "Studio Letícia Hermann",
  openingTime: "08:00",
  closingTime: "20:00",
  intervalMinutes: 15,
  workingDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
  destinationAccounts: ["Banco", "Cofre", "Gaveta"],
  expenseCategories: [
    "Material de Trabalho / Insumos",
    "Vale Letícia Hermann",
    "Alimentação / Lanche",
    "Cartão de Crédito / Fornecedor",
    "Manutenção de Equipamentos",
    "Outros"
  ],
  whatsappConfirmationTemplate:
    "Olá {cliente}! ✨ Seu agendamento de *{servicos}* no Studio Letícia Hermann está confirmado para o dia *{data}* às *{hora}*. Qualquer imprevisto, favor avisar com antecedência. Te esperamos! 💅",
  whatsappReminderTemplate:
    "Olá {cliente}! 🌸 Passando para lembrar do seu horário amanhã dia *{data}* às *{hora}* para *{servicos}*. Confirmado? Te aguardo!",
  whatsappReceiptTemplate:
    "Olá {cliente}! 🧾 Segue o comprovante do seu atendimento no Studio Letícia Hermann.\n\n✨ Serviços: {servicos}\n💰 Total: R$ {total}\nForma de Pagamento: {pagamento}\n\nMuito obrigado pela preferência e até a próxima! 💖",
};

export const initialServices: Service[] = [
  {
    id: "srv_fibra",
    name: "Fibra de vidro",
    category: "alongamento",
    durationMinutes: 180, // 03:00
    price: 220.00,
    commissionRate: 60,
    color: "#ec4899",
    active: true,
    description: "Alongamento completo de unhas com fibra de vidro premium e acabamento natural."
  },
  {
    id: "srv_manut_fibra",
    name: "Manutenção fibra",
    category: "manutencao",
    durationMinutes: 150, // 02:30
    price: 150.00,
    commissionRate: 60,
    color: "#f43f5e",
    active: true,
    description: "Manutenção estrutural e nivelamento da fibra de vidro."
  },
  {
    id: "srv_banho_gel",
    name: "Banho de gel",
    category: "alongamento",
    durationMinutes: 120, // 02:00
    price: 150.00,
    commissionRate: 60,
    color: "#8b5cf6",
    active: true,
    description: "Camada protetora em gel para unhas naturais mais fortes e duradouras."
  },
  {
    id: "srv_manut_banho",
    name: "Manutenção banho",
    category: "manutencao",
    durationMinutes: 130, // 02:10
    price: 150.00,
    commissionRate: 60,
    color: "#a855f7",
    active: true,
    description: "Manutenção e reposição do gel protetor."
  },
  {
    id: "srv_esmalt_maos",
    name: "Esmaltação em gel - mãos",
    category: "esmaltacao",
    durationMinutes: 120, // 02:00
    price: 110.00,
    commissionRate: 60,
    color: "#06b6d4",
    active: true,
    description: "Esmaltação em gel com secagem em cabine LED/UV, alta durabilidade e brilho intenso."
  },
  {
    id: "srv_esmalt_pes",
    name: "Esmaltação em gel - pés",
    category: "esmaltacao",
    durationMinutes: 105, // 01:45
    price: 80.00,
    commissionRate: 60,
    color: "#0ea5e9",
    active: true,
    description: "Esmaltação em gel nos pés com cutilagem e acabamento perfeito."
  },
  {
    id: "srv_mao_pe_trad",
    name: "Mão e Pé tradicional",
    category: "tradicional",
    durationMinutes: 120, // 02:00
    price: 75.00,
    commissionRate: 60,
    color: "#10b981",
    active: true,
    description: "Cutilagem completa e esmaltação tradicional para mãos e pés."
  },
  {
    id: "srv_pe_trad",
    name: "Pé tradicional",
    category: "tradicional",
    durationMinutes: 60, // 01:00
    price: 43.00,
    commissionRate: 60,
    color: "#14b8a6",
    active: true,
    description: "Higienização, cutilagem e esmaltação tradicional dos pés."
  },
  {
    id: "srv_mao_trad",
    name: "Mão tradicional",
    category: "tradicional",
    durationMinutes: 60, // 01:00
    price: 32.00,
    commissionRate: 60,
    color: "#84cc16",
    active: true,
    description: "Cutilagem e esmaltação tradicional das mãos."
  },
  {
    id: "srv_remocao_gel",
    name: "Remoção gel",
    category: "cuidados",
    durationMinutes: 45, // 00:45
    price: 40.00,
    commissionRate: 60,
    color: "#64748b",
    active: true,
    description: "Remoção segura e saudável de gel ou alongamento sem danificar a lâmina ungueal."
  },
  {
    id: "srv_conserto_unha",
    name: "Concerto unha",
    category: "cuidados",
    durationMinutes: 20,
    price: 20.00,
    commissionRate: 60,
    color: "#f59e0b",
    active: true,
    description: "Reparo de unha quebrada ou trincada."
  },
  {
    id: "srv_ausencia",
    name: "AUSÊNCIA / BLOQUEIO",
    category: "bloqueio",
    durationMinutes: 60,
    price: 0.00,
    color: "#475569",
    active: true,
    description: "Bloqueio de horário para almoço, folga ou compromisso pessoal."
  },
  {
    id: "srv_curso_esmalt",
    name: "CURSO ESMALT. GEL",
    category: "cursos",
    durationMinutes: 540, // 09:00
    price: 550.00,
    commissionRate: 100,
    color: "#eab308",
    active: true,
    description: "Curso profissionalizante presencial com técnica de cutilagem russa e esmaltação perfeita."
  }
];

export const initialClients: Client[] = [
  {
    id: "cli_1",
    name: "Camila Ribeiro",
    phone: "47991234567",
    carrier: "Vivo",
    birthDate: "15/04/1995",
    creditBalance: 0,
    createdAt: "2024-01-10",
    lastVisit: "2024-11-10",
    nextExpectedReturn: "2024-11-30",
    totalSpent: 920.00,
    totalVisits: 6,
    notes: "Prefere formato amendoadas (almond), esmaltes em tons nude e terrosos."
  },
  {
    id: "cli_2",
    name: "Mariana Santos",
    phone: "47988765432",
    carrier: "Claro",
    birthDate: "28/08/1992",
    creditBalance: 25.00,
    createdAt: "2024-02-15",
    lastVisit: "2024-11-14",
    nextExpectedReturn: "2024-12-04",
    totalSpent: 1250.00,
    totalVisits: 8,
    notes: "Faz manutenção de fibra a cada 20 dias pontualmente."
  },
  {
    id: "cli_3",
    name: "Juliana Costa",
    phone: "47999881122",
    carrier: "TIM",
    birthDate: "03/12/1988",
    creditBalance: 0,
    createdAt: "2024-03-01",
    lastVisit: "2024-11-05",
    nextExpectedReturn: "2024-11-25",
    totalSpent: 650.00,
    totalVisits: 4,
    notes: "Sensibilidade nas cutículas. Usar broca com rotação suave."
  },
  {
    id: "cli_4",
    name: "Fernanda Lima",
    phone: "47984443322",
    carrier: "Vivo",
    birthDate: "19/07/2000",
    creditBalance: 0,
    createdAt: "2024-04-12",
    lastVisit: "2024-11-16",
    nextExpectedReturn: "2024-12-06",
    totalSpent: 440.00,
    totalVisits: 4,
    notes: "Adora decorações com francesinha reversa e glitter."
  }
];

export const getSampleAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: "apt_1",
      clientId: "cli_1",
      clientName: "Camila Ribeiro",
      clientPhone: "47991234567",
      date: today,
      startTime: "09:00",
      endTime: "11:30",
      services: [
        {
          serviceId: "srv_manut_fibra",
          serviceName: "Manutenção fibra",
          price: 150.00,
          durationMinutes: 150
        }
      ],
      totalPrice: 150.00,
      status: "confirmed",
      professionalName: "Letícia Hermann",
      notes: "Trazer referência de nail art floral.",
      nextReturnDate: "2024-12-05",
      paid: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "apt_2",
      clientId: "cli_2",
      clientName: "Mariana Santos",
      clientPhone: "47988765432",
      date: today,
      startTime: "13:30",
      endTime: "15:30",
      services: [
        {
          serviceId: "srv_banho_gel",
          serviceName: "Banho de gel",
          price: 150.00,
          durationMinutes: 120
        }
      ],
      totalPrice: 150.00,
      status: "scheduled",
      professionalName: "Letícia Hermann",
      notes: "",
      nextReturnDate: "2024-12-10",
      paid: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "apt_3",
      clientId: "cli_4",
      clientName: "Fernanda Lima",
      clientPhone: "47984443322",
      date: today,
      startTime: "16:00",
      endTime: "18:00",
      services: [
        {
          serviceId: "srv_esmalt_maos",
          serviceName: "Esmaltação em gel - mãos",
          price: 110.00,
          durationMinutes: 120
        }
      ],
      totalPrice: 110.00,
      status: "scheduled",
      professionalName: "Letícia Hermann",
      notes: "",
      nextReturnDate: "2024-12-08",
      paid: false,
      createdAt: new Date().toISOString()
    }
  ];
};

export const initialCashRegister: CashRegister = {
  id: "cx_13",
  codeNumber: 13,
  openedAt: new Date().toISOString().split('T')[0] + " 08:00",
  openedBy: "Letícia Hermann",
  status: "open",
  initialAmount: 100.00,
  salesTotal: 410.00,
  expensesTotal: 35.00,
  supplyTotal: 100.00,
  bleedTotal: 0,
  finalExpectedAmount: 475.00,
  destinationAccount: "Banco",
  movements: [
    {
      id: "mov_1",
      type: "suprimento",
      amount: 100.00,
      method: "dinheiro",
      description: "Fundo de troco inicial",
      time: "08:00",
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: "mov_2",
      type: "venda",
      amount: 150.00,
      method: "pix",
      description: "Manutenção fibra - Mariana Santos",
      clientName: "Mariana Santos",
      time: "11:30",
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: "mov_3",
      type: "venda",
      amount: 110.00,
      method: "debito",
      description: "Esmaltação em gel - Camila Ribeiro",
      clientName: "Camila Ribeiro",
      time: "14:15",
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: "mov_4",
      type: "despesa",
      amount: 35.00,
      method: "dinheiro",
      description: "Lixas e descartáveis de reposição",
      category: "Material de Trabalho / Insumos",
      time: "15:00",
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: "mov_5",
      type: "venda",
      amount: 150.00,
      method: "pix",
      description: "Banho de gel - Juliana Costa",
      clientName: "Juliana Costa",
      time: "17:45",
      date: new Date().toISOString().split('T')[0]
    }
  ]
};

export const initialPastRegisters: CashRegister[] = [
  {
    id: "cx_12",
    codeNumber: 12,
    openedAt: "2024-08-31 08:30",
    closedAt: "2024-09-05 19:00",
    openedBy: "Letícia Hermann",
    closedBy: "Letícia Hermann",
    status: "closed",
    destinationAccount: "Banco",
    initialAmount: 80.00,
    salesTotal: 1850.00,
    expensesTotal: 120.00,
    supplyTotal: 80.00,
    bleedTotal: 500.00,
    finalExpectedAmount: 1310.00,
    finalRealAmount: 1310.00,
    closingNotes: "Sem curso na semana",
    movements: []
  }
];
