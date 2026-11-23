package br.com.galeria.painel;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import java.io.*;
import java.net.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.*;

final class AppUpdater {
    static final int INSTALL_PERMISSION = 410;
    private final Activity activity;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicBoolean cancelled = new AtomicBoolean();
    private volatile HttpURLConnection connection;
    private boolean busy;
    private AlertDialog progress;
    private JSONObject pending;
    AppUpdater(Activity activity) { this.activity = activity; }
    private PackageInfo installed() throws Exception {
        return activity.getPackageManager().getPackageInfo(activity.getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
    }
    private boolean alive() { return !activity.isFinishing() && !activity.isDestroyed(); }
    private void cancel() { cancelled.set(true); HttpURLConnection c = connection; if (c != null) c.disconnect(); }
    void close() { cancel(); worker.shutdownNow(); if (progress != null) progress.dismiss(); }
    private void status(String text) {
        activity.runOnUiThread(() -> { if (alive() && progress != null && progress.isShowing()) progress.setMessage(text); });
    }
    void check() {
        if (busy) return;
        busy = true; cancelled.set(false);
        progress = new AlertDialog.Builder(activity).setTitle("Atualizações do Quadro LDZ")
            .setMessage("Buscando uma nova versão…").setNegativeButton("Cancelar", (dialog, which) -> cancel()).create();
        progress.setOnCancelListener(dialog -> cancel()); progress.show();
        worker.execute(() -> {
            try {
                JSONObject repo = json(UpdatePolicy.REPOSITORY);
                String releases = UpdatePolicy.releasesUrl(repo.getLong("id"), repo.getString("full_name"));
                JSONObject release = json(releases);
                if (release.optBoolean("draft") || release.optBoolean("prerelease")) throw new IOException("Release não estável");
                String tag = release.getString("tag_name");
                if (!ReleaseVersion.isNewer(tag, installed().versionName)) {
                    complete("Nenhuma atualização disponível.\n\nVersão instalada: " + installed().versionName); return;
                }
                JSONArray assets = release.getJSONArray("assets"); JSONObject asset = null;
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject candidate = assets.getJSONObject(i);
                    String name = candidate.optString("name").toLowerCase(Locale.ROOT);
                    if (name.endsWith(".apk") && name.contains("quadro") && "uploaded".equals(candidate.optString("state"))) {
                        if (asset != null) throw new IOException("A release contém vários APKs; é necessário um APK universal inequívoco.");
                        asset = candidate;
                    }
                }
                if (asset == null) throw new IOException("A nova release ainda não possui APK disponível.");
                final JSONObject selected = asset;
                final String expectedVersion = tag;
                if (cancelled.get()) return;
                activity.runOnUiThread(() -> {
                    if (!alive() || cancelled.get()) return;
                    if (!activity.getPackageManager().canRequestPackageInstalls()) {
                        pending = selected;
                        try { pending.put("expected_version", expectedVersion); } catch (JSONException ignored) { }
                        progress.dismiss(); busy = false;
                        new AlertDialog.Builder(activity).setTitle("Permitir atualização")
                            .setMessage("Para atualizar diretamente, permita que o Quadro LDZ instale aplicativos. O Android ainda pedirá confirmação antes de instalar o APK.")
                            .setPositiveButton("Autorizar no Android", (dialog, which) -> {
                                try { activity.startActivityForResult(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                                    Uri.parse("package:" + activity.getPackageName())), INSTALL_PERMISSION); }
                                catch (Exception error) { pending = null; show("Esta TV não disponibilizou a autorização de instalação para o app."); }
                            }).setNegativeButton("Cancelar", (dialog, which) -> pending = null).show();
                    } else beginDownload(selected, expectedVersion);
                });
            } catch (Exception error) { fail(error); }
            finally {
                HttpURLConnection remaining = connection; if (remaining != null) remaining.disconnect(); connection = null;
                activity.runOnUiThread(() -> { if (cancelled.get()) busy = false; });
            }
        });
    }
    void permissionResult() {
        JSONObject asset = pending; pending = null;
        if (asset == null) return;
        if (!activity.getPackageManager().canRequestPackageInstalls()) { show("A instalação não foi autorizada. Nenhuma atualização foi instalada."); return; }
        cancelled.set(false); busy = true;
        progress = new AlertDialog.Builder(activity).setTitle("Atualizando Quadro LDZ")
            .setMessage("Baixando a nova versão…").setNegativeButton("Cancelar", (dialog, which) -> cancel()).create();
        progress.setOnCancelListener(dialog -> cancel()); progress.show();
        beginDownload(asset, asset.optString("expected_version"));
    }
    private void beginDownload(JSONObject asset, String version) {
        worker.execute(() -> {
            File folder = new File(activity.getCacheDir(), "updates");
            File part = new File(folder, "update-" + System.nanoTime() + ".part");
            try {
                long expected = asset.getLong("size");
                if (expected <= 0 || expected > 100L * 1024 * 1024) throw new IOException("Tamanho do APK inválido.");
                if (!folder.isDirectory() && !folder.mkdirs()) throw new IOException("Não foi possível preparar o download.");
                HttpURLConnection source = open(asset.getString("browser_download_url"), false);
                long total = 0; int lastPercent = -1; MessageDigest hash = MessageDigest.getInstance("SHA-256");
                try (InputStream input = source.getInputStream(); OutputStream output = new FileOutputStream(part)) {
                    byte[] buffer = new byte[32768]; int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (cancelled.get()) throw new IOException("Cancelado");
                        total += count; if (total > expected) throw new IOException("Tamanho do APK divergente.");
                        output.write(buffer, 0, count); hash.update(buffer, 0, count);
                        int percent = (int)(total * 100 / expected);
                        if (percent != lastPercent) { lastPercent = percent; status("Baixando " + version + "… " + percent + "%"); }
                    }
                } finally { source.disconnect(); connection = null; }
                if (total != expected) throw new IOException("Download incompleto. Tente novamente.");
                StringBuilder hex = new StringBuilder(); for (byte b : hash.digest()) hex.append(String.format(Locale.ROOT, "%02x", b & 255));
                String digest = asset.optString("digest", "");
                if (digest.startsWith("sha256:") && !digest.substring(7).equalsIgnoreCase(hex.toString())) throw new IOException("Verificação de integridade falhou.");
                status("Verificando o APK…"); verifyApk(part, version);
                if (cancelled.get()) return;
                File ready = new File(folder, "update.apk");
                if (ready.exists() && !ready.delete()) throw new IOException("Não foi possível substituir o download anterior.");
                if (!part.renameTo(ready)) throw new IOException("Não foi possível preparar o instalador.");
                activity.runOnUiThread(() -> {
                    busy = false; if (!alive() || cancelled.get()) return;
                    progress.dismiss();
                    Uri uri = Uri.parse("content://" + activity.getPackageName() + ".updates/update.apk");
                    Intent intent = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive")
                        .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.setClipData(ClipData.newRawUri("Atualização Quadro LDZ", uri));
                    try { activity.startActivity(intent); }
                    catch (Exception error) { show("O Android não disponibilizou um instalador de APKs compatível."); }
                });
            } catch (Exception error) { fail(error); }
            finally {
                HttpURLConnection remaining = connection; if (remaining != null) remaining.disconnect(); connection = null;
                if (part.exists()) part.delete();
                activity.runOnUiThread(() -> { if (cancelled.get()) busy = false; });
            }
        });
    }
    private void verifyApk(File file, String version) throws Exception {
        // Android 9 only collects archive certificates when GET_SIGNATURES is also set.
        // Keep GET_SIGNING_CERTIFICATES to compare the actual current signers below.
        PackageInfo apk = activity.getPackageManager().getPackageArchiveInfo(file.getAbsolutePath(),
            PackageManager.GET_SIGNING_CERTIFICATES | PackageManager.GET_SIGNATURES);
        PackageInfo local = installed();
        if (apk == null || !activity.getPackageName().equals(apk.packageName) || apk.getLongVersionCode() <= local.getLongVersionCode()
            || !apk.versionName.equals(version.replaceFirst("^[vV]", "")) || apk.applicationInfo.minSdkVersion > Build.VERSION.SDK_INT) {
            throw new IOException("O APK não é uma atualização compatível do Quadro LDZ.");
        }
        if (apk.signingInfo == null || local.signingInfo == null) throw new IOException("APK sem assinatura válida.");
        Set<String> next = signatures(apk.signingInfo.getApkContentsSigners()), current = signatures(local.signingInfo.getApkContentsSigners());
        if (next.isEmpty() || !next.equals(current)) throw new IOException("A assinatura do APK difere da instalação atual. Atualização recusada.");
    }
    private Set<String> signatures(Signature[] signatures) {
        Set<String> values = new HashSet<>(); for (Signature signature : signatures) values.add(signature.toCharsString()); return values;
    }
    private HttpURLConnection open(String address, boolean api) throws Exception {
        for (int redirects = 0; redirects <= 5; redirects++) {
            if (cancelled.get()) throw new IOException("Cancelado");
            if (!UpdatePolicy.allowed(address, api)) throw new IOException("Endereço de atualização não permitido.");
            HttpURLConnection c = (HttpURLConnection)new URL(address).openConnection(); connection = c;
            c.setInstanceFollowRedirects(false); c.setConnectTimeout(12000); c.setReadTimeout(20000);
            c.setRequestProperty("User-Agent", "Quadro-LDZ-Android");
            if (api) c.setRequestProperty("Accept", "application/vnd.github+json");
            int status = c.getResponseCode();
            if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
                String location = c.getHeaderField("Location"); c.disconnect();
                address = UpdatePolicy.redirect(address, location, api); continue;
            }
            if (status != 200) { c.disconnect(); throw new IOException(status == 403 || status == 429
                ? "O GitHub limitou as consultas. Tente novamente mais tarde." : status == 404
                ? "Nenhuma release pública disponível no momento." : "Não foi possível acessar o GitHub (HTTP " + status + ")."); }
            return c;
        }
        throw new IOException("Excesso de redirecionamentos do GitHub.");
    }
    private JSONObject json(String address) throws Exception {
        HttpURLConnection c = open(address, true);
        try (InputStream input = c.getInputStream(); ByteArrayOutputStream bytes = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096]; int count;
            while ((count = input.read(buffer)) != -1) {
                if (cancelled.get() || bytes.size() + count > 512 * 1024) throw new IOException("Consulta interrompida.");
                bytes.write(buffer, 0, count);
            }
            return new JSONObject(bytes.toString("UTF-8"));
        } finally { c.disconnect(); connection = null; }
    }
    private void fail(Exception error) {
        complete("Não foi possível atualizar agora.\n\n" + (error instanceof IOException ? error.getMessage() : "Resposta de atualização inválida."));
    }
    private void complete(String message) {
        activity.runOnUiThread(() -> {
            busy = false; if (!alive() || cancelled.get()) return;
            if (progress != null) progress.dismiss(); show(message);
        });
    }
    private void show(String message) {
        if (alive()) new AlertDialog.Builder(activity).setTitle("Atualizações do Quadro LDZ")
            .setMessage(message).setPositiveButton("Voltar ao quadro", null).show();
    }
}
