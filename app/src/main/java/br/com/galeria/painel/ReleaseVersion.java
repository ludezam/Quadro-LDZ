package br.com.galeria.painel;

/** Stable three-part release tags; prereleases are deliberately not accepted. */
public final class ReleaseVersion {
    private ReleaseVersion() {}
    public static boolean isNewer(String candidate, String installed) {
        long[] next = parts(candidate), current = parts(installed);
        for (int i = 0; i < 3; i++) {
            if (next[i] != current[i]) return next[i] > current[i];
        }
        return false;
    }
    private static long[] parts(String value) {
        if (value == null || !value.matches("[vV]?[0-9]{1,9}\\.[0-9]{1,9}\\.[0-9]{1,9}")) {
            throw new IllegalArgumentException("Versão de release inválida");
        }
        String[] segments = value.replaceFirst("^[vV]", "").split("\\.");
        return new long[] { Long.parseLong(segments[0]), Long.parseLong(segments[1]), Long.parseLong(segments[2]) };
    }
}
