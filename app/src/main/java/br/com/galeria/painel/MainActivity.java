package br.com.galeria.painel;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebChromeClient;
import java.io.IOException;

public class MainActivity extends Activity {
    private WebView web;
    private static final String ORIGIN = "https://galeria.example/";
    private AppUpdater updater;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        updater = new AppUpdater(this);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                String path = request.getUrl().getPath();
                boolean localArt = url.startsWith(ORIGIN) && path != null && path.matches("/art/(?:[a-z0-9-]+\\.jpg|catalog\\.json)");
                boolean effect = url.equals(ORIGIN + "paint-reveal.js");
                if (url.equals(ORIGIN) || localArt || effect) {
                    boolean image = localArt && path.endsWith(".jpg");
                    String asset = (localArt || effect) ? path.substring(1) : "index.html";
                    String mime = effect ? "application/javascript" : image ? "image/jpeg" : localArt ? "application/json" : "text/html";
                    try { return new WebResourceResponse(mime, image ? null : "UTF-8", getAssets().open(asset)); }
                    catch (IOException ex) { return new WebResourceResponse("text/plain", "UTF-8", 500, "Missing asset", null, null); }
                }
                return null;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return request.isForMainFrame() && !request.getUrl().toString().equals(ORIGIN);
            }
        });
        setContentView(web);
        web.loadUrl(ORIGIN);
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("!document.getElementById('panel').hidden", open -> {
            if (isFinishing() || isDestroyed()) return;
            if ("true".equals(open)) web.evaluateJavascript("window.closePanel()", null);
            else showExitMenu();
        });
    }
    private String installedVersion() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; }
        catch (Exception error) { return "0.0.0"; }
    }
    private void showExitMenu() {
        new AlertDialog.Builder(this).setTitle("Quadro LDZ · " + installedVersion())
            .setItems(new String[] {"Buscar atualizações", "Voltar ao quadro", "Sair"}, (dialog, which) -> {
                if (which == 0) updater.check();
                else if (which == 2) finish();
            }).show();
    }
    @Override protected void onPause() { web.evaluateJavascript("window.PaintReveal && window.PaintReveal.cancel()", null); web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == AppUpdater.INSTALL_PERMISSION) updater.permissionResult();
    }
    @Override protected void onDestroy() {
        updater.close();

        web.destroy(); super.onDestroy();
    }
}
