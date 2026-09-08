# 💅 ZanettIA Agenda Pro — Sistema de Gestão para Manicures & Estética

Sistema completo de agendamento online, frente de caixa (PDV), controle de clientes, fichas de anamnese digital com assinatura e relatórios financeiros, construído especialmente para a rotina de manicures e designers de unhas, inicialmente personalizado para **Letícia Hermann Unhas e Cursos**.

---

## 🚀 Como Rodar Localmente

1. Abra o terminal na pasta `agenda-pro`:
   ```bash
   cd agenda-pro
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra no navegador: [http://localhost:3001](http://localhost:3001)

---

## 📱 Funcionalidades Principais

1. **📅 Agenda Inteligente & Grade de Horários:**
   * Visualização diária e semanal com blocos proporcionais à duração do serviço.
   * Mudança rápida de status: *Agendado, Confirmado, Em Atendimento, Concluído, Cancelado, Falta*.
   * Disparo de WhatsApp de Confirmação e Lembrete em 1 clique.
   * Lançamento direto para recebimento no Caixa (PDV).

2. **🛍️ Frente de Caixa (PDV):**
   * Abertura e fechamento de caixa diário com conferência de valores.
   * Pagamento com PIX, Dinheiro, Cartão de Débito, Cartão de Crédito e Crédito em Haver.
   * Divisão de pagamentos múltiplos (ex: metade PIX, metade dinheiro).
   * Lançamento rápido de despesas diárias, sangrias e suprimento de troco.
   * Envio de comprovante / recibo formatado no WhatsApp da cliente em 1 clique.

3. **👥 Gestão de Clientes (CRM):**
   * Cadastro completo com WhatsApp, aniversário e preferências de estilo de unha.
   * Histórico completo de visitas anteriores e total faturado por cliente.

4. **✨ Catálogo de Serviços Pré-Configurado:**
   * Fibra de vidro (3h - R$ 220)
   * Manutenção fibra (2h30 - R$ 150)
   * Banho de gel (2h - R$ 150)
   * Manutenção banho (2h10 - R$ 150)
   * Esmaltação em gel pés e mãos (R$ 80 a R$ 110)
   * Mão e Pé tradicional (R$ 75)
   * Cursos e remoções

5. **📋 Ficha de Anamnese Digital com Assinatura:**
   * Questionário especializado para unhas (alergias, tipo de lâmina, histórico de fungos, formato desejado).
   * Canvas touch para a cliente assinar com o dedo na tela do celular ou tablet.

6. **🌐 Link Público de Agendamento Online (`/agendar/leticia`):**
   * Link personalizável para colocar na bio do Instagram ou enviar pelo WhatsApp.
   * A cliente escolhe os serviços, vê o valor total e escolhe um horário livre na grade automaticamente.

---

## ☁️ Como Publicar na Nuvem com Custo ZERO (Vercel)

1. Crie um repositório no seu GitHub ou conecte direto à pasta do projeto.
2. Acesse [vercel.com](https://vercel.com) (gratuito) e importe o projeto `agenda-pro`.
3. Clique em **Deploy**.
4. Em menos de 2 minutos você terá uma URL pronta (ex: `https://agenda-leticia.vercel.app` ou seu domínio próprio).
5. No celular da Letícia: abra o link no Safari (iPhone) ou Chrome (Android) e clique em **"Adicionar à Tela de Início"** para instalar como um aplicativo nativo!
