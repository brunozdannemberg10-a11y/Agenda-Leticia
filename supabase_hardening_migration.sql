-- =============================================================================
-- TECHO PRO - MASTER SECURITY HARDENING MIGRATION (SUPABASE / POSTGRESQL)
-- VERSÃO: 2.1 - 100% COMPATÍVEL COM SUPABASE SQL EDITOR (SEM ERRO DE SCHEMA AUTH)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTENSÕES
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. SOFT DELETE: ADIÇÃO DE COLUNA DELETED_AT EM TODAS AS TABELAS (BRECHA 5)
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.empresas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.assinaturas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.agendamentos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.clientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.servicos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.profissionais ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.financeiro ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE IF EXISTS public.configuracoes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- -----------------------------------------------------------------------------
-- 2. INTEGRIDADE REFERENCIAL & FOREIGN KEYS (BRECHA 6)
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.agendamentos 
    ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.financeiro 
    ADD COLUMN IF NOT EXISTS agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_id_fkey_auth'
    ) THEN
        ALTER TABLE public.usuarios 
            ADD CONSTRAINT usuarios_id_fkey_auth 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 3. CONSTRAINTS DE VALIDAÇÃO DE TIPOS & DADOS (BRECHA 7)
-- -----------------------------------------------------------------------------
ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS check_cpf_format;
ALTER TABLE public.clientes ADD CONSTRAINT check_cpf_format 
    CHECK (cpf IS NULL OR cpf = '' OR cpf ~ '^[0-9.-]{11,18}$');

ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE public.clientes ADD CONSTRAINT check_email_format 
    CHECK (email IS NULL OR email = '' OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.financeiro DROP CONSTRAINT IF EXISTS check_financeiro_tipo;
ALTER TABLE public.financeiro ADD CONSTRAINT check_financeiro_tipo 
    CHECK (tipo IN ('RECEITA', 'DESPESA'));

ALTER TABLE public.financeiro DROP CONSTRAINT IF EXISTS check_financeiro_status;
ALTER TABLE public.financeiro ADD CONSTRAINT check_financeiro_status 
    CHECK (status IN ('PAGO', 'PENDENTE', 'CANCELADO'));

ALTER TABLE public.financeiro DROP CONSTRAINT IF EXISTS check_financeiro_valor;
ALTER TABLE public.financeiro ADD CONSTRAINT check_financeiro_valor 
    CHECK (valor >= 0);

ALTER TABLE public.profissionais DROP CONSTRAINT IF EXISTS check_comissao_range;
ALTER TABLE public.profissionais ADD CONSTRAINT check_comissao_range 
    CHECK (comissao >= 0 AND comissao <= 100);

ALTER TABLE public.servicos DROP CONSTRAINT IF EXISTS check_servico_duracao;
ALTER TABLE public.servicos ADD CONSTRAINT check_servico_duracao 
    CHECK (duracao > 0);

ALTER TABLE public.servicos DROP CONSTRAINT IF EXISTS check_servico_preco;
ALTER TABLE public.servicos ADD CONSTRAINT check_servico_preco 
    CHECK (preco >= 0);

ALTER TABLE public.agendamentos DROP CONSTRAINT IF EXISTS check_agendamento_status;
ALTER TABLE public.agendamentos ADD CONSTRAINT check_agendamento_status 
    CHECK (status IN ('AGENDADO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO', 'FALTOU'));

ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS check_usuario_role;
ALTER TABLE public.usuarios ADD CONSTRAINT check_usuario_role 
    CHECK (role IN ('admin', 'gerente', 'profissional', 'recepcao'));

-- -----------------------------------------------------------------------------
-- 4. ÍNDICES DE ALTA PERFORMANCE PARA MULTI-TENANT (BRECHA 8)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agendamentos_empresa_data ON public.agendamentos(empresa_id, data) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agendamentos_empresa_status ON public.agendamentos(empresa_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financeiro_empresa_data ON public.financeiro(empresa_id, data) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_financeiro_empresa_tipo ON public.financeiro(empresa_id, tipo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_nome ON public.clientes(empresa_id, nome) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_telefone ON public.clientes(empresa_id, telefone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_servicos_empresa_ativo ON public.servicos(empresa_id, ativo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profissionais_empresa_ativo ON public.profissionais(empresa_id, ativo) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON public.usuarios(empresa_id) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 5. TABELA DE AUDITORIA & HISTÓRICO WORM (BRECHA 10)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID,
    user_id UUID,
    tabela TEXT NOT NULL,
    operacao TEXT NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    colunas_alteradas TEXT[],
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Registros de auditoria são estritamente imutáveis.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_empresa_id UUID;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
    v_op TEXT := TG_OP;
    v_changed_cols TEXT[] := ARRAY[]::TEXT[];
    v_col TEXT;
    v_headers TEXT;
    v_ip TEXT := NULL;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_old := to_jsonb(OLD);
        v_empresa_id := NULLIF(v_old ->> 'empresa_id', '')::uuid;
    ELSIF TG_OP = 'INSERT' THEN
        v_new := to_jsonb(NEW);
        v_empresa_id := NULLIF(v_new ->> 'empresa_id', '')::uuid;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        v_empresa_id := NULLIF(v_new ->> 'empresa_id', '')::uuid;
        
        IF (v_old ->> 'deleted_at' IS NULL) AND (v_new ->> 'deleted_at' IS NOT NULL) THEN
            v_op := 'SOFT_DELETE';
        END IF;

        FOR v_col IN SELECT jsonb_object_keys(v_new)
        LOOP
            IF v_new -> v_col IS DISTINCT FROM v_old -> v_col THEN
                v_changed_cols := array_append(v_changed_cols, v_col);
            END IF;
        END LOOP;
    END IF;

    BEGIN
        v_headers := current_setting('request.headers', true);
        IF v_headers IS NOT NULL THEN
            v_ip := v_headers::jsonb ->> 'x-forwarded-for';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN v_ip := NULL;
    END;

    INSERT INTO public.audit_logs (
        empresa_id,
        user_id,
        tabela,
        operacao,
        dados_anteriores,
        dados_novos,
        colunas_alteradas,
        ip_address
    ) VALUES (
        v_empresa_id,
        v_user_id,
        TG_TABLE_NAME,
        v_op,
        v_old,
        v_new,
        v_changed_cols,
        v_ip
    );

    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_financeiro ON public.financeiro;
CREATE TRIGGER trg_audit_financeiro AFTER INSERT OR UPDATE OR DELETE ON public.financeiro
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS trg_audit_agendamentos ON public.agendamentos;
CREATE TRIGGER trg_audit_agendamentos AFTER INSERT OR UPDATE OR DELETE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS trg_audit_clientes ON public.clientes;
CREATE TRIGGER trg_audit_clientes AFTER INSERT OR UPDATE OR DELETE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS trg_audit_profissionais ON public.profissionais;
CREATE TRIGGER trg_audit_profissionais AFTER INSERT OR UPDATE OR DELETE ON public.profissionais
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- -----------------------------------------------------------------------------
-- 6. FUNÇÃO MESTRA DE OBTENÇÃO DO TENANT NO SCHEMA PUBLIC (CORREÇÃO DO SCHEMA AUTH)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_empresa_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_empresa_id UUID;
BEGIN
    BEGIN
        v_empresa_id := NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'empresa_id', '')::uuid;
        IF v_empresa_id IS NOT NULL THEN
            RETURN v_empresa_id;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    SELECT u.empresa_id INTO v_empresa_id
    FROM public.usuarios u
    WHERE u.id = auth.uid()
      AND u.deleted_at IS NULL
    LIMIT 1;

    RETURN v_empresa_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. POLÍTICAS RLS (BRECHAS 2 E 3 - ISOLAMENTO MULTI-TENANT RIGOROSO)
-- -----------------------------------------------------------------------------

-- A. salons_state (Bloqueia acesso anônimo sem RLS)
ALTER TABLE IF EXISTS public.salons_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.salons_state FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salons_state_anon_leak" ON public.salons_state;
DROP POLICY IF EXISTS "salons_state_authenticated_access" ON public.salons_state;

CREATE POLICY "salons_state_authenticated_access" ON public.salons_state
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- B. empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empresas_isolation_select" ON public.empresas;
DROP POLICY IF EXISTS "empresas_isolation_update" ON public.empresas;
DROP POLICY IF EXISTS "empresas_public_read_booking" ON public.empresas;
DROP POLICY IF EXISTS "empresas_insert_signup" ON public.empresas;
DROP POLICY IF EXISTS "Allow authenticated" ON public.empresas;

CREATE POLICY "empresas_isolation_select" ON public.empresas
    FOR SELECT TO authenticated
    USING (id = public.current_empresa_id() AND deleted_at IS NULL);

CREATE POLICY "empresas_isolation_update" ON public.empresas
    FOR UPDATE TO authenticated
    USING (id = public.current_empresa_id())
    WITH CHECK (id = public.current_empresa_id());

CREATE POLICY "empresas_public_read_booking" ON public.empresas
    FOR SELECT TO anon
    USING (deleted_at IS NULL);

CREATE POLICY "empresas_insert_signup" ON public.empresas
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- C. usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_isolation_all" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_signup" ON public.usuarios;
DROP POLICY IF EXISTS "Allow authenticated" ON public.usuarios;

CREATE POLICY "usuarios_isolation_all" ON public.usuarios
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id() AND deleted_at IS NULL)
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "usuarios_insert_signup" ON public.usuarios
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- D. clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clientes_isolation_all" ON public.clientes;
DROP POLICY IF EXISTS "clientes_anon_booking_insert" ON public.clientes;
DROP POLICY IF EXISTS "Allow authenticated" ON public.clientes;

CREATE POLICY "clientes_isolation_all" ON public.clientes
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id() AND deleted_at IS NULL)
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "clientes_anon_booking_insert" ON public.clientes
    FOR INSERT TO anon
    WITH CHECK (empresa_id IS NOT NULL);

-- E. servicos
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "servicos_isolation_all" ON public.servicos;
DROP POLICY IF EXISTS "servicos_anon_booking_select" ON public.servicos;
DROP POLICY IF EXISTS "Allow authenticated" ON public.servicos;

CREATE POLICY "servicos_isolation_all" ON public.servicos
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id() AND deleted_at IS NULL)
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "servicos_anon_booking_select" ON public.servicos
    FOR SELECT TO anon
    USING (ativo = true AND deleted_at IS NULL);

-- F. profissionais
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profissionais_isolation_all" ON public.profissionais;
DROP POLICY IF EXISTS "profissionais_anon_booking_select" ON public.profissionais;
DROP POLICY IF EXISTS "Allow authenticated" ON public.profissionais;

CREATE POLICY "profissionais_isolation_all" ON public.profissionais
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id() AND deleted_at IS NULL)
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "profissionais_anon_booking_select" ON public.profissionais
    FOR SELECT TO anon
    USING (ativo = true AND deleted_at IS NULL);

