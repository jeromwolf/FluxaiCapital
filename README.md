# FluxAI Capital - 차세대 자산운용 플랫폼

## 프로젝트 개요
1조원 규모 자산운용사 구축을 목표로 하는 AI 기반 투자 관리 시스템

## 기술 스택
- **Backend**: Python 3.11+, FastAPI
- **Database**: PostgreSQL, Redis
- **Data Pipeline**: Apache Airflow, Kafka
- **ML/AI**: PyTorch, scikit-learn
- **Monitoring**: Prometheus, Grafana

## 프로젝트 구조
```
FluxAIcapital/
├── src/
│   ├── api/         # FastAPI 엔드포인트
│   ├── core/        # 핵심 비즈니스 로직
│   ├── models/      # 데이터베이스 모델
│   ├── services/    # 외부 서비스 연동
│   ├── portfolio/   # 포트폴리오 관리
│   ├── risk/        # 리스크 관리
│   └── data/        # 데이터 수집/처리
├── tests/           # 테스트 코드
├── docs/            # 문서
└── config/          # 설정 파일
```

## 로드맵
### Phase 1 (1억 → 10억)
- [ ] MVP 시스템 구축
- [ ] 기본 포트폴리오 관리
- [ ] 리스크 모니터링

### Phase 2 (10억 → 100억)
- [ ] AI 기반 자산배분
- [ ] 자동 리밸런싱
- [ ] 규제 보고 자동화

### Phase 3 (100억 → 1000억)
- [ ] 멀티 전략 구현
- [ ] 기관투자자 대응
- [ ] 글로벌 시장 확대

### Phase 4 (1000억 → 1조)
- [ ] 완전 자동화 운용
- [ ] AI 예측 모델 고도화
- [ ] 글로벌 라이선스 확보