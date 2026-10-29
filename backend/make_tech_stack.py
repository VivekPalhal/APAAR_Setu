import json, re, os
from PIL import Image, ImageDraw, ImageFont, ImageChops
from svg.path import parse_path, Move, Close, Line
ICONS = os.environ.get("SIMPLE_ICONS_DIR", "./simple-icons")
R="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
B="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
INK=(27,29,35); MUT=(107,111,122); ACC=(55,48,163); SOFT=(238,240,255); LINE=(226,228,242)
hexmap={}
data=json.load(open(f"{ICONS}/_data/simple-icons.json"))
for e in (data["icons"] if isinstance(data,dict) else data):
    s=e.get("slug") or re.sub(r"[^a-z0-9]","",e["title"].lower()); hexmap[s]=e["hex"]
def logo(slug,size,SS=4):
    svg=open(f"{ICONS}/icons/{slug}.svg").read()
    d=re.search(r' d="([^"]+)"',svg).group(1)
    path=parse_path(d); S=size*SS; sc=S/24.0
    subs=[]; cur=[]
    for seg in path:
        if isinstance(seg,Move):
            if len(cur)>2: subs.append(cur)
            cur=[(seg.end.real*sc,seg.end.imag*sc)]; continue
        if isinstance(seg,Close): 
            if len(cur)>2: subs.append(cur)
            cur=[]; continue
        n=2 if isinstance(seg,Line) else 40
        for k in range(1,n+1):
            p=seg.point(k/n); cur.append((p.real*sc,p.imag*sc))
    if len(cur)>2: subs.append(cur)
    mask=Image.new("L",(S,S),0)
    for sp in subs:
        m=Image.new("L",(S,S),0); ImageDraw.Draw(m).polygon(sp,fill=255); mask=ImageChops.difference(mask,m)
    mask=mask.resize((size,size),Image.LANCZOS)
    col=tuple(int(hexmap.get(slug,"3730A3")[i:i+2],16) for i in (0,2,4))
    out=Image.new("RGBA",(size,size),col+(0,)); out.putalpha(mask); return out

W=2400; H=round(W*301/243)       # same shape as the attached image
SEC=[
("Frontend",[("React","UI library","react",0),("Next.js","App Router, SSR","nextdotjs",0),("TypeScript","Typed code","typescript",0),("Tailwind CSS","Styling","tailwindcss",0),("TanStack Query","Data fetching","reactquery",0)]),
("Backend",[("Python","Language","python",1),("FastAPI","API framework","fastapi",1),("Pydantic","Validation","pydantic",1),("SQLAlchemy","Database layer","sqlalchemy",0),("OpenAPI","API contract","openapiinitiative",1)]),
("AI and analytics",[("scikit-learn","ML library","scikitlearn",1),("NumPy","Fast maths","numpy",1),("Isolation Forest","Odd-pattern AI","IF",1),("Robust z-score","Peer comparison","MAD",1),("NL query planner","Safe query plans","NLQ",1)]),
("Data and messaging",[("PostgreSQL","Records, ledger","postgresql",0),("ClickHouse","Fast analytics","clickhouse",0),("Redis Streams","Queue, live events","redis",0),("SQLite","Prototype database","sqlite",1),("S3 object store","Files and reports","amazons3",0)]),
("Security and identity",[("Keycloak","OIDC SSO, MFA","keycloak",0),("JWT","Session tokens","jsonwebtokens",0),("Ed25519","Credential signing","Ed",1),("W3C VC","Verifiable credentials","VC",1),("KMS / HSM","Key protection","KMS",0)]),
("Deployment and monitoring",[("Docker","Containers","docker",0),("Kubernetes","Orchestration","kubernetes",0),("Helm","K8s packaging","helm",0),("Prometheus","Metrics","prometheus",0),("Grafana","Dashboards","grafana",0)]),
("Quality and delivery",[("OpenTelemetry","Tracing","opentelemetry",0),("GitHub Actions","CI/CD","githubactions",0),("pytest","Unit tests","pytest",0),("k6","Load tests","k6",0),("Playwright","End-to-end tests","PW",0)]),
]
SS=2
img=Image.new("RGB",(W*SS,H*SS),(255,255,255)); d=ImageDraw.Draw(img)
p=lambda v:int(round(v*SS)); Fo=lambda f,s:ImageFont.truetype(f,p(s))
def T(x,y,t,f,fill,a="lm"): d.text((p(x),p(y)),t,font=f,fill=fill,anchor=a)
def RR(b,r,fill=None,outline=None,w=1): d.rounded_rectangle([p(b[0]),p(b[1]),p(b[2]),p(b[3])],radius=p(r),fill=fill,outline=outline,width=p(w))
d.rectangle([0,0,p(W),p(14)],fill=ACC)
M=90
RR((M,70,M+78,148),18,fill=ACC); T(M+39,109,"A",Fo(B,52),(255,255,255),"mm")
T(M+108,92,"APAAR Setu",Fo(B,46),INK); T(M+108,134,"SIH Problem Statement 26263",Fo(R,28),MUT)
T(M,238,"Complete technology stack",Fo(B,92),INK)
T(M,312,"Every tool in the prototype and the production design",Fo(R,38),MUT)
# legend
RR((W-M-640,64,W-M,118),27,fill=SOFT); d.ellipse([p(W-M-610),p(76),p(W-M-582),p(104)],fill=ACC)
T(W-M-562,91,"Used in the working prototype",Fo(R,30),ACC)
cols=5; gut=26; tw=(W-2*M-(cols-1)*gut)/cols
top=380; bottom=H-130; nsec=len(SEC); per=(bottom-top)/nsec
hdr=64; th=per-hdr-34
for si,(name,items) in enumerate(SEC):
    y=top+si*per
    fh=Fo(B,36); tl=d.textlength(name,font=fh)/SS
    T(M,y+hdr/2-4,name,fh,ACC); d.line([p(M+tl+24),p(y+hdr/2-4),p(W-M),p(y+hdr/2-4)],fill=LINE,width=p(3))
    for i,(nm,sub,slug,proto) in enumerate(items):
        x=M+i*(tw+gut); ty=y+hdr
        RR((x,ty,x+tw,ty+th),22,fill=(255,255,255),outline=LINE,w=3)
        ls=min(124,th*0.46); lx=x+tw/2-ls/2; ly=ty+th*0.1
        if os.path.exists(f"{ICONS}/icons/{slug}.svg"):
            lg=logo(slug,int(ls*SS)); img.paste(lg,(p(lx),p(ly)),lg)
        else:
            RR((lx,ly,lx+ls,ly+ls),ls*0.22,fill=SOFT,outline=ACC,w=4)
            fs=Fo(B,ls*(0.36 if len(slug)<3 else 0.30)); T(lx+ls/2,ly+ls/2,slug,fs,ACC,"mm")
        fsz=38
        while d.textlength(nm,font=Fo(B,fsz))/SS>tw-30 and fsz>24: fsz-=1
        T(x+tw/2,ty+th*0.70,nm,Fo(B,fsz),INK,"mm")
        T(x+tw/2,ty+th*0.88,sub,Fo(R,27),MUT,"mm")
        if proto: d.ellipse([p(x+tw-44),p(ty+16),p(x+tw-18),p(ty+42)],fill=ACC)
T(M,H-62,"Logos and names belong to their respective owners and are shown only to identify the tools.",Fo(R,26),MUT)
T(W-M,H-62,"One verified record for every AICTE student",Fo(R,26),MUT,"rm")
out=img.resize((W,H),Image.LANCZOS)
out.save("APAAR_Setu_Tech_Stack.png", optimize=True)
print(out.size)
