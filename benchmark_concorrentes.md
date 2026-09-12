# 📊 Benchmark Competitivo & Análise Estratégica de Produto: Techo PRO vs. Líderes de Mercado

**Data:** 11 de Setembro de 2026  
**Área:** Product Management, Inteligência Competitiva & Arquitetura SaaS  
**Objeto de Análise:** Plataforma **Techo PRO** (index.html, genda-pro, Supabase) em comparação direta com:
- **Nacionais:** Simples Agenda, Trinks, AppBarber / AppBeleza, Gendo
- **Globais:** Fresha, Booksy
- **Engenharia de Agendamento & Anti-Conflito:** Cal.com / Calendly

---

## 1. Sumário Executivo & Diagnóstico Estratégico

O mercado de software de gestão para o segmento de beleza, estética, bem-estar e barbearias no Brasil movimenta centenas de milhares de micro e pequenas empresas (MEIs e MEs). Profissionais autônomos (manicures, lash designers, barbeiros, micropigmentadoras, esteticistas) e donos de salões enfrentam três dores operacionais crônicas:

1. **A Dor do No-Show (Cliente Faltoso):** Um cliente que não comparece representa 100% de perda da receita daquela hora de trabalho, além de impedir o encaixe de outro cliente disposto a pagar.
2. **O Caos da Comunicação no WhatsApp:** Profissionais passam de 2 a 4 horas por dia respondendo clientes no direct do Instagram e WhatsApp apenas para negociar horários e confirmar se o cliente vem.
3. **Custo Alto e Interfaces Legadas dos Concorrentes:** Líderes tradicionais como Trinks e Simples Agenda cobram mensalidades pesadas (R$ 89 a R$ 350+/mês) somadas a taxas sobre vendas, pacotes caros de SMS/WhatsApp e plataformas com visual antigo, lentas e complexas para usar em smartphones.

### O Diagnóstico do Techo PRO:
O **Techo PRO** já possui alicerces invejáveis: uma interface moderna com múltiplos temas refinados (*Emerald*, *Bourbon* para barbearias e *Rose Gold* para estética), DRE e relatórios financeiros superiores à média, módulo inédito de cursos/alunas e PDV ágil.

Entretanto, **faltam mecanismos operacionais críticos de retenção e proteção de receita** que os concorrentes consolidados usam como principal argumento de venda:
- **Taxa de Reserva / Depósito Prévio Pix (Anti-No-Show)**
- **Buffer Time (Intervalo pós-atendimento para limpeza/esterilização)**
- **Fila de Espera / Encaixe Inteligente**
- **Confirmação Ativa com Robô no WhatsApp (Sim/Não)**
- **Bloqueio de Inadimplentes / Faltosos**
- **Sincronização 2-Way com Google Calendar**
- **Link Público de Agendamento Online na Bio 100% integrado ao index.html**

Implementando esses recursos, o Techo PRO reúne as condições ideais para praticar uma **estratégia de ruptura de mercado (disrupção por preço e valor)** com planos a R$ 29,90 e R$ 59,90/mês.

---

## 2. Raio-X dos Concorrentes Analisados

`mermaid
quadrantChart
    title Posicionamento de Mercado: Experiência de Uso vs. Custo / Complexidade
    x-axis Baixo Custo / Simples --> Alto Custo / Complexo
    y-axis Interface Datada / Rígida --> Interface Moderna / Flexível
    quadrant-1 Legados Caros (Trinks, Simples Agenda)
    quadrant-2 Modernos Globais (Fresha, Booksy)
    quadrant-3 Softwares Simples de Entrada
    quadrant-4 Oportunidade de Ouro: Techo PRO
    Simples Agenda: [0.65, 0.28]
    Trinks: [0.85, 0.35]
    AppBarber: [0.58, 0.52]
    Gendo: [0.68, 0.65]
    Fresha: [0.72, 0.88]
    Booksy: [0.78, 0.82]
    Cal.com: [0.35, 0.92]
    Techo PRO (Atual): [0.20, 0.75]
    Techo PRO (Com Gaps Resolvidos): [0.22, 0.95]
`

### 2.1. Simples Agenda (Brasil)
- **Público-Alvo:** Clínicas de estética, consultórios de saúde, salões e barbearias.
- **Faixa de Preço:** R$ 49,90 a R$ 199,90/mês (por número de profissionais).
- **Pontos Fortes:**
  - Sistema consolidado no Brasil, com DRE básico, prontuário com anamnese, emissão de NFSe e controle de estoque com baixa por serviço.
  - Link de agendamento online funcional.
