products = [
  {'id':'massage-gun','rank':1,'name':'마사지건','keywords':['목·어깨 통증','허리 통증','근육 이완','마사지','피로 회복']},
  {'id':'lumbar-cushion','rank':2,'name':'허리 쿠션','keywords':['허리 통증','자세 교정','의자','앉기','요추']},
  {'id':'neck-massager','rank':3,'name':'넥 마사지기','keywords':['목·어깨 통증','목 통증','경추','마사지','어깨 결림']},
  {'id':'eye-massager','rank':4,'name':'눈 마사지기','keywords':['눈 피로','안구건조증','눈 통증','수면']},
  {'id':'foot-massager','rank':5,'name':'발 마사지기','keywords':['피로 회복','다리 부종','발 피로','혈액순환','스트레칭']},
  {'id':'posture-corrector','rank':6,'name':'자세 교정 밴드','keywords':['자세 교정','목·어깨 통증','허리 통증','굽은 어깨','척추']},
  {'id':'monitor-stand','rank':7,'name':'모니터 거치대','keywords':['목·어깨 통증','자세 교정','모니터','거북목']},
  {'id':'yoga-mat','rank':8,'name':'요가 매트','keywords':['스트레칭','피로 회복','허리 통증','코어 운동','홈트']},
  {'id':'protein-supplement','rank':9,'name':'단백질 보충제','keywords':['단백질','근육','근감소','근력운동','근육합성','근육회복','근감소증']},
  {'id':'omega3','rank':10,'name':'오메가3','keywords':['혈관건강','혈압','심혈관','뇌건강','혈액순환']},
  {'id':'joint-supplement','rank':11,'name':'관절 영양제','keywords':['무릎통증','관절','무릎보호','관절보호','스트레칭','유연성']},
  {'id':'vitamin-d-calcium','rank':12,'name':'비타민D+칼슘','keywords':['낙상예방','균형감각','면역력','뼈','골밀도']},
  {'id':'magnesium-sleep','rank':13,'name':'마그네슘','keywords':['수면','수면 개선','피로 회복','스트레스','수면질']},
  {'id':'lutein','rank':14,'name':'루테인·지아잔틴','keywords':['눈 피로','안구건조증','눈 통증','눈 건강','블루라이트']},
  {'id':'vitamin-b','rank':15,'name':'비타민B 복합제','keywords':['피로 회복','신경통','에너지','만성 피로']},
  {'id':'vitamin-c','rank':16,'name':'비타민C','keywords':['피로 회복','면역력','항산화','만성 피로']},
  {'id':'collagen-peptide','rank':17,'name':'콜라겐 펩타이드','keywords':['스트레칭','관절','연골','유연성']},
  {'id':'coenzyme-q10','rank':18,'name':'코엔자임Q10','keywords':['피로 회복','만성 피로','에너지','심혈관','항산화']},
  {'id':'milk-thistle','rank':19,'name':'밀크씨슬','keywords':['피로 회복','간건강','만성 피로','해독']},
  {'id':'iron-supplement','rank':20,'name':'철분','keywords':['피로 회복','만성 피로','빈혈','여성 건강']},
  {'id':'wrist-brace','rank':21,'name':'손목 보호대','keywords':['손목·팔꿈치 통증','손목','손목터널증후군','키보드']},
  {'id':'elbow-brace','rank':22,'name':'팔꿈치 보호대','keywords':['손목·팔꿈치 통증','팔꿈치','테니스엘보우','마우스']},
  {'id':'foam-roller','rank':23,'name':'폼롤러','keywords':['스트레칭','허리 통증','목·어깨 통증','근막 이완','홈트']},
  {'id':'cervical-traction','rank':24,'name':'경추 견인기','keywords':['목·어깨 통증','자세 교정','거북목','경추','목 디스크']},
  {'id':'blue-light-glasses','rank':25,'name':'블루라이트 차단 안경','keywords':['눈 피로','수면 개선','안구건조증','블루라이트','모니터']},
  {'id':'heat-pad','rank':26,'name':'온열 찜질 패드','keywords':['목·어깨 통증','허리 통증','손목·팔꿈치 통증','근육 이완','혈액순환']},
  {'id':'footrest','rank':27,'name':'발판(풋레스트)','keywords':['허리 통증','자세 교정','다리 부종','요추','앉기']},
  {'id':'standing-mat','rank':28,'name':'스탠딩 데스크 매트','keywords':['허리 통증','피로 회복','스트레칭','다리 피로','스탠딩']},
]

categories = ['목·어깨 통증','허리 통증','눈 피로','자세 교정','스트레칭','피로 회복','수면 개선','손목·팔꿈치 통증']

def pick_products(category):
    scored = []
    for p in products:
        score = sum(1 for k in p['keywords'] if k == category or category in k)
        scored.append((score, p['rank'], p))
    scored.sort(key=lambda x: (-x[0], x[1]))
    top = [x[2] for x in scored[:2] if x[0] > 0]
    return top if top else products[:2]

print("=" * 50)
for cat in categories:
    result = pick_products(cat)
    print(f"\n[{cat}]")
    for i, p in enumerate(result, 1):
        print(f"  {i}. {p['name']} (rank {p['rank']})")
print("\n" + "=" * 50)
