Ferramentas-base (validadas no Context7)
- Chrome Extensions (MV3) — ID: /websites/developer_chrome_extensions; base oficial para manifest_version: 3, service_worker, content_scripts, permissions, host_permissions.
- MDN WebExtensions — ID: /websites/developer_mozilla_en-us_mozilla_add-ons_webextensions; arquitetura e boas práticas cross-browser (mensageria, scripts de conteúdo, permissões).
- webextension-polyfill — ID: /mozilla/webextension-polyfill; padroniza API em browser.* com Promises (melhora compatibilidade Chrome/Firefox).
APIs/peças que você vai precisar na extensão
- manifest.json MV3 com background.service_worker e type: "module" (quando necessário).
- content_scripts para interagir com o DOM do WhatsApp Web.
- Mensageria entre content script e service worker (runtime.sendMessage, onMessage).
- host_permissions para domínios do WhatsApp Web.
- storage (storage.local) para estado/configuração da automação.
- scripting + activeTab (injeções sob demanda) e alarms (agendamentos confiáveis no MV3).
Stack prática (recomendada)
- Runtime: APIs nativas WebExtension + webextension-polyfill.
- Build: Vite (ou Plasmo) + TypeScript.
- Qualidade: ESLint + Prettier.
- Testes: Playwright (E2E no navegador) para fluxos críticos.
Cuidados específicos para WhatsApp Web
- O WhatsApp Web muda DOM com frequência; automações por seletor quebram fácil.
- Priorize arquitetura resiliente (detecção de elementos + retries + fallback).
- Atenção aos termos de uso/risco de bloqueio ao automatizar ações em conta real.
Se quiser, no próximo passo eu te entrego um blueprint de arquitetura (estrutura de pastas + fluxo de mensagens + permissões mínimas) já pronto para iniciar o projeto.





Plano de aprendizado/implementação (ordem ideal)
- Fase 1: Fundamentos MV3  
  - Criar extensão mínima com service_worker, content_script e popup simples.
- Fase 2: Mensageria e estado  
  - Implementar fluxo content_script -> service_worker -> storage.local.
- Fase 3: Automação no WhatsApp Web  
  - Ler DOM com seletores resilientes, detectar elementos, retries e fallback.
- Fase 4: Comandos seguros  
  - Criar “ações” explícitas (ex: coletar chats, preparar mensagem), evitando automação agressiva.
- Fase 5: Robustez  
  - Logs estruturados, tratamento de erro, feature flags e testes E2E com Playwright.