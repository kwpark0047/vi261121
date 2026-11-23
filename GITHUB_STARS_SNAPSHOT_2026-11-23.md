# GitHub Stars Top-100 Snapshot — 2026-11-23

Live `GET /search/repositories` snapshots (`sort=stars&order=desc&per_page=100`), one page of 100 each, taken 2026-11-23 with an authenticated token (gh CLI). Raw JSON kept in `/tmp` (ephemeral) — regenerate with the same queries if needed.

## Caveats

- `total_count` for the broad query (`354,818,199`) is GitHub's search-index estimate and is **not reliable** as "all repositories"; `incomplete_results: true` on broad queries means ordering/coverage is best-effort and can differ run to run.
- GitHub search requires a non-empty `q`; the app's `all` preset has no valid query (see `api/github/top-starred.ts`), so this snapshot's `all`-equivalent table uses the stand-in query `created:>2000-01-01` and is **not literally every repository**.
- Point-in-time view; star counts move daily.
- Blank Language/License = GitHub reported null.

## Broad stand-in for "all" — `created:>2000-01-01`

Query: `created:>2000-01-01` (stand-in; not literally every repository) · items: 100 · total_count: 354818199 · incomplete_results: True · saved: 2026-11-23 06:37 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | codecrafters-io/build-your-own-x | 564801 | Markdown |  |
| 2 | sindresorhus/awesome | 541229 |  | CC0-1.0 |
| 3 | public-apis/public-apis | 500908 | Python | MIT |
| 4 | morluto/rea | 474499 | TypeScript | MIT |
| 5 | freeCodeCamp/freeCodeCamp | 459513 | TypeScript | BSD-3-Clause |
| 6 | openclaw/openclaw | 395069 | TypeScript | MIT |
| 7 | donnemartin/system-design-primer | 378859 | Python | NOASSERTION |
| 8 | awesome-selfhosted/awesome-selfhosted | 339637 |  | NOASSERTION |
| 9 | vinta/awesome-python | 336539 | Python | NOASSERTION |
| 10 | mattpocock/skills | 330737 | Shell | MIT |
| 11 | affaan-m/ECC | 309152 | JavaScript | MIT |
| 12 | practical-tutorials/project-based-learning | 290301 | Python | MIT |
| 13 | deepseek-ai/deepseek-harness | 285715 | TypeScript | MIT |
| 14 | 996icu/996.ICU | 277256 |  | NOASSERTION |
| 15 | torvalds/linux | 256508 | C | NOASSERTION |
| 16 | react/react | 252932 | JavaScript | MIT |
| 17 | multica-ai/andrej-karpathy-skills | 235163 |  |  |
| 18 | TheAlgorithms/Python | 226401 | Python | MIT |
| 19 | vuejs/vue | 212507 | TypeScript | MIT |
| 20 | n8n-io/n8n | 211871 | TypeScript | NOASSERTION |
| 21 | DigitalPlatDev/FreeDomain | 208992 | Markdown | AGPL-3.0 |
| 22 | firecrawl/firecrawl | 207256 | TypeScript | AGPL-3.0 |
| 23 | tensorflow/tensorflow | 201785 | C++ | Apache-2.0 |
| 24 | massgravel/Microsoft-Activation-Scripts | 200597 | Batchfile | GPL-3.0 |
| 25 | microsoft/markitdown | 197932 | Python | MIT |
| 26 | trekhleb/javascript-algorithms | 196766 | JavaScript | MIT |
| 27 | avelino/awesome-go | 195479 | Go | MIT |
| 28 | ultraworkers/claw-code | 194733 | Rust | MIT |
| 29 | ohmyzsh/ohmyzsh | 190859 | Shell | MIT |
| 30 | 521xueweihan/HelloGitHub | 190647 | Python |  |
| 31 | Significant-Gravitas/AutoGPT | 188145 | Python | NOASSERTION |
| 32 | jackfrued/Python-100-Days | 187984 | Jupyter Notebook |  |
| 33 | ollama/ollama | 187895 | Go | MIT |
| 34 | CyC2018/CS-Notes | 186561 | JavaScript |  |
| 35 | flutter/flutter | 181469 | Dart | BSD-3-Clause |
| 36 | github/gitignore | 176428 |  | CC0-1.0 |
| 37 | msitarzewski/agency-agents | 169844 | Shell | MIT |
| 38 | AUTOMATIC1111/stable-diffusion-webui | 165372 | Python | AGPL-3.0 |
| 39 | langgenius/dify | 161714 | Python | NOASSERTION |
| 40 | open-webui/open-webui | 159304 | Svelte | NOASSERTION |
| 41 | anthropics/claude-code | 156741 | TypeScript |  |
| 42 | farion1231/cc-switch | 156482 | Rust | MIT |
| 43 | github/spec-kit | 151064 | Python | MIT |
| 44 | airbnb/javascript | 148022 | JavaScript | MIT |
| 45 | Shubhamsaboo/awesome-llm-apps | 145453 | Python | Apache-2.0 |
| 46 | x1xhlol/system-prompts-and-models-of-ai-tools | 144822 |  | GPL-3.0 |
| 47 | vercel/next.js | 143607 | JavaScript | MIT |
| 48 | garrytan/gstack | 142406 | TypeScript | MIT |
| 49 | golang/go | 140177 | Go | BSD-3-Clause |
| 50 | openai/codex | 136174 | Rust | Apache-2.0 |
| 51 | excalidraw/excalidraw | 136151 | TypeScript | MIT |
| 52 | labuladong/fucking-algorithm | 136078 | Markdown |  |
| 53 | stablyai/orca | 133413 | TypeScript | MIT |
| 54 | rustdesk/rustdesk | 130878 | Rust | AGPL-3.0 |
| 55 | Chalarangelo/30-seconds-of-code | 129608 | JavaScript | CC-BY-4.0 |
| 56 | kubernetes/kubernetes | 129382 | Go | Apache-2.0 |
| 57 | shadcn-ui/ui | 128793 | TypeScript | MIT |
| 58 | VoltAgent/awesome-design-md | 128683 |  | MIT |
| 59 | react/react-native | 126996 | C++ | MIT |
| 60 | microsoft/generative-ai-for-beginners | 124038 | Jupyter Notebook | MIT |
| 61 | TauricResearch/TradingAgents | 123530 | Python | Apache-2.0 |
| 62 | earendil-works/pi | 123404 | TypeScript | MIT |
| 63 | JuliusBrussee/caveman | 122221 | Go | Apache-2.0 |
| 64 | browser-use/browser-use | 121796 | Python | MIT |
| 65 | godotengine/godot | 120607 | C++ | MIT |
| 66 | immich-app/immich | 119898 | TypeScript | AGPL-3.0 |
| 67 | justjavac/free-programming-books-zh_CN | 119689 |  | GPL-3.0 |
| 68 | jaywcjlove/awesome-mac | 119168 | Swift | CC0-1.0 |
| 69 | debpalash/VoiceStudio | 116685 | Python | AGPL-3.0 |
| 70 | paperclipai/paperclip | 116060 | TypeScript | MIT |
| 71 | sherlock-project/sherlock | 115973 | Python | MIT |
| 72 | supabase/supabase | 115367 | TypeScript | Apache-2.0 |
| 73 | d3/d3 | 113994 | Shell | ISC |
| 74 | tauri-apps/tauri | 113170 | Rust | Apache-2.0 |
| 75 | papers-we-love/papers-we-love | 111755 | Shell |  |
| 76 | fatedier/frp | 110718 | Go | Apache-2.0 |
| 77 | denoland/deno | 109041 | Rust | MIT |
| 78 | nexu-io/open-design | 109038 | TypeScript | Apache-2.0 |
| 79 | google-gemini/gemini-cli | 109010 | TypeScript | Apache-2.0 |
| 80 | ruanyf/weekly | 108574 |  |  |
| 81 | pytorch/pytorch | 105832 | Python | NOASSERTION |
| 82 | D4Vinci/Scrapling | 105107 | Python | BSD-3-Clause |
| 83 | deepseek-ai/DeepSeek-V3 | 104893 | Python | MIT |
| 84 | neovim/neovim | 104008 | Vim Script | NOASSERTION |
| 85 | react/create-react-app | 103221 | JavaScript | MIT |
| 86 | angular/angular | 101561 | TypeScript | MIT |
| 87 | NationalSecurityAgency/ghidra | 101022 | Java | Apache-2.0 |
| 88 | karpathy/autoresearch | 100441 | Python |  |
| 89 | ant-design/ant-design | 100351 | TypeScript | MIT |
| 90 | mui/material-ui | 99390 | JavaScript | MIT |
| 91 | OpenCut-app/OpenCut | 99204 | TypeScript | MIT |
| 92 | tailwindlabs/tailwindcss | 98707 | TypeScript | MIT |
| 93 | florinpop17/app-ideas | 98692 |  | MIT |
| 94 | punkpeye/awesome-mcp-servers | 98402 |  | MIT |
| 95 | microsoft/Web-Dev-For-Beginners | 97152 | JavaScript | MIT |
| 96 | 3b1b/manim | 96829 | Python | MIT |
| 97 | puppeteer/puppeteer | 95888 | TypeScript | Apache-2.0 |
| 98 | zed-industries/zed | 95546 | Rust | NOASSERTION |
| 99 | iluwatar/java-design-patterns | 94899 | Java | NOASSERTION |
| 100 | ryanmcdermott/clean-code-javascript | 94688 | JavaScript | MIT |