- **Pontos Fracos:**
  - Interface visual parada em 2012 (tons de cinza e tabelas densas).
  - Aplicativo mobile é um WebView lento que gera reclamações constantes nas lojas de apps.
  - Lembretes automáticos dependem de contratação de pacotes pré-pagos de créditos.
  - Não possui captura nativa de sinal Pix integrada ao fluxo de agendamento sem taxas extras.

### 2.2. Trinks (Brasil)
- **Público-Alvo:** Salões médios e grandes, redes de estética e franquias de barbearia.
- **Faixa de Preço:** R$ 99,00 a R$ 349,00/mês + taxas de gateway Trinks Pay + pacotes de SMS/WhatsApp.
- **Pontos Fortes:**
  - Conformidade nativa com a **Lei do Salão Parceiro (Lei 13.352/2016)**, com emissão de nota segregada e split automático de pagamento.
  - Maquininha própria integrada com conciliação automática.
  - Programa de fidelidade, vouchers pré-pagos e pacotes de serviços.
- **Pontos Fracos:**
  - Custo total de propriedade (TCO) altíssimo para profissionais solo ou pequenas equipes.
  - Suporte ao cliente moroso e burocrático.
  - Configuração excessivamente complexa; curva de aprendizado íngreme.

### 2.3. AppBarber / AppBeleza (Brasil)
- **Público-Alvo:** Barbearias e salões focados em experiência jovem e masculina.
- **Faixa de Preço:** R$ 69,90 a R$ 250,00+/mês.
- **Pontos Fortes:**
  - Possibilidade de ter um **aplicativo próprio com a logo do salão** publicado na Google Play e App Store (plano corporativo).
  - Módulo de **Clube de Assinaturas** (ex: corte e barba ilimitados por R$ 99/mês cobrados recorrentemente no cartão).
  - Comanda de consumo móvel para bar/barbearia (cerveja, sinuca, produtos para barba).
- **Pontos Fracos:**
  - O app personalizado tem custo de setup elevado e demora na aprovação da Apple/Google.
  - Financeiro e DRE são muito simplistas, sem análise aprofundada de custos fixos e margens.
  - Visual pesado e focado quase exclusivamente no público masculino (dificulta adoção em clínicas de estética).

### 2.4. Gendo (Brasil)
- **Público-Alvo:** Clínicas de estética, salões de beleza premium e spas.
- **Faixa de Preço:** R$ 69,00 a R$ 399,00/mês.
- **Pontos Fortes:**
  - Automação oficial de **WhatsApp com bot interativo de confirmação (Sim/Não)**.
  - Cobrança de sinal obrigatório no agendamento online via Pix para combater faltas.
  - Ficha de anamnese com termo de consentimento assinado na tela e upload de fotos.
- **Pontos Fracos:**
  - Mensalidades encarecem rapidamente ao adicionar atendentes.
  - Interface do painel administrativo é fragmentada entre muitas telas.

### 2.5. Fresha (Global)
- **Público-Alvo:** Salões, clínicas e spas no mundo inteiro.
- **Modelo de Preço:** Freemium híbrido. Software base gratuito, porém cobra:
  - **20% de comissão** no primeiro atendimento de clientes originados do marketplace Fresha.
  - **Taxa de processamento de cartão** em todas as reservas pagas online (~2.2% a 2.5% + taxa fixa).
  - Cobrança por disparos de campanhas de e-mail e SMS.
- **Recursos 'Killer':**
  - **Política de No-Show com Retenção de Cartão:** O cliente cadastra o cartão de crédito para agendar; se não comparecer ou cancelar fora do prazo, o cartão é debitado automaticamente.
  - Re-agendamento 100% autônomo pelo próprio cliente sem incomodar o salão.
  - Sistema de avaliações verificadas (reviews) pós-atendimento.
- **Pontos Fracos:**
  - Modelo de take-rate de 20% revolta donos de salão quando um cliente antigo agenda via marketplace.
  - Sem integração nativa com o Pix do Brasil nem suporte à emissão de NFS-e das prefeituras brasileiras.

