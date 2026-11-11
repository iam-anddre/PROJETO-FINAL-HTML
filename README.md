# AXIS MEDICAL CENTER

Sistema web demonstrativo para organizar algumas rotinas de atendimento de uma unidade de saúde. O projeto foi desenvolvido com HTML, CSS e JavaScript, sem frameworks ou processo de instalação.

> Projeto acadêmico demonstrativo. Os dados ficam armazenados localmente no navegador; não há servidor ou banco de dados. Não use informações reais de pacientes.

## Recursos

- **Painel:** visão geral e atalhos para as áreas do sistema.
- **Cadastro e pacientes:** cadastro de pacientes, listagem e busca por nome ou CPF.
- **Triagem e fila:** registro das informações da triagem, classificação de risco e organização da fila por prioridade.
- **Agendamento:** cadastro e consulta de horários, com opção de cancelar consultas.
- **Médicos:** consulta e busca de profissionais.
- **Leitos:** consulta da ocupação e atualização do estado dos leitos.
- **Usuários:** cadastro e ativação ou desativação de usuários.
- **Prontuário:** página demonstrativa de erro 404 com botão para voltar ao início. 

## Estrutura

```text
PROJETO-FINAL-HTML/
├── css/
│   └── style.css
├── imagens/
│   ├── erro/
│   ├── logo/
│   └── medicos/
├── js/
│   └── app.js
├── paginas/
│   ├── agendamento.html
│   ├── cadastro-pacientes.html
│   ├── fila.html
│   ├── leitos.html
│   ├── medicos.html
│   ├── pacientes.html
│   ├── painel.html
│   ├── prontuario.html
│   ├── prontuarios.html
│   ├── triagem.html
│   └── usuarios.html
└── README.md
```

## Armazenamento

As informações criadas durante o uso são guardadas no `localStorage` do navegador. Elas ficam no mesmo navegador e dispositivo e podem ser apagadas quando os dados de navegação forem limpos. O armazenamento local é apenas para demonstração e não substitui um banco de dados.