## "web app" OR webapp

Query: "web app" OR webapp · items: 100 · total_count: 1351891 · incomplete_results: False · saved: 2026-11-23 06:59 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | donnemartin/system-design-primer | 378860 | Python | NOASSERTION |
| 2 | react/create-react-app | 103221 | JavaScript | MIT |
| 3 | angular/angular | 101561 | TypeScript | MIT |
| 4 | louislam/uptime-kuma | 94782 | JavaScript | MIT |
| 5 | angular/angular.js | 58423 | JavaScript | MIT |
| 6 | h5bp/html5-boilerplate | 57700 | JavaScript | MIT |
| 7 | ionic-team/ionic-framework | 52777 | TypeScript | MIT |
| 8 | imputnet/cobalt | 46748 | Svelte | AGPL-3.0 |
| 9 | astaxie/build-web-application-with-golang | 43848 | Go | BSD-3-Clause |
| 10 | DayuanJiang/next-ai-draw-io | 37134 | TypeScript | Apache-2.0 |
| 11 | gchq/CyberChef | 36503 | JavaScript | Apache-2.0 |
| 12 | authelia/authelia | 29710 | Go | Apache-2.0 |
| 13 | reflex-dev/reflex | 29045 | Python | Apache-2.0 |
| 14 | louislam/dockge | 24885 | TypeScript | MIT |
| 15 | qeeqbox/social-analyzer | 24606 | JavaScript | AGPL-3.0 |
| 16 | react-navigation/react-navigation | 24527 | TypeScript |  |
| 17 | youzan/vant | 24430 | TypeScript | MIT |
| 18 | kriasoft/react-starter-kit | 23725 | TypeScript | MIT |
| 19 | chaitin/SafeLine | 23396 | Go | GPL-3.0 |
| 20 | QwikDev/qwik | 22075 | TypeScript | MIT |
| 21 | tipsy/profile-summary-for-github | 19942 | Vue | Apache-2.0 |
| 22 | SnapDrop/snapdrop | 19711 | JavaScript | GPL-3.0 |
| 23 | radix-ui/primitives | 19543 | TypeScript | MIT |
| 24 | adonisjs/core | 19192 | TypeScript | MIT |
| 25 | wasp-lang/wasp | 18812 | TypeScript | MIT |
| 26 | sanic-org/sanic | 18639 | Python | MIT |
| 27 | janeczku/calibre-web | 18588 | Fluent | GPL-3.0 |
| 28 | ionic-team/ionicons | 18261 | TypeScript | MIT |
| 29 | dexteryy/spellbook-of-modern-webdev | 17967 |  |  |
| 30 | ionic-team/capacitor | 17140 | TypeScript | MIT |
| 31 | zauberzeug/nicegui | 16355 | Python | MIT |
| 32 | Sjj1024/PakePlus | 16221 | HTML | MIT |
| 33 | basecamp/kamal | 14753 | Ruby | MIT |
| 34 | keystonejs/keystone-classic | 14479 | JavaScript | MIT |
| 35 | marko-js/marko | 14477 | JavaScript | MIT |
| 36 | formkit/auto-animate | 13976 | TypeScript | MIT |
| 37 | tinode/chat | 13579 | Go | GPL-3.0 |
| 38 | GoogleChrome/workbox | 13063 | JavaScript | MIT |
| 39 | ant-design/ant-design-mobile | 12101 | TypeScript | MIT |
| 40 | erikras/react-redux-universal-hot-example | 12051 | JavaScript | MIT |
| 41 | Shopify/liquid | 11925 | Ruby | MIT |
| 42 | mui/base-ui | 11475 | TypeScript | MIT |
| 43 | iib0011/omni-tools | 10775 | TypeScript | MIT |
| 44 | H-M-H/Weylus | 9798 | Rust | NOASSERTION |
| 45 | api-platform/api-platform | 9200 | PHP | MIT |
| 46 | marmelab/gremlins.js | 9106 | JavaScript | MIT |
| 47 | maxence-charriere/go-app | 8984 | Go | MIT |
| 48 | Snouzy/workout-cool | 8705 | TypeScript | MIT |
| 49 | kaminari/kaminari | 8664 | Ruby | MIT |
| 50 | ariakit/ariakit | 8645 | TypeScript |  |
| 51 | elm/compiler | 7942 | Haskell | BSD-3-Clause |
| 52 | mailcheck/mailcheck | 7934 | JavaScript | MIT |
| 53 | Mango/slideout | 7860 | JavaScript | MIT |
| 54 | tokio-rs/topcoat | 7306 | Rust | MIT |
| 55 | simple-login/app | 7156 | Python | AGPL-3.0 |
| 56 | sandstorm-io/sandstorm | 7081 | JavaScript | NOASSERTION |
| 57 | unovue/reka-ui | 6968 | TypeScript | MIT |
| 58 | google/lovefield | 6752 | JavaScript | Apache-2.0 |
| 59 | golden-layout/golden-layout | 6722 | JavaScript | MIT |
| 60 | seriousm4x/UpSnap | 6448 | Go | MIT |
| 61 | smol-ai/GodMode | 6225 | TypeScript | MIT |
| 62 | jvalen/pixel-art-react | 6067 | JavaScript | MIT |
| 63 | holoviz/panel | 5830 | Python | BSD-3-Clause |
| 64 | nginx/unit | 5532 | C | Apache-2.0 |
| 65 | digitallyinduced/ihp | 5386 | Haskell | MIT |
| 66 | digitalbazaar/forge | 5354 | JavaScript | NOASSERTION |
| 67 | jagenjo/webglstudio.js | 5331 | JavaScript | MIT |
| 68 | dbeaver/cloudbeaver | 5243 | TypeScript | Apache-2.0 |
| 69 | nisrulz/app-privacy-policy-generator | 4975 | HTML | AGPL-3.0 |
| 70 | hemanth/awesome-pwa | 4951 | JavaScript |  |
| 71 | preactjs/wmr | 4905 | JavaScript | MIT |
| 72 | jameskokoska/Cashew | 4829 | Dart | GPL-3.0 |
| 73 | pywebio/PyWebIO | 4803 | Python | MIT |
| 74 | miguelgrinberg/microblog | 4771 | Python | MIT |
| 75 | puikinsh/Adminator-admin-dashboard | 4696 | HTML | MIT |
| 76 | webui-dev/webui | 4667 | C | MIT |
| 77 | stackblitz/webcontainer-core | 4649 |  | MIT |
| 78 | szabodanika/microbin | 4640 | Rust | BSD-3-Clause |
| 79 | Yooooomi/your_spotify | 4632 | TypeScript | GPL-3.0 |
| 80 | nolanlawson/fuite | 4615 | JavaScript | Apache-2.0 |
| 81 | kriasoft/react-firebase-starter | 4509 | JavaScript | MIT |
| 82 | mljar/mercury | 4358 | Python | Apache-2.0 |
| 83 | yousifamanuel/terraink | 4296 | TypeScript | NOASSERTION |
| 84 | h2oai/wave | 4258 | Python | Apache-2.0 |
| 85 | Bubka/2FAuth | 4238 | PHP | AGPL-3.0 |
| 86 | topcoat/topcoat | 4236 | HTML | Apache-2.0 |
| 87 | bootflat/bootflat.github.io | 4204 | HTML | MIT |
| 88 | dwyl/learn-json-web-tokens | 4171 | JavaScript | MIT |
| 89 | AzuraCast/AzuraCast | 4114 | PHP | AGPL-3.0 |
| 90 | shadowwalker/next-pwa | 4075 | JavaScript | MIT |
| 91 | Atri-Labs/atrilabs-engine | 4061 | JavaScript | GPL-3.0 |
| 92 | prazzon/Flexbox-Labs | 4059 | TypeScript | MIT |
| 93 | BoxFactura/pulltorefresh.js | 3998 | JavaScript | MIT |
| 94 | LinkStackOrg/LinkStack | 3961 | PHP | AGPL-3.0 |
| 95 | didi/mpx | 3954 | JavaScript | Apache-2.0 |
| 96 | premieroctet/photoshot | 3877 | TypeScript | MIT |
| 97 | ngbp/ngbp | 3871 | JavaScript | MIT |
| 98 | gravityblast/fresh | 3852 | Go | MIT |
| 99 | pwa-builder/PWABuilder | 3845 | TypeScript | NOASSERTION |
| 100 | HanaokaYuzu/Gemini-API | 3835 | Python | AGPL-3.0 |