### 2.6. Booksy (Global / Brasil)
- **Público-Alvo:** Barbeiros, nail designers e salões em centros urbanos.
- **Faixa de Preço:** R$ 89 a R$ 220+/mês.
- **Recursos 'Killer':**
  - **Botão Reservar Agora nativo no perfil do Instagram e Facebook** e integração direta com o **Reserve with Google** (o cliente pesquisa no Google Maps e agenda direto do resultado de busca).
  - Taxa de cancelamento configurável (ex: retenção de 50% se cancelar com menos de 12 horas).
  - Booksy Boost: ferramenta de anúncios internos para atrair novos clientes da região pagando comissão de sucesso.
- **Pontos Fracos:**
  - Dependência do ecossistema do app deles; se o salão cancela a assinatura, perde o contato com os clientes que usavam o app.

### 2.7. Cal.com / Calendly (Padrão Ouro de Engenharia de Agendamento)
- **Público-Alvo:** Profissionais liberais, executivos, consultores e equipes de alta performance.
- **Recursos 'Killer' de Engenharia de Links Públicos:**
  - **Buffer Time Pré e Pós-Evento:** Adiciona automaticamente 10, 15 ou 30 minutos livres antes e depois de cada compromisso para preparação, descanso e imprevistos.
  - **Sincronização 2-Way Realtime com Google Calendar / Outlook:** Se o profissional adiciona um compromisso pessoal (ex: dentista) no seu calendário pessoal, o horário desaparece imediatamente da grade pública.
  - **Regras Anti-Surpresa:**
    - *Notice Period:* Antecedência mínima para agendar (ex: mínimo 2 horas, impedindo agendamentos em cima da hora).
    - *Future Limit:* Janela máxima permitida (ex: só permite agendamento nos próximos 30 dias).
    - *Daily Limit:* Limite diário de clientes (ex: máximo 6 atendimentos por dia para evitar estafa).
  - **Perguntas Obrigatórias Customizadas:** Campos condicionais no agendamento para triagem.

---

## 3. Matriz Comparativa Detalhada de Funcionalidades

| Funcionalidade / Recurso | Techo PRO (Atual) | Simples Agenda | Trinks | AppBarber | Gendo | Fresha | Booksy | Cal.com |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Design Moderno & Temas Personalizados** | 🟢 **Excelente (3 temas)** | 🔴 Datado | 🟡 Regular | 🟢 Bom | 🟡 Regular | 🟢 Excelente | 🟢 Muito Bom | 🟢 Excelente |
| **Link Público para Bio do Instagram** | 🟡 Apenas no genda-pro | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim |
| **Sinal Pix / Depósito Anti-No-Show** | 🔴 **Não tem** | 🟡 Parcial | 🟡 Via Cartão | 🟡 Parcial | 🟢 **Sim (Nativo)** | 🟢 **Sim (Cartão)** | 🟢 **Sim** | 🟢 Via Stripe |
| **Tempo de Buffer / Intervalo entre Clientes** | 🔴 **Não tem** | 🟡 Básico | 🟡 Básico | 🔴 Não tem | 🟡 Básico | 🟢 **Sim** | 🟢 **Sim** | 🟢 **Sim (Perfeito)** |
| **Fila de Espera / Encaixes Inteligentes** | 🔴 **Não tem** | 🟡 Manual | 🟢 Sim | 🟡 Básico | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🔴 Não |
| **Confirmação Ativa WhatsApp (Bot Sim/Não)** | 🔴 Apenas link manual | 🟡 Créditos SMS/Zap | 🟡 Pago à parte | 🟡 Push App | 🟢 **Sim (Robô)** | 🟡 E-mail/SMS | 🟡 Notificação App | 🟡 E-mail |
| **Bloqueio de Clientes Devedores / Faltosos** | 🔴 **Não tem** | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🔴 Não |
| **Sincronização 2-Way com Google Calendar** | 🔴 **Não tem** | 🟡 1-Way (iCal) | 🟡 1-Way | 🔴 Não | 🔴 Não | 🟢 2-Way | 🟢 2-Way | 🟢 **2-Way Perfeito** |
| **Regras Anti-Surpresa (Aviso prévio/limite)** | 🔴 **Não tem** | 🟡 Básico | 🟡 Básico | 🟡 Básico | 🟡 Básico | 🟢 Sim | 🟢 Sim | 🟢 **Completo** |
| **Ficha de Anamnese com Fotos e Assinatura** | 🟡 Texto / Canvas só no Next | 🟢 Sim (Texto) | 🟡 Módulo Extra | 🔴 Não tem | 🟢 **Sim (Fotos)** | 🟡 Formulário | 🔴 Não | 🔴 Não |
| **Módulo de Cursos & Gestão de Alunas** | 🟢 **Sim (Exclusivo)** | 🔴 Não tem | 🔴 Não tem | 🔴 Não tem | 🔴 Não tem | 🔴 Não tem | 🔴 Não tem | 🔴 Não |
| **Frente de Caixa (PDV) com Múltiplos Meios** | 🟢 **Sim (Completo)** | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🟢 Sim | 🔴 Não |
| **DRE & Relatórios Gerenciais** | 🟢 **Sim (Nativo)** | 🟢 Sim | 🟢 Sim | 🟡 Básico | 🟡 Regular | 🟡 Regular | 🟡 Regular | 🔴 Não |
| **Split da Lei do Salão Parceiro** | 🔴 **Não tem** | 🟢 Sim | 🟢 **Referência** | 🟡 Parcial | 🟢 Sim | 🔴 Não tem | 🔴 Não tem | 🔴 Não |
| **Importador 1-Clique de Outras Agendas** | 🟢 **Sim (Simples Agenda)** | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não | 🔴 Não |
| **Preço de Entrada (Autônomo/Individual)** | 🟢 **R$ 29,90** | 🔴 R$ 49,90 | 🔴 R$ 99,00 | 🔴 R$ 69,90 | 🔴 R$ 69,00 | 🟡 20% comissão | 🔴 R$ 89,00 | 🟢 Grátis/US$ 15 |

