# Como contribuir

Abra uma issue descrevendo o comportamento esperado, o que aconteceu, modelo do aparelho, versão do Android e versão do WebView. Capturas de tela ajudam; remova dados pessoais antes de publicar.

Para alterações, crie uma branch, mantenha o escopo claro e execute `node tools/verify-panel.cjs`. Se a mudança afetar o Android, compile o APK e registre o aparelho ou emulador usado. Não trate o teste JavaScript como prova de compatibilidade com uma TV.

Novas pinturas precisam ter autoria, origem e licença verificadas no catálogo. Inclua imagens dimensionadas para o painel e preserve as proporções na exibição. Evite adicionar dependências de execução para tarefas já atendidas pela plataforma.

Não envie `tools.local.json`, keystores, credenciais, saídas de compilação ou APKs em commits. Os APKs públicos são distribuídos em Releases. A chave usada para assinar uma atualização deve corresponder à da instalação anterior.