## "ai agent" OR "coding agent"

Query: "ai agent" OR "coding agent" · items: 100 · total_count: 512602 · incomplete_results: False · saved: 2026-11-23 06:59 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | anomalyco/opencode | 228672 | TypeScript | MIT |
| 2 | DietrichGebert/ponytail | 197053 | JavaScript | MIT |
| 3 | Shubhamsaboo/awesome-llm-apps | 145454 | Python | Apache-2.0 |
| 4 | openai/codex | 136177 | Rust | Apache-2.0 |
| 5 | VoltAgent/awesome-design-md | 128686 |  | MIT |
| 6 | earendil-works/pi | 123406 | TypeScript | MIT |
| 7 | JuliusBrussee/caveman | 122224 | Go | Apache-2.0 |
| 8 | Leonxlnx/taste-skill | 120279 | JavaScript | MIT |
| 9 | addyosmani/agent-skills | 119843 | JavaScript | MIT |
| 10 | pbakaus/impeccable | 115194 | Rust | Apache-2.0 |
| 11 | Panniantong/Agent-Reach | 114076 | Python | MIT |
| 12 | nexu-io/open-design | 109041 | TypeScript | Apache-2.0 |
| 13 | google-gemini/gemini-cli | 109010 | TypeScript | Apache-2.0 |
| 14 | karpathy/autoresearch | 100441 | Python |  |
| 15 | unclecode/crawl4ai | 87689 | Python | Apache-2.0 |
| 16 | microsoft/ai-agents-for-beginners | 80796 | Jupyter Notebook | MIT |
| 17 | headroomlabs-ai/headroom | 80574 | Python | Apache-2.0 |
| 18 | dair-ai/Prompt-Engineering-Guide | 80305 | MDX | MIT |
| 19 | cloudflare/security-audit-skill | 77214 | JavaScript | MIT |
| 20 | openbq-org/OpenBB | 75651 | Python | NOASSERTION |
| 21 | thedaviddias/Front-End-Checklist | 74799 | MDX | MIT |
| 22 | mvanhorn/last30days-skill | 72959 | Python | MIT |
| 23 | cline/cline | 71836 | TypeScript | Apache-2.0 |
| 24 | mem0ai/mem0 | 69360 | Python | Apache-2.0 |
| 25 | openinterpreter/openinterpreter | 68950 | Rust | Apache-2.0 |
| 26 | upstash/context7 | 65307 | TypeScript | MIT |
| 27 | coreyhaines31/marketingskills | 62107 | JavaScript | MIT |
| 28 | ayghri/i-have-adhd | 61993 | Python | MIT |
| 29 | crewAIInc/crewAI | 61187 | Python | MIT |
| 30 | bojieli/ai-agent-book | 59387 | Python | Apache-2.0 |
| 31 | ChromeDevTools/chrome-devtools-mcp | 58901 | TypeScript | Apache-2.0 |
| 32 | K-Dense-AI/scientific-agent-skills | 58138 | Python | MIT |
| 33 | multica-ai/multica | 57359 | Go | NOASSERTION |
| 34 | aaif-goose/goose | 56886 | Rust | Apache-2.0 |
| 35 | FlowiseAI/Flowise | 55589 | TypeScript | NOASSERTION |
| 36 | vercel-labs/agent-browser | 53480 | Rust | Apache-2.0 |
| 37 | DavidHDev/react-bits | 52513 | JavaScript | NOASSERTION |
| 38 | herdrdev/herdr | 52396 | Rust | Apache-2.0 |
| 39 | sickn33/agentic-awesome-skills | 50168 | Python | MIT |
| 40 | DeusData/codebase-memory-mcp | 49056 | C | MIT |
| 41 | AstrBotDevs/AstrBot | 47367 | Python | AGPL-3.0 |
| 42 | siyuan-note/siyuan | 47346 | TypeScript | AGPL-3.0 |
| 43 | ifixai-ai/iFixAi | 46889 | Python | Apache-2.0 |
| 44 | volcengine/OpenViking | 42632 | Python | AGPL-3.0 |
| 45 | patchy631/ai-engineering-hub | 42074 | Jupyter Notebook | MIT |
| 46 | ToolJet/ToolJet | 41284 | HTML | AGPL-3.0 |
| 47 | codewhale-hq/Codewhale | 41198 | Rust | MIT |
| 48 | Donchitos/Claude-Code-Game-Studios | 40658 | Shell | MIT |
| 49 | ashishpatel26/500-AI-Agents-Projects | 40586 | Python | MIT |
| 50 | can1357/oh-my-pi | 39690 | TypeScript | MIT |
| 51 | JCodesMore/ai-website-cloner-template | 39647 | TypeScript | MIT |
| 52 | bytedance/UI-TARS-desktop | 39598 | TypeScript | Apache-2.0 |
| 53 | musistudio/claude-code-router | 38326 | TypeScript | MIT |
| 54 | h4ckf0r0day/obscura | 37064 | Rust | Apache-2.0 |
| 55 | mukul975/Anthropic-Cybersecurity-Skills | 36590 | Python | Apache-2.0 |
| 56 | continuedev/continue | 36540 | TypeScript | Apache-2.0 |
| 57 | reworkd/AgentGPT | 36268 | TypeScript | GPL-3.0 |
| 58 | esengine/DeepSeek-Reasonix | 36078 | Go | MIT |
| 59 | vxcontrol/pentagi | 34828 | Go | MIT |
| 60 | mksglu/context-mode | 34406 | JavaScript | NOASSERTION |
| 61 | iOfficeAI/OfficeCLI | 33528 | C# | Apache-2.0 |
| 62 | topoteretes/cognee | 33493 | Python | Apache-2.0 |
| 63 | BigPizzaV3/CodexPlusPlus | 33312 | Rust | AGPL-3.0 |
| 64 | getzep/graphiti | 33014 | Python | Apache-2.0 |
| 65 | zarazhangrui/frontend-slides | 32786 | JavaScript | MIT |
| 66 | SigNoz/signoz | 32709 | TypeScript | NOASSERTION |
| 67 | feder-cr/Jobs_Applier_AI_Agent | 32613 | Python | MIT |
| 68 | conductor-oss/conductor | 32497 | Java | Apache-2.0 |
| 69 | googleworkspace/cli | 32452 | Rust | Apache-2.0 |
| 70 | browser-use/video-use | 31465 | Python | MIT |
| 71 | vercel/turborepo | 31388 | Rust | MIT |
| 72 | dream-num/univer | 31336 | TypeScript | Apache-2.0 |
| 73 | ComposioHQ/composio | 31242 | TypeScript | MIT |
| 74 | jackwener/OpenCLI | 31235 | JavaScript | Apache-2.0 |
| 75 | netbirdio/netbird | 31221 | Go | NOASSERTION |
| 76 | hypit-ai/hypit | 31155 | TypeScript | NOASSERTION |
| 77 | TencentCloud/TencentDB-Agent-Memory | 31107 | TypeScript | NOASSERTION |
| 78 | e2b-dev/awesome-ai-agents | 31033 |  | NOASSERTION |
| 79 | QwenLM/qwen-code | 30880 | TypeScript | Apache-2.0 |
| 80 | Infisical/infisical | 30694 | TypeScript | NOASSERTION |
| 81 | rohitg00/agentmemory | 30539 | TypeScript | Apache-2.0 |
| 82 | kestra-io/kestra | 30321 | Java | Apache-2.0 |
| 83 | alirezarezvani/claude-skills | 30301 | Python | MIT |
| 84 | op7418/guizang-ppt-skill | 30285 | HTML | AGPL-3.0 |
| 85 | simstudioai/sim | 30187 | TypeScript | Apache-2.0 |
| 86 | nrwl/nx | 29493 | TypeScript | MIT |
| 87 | google-labs-code/design.md | 29043 | TypeScript | Apache-2.0 |
| 88 | gastownhall/beads | 28939 | Go | MIT |
| 89 | manaflow-ai/cmux | 28903 | Swift | NOASSERTION |
| 90 | BloopAI/vibe-kanban | 28793 | Rust | Apache-2.0 |
| 91 | Budibase/budibase | 28437 | TypeScript | NOASSERTION |
| 92 | OthmanAdi/planning-with-files | 28197 | Shell | MIT |
| 93 | openai/symphony | 28133 | Elixir | Apache-2.0 |
| 94 | Kilo-Org/kilocode | 28095 | TypeScript | MIT |
| 95 | xai-org/grok-build | 27833 | Rust | Apache-2.0 |
| 96 | NVIDIA/SkillSpector | 27329 | Python | Apache-2.0 |
| 97 | enescingoz/awesome-n8n-templates | 26530 |  | NOASSERTION |
| 98 | vercel-labs/agent-desktop | 26219 | Rust | Apache-2.0 |
| 99 | activepieces/activepieces | 25683 | TypeScript | NOASSERTION |
| 100 | agentsmd/agents.md | 25667 | TypeScript | MIT |

