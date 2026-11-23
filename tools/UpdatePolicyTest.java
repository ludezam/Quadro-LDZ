import br.com.galeria.painel.UpdatePolicy;
public class UpdatePolicyTest {
 public static void main(String[] args) throws Exception {
  check(UpdatePolicy.releasesUrl(1450351190L,"novo-dono/novo-nome").endsWith("novo-dono/novo-nome/releases/latest"));
  check(UpdatePolicy.redirect("https://api.github.com/repos/antigo/repo","/repos/novo/repo",true).equals("https://api.github.com/repos/novo/repo"));
  check(UpdatePolicy.allowed("https://release-assets.githubusercontent.com/path?token=temporary",false));
  for(String bad:new String[]{"http://github.com/file.apk","https://github.com.evil.org/file.apk","https://githubusercontent.com.evil.org/a","https://user:password@github.com/a","file:///a","https://github.com:8443/a"})check(!UpdatePolicy.allowed(bad,false));
  check(!UpdatePolicy.allowed("https://github.com/a",true));
  try{UpdatePolicy.releasesUrl(999L,"ludezam/Quadro-LDZ");throw new AssertionError();}catch(IllegalArgumentException expected){}
  try{UpdatePolicy.redirect("https://github.com/a","https://example.com/other.apk",false);throw new AssertionError();}catch(IllegalArgumentException expected){}
  System.out.println("OK: ID estável, nome/conta alterados, redirecionamentos GitHub/CDN e rejeição de destinos inválidos.");
 }
 private static void check(boolean value){if(!value)throw new AssertionError();}
}
