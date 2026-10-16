"""Replace the YOUR-DOMAIN.com placeholder with your real site address.
Usage:  python set_domain.py https://www.adityaortho.com
Updates canonical / Open Graph URLs, JSON-LD, sitemap.xml and robots.txt."""
import sys, pathlib
if len(sys.argv) != 2 or not sys.argv[1].startswith('http'):
    sys.exit('Usage: python set_domain.py https://your-real-domain.com')
new = sys.argv[1].rstrip('/')
for f in ['index.html', 'products.html', 'sitemap.xml', 'robots.txt']:
    p = pathlib.Path(__file__).parent / f
    t = p.read_text(encoding='utf-8')
    p.write_text(t.replace('https://YOUR-DOMAIN.com', new), encoding='utf-8')
    print('updated', f)
