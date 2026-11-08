# Privacidade — Quadro LDZ 0.3.0

Atualizado em 8 de novembro de 2026.

O aplicativo não exige conta, não inclui anúncios, analytics ou rastreadores próprios e não acessa GPS, câmera, microfone, contatos ou arquivos pessoais. A permissão declarada é acesso à internet. As pinturas são arquivos locais incluídos no APK.

## Dados locais

O armazenamento local do WebView guarda a cidade escolhida (incluindo coordenadas e fuso), a última previsão, o tema e a posição da sequência de pinturas. Não há servidor próprio nem sincronização. Apagar os dados do aplicativo ou desinstalá-lo remove essas preferências; não há exportação ou recuperação na interface.

## Serviços externos

Ao pesquisar uma cidade, o termo digitado é enviado por HTTPS ao serviço de geocodificação do Open-Meteo. Para obter o clima, suas coordenadas são enviadas à API de previsão do Open-Meteo na abertura, ao retornar ao app, recuperar a conexão e a cada 30 minutos enquanto o app está ativo. Esses serviços recebem o endereço IP da conexão e os dados normais de uma requisição de rede.

Consulte a [política de privacidade do Open-Meteo](https://open-meteo.com/en/terms). Não são feitas consultas ao museu ou ao Wikimedia durante o uso normal. `galeria.example` é uma origem HTTPS sintética interceptada pelo aplicativo para servir os arquivos internos; não hospeda um serviço deste projeto.

## Relatos de problemas

Ao abrir uma issue pública, remova endereços IP, dados pessoais, coordenadas e qualquer informação que não queira compartilhar. Não publique chaves de assinatura ou credenciais.
