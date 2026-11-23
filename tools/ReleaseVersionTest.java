import br.com.galeria.painel.ReleaseVersion;
public class ReleaseVersionTest {
    public static void main(String[] args) {
        check(ReleaseVersion.isNewer("v1.1.3", "1.1.2"));
        check(!ReleaseVersion.isNewer("v1.1.3", "1.1.3"));
        check(ReleaseVersion.isNewer("v1.1.2", "0.4.0"));
        check(ReleaseVersion.isNewer("v1.1.2", "1.1.1"));
        check(ReleaseVersion.isNewer("v1.1.1", "1.1.0"));
        check(!ReleaseVersion.isNewer("v1.1.1", "1.1.1"));
        check(!ReleaseVersion.isNewer("v0.4.0", "0.4.0"));
        check(!ReleaseVersion.isNewer("v0.3.0", "0.4.0"));
        check(ReleaseVersion.isNewer("v0.10.0", "0.9.9"));
        check(ReleaseVersion.isNewer("v1.0.0", "0.99.99"));
        check(ReleaseVersion.isNewer("0.4.1", "0.4.0"));
        for (String invalid : new String[]{"v0.5.0-beta", "latest", "0.4", "-1.0.0", "9999999999.0.0"}) {
            try { ReleaseVersion.isNewer(invalid, "0.4.0"); throw new AssertionError(invalid); }
            catch (IllegalArgumentException expected) { }
        }
        System.out.println("OK: comparação numérica de releases e rejeição de versões inválidas/prereleases.");
    }
    private static void check(boolean value) { if (!value) throw new AssertionError(); }
}
