package br.com.galeria.painel;

import java.net.URI;
import java.net.URL;

public final class UpdatePolicy {
    public static final long REPOSITORY_ID = 1450351190L;
    public static final String REPOSITORY = "https://api.github.com/repositories/" + REPOSITORY_ID;
    private UpdatePolicy() {}
    public static boolean allowed(String address, boolean api) {
        try {
            URI uri = new URI(address);
            String host = uri.getHost();
            if (!"https".equalsIgnoreCase(uri.getScheme()) || host == null || uri.getUserInfo() != null
                || (uri.getPort() != -1 && uri.getPort() != 443)) return false;
            host = host.toLowerCase(java.util.Locale.ROOT);
            return api ? host.equals("api.github.com")
                : host.equals("github.com") || host.endsWith(".githubusercontent.com");
        } catch (Exception error) { return false; }
    }
    public static String redirect(String current, String location, boolean api) throws Exception {
        if (location == null || location.isEmpty()) throw new IllegalArgumentException("Redirecionamento vazio");
        String next = new URL(new URL(current), location).toString();
        if (!allowed(next, api)) throw new IllegalArgumentException("Endereço de atualização não permitido");
        return next;
    }
    public static String releasesUrl(long id, String fullName) {
        if (id != REPOSITORY_ID || fullName == null || !fullName.matches("[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+")) {
            throw new IllegalArgumentException("Repositório de atualização não reconhecido");
        }
        return "https://api.github.com/repos/" + fullName + "/releases/latest";
    }
}