---

## 4. Mapeamento Profundo dos 10 Gaps Críticos

### Gap 1: Taxa de Sinal / Depósito Prévio Pix (Anti-No-Show)
* **O Problema Real:** No setor de unhas e barbearias de alto padrão, clientes marcam procedimentos de 2 a 3 horas (ex: alongamento em fibra de vidro ou mechas) e simplesmente não aparecem na sexta-feira ou sábado. A profissional perde R$ 150 a R$ 350 naquele bloco.
* **Como os concorrentes fazem:** O Gendo e Fresha exigem que, ao selecionar o horário na bio, o cliente pague um sinal de 30% ou 50% (ou um valor fixo, ex: R$ 30,00). O horário só fica bloqueado e confirmado quando o pagamento cai.
* **Como o Techo PRO deve implementar:**
  - No cadastro de serviços (servicos), adicionar os campos:
    - exigir_sinal: boolean
    - 	ipo_sinal: 'percentual' | 'fixo'
    - alor_sinal: numeric
  - No link de agendamento online: ao escolher o horário, é gerado um **QR Code Pix Dinâmico imediato** (via Asaas / Mercado Pago / OpenPix) com expiração de 10 minutos.
  - Se o Pix for pago, o agendamento muda automaticamente para confirmado e o valor pago entra como adiantamento na comanda do cliente no PDV. Se não pagar em 10 min, o horário é liberado.

### Gap 2: Tempo de Intervalo / Buffer Time entre Atendimentos
* **O Problema Real:** Nenhuma manicure ou micropigmentadora atende uma cliente das 09:00 às 10:30 e consegue iniciar a próxima exatamente às 10:30. São necessários pelo menos **15 minutos** para:
  1. Trocar lençol de proteção descartável da maca ou mesa.
  2. Higienizar e borrifar álcool 70% na cabine UV/LED e bancada.
  3. Colocar o alicate usado na cuba de desinfecção e pegar kit esterilizado em autoclave.
  4. Beber água e ir ao banheiro.
  Sem o buffer, os atrasos se acumulam e às 16h a profissional está com 1 hora de atraso, gerando estresse e reclamações.
* **Como o Techo PRO deve implementar:**
  - No cadastro da empresa ou do serviço: campo uffer_time_minutes (ex: 0, 10, 15, 20 ou 30 minutos).
  - No motor de cálculo de horários vagos (generateAvailableSlots): o slot ocupado passa a ser duracao_servico + buffer_time. O cliente só vê disponível o horário após o buffer, mas no card interno da profissional o tempo de atendimento real e o tempo de higienização ficam claramente distinguidos.

