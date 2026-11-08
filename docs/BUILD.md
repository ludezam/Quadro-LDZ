# Compilação

## Processo validado no Windows

Requisitos: JDK 17, Android SDK Platform 34, Android SDK Build-Tools 34.0.0 e PowerShell. Node.js 20 ou superior é usado apenas para os testes auxiliares.

1. Instale o JDK e o SDK a partir das fontes oficiais: [JDK Temurin](https://adoptium.net/temurin/releases/?version=17) e [Android Studio / ferramentas de linha de comando](https://developer.android.com/studio).
2. No SDK Manager, instale **Android SDK Platform 34** e **Android SDK Build-Tools 34.0.0**.
3. Defina `JAVA_HOME` e `ANDROID_HOME`, ou copie `tools.local.example.json` para `tools.local.json` e ajuste os caminhos locais. Não publique esse arquivo.
4. Na raiz do projeto, execute:

```powershell
node tools/verify-panel.cjs
./build-apk.ps1
```

O resultado é `outputs/Quadro-LDZ-0.3.0-teste.apk`. O script compila Java, gera DEX, empacota os recursos, alinha, assina e verifica o APK. São usadas pastas de trabalho novas em `build/manual` a cada execução; o SDK não é alterado.

O script cria uma chave de desenvolvimento em `.android/galeria-debug.keystore` quando ela não existe. Essa pasta é ignorada pelo Git. A senha convencional de desenvolvimento no script não é uma credencial de produção. Guarde a chave local para continuar instalando atualizações sobre o mesmo app; um clone novo gera outra chave e não substitui uma instalação assinada com a chave anterior.

## Android Studio / Gradle

O projeto também declara AGP 8.7.3, Gradle compatível 8.9, JDK 17 e SDK 34. Abra a pasta no Android Studio, configure o SDK e uma instalação do Gradle 8.9. O wrapper não está incluído. Alternativamente, com Gradle 8.9 no PATH:

```text
gradle assembleDebug
```

O APK dessa alternativa fica em `app/build/outputs/apk/debug`. O processo de distribuição desta versão foi executado pelo script PowerShell; o fluxo Gradle não foi validado em aparelho.

## GitHub Actions

O workflow de verificação executa o teste JavaScript e compila um APK de desenvolvimento no Windows. A chave é efêmera no runner. O artefato de CI serve para teste e não possui garantia de assinatura compatível com o APK de Releases; não o use como atualização de uma instalação existente.

## Estrutura

| Caminho | Função |
| --- | --- |
| `app/src/main/java/.../MainActivity.java` | Activity Android e recursos HTTPS locais do WebView |
| `app/src/main/assets/index.html` | Interface, cidade, clima, tema e rotação |
| `app/src/main/assets/art/` | 40 pinturas, catálogo e fontes |
| `app/src/main/res/` | Ícone, banner e nome |
| `tools/verify-panel.cjs` | Verificações funcionais com DOM e relógio simulados |
| `tools/make-banner.ps1` | Geração de ícone e banner |
| `tools/package-*.cjs` | Registro do processo de preparação dos acervos |

As imagens já estão no repositório: não execute scripts de download para compilar. Eles usam os arquivos intermediários de pesquisa em `build`, que não são distribuídos, e documentam a preparação da seleção. As origens individuais estão no catálogo.
