# Aider

Current shared setup supports inference only. It saves the main, weak and editor model roles, OpenAI-compatible endpoint and private credential in the native user configuration. Respect project `.aider.conf.yml`, environment and explicit CLI overrides; a changed user default does not replace them.

Choose exact authenticated Telos IDs. Setup can use one selected ID for all roles; change individual roles only when requested and supported by the effective Aider configuration. Keep Aider's edit workflow and tools client-owned.

The verified Aider integration has no native MCP or Agent Skills loader. Setup saves the two-skill bundle as reference material and reports its location; it must not claim automatic skill activation or shared connector access. Consult the bundled references manually when useful. Do not introduce a plugin, wrapper or extra provider to simulate unsupported features.

There is no assumed curated Aider memory source. Do not upload chat history as a substitute.
