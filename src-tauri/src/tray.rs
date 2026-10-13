use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Construct Tray Menu items
    let show_item = MenuItem::with_id(app, "show", "Pencereyi Aç", true, None::<&str>)?;
    let backup_now_item = MenuItem::with_id(app, "backup_now", "Şimdi Yedekle", true, None::<&str>)?;
    let sep1 = MenuItem::with_id(app, "sep1", "---", false, None::<&str>)?;
    let toggle_auto_item = MenuItem::with_id(app, "toggle_auto", "Otomatik Yedeklemeyi Başlat / Durdur", true, None::<&str>)?;
    let sep2 = MenuItem::with_id(app, "sep2", "---", false, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Çıkış", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[&show_item, &backup_now_item, &sep1, &toggle_auto_item, &sep2, &quit_item],
    )?;

    // Build Tray Icon
    let _tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("Rust AutoBackup - Arka Planda Aktif")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
            "backup_now" => {
                // Emit frontend event to trigger manual backup
                let _ = app.emit("tray-trigger-backup", ());
            }
            "toggle_auto" => {
                let _ = app.emit("tray-toggle-auto", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let is_visible = window.is_visible().unwrap_or(false);
                    if is_visible {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
