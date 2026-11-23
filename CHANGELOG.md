# Histórico de versões

## 1.1.3 — 2026-11-22

- Retorno às pinceladas horizontais alternadas, revelando a obra de cima para baixo.
- Duração de três segundos e correção da leitura de assinaturas no Android 9 mantidas.
- versionCode 8, para atualização direta da versão 1.1.2 instalada na TV.

## 1.1.2 — 2026-11-22

- Reduzida a duração da transição diagonal de quatro para três segundos.

- Corrigida a coleta de certificados de APKs no Android 9, evitando a mensagem incorreta de APK sem assinatura válida.
- Mantida a comparação obrigatória dos assinantes atuais com a instalação existente.
- versionCode 7; a recuperação de instalações com o atualizador antigo exige uma instalação por ADB ou pelo instalador do Android.

## 1.1.1 — 2026-11-22

- Pinceladas diagonais que avançam do canto superior esquerdo ao inferior direito, mantendo a transição de quatro segundos.
- APK com versionCode 6, compatível com a atualização pelo menu da versão 1.1.

## 1.1 (1.1.0) — 2026-11-22

- Obras reveladas com pinceladas em uma transição de quatro segundos, sem animar relógio ou clima.
- Primeira obra imediata, respeito a movimento reduzido e finalização segura ao sair ou alterar o tema.
- Menu nativo de saída com Buscar atualizações, Voltar ao quadro e Sair.
- Consulta sob demanda à release estável mais recente de ludezam/Quadro-LDZ, com comparação numérica de versões e tratamento de falhas.
- Download direto do APK e abertura do instalador Android, com autorização de fonte desconhecida quando necessária e confirmação final do sistema.
- Repositório localizado pelo ID fixo, suportando renomeação/transferência e até cinco redirecionamentos HTTPS.
- Verificação de tamanho, digest quando disponível, pacote, versão, Android mínimo e mesma assinatura antes de encaminhar o APK ao instalador.

## 0.3.0 — 2026-11-08

- Ícone PNG e banner com pintura de Almeida Júnior e título Quadro LDZ em Georgia.
- Recursos de ícone e banner também declarados na Activity para compatibilidade com launchers de TV.
- Dez pinturas brasileiras adicionais; 40 obras offline, intercaladas.
- Créditos de coleção corrigidos para distinguir obras brasileiras do acervo de Chicago.
- Primeira publicação pública do projeto com documentação, licença e instruções de compilação.

## 0.2.0 — 2026-11-08

- Nome Quadro LDZ, 30 obras offline e rotação a cada 15 minutos.
- Tema claro em tom de papel e tema escuro, sem alterar as cores das pinturas.
- Remoção do YouTube e da linha de horário/fonte da atualização do clima.

## 0.1.0 — 2026-11-08

- Protótipo com relógio, data, cidade, clima e player do YouTube.
- Android mínimo 9, uso horizontal e navegação por controle remoto.
- Pinturas de reserva locais após falhas de acesso ao servidor do museu.
