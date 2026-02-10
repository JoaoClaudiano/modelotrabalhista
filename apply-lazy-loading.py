#!/usr/bin/env python3
import re
import os
from pathlib import Path

# List of files to process
files_to_process = [
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/acidente-trabalho-pericia-inss-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/adicional-noturno-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/adicional-periculosidade-motoboy.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/aviso-previo-indenizado-e-trabalhado.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/banco-horas-vs-extras-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/burnout-doenca-ocupacional.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/clt-pj-calculadora-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/demissao-comum-acordo.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/esocial-domestico-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/estabilidade-gestante-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/fgts-digital-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/hora-extra-home-office-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/horas-extras-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/index.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/intervalo-intrajornada-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/jovem-aprendiz-vs-estagiario-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/licenca-paternidade-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/motorista-app-clt-stf-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/multa-40-fgts.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/pedido-demissao.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/pericia-inss-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/pis-pasep-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/recisao-indireta-justa-causa-aplicada-pelo-empregado.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/salario-familia-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/saque-aniversario-vs-rescisao.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/seguro-desemprego-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/tabela-inss-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/teletrabalho-híbrido-custos-2026.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/template.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/artigos/trabalho-feriados.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/advertencia.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/ajuste-horario-pais.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/alteracao-jornada.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/convocatoria-reuniao.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/flexibilizacao-jornada-motivo-familiar.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/index.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/intervalo-amamentacao.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/licenca-maternidade-paternidade.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/pedido-demissao.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/pedido-reembolso.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/solicitacao-beneficios.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/modelos/solicitacao-ferias.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/pages/contato.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/pages/disclaimer.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/pages/example.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/pages/privacidade.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/pages/sobre.html",
    "/home/runner/work/modelotrabalhista/modelotrabalhista/pages/termos.html",
]

def process_html_file(filepath):
    """Process a single HTML file to apply lazy loading optimizations."""
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 1. Remove inline gtag script blocks (window.dataLayer and gtag function)
        # Match script tags containing window.dataLayer or gtag
        content = re.sub(
            r'<script[^>]*>\s*window\.dataLayer\s*=\s*window\.dataLayer.*?</script>\s*',
            '',
            content,
            flags=re.DOTALL
        )
        
        # 2. Remove external gtag/js script tags
        content = re.sub(
            r'<script[^>]*src=["\']https://www\.googletagmanager\.com/gtag/js[^"\']*["\'][^>]*>\s*</script>\s*',
            '',
            content
        )
        
        # 3. Remove adsbygoogle.js script tags
        content = re.sub(
            r'<script[^>]*src=["\']https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^"\']*["\'][^>]*>\s*</script>\s*',
            '',
            content
        )
        
        # 4. Add lazy-ads.js script if not already present
        if 'lazy-ads.js' not in content:
            # Find the closing </head> tag and insert before it
            lazy_ads_script = '    <script src="/js/lazy-ads.js?v=1770454479" defer></script>\n'
            content = re.sub(
                r'(\s*</head>)',
                lazy_ads_script + r'\1',
                content
            )
        
        # 5. Transform responsive.css to async loading with preload
        # Match the responsive.css link tag and capture the path and version
        def replace_responsive_css(match):
            path = match.group(1)
            version = match.group(2)
            return f'<link rel="preload" href="{path}css/responsive.css?v={version}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="{path}css/responsive.css?v={version}"></noscript>'
        
        content = re.sub(
            r'<link\s+rel=["\']stylesheet["\']\s+href=["\'](\.\./|/)css/responsive\.css\?v=([^"\']+)["\']>',
            replace_responsive_css,
            content
        )
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Processed: {filepath}")
            return True
        else:
            print(f"- No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    print("Starting lazy loading optimization...\n")
    
    processed_count = 0
    error_count = 0
    
    for filepath in files_to_process:
        if os.path.exists(filepath):
            if process_html_file(filepath):
                processed_count += 1
        else:
            print(f"✗ File not found: {filepath}")
            error_count += 1
    
    print(f"\n{'='*60}")
    print(f"Processing complete!")
    print(f"Files processed: {processed_count}")
    print(f"Errors: {error_count}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
