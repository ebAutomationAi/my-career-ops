import html.parser, pathlib
text = pathlib.Path('CV-ECB_AG.html').read_text(encoding='utf-8', errors='ignore')

class T(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.out = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() in ('style', 'script', 'head', 'title'):
            self.skip = True

    def handle_endtag(self, tag):
        if tag.lower() in ('style', 'script', 'head', 'title'):
            self.skip = False

    def handle_data(self, data):
        if self.skip:
            return
        s = data.strip()
        if s:
            self.out.append(s)

parser = T()
parser.feed(text)
out = ' '.join(parser.out)
out = ' '.join(out.split())
print(out[:20000])