## language:typescript

Query: language:typescript · items: 100 · total_count: 20068771 · incomplete_results: False · saved: 2026-11-23 06:59 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | morluto/rea | 474531 | TypeScript | MIT |
| 2 | freeCodeCamp/freeCodeCamp | 459513 | TypeScript | BSD-3-Clause |
| 3 | openclaw/openclaw | 395070 | TypeScript | MIT |
| 4 | nilbuild/developer-roadmap | 372603 | TypeScript | NOASSERTION |
| 5 | deepseek-ai/deepseek-harness | 285727 | TypeScript | MIT |
| 6 | anomalyco/opencode | 228672 | TypeScript | MIT |
| 7 | vuejs/vue | 212507 | TypeScript | MIT |
| 8 | n8n-io/n8n | 211872 | TypeScript | NOASSERTION |
| 9 | firecrawl/firecrawl | 207269 | TypeScript | AGPL-3.0 |
| 10 | microsoft/vscode | 195795 | TypeScript | MIT |
| 11 | clash-verge-rev/clash-verge-rev | 160045 | TypeScript | GPL-3.0 |
| 12 | anthropics/claude-code | 156745 | TypeScript |  |
| 13 | iptv-org/iptv | 144547 | TypeScript | Unlicense |
| 14 | yangshun/tech-interview-handbook | 143610 | TypeScript | MIT |
| 15 | garrytan/gstack | 142410 | TypeScript | MIT |
| 16 | excalidraw/excalidraw | 136151 | TypeScript | MIT |
| 17 | stablyai/orca | 133452 | TypeScript | MIT |
| 18 | shadcn-ui/ui | 128795 | TypeScript | MIT |
| 19 | earendil-works/pi | 123406 | TypeScript | MIT |
| 20 | immich-app/immich | 119900 | TypeScript | AGPL-3.0 |
| 21 | thedotmack/claude-mem | 119146 | TypeScript | Apache-2.0 |
| 22 | paperclipai/paperclip | 116068 | TypeScript | MIT |
| 23 | supabase/supabase | 115369 | TypeScript | Apache-2.0 |
| 24 | nexu-io/open-design | 109041 | TypeScript | Apache-2.0 |
| 25 | google-gemini/gemini-cli | 109010 | TypeScript | Apache-2.0 |
| 26 | angular/angular | 101561 | TypeScript | MIT |
| 27 | microsoft/playwright | 100842 | TypeScript | Apache-2.0 |
| 28 | ant-design/ant-design | 100351 | TypeScript | MIT |
| 29 | OpenCut-app/OpenCut | 99206 | TypeScript | MIT |
| 30 | tailwindlabs/tailwindcss | 98707 | TypeScript | MIT |
| 31 | Stirling-Tools/Stirling-PDF | 97264 | TypeScript | NOASSERTION |
| 32 | puppeteer/puppeteer | 95888 | TypeScript | Apache-2.0 |
| 33 | OpenHands/OpenHands | 94112 | TypeScript | MIT |
| 34 | Egonex-AI/Understand-Anything | 93714 | TypeScript | MIT |
| 35 | modelcontextprotocol/servers | 92177 | TypeScript | NOASSERTION |
| 36 | storybookjs/storybook | 91687 | TypeScript | MIT |
| 37 | mermaid-js/mermaid | 91206 | TypeScript | MIT |
| 38 | koala73/worldmonitor | 91081 | TypeScript | AGPL-3.0 |
| 39 | cheaper-inference/OmniRoute | 89681 | TypeScript | MIT |
| 40 | ChatGPTNextWeb/NextChat | 88988 | TypeScript | MIT |
| 41 | heygen-com/hyperframes | 88456 | TypeScript | Apache-2.0 |
| 42 | lobehub/lobehub | 86018 | TypeScript | NOASSERTION |
| 43 | realworld-apps/realworld | 84406 | TypeScript | NOASSERTION |
| 44 | vitejs/vite | 84048 | TypeScript | MIT |
| 45 | ruvnet/ruflo | 82294 | TypeScript | MIT |
| 46 | hoppscotch/hoppscotch | 80866 | TypeScript | MIT |
| 47 | coder/code-server | 79932 | TypeScript | MIT |
| 48 | colbymchenry/codegraph | 78453 | TypeScript | MIT |
| 49 | grafana/grafana | 78047 | TypeScript | AGPL-3.0 |
| 50 | nestjs/nest | 77224 | TypeScript | MIT |
| 51 | toeverything/AFFiNE | 76982 | TypeScript | NOASSERTION |
| 52 | Eugeny/tabby | 75540 | TypeScript | MIT |
| 53 | Fission-AI/OpenSpec | 75500 | TypeScript | MIT |
| 54 | remotion-dev/remotion | 75036 | TypeScript | NOASSERTION |
| 55 | strapi/strapi | 73540 | TypeScript | NOASSERTION |
| 56 | pingdotgg/t3code | 72632 | TypeScript | MIT |
| 57 | cline/cline | 71836 | TypeScript | Apache-2.0 |
| 58 | code-yeongyu/oh-my-openagent | 71070 | TypeScript | NOASSERTION |
| 59 | apache/echarts | 67781 | TypeScript | Apache-2.0 |
| 60 | meta/docusaurus | 66786 | TypeScript | MIT |
| 61 | nocodb/nocodb | 65600 | TypeScript | NOASSERTION |
| 62 | upstash/context7 | 65307 | TypeScript | MIT |
| 63 | marktext/marktext | 64280 | TypeScript | MIT |
| 64 | withastro/astro | 64141 | TypeScript | NOASSERTION |
| 65 | socketio/socket.io | 63264 | TypeScript | MIT |
| 66 | makeplane/plane | 62997 | TypeScript | AGPL-3.0 |
| 67 | reduxjs/redux | 61437 | TypeScript | MIT |
| 68 | twentyhq/twenty | 61349 | TypeScript | NOASSERTION |
| 69 | nuxt/nuxt | 61101 | TypeScript | MIT |
| 70 | pmndrs/zustand | 58984 | TypeScript | MIT |
| 71 | ChromeDevTools/chrome-devtools-mcp | 58901 | TypeScript | Apache-2.0 |
| 72 | agalwood/Motrix | 58701 | TypeScript | NOASSERTION |
| 73 | appwrite/appwrite | 58605 | TypeScript | BSD-3-Clause |
| 74 | laurent22/joplin | 57318 | TypeScript | NOASSERTION |
| 75 | tashfeenahmed/freellmapi | 56841 | TypeScript | MIT |
| 76 | remix-run/react-router | 56652 | TypeScript | MIT |
| 77 | TryGhost/Ghost | 55882 | TypeScript | MIT |
| 78 | lyswhut/lx-music-desktop | 55593 | TypeScript | Apache-2.0 |
| 79 | FlowiseAI/Flowise | 55589 | TypeScript | NOASSERTION |
| 80 | vuejs/core | 55147 | TypeScript | MIT |
| 81 | CherryHQ/cherry-studio | 53768 | TypeScript | AGPL-3.0 |
| 82 | expo/expo | 53730 | TypeScript | MIT |
| 83 | upscayl/upscayl | 53091 | TypeScript | AGPL-3.0 |
| 84 | ionic-team/ionic-framework | 52777 | TypeScript | MIT |
| 85 | KeygraphHQ/shannon | 52199 | TypeScript | AGPL-3.0 |
| 86 | moeru-ai/airi | 51654 | TypeScript | MIT |
| 87 | tldraw/tldraw | 51535 | TypeScript | NOASSERTION |
| 88 | DefinitelyTyped/DefinitelyTyped | 51485 | TypeScript | NOASSERTION |
| 89 | justjavac/wechat-miniapp-radar | 51144 | TypeScript | GPL-3.0 |
| 90 | chenglou/pretext | 51091 | TypeScript | NOASSERTION |
| 91 | cypress-io/cypress | 51046 | TypeScript | MIT |
| 92 | TanStack/query | 50620 | TypeScript | MIT |
| 93 | calcom/cal.diy | 50324 | TypeScript | MIT |
| 94 | slidevjs/slidev | 49602 | TypeScript | MIT |
| 95 | pixijs/pixijs | 48884 | TypeScript | MIT |
| 96 | abhigyanpatwari/GitNexus | 48743 | TypeScript | NOASSERTION |
| 97 | type-challenges/type-challenges | 48571 | TypeScript | MIT |
| 98 | prisma/orm | 47692 | TypeScript | Apache-2.0 |
| 99 | LibreChat-AI/LibreChat | 47432 | TypeScript | MIT |
| 100 | slab/quill | 47383 | TypeScript | BSD-3-Clause |

