# Política de Privacidade — Ageris

**Última atualização:** 29 de maio de 2026

Esta Política de Privacidade descreve como a Ageris ("nós", "nossa plataforma")
coleta, utiliza, armazena e protege os dados pessoais dos usuários ("você"),
em conformidade com a **Lei nº 13.709/2018 — Lei Geral de Proteção de Dados
Pessoais (LGPD)**.

> **[A PREENCHER]** Operadora da plataforma: `[RAZÃO SOCIAL]`, inscrita no
> CNPJ sob o nº `[00.000.000/0000-00]`, com sede em `[ENDEREÇO]`.

---

## 1. Quais dados coletamos

Coletamos apenas os dados necessários para operar o marketplace de compra e
venda de gado e processar pagamentos.

### 1.1 Dados de cadastro (fornecidos por você)
- Nome e sobrenome
- E-mail
- Telefone
- CPF ou CNPJ (documento fiscal)
- Região (UF / município)
- Número de registro de veículo (CAR), quando informado

### 1.2 Dados de uso da plataforma
- Lotes de gado cadastrados (raça, sexo, finalidade, peso, idade, localização)
- Anúncios criados, seu status e mídias (fotos e vídeos)
- Histórico de compras e vendas

### 1.3 Dados de pagamento e repasse
- Dados de recebimento (chave PIX ou dados bancários para TED)
- Registros de cobranças e confirmações de pagamento

### 1.4 Dados técnicos
- Identificador de autenticação (Firebase UID)
- Endereço IP e registros de acesso (logs), usados para segurança e auditoria

Não coletamos dados pessoais sensíveis (origem racial, opinião política,
saúde, biometria etc.).

---

## 2. Por que coletamos (finalidades e bases legais)

| Finalidade | Base legal (LGPD, art. 7º) |
|---|---|
| Criar e manter sua conta | Execução de contrato (art. 7º, V) |
| Publicar e gerenciar anúncios | Execução de contrato (art. 7º, V) |
| Processar pagamentos e repasses | Execução de contrato (art. 7º, V) |
| Cumprir obrigações fiscais e financeiras | Obrigação legal/regulatória (art. 7º, II) |
| Prevenir fraudes e garantir segurança | Legítimo interesse (art. 7º, IX) |
| Comunicações sobre o serviço | Execução de contrato / consentimento |

---

## 3. Onde e como seus dados são armazenados

Seus dados são armazenados em provedores de infraestrutura confiáveis:

- **Banco de dados (PostgreSQL):** dados de cadastro, anúncios, lotes,
  dados de repasse e registros de auditoria.
- **Firebase Authentication (Google):** gerenciamento de identidade e senha.
  Sua senha **nunca** é armazenada por nós em texto aberto — ela é gerida
  diretamente pelo Firebase.
- **Firebase Storage (Google):** mídias (fotos e vídeos) dos anúncios.

O acesso aos seus dados de cadastro e de repasse é restrito à sua própria
conta — outros usuários só visualizam informações públicas do vendedor
(nome e UF).

---

## 4. Compartilhamento com terceiros

Compartilhamos dados pessoais **somente** quando necessário para prestar o
serviço:

- **Asaas (processador de pagamentos):** ao realizar uma cobrança, enviamos
  seu nome e documento (CPF/CNPJ) para o Asaas, responsável por processar
  pagamentos PIX e repasses. O tratamento desses dados pelo Asaas segue a
  política de privacidade da própria empresa.
- **Google / Firebase:** conforme descrito na seção 3.
- **Autoridades públicas:** quando exigido por lei ou ordem judicial.

Não vendemos nem alugamos seus dados pessoais.

### Transferência internacional
Os provedores Firebase (Google) e Asaas podem processar dados em servidores
fora do Brasil. Essas transferências observam as salvaguardas previstas nos
arts. 33 a 36 da LGPD.

---

## 5. Por quanto tempo guardamos seus dados

- **Conta ativa:** mantemos seus dados enquanto sua conta existir.
- **Após exclusão da conta:** dados de cadastro são removidos; registros
  financeiros e fiscais (transações, pagamentos) são mantidos pelo prazo
  legal aplicável (até **5 anos**) para cumprimento de obrigações legais.
- **Logs de segurança:** mantidos por período limitado para auditoria.

---

## 6. Seus direitos como titular (LGPD, art. 18)

Você pode, a qualquer momento:

- **Acessar** os dados que mantemos sobre você;
- **Corrigir** dados incompletos ou desatualizados (pela tela de perfil);
- **Excluir** sua conta e os dados associados (função "Excluir conta" no app);
- **Solicitar portabilidade** dos seus dados;
- **Revogar consentimento** e obter informações sobre o tratamento.

> **Observação:** O CPF/CNPJ não pode ser alterado após a criação de uma
> conta de pagamento (Asaas), por exigência do processador financeiro.

Para exercer esses direitos, entre em contato pelo canal abaixo.

---

## 7. Segurança dos dados

Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:

- Autenticação obrigatória (token Firebase) em todas as requisições autenticadas;
- Controle de acesso: cada usuário só acessa os próprios dados sensíveis;
- Comunicação criptografada (HTTPS/TLS) em produção;
- Limitação de taxa (rate limiting) para prevenir abuso;
- Registros de auditoria para ações sensíveis (ex.: exclusão de conta).

Nenhum sistema é 100% seguro; em caso de incidente de segurança relevante,
notificaremos os titulares e a ANPD conforme exigido pela LGPD.

---

## 8. Contato e Encarregado (DPO)

Para dúvidas, solicitações ou exercício de direitos relativos aos seus dados
pessoais, entre em contato:

- **E-mail:** ageris.contato@gmail.com

> **[A PREENCHER]** Encarregado pelo Tratamento de Dados (DPO): `[NOME]`.

---

## 9. Alterações nesta política

Podemos atualizar esta Política periodicamente. A data da última atualização
estará sempre indicada no topo do documento. Alterações relevantes serão
comunicadas pelos canais da plataforma.
