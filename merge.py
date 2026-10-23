import base64
import os

html_file = 'Plataforma Final/Quantum Hub.html'
guide_file = 'Plataforma Final/Guia de Uso — QUANTUM HUB.html'

with open(guide_file, 'rb') as f:
    guide_bytes = f.read()

b64_guide = base64.b64encode(guide_bytes).decode('utf-8')
data_url = f"data:text/html;base64,{b64_guide}"

with open(html_file, 'r', encoding='utf-8') as f:
    hub_html = f.read()

# 1. Add nav button
nav_btn_target = '<button class="nav-btn" id="nav-espectro" onclick="goSection(\'espectro\')">📊 Espectro</button>'
nav_btn_inject = '<button class="nav-btn" id="nav-guia" onclick="goSection(\'guia\')">📖 Guia de Uso</button>'
if nav_btn_target in hub_html:
    hub_html = hub_html.replace(nav_btn_target, f'{nav_btn_target}\n        {nav_btn_inject}')
elif 'nav-espectro' in hub_html:
    # fallback
    hub_html = hub_html.replace('id="nav-espectro" onclick="goSection(\'espectro\')">📊 Espectro</button>', 
                                'id="nav-espectro" onclick="goSection(\'espectro\')">📊 Espectro</button>\n        <button class="nav-btn" id="nav-guia" onclick="goSection(\'guia\')">📖 Guia de Uso</button>')

# 2. Add section
section_html = f"""
    <!-- GUIA DE USO -->
    <section id="guia" class="section">
      <div class="container">
        <div class="sec-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="text-align:left;">
            <h2 class="sec-title" style="margin-bottom:0;">📖 Guia de Uso</h2>
            <p class="sec-sub">Instruções completas de como utilizar o Quantum Hub</p>
          </div>
          <a href="{data_url}" download="Guia de Uso - QUANTUM HUB.html" style="background:var(--cyan); color:#000; padding:10px 20px; text-decoration:none; border-radius:20px; font-weight:bold; box-shadow:0 4px 15px rgba(0,204,255,0.4); display:inline-block;">📥 Baixar Guia (HTML)</a>
        </div>
        <div style="width:100%; height:75vh; border:1px solid var(--border); border-radius:16px; overflow:hidden; background:#fff; margin-top:20px;">
          <iframe src="{data_url}" style="width:100%; height:100%; border:none;"></iframe>
        </div>
      </div>
    </section>
"""

# inject right before </body> or script
if '</body>' in hub_html:
    hub_html = hub_html.replace('</body>', f'{section_html}\n  </body>')
else:
    hub_html += f"\n{section_html}"

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(hub_html)

os.remove(guide_file)
print("Integration successful!")
