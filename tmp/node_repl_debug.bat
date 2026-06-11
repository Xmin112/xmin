@echo off
echo [DEBUG] Starting node_repl.exe at %date% %time% >> "D:\new cc\tmp\node_repl_debug.log"
echo [DEBUG] CWD: %CD% >> "D:\new cc\tmp\node_repl_debug.log"
echo [DEBUG] NODE_REPL_NODE_PATH: %NODE_REPL_NODE_PATH% >> "D:\new cc\tmp\node_repl_debug.log"
echo [DEBUG] CODEX_CLI_PATH: %CODEX_CLI_PATH% >> "D:\new cc\tmp\node_repl_debug.log"
"C:\Users\Xmin\AppData\Local\OpenAI\Codex\bin\34ab3e1324cc55b5\node_repl.exe" 2>> "D:\new cc\tmp\node_repl_debug.log"
echo [DEBUG] Exit code: %ERRORLEVEL% at %time% >> "D:\new cc\tmp\node_repl_debug.log"
