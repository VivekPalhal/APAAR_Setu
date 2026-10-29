from PIL import Image, ImageDraw, ImageFont
import os
R="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
B="/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
F=lambda p,s: ImageFont.truetype(p,s)
INK=(27,29,35); MUTED=(107,111,122); ACC=(55,48,163); SOFT=(238,240,255); LINE=(227,229,245); ALT=(247,248,255)
W=1600; PAD=56; S=1  # px already at 2x scale
OUT = os.environ.get("TABLE_IMAGES_DIR", "./table-images")

def wrap(draw,text,font,maxw):
    words=text.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if draw.textlength(t,font=font)<=maxw: cur=t
        else: lines.append(cur); cur=w
    if cur: lines.append(cur)
    return lines

def icon(d,x,y,s,kind):
    d.rounded_rectangle([x,y,x+s,y+s],radius=14,fill=ACC)
    c=(255,255,255); cx,cy=x+s/2,y+s/2
    if kind=="shield":
        d.polygon([(cx,y+11),(x+s-12,y+19),(x+s-14,cy+8),(cx,y+s-9),(x+14,cy+8),(x+12,y+19)],fill=c)
        d.line([(cx-9,cy+1),(cx-2,cy+8),(cx+10,cy-6)],fill=ACC,width=5)
    elif kind=="bars":
        for i,h in enumerate([16,26,36]): d.rectangle([x+15+i*15,y+s-12-h,x+25+i*15,y+s-12],fill=c)
    elif kind=="people":
        d.ellipse([cx-18,y+12,cx-2,y+28],fill=c); d.ellipse([cx+2,y+12,cx+18,y+28],fill=c)
        d.pieslice([cx-26,y+30,cx+0,y+s+14],180,360,fill=c); d.pieslice([cx+0,y+30,cx+26,y+s+14],180,360,fill=c)
    elif kind=="build":
        d.rectangle([x+14,y+14,x+s-14,y+s-12],fill=c)
        for i in range(2):
            for j in range(3): d.rectangle([x+20+j*13,y+20+i*14,x+28+j*13,y+28+i*14],fill=ACC)
    elif kind=="stack":
        for i in range(3): d.rounded_rectangle([x+12,y+12+i*13,x+s-12,y+22+i*13],radius=3,fill=c)
    else:
        d.line([(x+14,cy+2),(cx-3,y+s-14),(x+s-13,y+14)],fill=c,width=7)

def make(fn,title,kind,cols,rows,widths):
    tmp=Image.new("RGB",(W,10)); d=ImageDraw.Draw(tmp)
    fh,fl,fr,ft=F(B,30),F(B,34),F(R,34),F(B,50)
    tw=W-2*PAD; xs=[0]
    for w in widths: xs.append(xs[-1]+int(tw*w))
    cp=30; badge=52
    laid=[]
    for i,r in enumerate(rows):
        cells=[]
        for ci,t in enumerate(r):
            f=fl if ci==0 else fr
            off=(badge+20) if ci==0 else 0
            lines=wrap(d,t,f,xs[ci+1]-xs[ci]-2*cp-off)
            cells.append(lines)
        h=max(len(c) for c in cells)*46+2*28
        laid.append((cells,max(h,badge+2*24)))
    head_h=84; th=head_h+sum(h for _,h in laid)
    title_h=120; foot=70
    H=PAD+title_h+th+foot+PAD//2
    img=Image.new("RGB",(W,H),(255,255,255)); d=ImageDraw.Draw(img)
    icon(d,PAD,PAD,76,kind); d.text((PAD+100,PAD+8),title,font=ft,fill=INK)
    d.text((PAD+100,PAD+70),"APAAR Setu  ·  SIH Problem Statement 26263",font=F(R,24),fill=MUTED)
    ty=PAD+title_h
    tbl=Image.new("RGB",(tw,th),(255,255,255)); td=ImageDraw.Draw(tbl)
    td.rectangle([0,0,tw,head_h],fill=ACC)
    for ci,c in enumerate(cols):
        td.text((xs[ci]+cp,head_h/2),c,font=fh,fill=(255,255,255),anchor="lm")
    y=head_h
    for i,(cells,h) in enumerate(laid):
        td.rectangle([0,y,tw,y+h],fill=ALT if i%2 else (255,255,255))
        if i>0: td.line([(0,y),(tw,y)],fill=LINE,width=2)
        for ci,lines in enumerate(cells):
            f=fl if ci==0 else fr; col=INK if ci==0 else (60,64,74)
            tx=xs[ci]+cp; 
            if ci==0:
                by=y+(h-badge)/2
                td.ellipse([tx,by,tx+badge,by+badge],fill=SOFT)
                n=str(i+1); nb=td.textbbox((0,0),n,font=F(B,28))
                td.text((tx+(badge-(nb[2]-nb[0]))/2-nb[0],by+(badge-(nb[3]-nb[1]))/2-nb[1]),n,font=F(B,28),fill=ACC)
                tx+=badge+20
            ty0=y+(h-len(lines)*46)/2
            for li,l in enumerate(lines): td.text((tx,ty0+li*46),l,font=f,fill=col)
        if len(cols)>1:
            for xx in xs[1:-1]: td.line([(xx,y+16),(xx,y+h-16)],fill=LINE,width=2)
        y+=h
    mask=Image.new("L",(tw,th),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,tw-1,th-1],radius=22,fill=255)
    img.paste(tbl,(PAD,ty),mask)
    d.rounded_rectangle([PAD,ty,PAD+tw-1,ty+th-1],radius=22,outline=LINE,width=3)
    d.text((PAD,ty+th+22),"One verified record for every AICTE student",font=F(R,24),fill=MUTED)
    img.save(os.path.join(OUT,fn),optimize=True); print(fn,img.size)