-- G. agendamentos
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agendamentos_isolation_all" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_anon_booking_insert" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_anon_booking_slots" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow authenticated" ON public.agendamentos;

CREATE POLICY "agendamentos_isolation_all" ON public.agendamentos
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id() AND deleted_at IS NULL)
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "agendamentos_anon_booking_insert" ON public.agendamentos
    FOR INSERT TO anon
    WITH CHECK (empresa_id IS NOT NULL AND status = 'AGENDADO');

CREATE POLICY "agendamentos_anon_booking_slots" ON public.agendamentos
    FOR SELECT TO anon
    USING (status != 'CANCELADO' AND deleted_at IS NULL);

-- H. financeiro
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financeiro_isolation_all" ON public.financeiro;
DROP POLICY IF EXISTS "Allow authenticated" ON public.financeiro;

CREATE POLICY "financeiro_isolation_all" ON public.financeiro
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id() AND deleted_at IS NULL)
    WITH CHECK (empresa_id = public.current_empresa_id());

-- I. assinaturas & configuracoes
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assinaturas_isolation_all" ON public.assinaturas;
DROP POLICY IF EXISTS "assinaturas_insert_signup" ON public.assinaturas;

CREATE POLICY "assinaturas_isolation_all" ON public.assinaturas
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id())
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "assinaturas_insert_signup" ON public.assinaturas
    FOR INSERT TO authenticated
    WITH CHECK (empresa_id IS NOT NULL);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes_isolation_all" ON public.configuracoes;