## language:python

Query: language:python · items: 100 · total_count: 36498279 · incomplete_results: False · saved: 2026-11-23 06:59 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | public-apis/public-apis | 500911 | Python | MIT |
| 2 | EbookFoundation/free-programming-books | 402096 | Python | CC-BY-4.0 |
| 3 | donnemartin/system-design-primer | 378860 | Python | NOASSERTION |
| 4 | vinta/awesome-python | 336542 | Python | NOASSERTION |
| 5 | practical-tutorials/project-based-learning | 290301 | Python | MIT |
| 6 | NousResearch/hermes-agent | 265507 | Python | MIT |
| 7 | TheAlgorithms/Python | 226401 | Python | MIT |
| 8 | yt-dlp/yt-dlp | 210063 | Python | Unlicense |
| 9 | anthropics/skills | 199144 | Python |  |
| 10 | microsoft/markitdown | 197939 | Python | MIT |
| 11 | 521xueweihan/HelloGitHub | 190654 | Python |  |
| 12 | Significant-Gravitas/AutoGPT | 188145 | Python | NOASSERTION |
| 13 | huggingface/transformers | 169403 | Python | Apache-2.0 |
| 14 | AUTOMATIC1111/stable-diffusion-webui | 165372 | Python | AGPL-3.0 |
| 15 | langgenius/dify | 161716 | Python | NOASSERTION |
| 16 | langflow-ai/langflow | 156860 | Python | MIT |
| 17 | nextlevelbuilder/ui-ux-pro-max-skill | 152981 | Python | MIT |
| 18 | Graphify-Labs/graphify | 152171 | Python | Apache-2.0 |
| 19 | github/spec-kit | 151065 | Python | MIT |
| 20 | langchain-ai/langchain | 149988 | Python | MIT |
| 21 | Comfy-Org/ComfyUI | 148189 | Python | GPL-3.0 |
| 22 | Shubhamsaboo/awesome-llm-apps | 145454 | Python | Apache-2.0 |
| 23 | harry0703/MoneyPrinterTurbo | 145138 | Python | MIT |
| 24 | ytdl-org/youtube-dl | 141639 | Python | Unlicense |
| 25 | krahets/hello-algo | 132607 | Python | NOASSERTION |
| 26 | TauricResearch/TradingAgents | 123531 | Python | Apache-2.0 |
| 27 | browser-use/browser-use | 121798 | Python | MIT |
| 28 | debpalash/VoiceStudio | 116695 | Python | AGPL-3.0 |
| 29 | sherlock-project/sherlock | 115981 | Python | MIT |
| 30 | Panniantong/Agent-Reach | 114076 | Python | MIT |
| 31 | openai/whisper | 113398 | Python | MIT |
| 32 | pytorch/pytorch | 105829 | Python | NOASSERTION |
| 33 | D4Vinci/Scrapling | 105110 | Python | BSD-3-Clause |
| 34 | fastapi/fastapi | 105056 | Python | MIT |
| 35 | deepseek-ai/DeepSeek-V3 | 104894 | Python | MIT |
| 36 | karpathy/autoresearch | 100441 | Python |  |
| 37 | hacksider/Deep-Live-Cam | 98738 | Python | AGPL-3.0 |
| 38 | nvbn/thefuck | 97964 | Python | MIT |
| 39 | vllm-project/vllm | 97380 | Python | Apache-2.0 |
| 40 | 3b1b/manim | 96830 | Python | MIT |
| 41 | odysseus-dev/odysseus | 95918 | Python | AGPL-3.0 |
| 42 | PaddlePaddle/PaddleOCR | 93049 | Python | Apache-2.0 |
| 43 | home-assistant/core | 92563 | Python | Apache-2.0 |
| 44 | django/django | 91945 | Python | BSD-3-Clause |
| 45 | unclecode/crawl4ai | 87689 | Python | Apache-2.0 |
| 46 | datawhalechina/hello-agents | 87671 | Python | NOASSERTION |
| 47 | bregman-arie/devops-exercises | 86915 | Python | NOASSERTION |
| 48 | 666ghj/MiroFish | 86361 | Python | AGPL-3.0 |
| 49 | bytedance/deer-flow | 85634 | Python | MIT |
| 50 | fighting41love/funNLP | 84728 | Python |  |
| 51 | opendatalab/MinerU | 84173 | Python | NOASSERTION |
| 52 | swisskyrepo/PayloadsAllTheThings | 82872 | Python | MIT |
| 53 | d2l-ai/d2l-zh | 82672 | Python | Apache-2.0 |
| 54 | OpenMontageInc/OpenMontage | 82504 | Python | AGPL-3.0 |
| 55 | Z4nzu/hackingtool | 82122 | Python | MIT |
| 56 | abi/screenshot-to-code | 81385 | Python | MIT |
| 57 | shareAI-lab/learn-claude-code | 80757 | Python | MIT |
| 58 | headroomlabs-ai/headroom | 80574 | Python | Apache-2.0 |
| 59 | ComposioHQ/awesome-claude-skills | 80092 | Python |  |
| 60 | unslothai/unsloth | 80012 | Python | Apache-2.0 |
| 61 | rohitg00/ai-engineering-from-scratch | 79875 | Python | MIT |
| 62 | hugohe3/ppt-master | 79394 | Python | MIT |
| 63 | Asabeneh/30-Days-Of-Python | 79348 | Python |  |
| 64 | python/cpython | 78476 | Python | NOASSERTION |
| 65 | tensorflow/models | 77632 | Python | NOASSERTION |
| 66 | usestrix/strix | 77137 | Python | Apache-2.0 |
| 67 | hiyouga/LlamaFactory | 76225 | Python | Apache-2.0 |
| 68 | openbq-org/OpenBB | 75651 | Python | NOASSERTION |
| 69 | apache/superset | 75624 | Python | Apache-2.0 |
| 70 | pallets/flask | 75357 | Python | BSD-3-Clause |
| 71 | josephmisiti/awesome-machine-learning | 74890 | Python | NOASSERTION |
| 72 | ZhuLinsen/daily_stock_analysis | 73772 | Python | MIT |
| 73 | ai-job-search-dev/ai-job-search | 73073 | Python | MIT |
| 74 | mvanhorn/last30days-skill | 72959 | Python | MIT |
| 75 | Alishahryar1/free-claude-code | 72741 | Python | NOASSERTION |
| 76 | asgeirtj/system_prompts_leaks | 72465 | Python | CC0-1.0 |
| 77 | blader/humanizer | 72454 | Python | MIT |
| 78 | binary-husky/gpt_academic | 71711 | Python | GPL-3.0 |
| 79 | ansible/ansible | 71666 | Python | GPL-3.0 |
| 80 | NanmiCoder/MediaCrawler | 71646 | Python | NOASSERTION |
| 81 | FoundationAgents/MetaGPT | 71419 | Python | MIT |
| 82 | docling-project/docling | 70896 | Python | MIT |
| 83 | mem0ai/mem0 | 69360 | Python | Apache-2.0 |
| 84 | jingyaogong/minimind | 68975 | Python | Apache-2.0 |
| 85 | scikit-learn/scikit-learn | 68298 | Python | BSD-3-Clause |
| 86 | labmlai/annotated_deep_learning_paper_implementations | 67786 | Python | MIT |
| 87 | xtekky/gpt4free | 67099 | Python | GPL-3.0 |
| 88 | scrapy/scrapy | 65545 | Python | BSD-3-Clause |
| 89 | localstack/localstack | 65108 | Python | NOASSERTION |
| 90 | karpathy/nanoGPT | 65026 | Python | MIT |
| 91 | virattt/ai-hedge-fund | 64820 | Python | MIT |
| 92 | keras-team/keras | 64451 | Python | Apache-2.0 |
| 93 | commaai/openpilot | 64213 | Python | MIT |
| 94 | RVC-Boss/GPT-SoVITS | 64204 | Python | MIT |
| 95 | sansan0/TrendRadar | 63815 | Python | GPL-3.0 |
| 96 | BerriAI/litellm | 63739 | Python | NOASSERTION |
| 97 | ultralytics/ultralytics | 63676 | Python | AGPL-3.0 |
| 98 | HKUDS/CLI-Anything | 62989 | Python | Apache-2.0 |
| 99 | vectorize-io/hindsight | 62740 | Python | MIT |
| 100 | ayghri/i-have-adhd | 61993 | Python | MIT |

