//! Starts `nuclear-lsp` for `.nuc` files and passes it the user's settings (`lsp.nuclear-lsp` in Zed).
use zed_extension_api::{self as zed, LanguageServerId, Result, Worktree, serde_json::json, settings::LspSettings};

const SERVER: &str = "nuclear-lsp";

struct Nuclear;

impl Nuclear {
    fn settings(worktree: &Worktree) -> Option<LspSettings> {
        LspSettings::for_worktree(SERVER, worktree).ok()
    }
}

impl zed::Extension for Nuclear {
    fn new() -> Self {
        Nuclear
    }

    fn language_server_command(&mut self, _id: &LanguageServerId, worktree: &Worktree) -> Result<zed::Command> {
        let env = worktree.shell_env();
        let configured = Self::settings(worktree).and_then(|s| s.binary).and_then(|b| b.path);
        // `./install.sh` installs the server (with its dialects and type definitions) as ~/.local/bin/nuclear-lsp
        let installed = || {
            let home = env.iter().find(|(k, _)| k == "HOME")?.1.clone();
            Some(format!("{home}/.local/bin/{SERVER}"))
        };
        let command = configured
            .or_else(|| worktree.which(SERVER))
            .or_else(installed)
            .ok_or_else(|| format!("{SERVER} not found: run ./install.sh in the NuclearLang repository"))?;
        Ok(zed::Command { command, args: vec![], env })
    }

    fn language_server_initialization_options(
        &mut self,
        _id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        let s = Self::settings(worktree);
        Ok(s.as_ref().and_then(|s| s.initialization_options.clone()).or_else(|| s.and_then(|s| s.settings)))
    }

    fn language_server_workspace_configuration(
        &mut self,
        _id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Option<zed::serde_json::Value>> {
        // the server reads `settings.nuclear` (the same keys as `nuclear.*` in VS Code)
        Ok(Self::settings(worktree).and_then(|s| s.settings).map(|s| json!({ "nuclear": s })))
    }
}

zed::register_extension!(Nuclear);