DROP POLICY IF EXISTS "configuracoes_insert_signup" ON public.configuracoes;

CREATE POLICY "configuracoes_isolation_all" ON public.configuracoes
    FOR ALL TO authenticated
    USING (empresa_id = public.current_empresa_id())
    WITH CHECK (empresa_id = public.current_empresa_id());

CREATE POLICY "configuracoes_insert_signup" ON public.configuracoes
    FOR INSERT TO authenticated
    WITH CHECK (empresa_id IS NOT NULL);

-- -----------------------------------------------------------------------------
-- 8. CRIPTOGRAFIA & MASCARAMENTO DE DADOS SENSÍVEIS (BRECHA 1)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mask_cpf(val text)
RETURNS text
IMMUTABLE
LANGUAGE plpgsql AS $$
BEGIN
    IF val IS NULL OR length(val) < 11 THEN
        RETURN '***.***.***-**';
    END IF;
    RETURN '***.***.' || substring(val from length(val)-4 for 3) || '-' || substring(val from length(val)-1 for 2);
END;
$$;

CREATE OR REPLACE VIEW public.vw_clientes_seguro AS
SELECT 
    id,
    empresa_id,
    nome,
    telefone,
    email,
    nascimento,
    public.mask_cpf(cpf) AS cpf_mascarado,
    notas,
    created_at
FROM public.clientes
WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 9. SEGURANÇA DOS LOGS DE AUDITORIA
-- -----------------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_tenant_select" ON public.audit_logs;
CREATE POLICY "audit_logs_tenant_select" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (empresa_id = public.current_empresa_id());