T=[
("01_governance_benefits.png","Organizational / Governance Benefits","build",["Benefit","Why"],[
 ["Single source of truth","One verified record per student, keyed on APAAR ID"],
 ["Early over-intake alerts","Flags a programme the moment seats pass approved intake"],
 ["Double enrolment caught","Same student at two institutions is found automatically"],
 ["Full audit trail","Every upload, edit, and view stored in a tamper-evident log"],
 ["Explainable AI alerts","Each flag shows a risk score and the evidence behind it"],
 ["No single-person dependency","Rules are configured by AICTE, not hard-coded by developers"]],[0.36,0.64]),
("02_institution_benefits.png","Institution Benefits","people",["Benefit","Why"],[
 ["One upload, any format","CSV, Excel, API, or ERP webhook"],
 ["Instant feedback","Errors appear in seconds with a clear fix hint"],
 ["Guided onboarding","Wizard moves from aggregate counts to student-level data"],
 ["Fewer rejections","Rules are visible before submission, not after"],
 ["Certificates made easy","APAAR ID and verification QR ready to print"]],[0.36,0.64]),
("03_student_employer_benefits.png","Student and Employer Benefits","shield",["Benefit","Why"],[
 ["Student owns the data","Share only chosen details and revoke at any time"],
 ["Instant verification","Scan a QR and get one clear result"],
 ["Works offline","The signature is checked on the phone itself"],
 ["Hard to forge","Any edit to the code shows as Not valid"],
 ["No login for employers","Open the link, see the result, done"]],[0.36,0.64]),
("04_security_privacy.png","Security and Privacy","shield",["Protection","How it works"],[
 ["Strong sign-in","SSO with MFA for all staff"],
 ["Role-based access","Each user sees only what their role allows"],
 ["Field-level encryption","DOB, phone, and email encrypted individually"],
 ["Consent ledger","Every share has a purpose, an expiry, and a revoke button"],
 ["Tamper-evident audit","Append-only, hash-chained log of every action"],
 ["DPDP Act 2023 aligned","Data minimisation, consent, and data kept in India"]],[0.36,0.64]),
("05_impact.png","Impact","bars",["Area","Outcome"],[
 ["Governance","Real-time view across 15,000+ institutions"],
 ["Compliance","Over-enrolment and double enrolment caught early"],
 ["Trust","Employer verification in seconds, not days"],
 ["Privacy","Verifiers see only what the student allows"],
 ["Efficiency","Less rework for institutions, faster review for AICTE"],
 ["Scale","Extends later to UGC, NCVET, and state boards"]],[0.28,0.72]),
("06_tech_stack.png","Technology Stack","stack",["Layer","Technology","Why"],[
 ["Backend","Python, FastAPI","Fast to build, clear API docs, strong for AI"],
 ["Frontend","React, Next.js","Clean dashboards, many languages"],
 ["Main database","PostgreSQL","Reliable records and full history"],
 ["Analytics","ClickHouse","Dashboards stay fast on millions of rows"],
 ["Queue","Redis Streams","Background checks and live updates"],
 ["AI","Isolation Forest","Explainable, runs on normal servers"],
 ["Trust","Ed25519 + KMS/HSM","Signed credentials that are hard to forge"],
 ["Deploy","Docker, Kubernetes","Ready for MeghRaj government cloud"]],[0.25,0.28,0.47]),
]
for t in T: make(*t)
