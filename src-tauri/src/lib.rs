use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

const MOBILE_UA: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const PANEL_POSITIONS: [(f64, f64); 4] = [
    (20.0, 20.0),
    (420.0, 20.0),
    (20.0, 884.0),
    (420.0, 884.0),
];

const PANEL_SIZE: (f64, f64) = (390.0, 844.0);

#[tauri::command]
fn navigate_panel(app: tauri::AppHandle, panel_id: usize, url: String) -> Result<(), String> {
    let label = format!("panel-{}", panel_id);
    let window = app.get_webview_window(&label).ok_or("panel not found")?;
    let parsed = url::Url::parse(&url).map_err(|e| e.to_string())?;
    window.navigate(parsed).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn go_back(app: tauri::AppHandle, panel_id: usize) -> Result<(), String> {
    let label = format!("panel-{}", panel_id);
    let window = app.get_webview_window(&label).ok_or("panel not found")?;
    window
        .eval("window.history.back()")
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn go_forward(app: tauri::AppHandle, panel_id: usize) -> Result<(), String> {
    let label = format!("panel-{}", panel_id);
    let window = app.get_webview_window(&label).ok_or("panel not found")?;
    window
        .eval("window.history.forward()")
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn reload_page(app: tauri::AppHandle, panel_id: usize) -> Result<(), String> {
    let label = format!("panel-{}", panel_id);
    let window = app.get_webview_window(&label).ok_or("panel not found")?;
    window
        .eval("location.reload()")
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn close_panel(app: tauri::AppHandle, panel_id: usize) -> Result<(), String> {
    let label = format!("panel-{}", panel_id);
    let window = app.get_webview_window(&label).ok_or("panel not found")?;
    window.close().map_err(|e| e.to_string())?;
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let (pw, ph) = PANEL_SIZE;
            for i in 0..4 {
                let label = format!("panel-{}", i);
                let (x, y) = PANEL_POSITIONS[i];
                WebviewWindowBuilder::new(
                    app.handle(),
                    &label,
                    WebviewUrl::App("blank.html".into()),
                )
                .user_agent(MOBILE_UA)
                .inner_size(pw, ph)
                .position(x, y)
                .title(format!("Panel {}", i + 1))
                .decorations(false)
                .resizable(false)
                .build()?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            navigate_panel,
            go_back,
            go_forward,
            reload_page,
            close_panel,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
