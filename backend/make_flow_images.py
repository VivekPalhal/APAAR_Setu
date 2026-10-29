from PIL import Image, ImageDraw, ImageFont
R="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
B="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
K=2                       # supersampling
INK=(27,29,35); MUT=(107,111,122); ACC=(55,48,163); SOFT=(238,240,255)
NOTE_BG=(225,245,238); NOTE_BD=(15,110,86); NOTE_TX=(8,80,65)
LINE=(190,193,210); FRAME=(150,154,180)

def font(p,s): return ImageFont.truetype(p,int(s*K))

def render(fn,title,sub,parts,steps,W=3200):
    names=[p[1] for p in parts]; ids=[p[0] for p in parts]
    n=len(parts); margin=250
    cx={pid:margin+i*(W-2*margin)/(n-1) for i,pid in enumerate(ids)}
    fm,fb,fs,ft,fh=font(R,30),font(B,30),font(B,32),font(B,58),font(R,32)
    probe=ImageDraw.Draw(Image.new("RGB",(10,10)))
    tw=lambda t,f: probe.textlength(t,font=f)/K
    # ---- layout pass
    y=410; items=[]; stack=[]; num=0
    for s in steps:
        k=s[0]
        if k=="msg":
            num+=1; items.append(dict(k=k,y=y+60,a=s[1],b=s[2],t=s[3],dash=len(s)>4 and s[4],n=num)); y+=120
        elif k=="self":
            num+=1; items.append(dict(k=k,y=y+50,a=s[1],t=s[2],n=num)); y+=160
        elif k=="note":
            items.append(dict(k=k,y=y+10,a=s[1],b=s[2],t=s[3])); y+=110
        elif k in("alt","opt"):
            y+=30; st=dict(k="frame",y0=y,kind=k,cond=s[1],divs=[]); stack.append(st); y+=70
        elif k=="else":
            y+=10; stack[-1]["divs"].append((y,s[1])); y+=60
        elif k=="end":
            st=stack.pop(); st["y1"]=y+10; items.insert(0,st); y+=40
    H=int(y+110)
    img=Image.new("RGB",(W*K,H*K),(255,255,255)); d=ImageDraw.Draw(img)
    P=lambda v:int(round(v*K))
    def text(x,y,t,f,fill,anchor="lm"): d.text((P(x),P(y)),t,font=f,fill=fill,anchor=anchor)
    def line(x1,y1,x2,y2,fill,w=3,dash=0):
        if not dash: d.line([P(x1),P(y1),P(x2),P(y2)],fill=fill,width=int(w*K)); return
        import math
        L=math.hypot(x2-x1,y2-y1); n_=int(L//(dash*2)); 
        for i in range(n_+1):
            a=i*dash*2/L; b=min((i*dash*2+dash)/L,1)
            d.line([P(x1+(x2-x1)*a),P(y1+(y2-y1)*a),P(x1+(x2-x1)*b),P(y1+(y2-y1)*b)],fill=fill,width=int(w*K))
    def head(x,y,dirx,fill):
        s=18; d.polygon([(P(x),P(y)),(P(x-dirx*s*1.6),P(y-s*.7)),(P(x-dirx*s*1.6),P(y+s*.7))],fill=fill)
    # title
    text(110,110,title,ft,INK); text(110,185,sub,fh,MUT)
    # participant boxes
    bw=max(max(tw(nm,fs) for nm in names)+70,300); bh=86; top=250
    # frames first
    left=min(cx.values())-bw/2-30; right=max(cx.values())+bw/2+30
    for it in items:
        if it["k"]!="frame": continue
        d.rounded_rectangle([P(left),P(it["y0"]),P(right),P(it["y1"])],radius=P(10),outline=FRAME,width=P(2.5))
        tag=it["kind"]; tgw=tw(tag,fb)+40
        d.rectangle([P(left),P(it["y0"]),P(left+tgw),P(it["y0"]+44)],fill=(235,236,246),outline=FRAME,width=P(2))
        text(left+20,it["y0"]+22,tag,fb,INK)
        text(left+tgw+24,it["y0"]+22,f"[{it['cond']}]",fm,MUT)
        for dy,c in it["divs"]:
            line(left,dy,right,dy,FRAME,2.5,dash=14); text(left+24,dy+30,f"[{c}]",fm,MUT)
    # lifelines
    for pid in ids: line(cx[pid],top+bh,cx[pid],H-70,LINE,3,dash=10)
    for pid,nm in parts:
        x=cx[pid]; d.rounded_rectangle([P(x-bw/2),P(top),P(x+bw/2),P(top+bh)],radius=P(14),fill=SOFT,outline=ACC,width=P(3))
        text(x,top+bh/2,nm,fs,(60,52,137),anchor="mm")
        d.rounded_rectangle([P(x-bw/2),P(H-70),P(x+bw/2),P(H-70+bh*0.0+1)],radius=0,fill=(255,255,255))
    # items
    for it in items:
        k=it["k"]
        if k=="msg":
            x1,x2,yy=cx[it["a"]],cx[it["b"]],it["y"]; dx=1 if x2>x1 else -1
            line(x1,yy,x2-dx*4,yy,INK,3.5,dash=14 if it["dash"] else 0); head(x2,yy,dx,INK)
            lab=it["t"]; num=str(it["n"]); full=f"{num}   {lab}"; w=tw(full,fm)+36
            mx=(x1+x2)/2; mx=min(max(mx,40+w/2),W-40-w/2)
            d.rounded_rectangle([P(mx-w/2),P(yy-62),P(mx+w/2),P(yy-12)],radius=P(8),fill=(255,255,255))
            nw=tw(num,fb); text(mx-w/2+18,yy-37,num,fb,ACC); text(mx-w/2+18+nw+22,yy-37,lab,fm,INK)
        elif k=="self":
            x,yy=cx[it["a"]],it["y"]; sg=-1 if x>W*0.55 else 1
            line(x,yy,x+sg*110,yy,INK,3.5); line(x+sg*110,yy,x+sg*110,yy+50,INK,3.5); line(x+sg*110,yy+50,x+sg*4,yy+50,INK,3.5); head(x,yy+50,-sg,INK)
            lab=it["t"]; num=str(it["n"]); nw=tw(num,fb); full=nw+22+tw(lab,fm)
            if sg==1:
                text(x+140,yy+25,num,fb,ACC); text(x+140+nw+22,yy+25,lab,fm,INK)
            else:
                x0=x-140-full
                d.rounded_rectangle([P(x0-14),P(yy+2),P(x-130),P(yy+48)],radius=P(8),fill=(255,255,255))
                text(x0,yy+25,num,fb,ACC); text(x0+nw+22,yy+25,lab,fm,INK)
        elif k=="note":
            xa,xb=cx[it["a"]],cx[it["b"]]; t=it["t"]; w=max(tw(t,fm)+70,abs(xb-xa)+bw*0.8)
            mx=(xa+xb)/2; mx=min(max(mx,40+w/2),W-40-w/2); yy=it["y"]
            d.rounded_rectangle([P(mx-w/2),P(yy),P(mx+w/2),P(yy+80)],radius=P(10),fill=NOTE_BG,outline=NOTE_BD,width=P(2.5))
            text(mx,yy+40,t,fm,NOTE_TX,anchor="mm")
    out=img.resize((W,H),Image.LANCZOS); out.save(fn,optimize=True); print(fn,out.size)

P1=[("B","Browser"),("G","API gateway"),("I","Ingest"),("P","PostgreSQL"),("Q","Redis Streams"),("W","Worker"),("S","SSE hub")]
S1=[("msg","B","G","POST /v1/batches (file, JWT)"),
("note","G","G","Verify JWT, role, rate limit"),
("msg","G","I","Forward with institution scope"),
("msg","I","P","INSERT upload_batch (status = received)"),
("self","I","Parse file and map columns"),
("self","I","Instant checks per 1,000-row chunk"),
("msg","I","P","Stage valid rows, save row issues"),
("msg","I","Q","XADD batch.validate"),
("msg","I","B","202 Accepted with batch_id",True),
("msg","B","S","Open SSE stream /v1/batches/{id}/events"),
("msg","Q","W","XREADGROUP (consumer group)"),
("msg","W","P","Load staged rows and programme limits"),
("self","W","Deep checks: seats, quotas, duplicates"),
("msg","W","P","Cross-institution lookup by APAAR ID"),
("self","W","Anomaly scoring (rules, stats, Isolation Forest)"),
("alt","over-intake or double enrolment"),
("msg","W","P","INSERT anomaly (critical), hold promotion"),
("else","clean"),
("msg","W","P","Promote rows to repository (one transaction)"),
("end",),
("msg","W","Q","XADD batch.done and outbox event"),
("msg","Q","S","Publish progress and alerts"),
("msg","S","B","Progress, counts, issues",True),
("msg","S","B","Alert on AICTE dashboard",True)]
out_dir = os.environ.get("FLOW_IMAGES_DIR", "./flow-images")
os.makedirs(out_dir, exist_ok=True)
render(os.path.join(out_dir, "01_upload_validation_sequence.png"),"Upload and validation flow","APAAR Setu  ·  from file upload to verified repository",P1,S1)

P2=[("St","Student app"),("A","API"),("C","Consent"),("K","Credential service"),("H","KMS / HSM"),("L","Audit log"),("E","Employer phone")]
S2=[("msg","St","A","POST /v1/credentials (claims, purpose, days)"),
("self","A","Authenticate student, confirm APAAR ownership"),
("msg","A","C","Create consent record"),
("msg","C","L","Append consent event"),
("msg","A","K","Build minimal payload from chosen claims"),
("msg","K","H","Sign payload (Ed25519)"),
("msg","H","K","Signature",True),
("msg","K","L","Append credential.issued (hash chain)"),
("msg","K","St","Signed token and QR link",True),
("note","St","E","Student shows or sends the QR"),
("self","E","Open verifier page, issuer public key already embedded"),
("self","E","Verify signature on device (works offline)"),
("opt","phone is online"),
("msg","E","A","GET /v1/verify?t=token"),
("msg","A","K","Check revocation list and expiry"),
("msg","K","L","Append verify event"),
("msg","A","E","Verified, Revoked or Expired",True),
("end",),
("note","E","E","Show one clear result with only the shared claims"),
("msg","St","A","DELETE /v1/consents/{id} (revoke)"),
("msg","A","K","Add credential to revocation list"),
("msg","K","L","Append credential.revoked")]
render(os.path.join(out_dir, "02_credential_verification_sequence.png"),"Credential issue and verification flow","APAAR Setu  ·  from student consent to employer result",P2,S2)
