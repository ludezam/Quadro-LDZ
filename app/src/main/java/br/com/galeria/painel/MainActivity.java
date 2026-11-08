package br.com.galeria.painel;

import android.app.Activity;
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
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
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
                if (url.equals(ORIGIN) || localArt) {
                    boolean image = localArt && path.endsWith(".jpg");
                    String asset = localArt ? path.substring(1) : "index.html";
                    String mime = image ? "image/jpeg" : localArt ? "application/json" : "text/html";
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
    @Override public void onBackPressed() { web.evaluateJavascript("window.closePanel && window.closePanel()", null); }
    @Override protected void onPause() { web.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (web != null) web.onResume(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