## language:rust

Query: language:rust · items: 100 · total_count: 1517890 · incomplete_results: False · saved: 2026-11-23 06:59 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | ultraworkers/claw-code | 194733 | Rust | MIT |
| 2 | farion1231/cc-switch | 156492 | Rust | MIT |
| 3 | openai/codex | 136177 | Rust | Apache-2.0 |
| 4 | rustdesk/rustdesk | 130883 | Rust | AGPL-3.0 |
| 5 | rust-lang/rust | 122423 | Rust | Apache-2.0 |
| 6 | pbakaus/impeccable | 115195 | Rust | Apache-2.0 |
| 7 | tauri-apps/tauri | 113171 | Rust | Apache-2.0 |
| 8 | denoland/deno | 109041 | Rust | MIT |
| 9 | ruvnet/RuView | 104875 | Rust | MIT |
| 10 | oven-sh/bun | 96834 | Rust | NOASSERTION |
| 11 | zed-industries/zed | 95547 | Rust | NOASSERTION |
| 12 | astral-sh/uv | 92643 | Rust | Apache-2.0 |
| 13 | rtk-ai/rtk | 87525 | Rust | Apache-2.0 |
| 14 | storytold/photocraft | 81081 | Rust | Apache-2.0 |
| 15 | unionlabs/union | 73712 | Rust | Apache-2.0 |
| 16 | dani-garcia/vaultwarden | 71195 | Rust | AGPL-3.0 |
| 17 | BurntSushi/ripgrep | 70168 | Rust | Unlicense |
| 18 | openinterpreter/openinterpreter | 68950 | Rust | Apache-2.0 |
| 19 | LadybirdBrowser/ladybird | 67276 | Rust | BSD-2-Clause |
| 20 | alacritty/alacritty | 66270 | Rust | Apache-2.0 |
| 21 | warpdotdev/warp | 66099 | Rust | AGPL-3.0 |
| 22 | rust-lang/rustlings | 64769 | Rust | MIT |
| 23 | tw93/Pake | 63954 | Rust | GPL-3.0 |
| 24 | sharkdp/bat | 61374 | Rust | Apache-2.0 |
| 25 | FuelLabs/sway | 61321 | Rust | Apache-2.0 |
| 26 | starship/starship | 60862 | Rust | ISC |
| 27 | rust-unofficial/awesome-rust | 60740 | Rust | CC0-1.0 |
| 28 | meilisearch/meilisearch | 59965 | Rust | NOASSERTION |
| 29 | typst/typst | 57372 | Rust | Apache-2.0 |
| 30 | aaif-goose/goose | 56886 | Rust | Apache-2.0 |
| 31 | FuelLabs/fuel-core | 56739 | Rust | Apache-2.0 |
| 32 | lencx/ChatGPT | 54679 | Rust |  |
| 33 | vercel-labs/agent-browser | 53480 | Rust | Apache-2.0 |
| 34 | herdrdev/herdr | 52396 | Rust | Apache-2.0 |
| 35 | astral-sh/ruff | 51464 | Rust | MIT |
| 36 | bevyengine/bevy | 49953 | Rust | Apache-2.0 |
| 37 | helix-editor/helix | 46976 | Rust | MPL-2.0 |
| 38 | janhq/jan | 46037 | Rust | NOASSERTION |
| 39 | juspay/hyperswitch | 45873 | Rust | Apache-2.0 |
| 40 | sharkdp/fd | 45168 | Rust | Apache-2.0 |
| 41 | parcel-bundler/parcel | 44032 | Rust | MIT |
| 42 | sxyazi/yazi | 43599 | Rust | MIT |
| 43 | GyulyVGC/sniffnet | 43247 | Rust | Apache-2.0 |
| 44 | FuelLabs/fuels-rs | 42916 | Rust | Apache-2.0 |
| 45 | tinyhumansai/openhuman | 42818 | Rust | GPL-3.0 |
| 46 | storytold/artcraft | 42024 | Rust | Apache-2.0 |
| 47 | storytold/craft-anything | 41504 | Rust | Apache-2.0 |
| 48 | codewhale-hq/Codewhale | 41198 | Rust | MIT |
| 49 | nushell/nushell | 41075 | Rust | MIT |
| 50 | ajeetdsouza/zoxide | 40704 | Rust | MIT |
| 51 | pola-rs/polars | 40446 | Rust | MIT |
| 52 | DioxusLabs/dioxus | 39882 | Rust | Apache-2.0 |
| 53 | cjpais/Handy | 39770 | Rust | MIT |
| 54 | spacedriveapp/spacedrive | 39581 | Rust | Apache-2.0 |
| 55 | AlexsJones/llmfit | 39251 | Rust | MIT |
| 56 | lapce/lapce | 39104 | Rust | Apache-2.0 |
| 57 | servo/servo | 38591 | Rust | MPL-2.0 |
| 58 | firecracker-microvm/firecracker | 38174 | Rust | Apache-2.0 |
| 59 | block/buzz | 37675 | Rust | Apache-2.0 |
| 60 | pnpm/pnpm | 37155 | Rust | MIT |
| 61 | h4ckf0r0day/obscura | 37064 | Rust | Apache-2.0 |
| 62 | casey/just | 36806 | Rust | CC0-1.0 |
| 63 | jdx/mise | 36413 | Rust | MIT |
| 64 | rustfs/rustfs | 36386 | Rust | Apache-2.0 |
| 65 | zellij-org/zellij | 36192 | Rust | MIT |
| 66 | qdrant/qdrant | 35668 | Rust | Apache-2.0 |
| 67 | fish-shell/fish-shell | 34511 | Rust | NOASSERTION |
| 68 | xai-org/x-algorithm | 34382 | Rust | Apache-2.0 |
| 69 | swc-project/swc | 34221 | Rust | Apache-2.0 |
| 70 | TabbyML/tabby | 33926 | Rust | NOASSERTION |
| 71 | tokio-rs/tokio | 33767 | Rust | MIT |
| 72 | lbjlaq/Antigravity-Manager | 33722 | Rust | NOASSERTION |
| 73 | zeroclaw-labs/zeroclaw | 33579 | Rust | Apache-2.0 |
| 74 | google/comprehensive-rust | 33558 | Rust | Apache-2.0 |
| 75 | surrealdb/surrealdb | 33351 | Rust | NOASSERTION |
| 76 | BigPizzaV3/CodexPlusPlus | 33312 | Rust | AGPL-3.0 |
| 77 | ankitects/anki | 32977 | Rust | NOASSERTION |
| 78 | Zackriya-Solutions/meetily | 32977 | Rust | MIT |
| 79 | yewstack/yew | 32869 | Rust | Apache-2.0 |
| 80 | dandavison/delta | 32813 | Rust | MIT |
| 81 | trycua/cua | 32805 | Rust | MIT |
| 82 | jj-vcs/jj | 32602 | Rust | Apache-2.0 |
| 83 | atuinsh/atuin | 32571 | Rust | MIT |
| 84 | googleworkspace/cli | 32452 | Rust | Apache-2.0 |
| 85 | emilk/egui | 32442 | Rust | Apache-2.0 |
| 86 | iced-rs/iced | 32107 | Rust | MIT |
| 87 | linera-io/linera-protocol | 32008 | Rust | Apache-2.0 |
| 88 | influxdata/influxdb | 31833 | Rust | Apache-2.0 |
| 89 | nautechsystems/nautilus_trader | 31753 | Rust | LGPL-3.0 |
| 90 | vercel/turborepo | 31388 | Rust | MIT |
| 91 | t8y2/dbx | 31182 | Rust | Apache-2.0 |
| 92 | sunface/rust-course | 31145 | Rust |  |
| 93 | chroma-core/chroma | 29731 | Rust | Apache-2.0 |
| 94 | wezterm/wezterm | 29660 | Rust | NOASSERTION |
| 95 | sharkdp/hyperfine | 29335 | Rust | Apache-2.0 |
| 96 | niri-wm/niri | 29206 | Rust | GPL-3.0 |
| 97 | BloopAI/vibe-kanban | 28793 | Rust | Apache-2.0 |
| 98 | GraphiteEditor/Graphite | 28013 | Rust | Apache-2.0 |
| 99 | cloudflare/pingora | 28007 | Rust | Apache-2.0 |
| 100 | tokio-rs/axum | 27921 | Rust | MIT |