### Gap 3: Fila de Espera / Encaixes Inteligentes (Waitlist)
* **O Problema Real:** Sextas e sábados costumam ter a grade 100% cheia com semanas de antecedência. Quando uma cliente avisa com antecedência que não poderá comparecer, a dona do salão perde um tempo enorme abrindo conversas antigas no WhatsApp para perguntar: *Fulana, abriu uma vaga no sábado às 14h, você ainda quer?*.
* **Como os concorrentes fazem:** O Trinks e o Booksy oferecem o botão *Entrar na Fila de Espera* quando o dia está sem vagas. Se surgir um cancelamento, o sistema notifica os interessados.
* **Como o Techo PRO deve implementar:**
  - Se o dia desejado estiver lotado no link público, surge o botão: **Me avise se vagar um horário hoje**.
  - O cliente informa nome, WhatsApp e serviços desejados.
  - Ao cancelar um agendamento na grade, o Techo PRO exibe um alerta modal: *Existe 3 clientes na fila de espera para esta data! Deseja disparar mensagem de encaixe?* com 1 clique para disparar o aviso via WhatsApp.

### Gap 4: Confirmação Ativa via WhatsApp com Robô (Sim/Não)
* **O Problema Real:** Hoje o Techo PRO usa window.open('api.whatsapp.com'). Isso exige que a profissional abra manualmente cliente por cliente no celular para enviar a mensagem, e depois fique lendo as respostas uma a uma para alterar a cor na agenda.
* **Como os concorrentes fazem:** O Gendo conecta via API de WhatsApp (Evolution API ou Z-API). 24 horas antes do atendimento, o sistema envia:
  > *Olá Camila! Seu horário de Manutenção de Fibra está marcado para amanhã, 12/09 às 14:00 com Letícia. Digite 1 para Confirmar ou 2 para Desmarcar/Remarcar.*
* **Como o Techo PRO deve implementar:**
  - Integração webhook com Evolution API / Z-API / WhatsApp Cloud API.
  - Se a cliente responder 1, o agendamento no Supabase é atualizado instantaneamente para status = 'confirmado' e fica **verde** na grade da profissional.
  - Se responder 2, atualiza para status = 'cancelado', fica **vermelho** e libera o horário para a fila de espera.

### Gap 5: Bloqueio de Clientes Devedores / Faltosos Recorrentes (Blacklist)
* **O Problema Real:** Todo negócio tem clientes tóxicos operacionais: pessoas que marcam horários e faltam 3 vezes sem avisar, ou que saem do salão devendo (pendurado no haver/fiado) e nunca pagam. Permitir que essa pessoa continue agendando online pela bio do Instagram gera fúria na dona do salão.
* **Como os concorrentes fazem:** O Simples Agenda e Trinks possuem flag de *Cliente Bloqueado / Em Débito*.
* **Como o Techo PRO deve implementar:**
  - No cadastro de clientes (clientes):
    - loqueado_agendamento: boolean
    - motivo_bloqueio: text (ex: Débito pendente de R$ 120 ou Faltou 2 vezes consecutivas sem avisar)
  - No link de agendamento online: ao digitar o WhatsApp, se o número estiver na blacklist, o sistema exibe com elegância: *Identificamos uma pendência em seu cadastro. Por favor, entre em contato direto pelo WhatsApp para agendar seu horário.*

### Gap 6: Sincronização Bidirecional com Google Calendar (2-Way Sync)
* **O Problema Real:** A profissional tem vida pessoal fora do salão: consulta médica, reunião escolar do filho, aniversário de família. Ela anota isso no calendário do celular (Google Calendar). Se a agenda do salão não conversa com o Google Calendar, a cliente da bio do Instagram agenda no horário em que ela está no médico, gerando cancelamento constrangedor.
* **Como o Cal.com faz:** O Cal.com integra com a Google Calendar API v3 via OAuth2. Ele lê os eventos marcados como usy (ocupado) no Google Agenda e remove esses blocos da grade pública de disponibilidade. Além disso, ao criar um agendamento no sistema, ele cria o evento na conta Google da profissional com lembrete nativo.
* **Como o Techo PRO deve implementar:**
  - Conexão OAuth2 com o Google Calendar nas configurações de perfil do profissional.
  - Ao consultar os slots disponíveis, subtrair os blocos ocupados do Google Calendar.

