# Validação e limites

## Validado

- Instalação e abertura em uma TCL com Android 11.
- Tema claro/escuro e carregamento das pinturas conferidos visualmente na TV.
- Nome e novo ícone confirmados pelo usuário no launcher da TV.
- Cidade, clima e preferências funcionando durante o teste.
- Assinatura e alinhamento do APK verificados pelas ferramentas Android.
- Teste automatizado das 40 referências JPEG, dez obras brasileiras, ciclo completo de pinturas, prazo de 15 minutos com relógio simulado, tema persistido e remoção da linha de atualização no clima normal.

## Ainda não validado

- TCL 43S6500 com Android 9 e outros fabricantes/modelos.
- Tablets, versões superiores ao Android 11 e diferentes WebViews.
- Execução contínua por vários dias e comportamento após suspensão profunda da TV.
- Todos os teclados virtuais e caminhos de foco de controles remotos.
- Consumo de memória, energia ou desempenho medidos por profiler.

O manifesto exige Android 9 ou superior e não estabelece versão máxima. Isso permite instalação em versões superiores, mas não equivale a uma certificação de compatibilidade em todos os aparelhos.

## Roteiro manual

1. Abrir pelo launcher e conferir paisagem, nome, ícone e dimensões.
2. Buscar uma cidade, selecionar um resultado, fechar e reabrir.
3. Percorrer Cidade, Outra pintura e Modo escuro com setas e OK.
4. Alterar tema, reiniciar e conferir persistência.
5. Conferir troca manual e automática após 15 minutos com o app aberto.
6. Desconectar a rede: pinturas e relógio devem continuar; o clima salvo deve ser identificado.
7. Reconectar e conferir atualização do clima.
8. Sair pelo botão Início; Voltar abre/fecha o diálogo de orientação no app.

## Limitações conhecidas

- Busca da cidade e clima exigem internet. Não há GPS, conta, música ou YouTube.
- A versão gratuita do Open-Meteo destina-se ao uso não comercial e pode ter limites de serviço.
- O app mantém a tela acordada enquanto está aberto; não controla brilho físico, carga ou desligamento da TV.
- Não há favoritos, escolha de coleção, intervalo configurável ou atualização automática do APK.
- Arte e horários são atualizados enquanto o app está visível; o comportamento em suspensão depende do Android e do fabricante.