## language:go

Query: language:go · items: 100 · total_count: 2631271 · incomplete_results: False · saved: 2026-11-23 06:59 UTC

| # | Repository | ⭐ Stars | Language | License |
| --- | --- | --- | --- | --- |
| 1 | avelino/awesome-go | 195481 | Go | MIT |
| 2 | ollama/ollama | 187896 | Go | MIT |
| 3 | golang/go | 140173 | Go | BSD-3-Clause |
| 4 | kubernetes/kubernetes | 129383 | Go | Apache-2.0 |
| 5 | JuliusBrussee/caveman | 122224 | Go | Apache-2.0 |
| 6 | microsoft/TypeScript | 111873 | Go | Apache-2.0 |
| 7 | fatedier/frp | 110719 | Go | Apache-2.0 |
| 8 | infiniflow/ragflow | 94567 | Go | Apache-2.0 |
| 9 | syncthing/syncthing | 90727 | Go | MPL-2.0 |
| 10 | gohugoio/hugo | 90551 | Go | Apache-2.0 |
| 11 | gin-gonic/gin | 89573 | Go | MIT |
| 12 | junegunn/fzf | 84355 | Go | MIT |
| 13 | jesseduffield/lazygit | 84019 | Go | MIT |
| 14 | netdata/netdata | 81601 | Go | GPL-3.0 |
| 15 | caddyserver/caddy | 79428 | Go | Apache-2.0 |
| 16 | nektos/act | 72764 | Go | MIT |
| 17 | moby/moby | 72307 | Go | Apache-2.0 |
| 18 | prometheus/prometheus | 67762 | Go | Apache-2.0 |
| 19 | traefik/traefik | 65660 | Go | MIT |
| 20 | usememos/memos | 64648 | Go | MIT |
| 21 | pocketbase/pocketbase | 61573 | Go | MIT |
| 22 | minio/minio | 61249 | Go | AGPL-3.0 |
| 23 | rclone/rclone | 61193 | Go | MIT |
| 24 | FiloSottile/mkcert | 59902 | Go | BSD-3-Clause |
| 25 | router-for-me/CLIProxyAPI | 59276 | Go | MIT |
| 26 | go-gitea/gitea | 59217 | Go | MIT |
| 27 | multica-ai/multica | 57359 | Go | NOASSERTION |
| 28 | alibaba/open-code-review | 55497 | Go | Apache-2.0 |
| 29 | wagoodman/dive | 54755 | Go | MIT |
| 30 | jesseduffield/lazydocker | 53404 | Go | MIT |
| 31 | etcd-io/etcd | 52649 | Go | Apache-2.0 |
| 32 | QuantumNous/new-api | 52372 | Go | AGPL-3.0 |
| 33 | ethereum/go-ethereum | 51483 | Go | LGPL-3.0 |
| 34 | mudler/LocalAI | 50507 | Go | MIT |
| 35 | AlistGo/alist | 50483 | Go | AGPL-3.0 |
| 36 | MHSanaei/3x-ui | 50436 | Go | GPL-3.0 |
| 37 | hashicorp/terraform | 50308 | Go | NOASSERTION |
| 38 | gogs/gogs | 47987 | Go | MIT |
| 39 | cli/cli | 47158 | Go | MIT |
| 40 | v2ray/v2ray-core | 46906 | Go | MIT |
| 41 | milvus-io/milvus | 46722 | Go | Apache-2.0 |
| 42 | Wei-Shaw/sub2api | 46478 | Go | LGPL-3.0 |
| 43 | juanfont/headscale | 45997 | Go | BSD-3-Clause |
| 44 | charmbracelet/bubbletea | 45843 | Go | MIT |
| 45 | spf13/cobra | 44824 | Go | Apache-2.0 |
| 46 | danielmiessler/Fabric | 44745 | Go | MIT |
| 47 | astaxie/build-web-application-with-golang | 43848 | Go | BSD-3-Clause |
| 48 | XTLS/Xray-core | 43104 | Go | MPL-2.0 |
| 49 | schollz/croc | 40996 | Go | MIT |
| 50 | pingcap/tidb | 40767 | Go | Apache-2.0 |
| 51 | photoprism/photoprism | 40470 | Go | NOASSERTION |
| 52 | gofiber/fiber | 40316 | Go | MIT |
| 53 | SagerNet/sing-box | 40210 | Go | NOASSERTION |
| 54 | yetone/magpie | 40198 | Go | MIT |
| 55 | evanw/esbuild | 40167 | Go | MIT |
| 56 | go-gorm/gorm | 39998 | Go | MIT |
| 57 | The-Vibe-Company/quivr | 39654 | Go | MIT |
| 58 | aquasecurity/trivy | 39635 | Go | Apache-2.0 |
| 59 | tailscale/tailscale | 39495 | Go | BSD-3-Clause |
| 60 | docker/compose | 39128 | Go | Apache-2.0 |
| 61 | harness/harness | 38955 | Go | Apache-2.0 |
| 62 | istio/istio | 38533 | Go | Apache-2.0 |
| 63 | glanceapp/glance | 38350 | Go | AGPL-3.0 |
| 64 | Tencent/WeKnora | 38044 | Go | NOASSERTION |
| 65 | IceWhaleTech/CasaOS | 37692 | Go | Apache-2.0 |
| 66 | 1Panel-dev/1Panel | 37506 | Go | GPL-3.0 |
| 67 | restic/restic | 37383 | Go | BSD-2-Clause |
| 68 | wailsapp/wails | 37180 | Go | MIT |
| 69 | hashicorp/vault | 36557 | Go | NOASSERTION |
| 70 | seaweedfs/seaweedfs | 36204 | Go | Apache-2.0 |
| 71 | esengine/DeepSeek-Reasonix | 36078 | Go | MIT |
| 72 | filebrowser/filebrowser | 35837 | Go | Apache-2.0 |
| 73 | binwiederhier/ntfy | 35699 | Go | Apache-2.0 |
| 74 | derailed/k9s | 35030 | Go | Apache-2.0 |
| 75 | unknwon/the-way-to-go_ZH_CN | 34990 | Go |  |
| 76 | vxcontrol/pentagi | 34828 | Go | MIT |
| 77 | v2fly/v2ray-core | 34795 | Go | MIT |
| 78 | github/github-mcp-server | 34680 | Go | MIT |
| 79 | k3s-io/k3s | 34500 | Go | Apache-2.0 |
| 80 | ehang-io/nps | 34256 | Go | GPL-3.0 |
| 81 | halfrost/LeetCode-Go | 33804 | Go | MIT |
| 82 | zeromicro/go-zero | 33440 | Go | MIT |
| 83 | podman-container-tools/podman | 33363 | Go | Apache-2.0 |
| 84 | projectdiscovery/nuclei | 33211 | Go | MIT |
| 85 | labstack/echo | 32830 | Go | MIT |
| 86 | cockroachdb/cockroach | 32642 | Go | NOASSERTION |
| 87 | beego/beego | 32432 | Go | NOASSERTION |
| 88 | grafana/k6 | 32382 | Go | AGPL-3.0 |
| 89 | kubernetes/minikube | 32261 | Go | Apache-2.0 |
| 90 | dokku/dokku | 32233 | Go | MIT |
| 91 | iawia002/lux | 31855 | Go | MIT |
| 92 | abiosoft/colima | 31798 | Go | MIT |
| 93 | gitleaks/gitleaks | 31264 | Go | MIT |
| 94 | netbirdio/netbird | 31221 | Go | NOASSERTION |
| 95 | opentofu/opentofu | 30954 | Go | MPL-2.0 |
| 96 | chubin/wttr.in | 30809 | Go | Apache-2.0 |
| 97 | spf13/viper | 30542 | Go | MIT |
| 98 | helm/helm | 30465 | Go | Apache-2.0 |
| 99 | XIU2/CloudflareSpeedTest | 30160 | Go | GPL-3.0 |
| 100 | sipeed/picoclaw | 30150 | Go | MIT |