### Gap 7: Regras Anti-Surpresa de Agendamento (Inspiração Cal.com)
* **O Problema Real:**
  1. A cliente abre a bio às 13:50 e agenda para as 14:00 (daqui a 10 minutos). A profissional não estava olhando o celular, estava almoçando e não tem como atender.
  2. A cliente quer agendar para daqui a 8 meses, quando os preços dos serviços já terão subido.
  3. Em dias de pico, 12 clientes agendam no mesmo dia para a mesma profissional, levando-a ao esgotamento físico.
* **Como o Techo PRO deve implementar:**
  - **Antecedência Mínima (Minimum Notice):** Não permitir agendamentos com menos de X horas de antecedência (ex: 2h ou 3h).
  - **Janela Máxima Futura (Rolling Window):** Permitir agendamentos no máximo para os próximos 30 ou 45 dias corridos.
  - **Limite Máximo de Atendimentos Diários:** Trava opcional no profissional (ex: máximo 6 atendimentos/dia).

### Gap 8: Ficha de Anamnese com Galeria Fotográfica de Evolução (Antes & Depois)
* **O Problema Real:** Na estética, unhas e sobrancelhas, a cliente chega reclamando que o procedimento caiu antes do tempo ou que a pele já estava perfeita. Ter a foto de alta resolução tirada na recepção antes do procedimento e a foto do resultado final com a data carimbada é a **maior proteção jurídica e técnica contra processos e calúnias**.
* **Como os concorrentes fazem:** Gendo e Fresha permitem tirar foto pelo celular e anexar diretamente ao prontuário da cliente.
* **Como o Techo PRO deve implementar:**
  - No perfil da cliente, criar a aba **Galeria & Prontuário Visual**.
  - Upload direto pelo celular (câmera ou galeria) com armazenamento no Supabase Storage (ucket: prontuarios).
  - Comparador lado a lado (*Antes vs Depois*) para exportar direto para o Instagram do salão com a marca d'água da profissional.

### Gap 9: Relatório e Split da Lei do Salão Parceiro (Lei 13.352/2016)
* **O Problema Real:** No Brasil, salão de beleza não pode tributar o faturamento bruto dos profissionais que atuam sob o regime de parceria (Lei do Salão Parceiro). Se uma escova custa R$ 100 e a comissão do cabeleireiro é R$ 60, o salão só deve pagar imposto sobre os R$ 40 (sua cota-parte de infraestrutura). Softwares que não separam isso geram bitributação pesada ou autuações da Receita Federal.
* **Como os concorrentes fazem:** O Trinks emite o Demonstrativo de Rateio e Recibo do Salão Parceiro bipartido automaticamente.
* **Como o Techo PRO deve implementar:**
  - Na aba de Relatórios/Financeiro, criar o **Relatório de Conformidade: Lei do Salão Parceiro**.
  - Segregação clara: *Receita Bruta | Cota-Parte do Estabelecimento | Cota-Parte do Profissional Parceiro | Encargos Descontados*.
  - Exportação em PDF do recibo oficial pronto para assinatura do profissional e envio ao contador.

