"""Derive the two-page résumé from resume.json -> resume-short.json.
Recent roles keep their best bullets; older roles become one-line entries."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, 'resume.json'), encoding='utf-8'))

DETAIL = ['VynixAI', 'Nubla AI', 'Apple', "Sam's Club", 'Contran Corp']
MAX_BULLETS = 4

def score(text):
    # Prefer bullets that carry a number, the strongest evidence on a short page.
    return 1 if re.search(r'\d', text) else 0

short_roles, earlier = [], []
for r in d['roles']:
    if r['company'] in DETAIL:
        bullets = [i for i in r['items'] if i['type'] == 'b']
        keep = sorted(range(len(bullets)), key=lambda k: (-score(bullets[k]['text']), k))[:MAX_BULLETS]
        keep_texts = {bullets[k]['text'] for k in keep}
        items = []
        for i in r['items']:
            if i['type'] == 'b' and i['text'] in keep_texts:
                items.append(i)
        # Keep the one-sentence role summary when the role has one.
        intro = [i for i in r['items'] if i['type'] == 'p']
        if intro:
            items = [intro[0]] + items
        short_roles.append({**r, 'items': items})
    else:
        years = re.findall(r'\d{4}', r['date'])
        span = years[0] if len(years) == 1 or years[0] == years[-1] else f"{years[0]}–{years[-1][2:]}"
        earlier.append({'company': r['company'], 'title': r.get('title', ''), 'date': span})

short = {**d, 'roles': short_roles, 'earlier': earlier, 'compact': True}
json.dump(short, open(os.path.join(HERE, 'resume-short.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('detailed roles:', [r['company'] for r in short_roles])
print('earlier roles:', len(earlier), '| bullets kept:', sum(1 for r in short_roles for i in r['items'] if i['type'] == 'b'))