### Gap 10: Link Público de Agendamento Online Integrado Diretamente ao index.html
* **O Problema Real:** Hoje o fluxo de agendamento público da cliente final está implementado apenas no projeto Next.js (genda-pro), enquanto o sistema principal de uso diário é a SPA em index.html. É imperativo que a dona do salão tenha uma URL pública imediata, sem atrito, que sincronize na mesma base Supabase.
* **Como o Techo PRO deve implementar:**
  - Modal na sidebar do index.html: **Meu Link da Bio**.
  - O sistema exibe o link amigável (ex: https://meu-dominio.com/agendar?s=studio-leticia), um QR Code para imprimir e colocar no balcão, e botão Copiar Link para o Instagram.

---

## 5. Diferenciais Competitivos que o Techo PRO Já Possui

Enquanto os concorrentes cobram caro por softwares engessados, o Techo PRO já conta com diferenciais de peso:

`mermaid
graph TD
    subgraph Diferenciais Únicos do Techo PRO
        D1[🎨 Design System de Alta Fidelidade<br/>(Temas Emerald, Bourbon, Rose Gold)]
        D2[📊 DRE Completo e Lucro Líquido Real<br/>(Deduções, Custos e Margens)]
        D3[🎓 Módulo de Cursos & Alunas<br/>(Nenhum concorrente atende)]
        D4[⚡ PDV Ágil com Impressão Térmica<br/>(Comprovante WhatsApp em 1 clique)]
        D5[💰 Preço Irresistível<br/>(Starter R$ 29,90 / PRO R$ 59,90)]
        D6[🔄 Importador Simples Agenda Nativo<br/>(Migração de dados em 30 segundos)]
    end
`

1. **Design System & Experiência Visual Encantadora:**
   Softwares como Simples Agenda parecem planilhas de Excel cinzas dos anos 2000. O Techo PRO é elegante, clean, moderno e personalizável. Um estúdio de unhas usa o tema *Rose Gold*, uma barbearia usa o tema escuro *Bourbon*, e uma clínica usa o tema *Emerald*. Isso gera orgulho no profissional ao operar.
2. **Módulo Exclusivo de Cursos & Alunas:**
   As melhores profissionais da beleza (especialmente nail designers, lash makers e micropigmentadoras) ganham mais dinheiro ministrando cursos VIP do que fazendo atendimentos individuais. **Nenhum dos concorrentes (Trinks, Simples Agenda, AppBarber, Booksy) possui um módulo para gerenciar turmas, alunas e recebimento de cursos**. O Techo PRO já tem essa tela pronta.
3. **DRE Gerencial Transparente:**
   A maioria das agendas apenas soma entradas e saídas simples. O Techo PRO já estrutura o Demonstrativo de Resultado do Exercício com Receita Bruta, Deduções, Custos Operacionais e Lucro Líquido Real.
4. **Migração em 1 Clique (Troca Sem Dor de Cabeça):**
   O maior medo de quem quer trocar de agenda é perder o cadastro de 500 clientes. O Techo PRO já tem o módulo de importação de arquivos do Simples Agenda pronto no código, eliminando a principal barreira de entrada da concorrência.

---

## 6. Proposta de Valor e Estratégia de Transição: Como Tornar o Techo PRO Irresistível

### 6.1. O Comparativo de Economia Real (Por que cancelar o Trinks/Simples Agenda hoje)

| Conceito | Trinks (Plano Base + Extras) | Simples Agenda (Plano Pro) | **Techo PRO (Plano PRO Completo)** |
| :--- | :---: | :---: | :---: |
| **Mensalidade Fixa** | R$ 149,00 / mês | R$ 89,90 / mês | **R$ 59,90 / mês** (ou R$ 44,90 no anual) |
| **Cobrança por Profissional Extra** | + R$ 35,00 / profissional | + R$ 20,00 / profissional | **R$ 0,00 (Ilimitado no PRO)** |
| **Pacote de Notificações WhatsApp** | R$ 0,18 a R$ 0,25 por disparo | R$ 0,15 por disparo | **Incluso / Via API integrada** |
| **Módulo de Cursos & Alunas** | Não existe | Não existe | **Incluso** |
| **Custo Anual Total Estimado** | **R$ 2.450,00 a R$ 3.800,00** | **R$ 1.300,00 a R$ 1.800,00** | **R$ 539,00 / ano** |
| **Economia Líquida para o Salão** | — | — | **Economia de até R$ 3.261,00 por ano** |

### 6.2. O Argumento de Vendas Matador (Oferta Irresistível)
> *Por que você continua pagando mais de R$ 150 todo mês para um sistema feio e antigo do Trinks, que ainda te cobra por cada profissional e não impede as clientes de faltarem? 
> No **Techo PRO**, você tem tudo em um só lugar: link na bio com **Sinal Pix Anti-No-Show** para garantir seu dinheiro mesmo se a cliente faltar, confirmação automática no WhatsApp, DRE financeiro real e design de luxo para o seu salão por apenas **R$ 59,90/mês**. E nós migramos todos os seus clientes do Simples Agenda ou Trinks para cá em 30 segundos de graça!*

---

## 7. Checklist Prático e Priorizado de Implementação (Matriz RICE)

A matriz abaixo classifica as melhorias por:
- **Alcance (Reach):** % de usuários impactados.
- **Impacto (Impact):** Aumento de retenção e vendas (1 = baixo, 5 = transformador).
- **Confiança (Confidence):** Certeza técnica de implementação (80% a 100%).
- **Esforço (Effort):** Homens-hora / complexidade (1 = rápido, 5 = pesado).

| Rank | Funcionalidade | Impacto | Esforço | Prioridade | Status / Próximo Passo |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **#1** | **Taxa de Sinal Pix Anti-No-Show no Agendamento Online** | 5 | 2 | **P0 (Imediato)** | Integrar gateway Pix dinâmico (Asaas/OpenPix) no checkout da bio. |
| **#2** | **Buffer Time / Intervalo pós-serviço (15 min)** | 5 | 1 | **P0 (Imediato)** | Somar ufferMinutes no gerador de horários livres da grade. |
| **#3** | **Regras Anti-Surpresa (Aviso prévio mínimo de 2h e limite de 30 dias)** | 4 | 1 | **P0 (Imediato)** | Validação no date/time picker do agendamento. |
| **#4** | **Bloqueio de Clientes Devedores / Faltosos (Blacklist)** | 4 | 1 | **P1 (Curto Prazo)** | Campo is_blocked no cadastro de clientes com alerta no agendamento. |
| **#5** | **Fila de Espera Dinâmica para Dias Lotados** | 4 | 2 | **P1 (Curto Prazo)** | Botão Avise-me se vagar com modal de encaixe ao desmarcar. |
| **#6** | **Disparo de Confirmação Automática WhatsApp (Sim/Não)** | 5 | 3 | **P1 (Curto Prazo)** | Webhook de entrada via Evolution API / Z-API para mudar status na agenda. |
| **#7** | **Prontuário com Fotos de Antes/Depois e Assinatura Touch** | 4 | 2 | **P1 (Curto Prazo)** | Bucket no Supabase Storage e canvas touch de assinatura no index.html. |
| **#8** | **Relatório da Lei do Salão Parceiro (Segregação de Impostos)** | 4 | 2 | **P2 (Médio Prazo)** | Tela de fechamento de comissões com dedução de taxa de bancada. |
| **#9** | **Sincronização Bidirecional com Google Calendar** | 4 | 4 | **P2 (Médio Prazo)** | Integração OAuth2 com Google Calendar API para bloquear slots pessoais. |
| **#10** | **Checkout Automático da Assinatura do Techo PRO (Asaas)** | 5 | 2 | **P0 (Imediato)** | Edge Function para cobrança de mensalidade e liberação em tempo real. |

---

## 8. Arquitetura de Dados Recomendada (Supabase)

Para suportar essas funcionalidades de nível corporativo, o seguinte esquema SQL deve ser adicionado ao Supabase:

`sql
-- 1. Buffer Time e Regras no Cadastro de Serviços e Empresa
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 15;
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS exige_sinal BOOLEAN DEFAULT FALSE;
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS valor_sinal NUMERIC(10,2) DEFAULT 0.00;

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS min_notice_hours INTEGER DEFAULT 2;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS max_future_days INTEGER DEFAULT 30;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS max_daily_appointments INTEGER DEFAULT 10;

-- 2. Bloqueio de Clientes (Anti-Fraude e Anti-Calote)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT;

-- 3. Fila de Espera (Waitlist)
CREATE TABLE IF NOT EXISTS fila_espera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT NOT NULL,
    data_desejada DATE NOT NULL,
    servicos_ids JSONB NOT NULL,
    status TEXT DEFAULT 'aguardando', -- 'aguardando' | 'notificado' | 'atendido' | 'expirado'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fotos de Evolução do Prontuário (Antes e Depois)
CREATE TABLE IF NOT EXISTS prontuario_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id),
    tipo TEXT NOT NULL, -- 'antes' | 'depois' | 'termo_assinado'
    foto_url TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pagamento de Sinal via Pix no Agendamento
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS sinal_pago BOOLEAN DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS sinal_valor NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS pix_txid TEXT;
`

---

## 9. Conclusão e Próximos Passos

O Techo PRO tem em mãos uma oportunidade ímpar: o mercado brasileiro está saturado de softwares legados caros e engessados (Trinks e Simples Agenda), enquanto os softwares modernos globais (Fresha e Booksy) cobram comissões predatórias sobre os novos clientes e não compreendem as especificidades fiscais brasileiras (Pix instantâneo, Lei do Salão Parceiro e NFS-e).

Ao incorporar as 3 funcionalidades fundamentais imediatas:
1. **Taxa de Sinal Pix Anti-No-Show**;
2. **Buffer Time de higienização entre horários**;
3. **Notificação e confirmação ativa no WhatsApp**;

O Techo PRO transforma-se na **ferramenta de gestão mais completa, rentável e desejada do mercado brasileiro da beleza e estética**, justificando com folga sua expansão e comercialização em escala nacional.
