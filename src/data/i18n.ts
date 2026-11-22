import type {
  AppLanguage,
  BackendTech,
  ContentType,
  DevelopmentPlatform,
  HostingProvider,
  OwnershipClaimRecord,
  PlatformCategory,
  PricingModel,
  ProjectReportRecord,
  SortOption,
  VerificationStatus,
} from '../types/vibeatlas';

export const UI_STRINGS: Record<
  AppLanguage,
  {
    nav: {
      home: string;
      discover: string;
      makers: string;
      submit: string;
      githubStars: string;
      primaryCta: string;
    };
    workspace: {
      savedBookmarks: string;
      signInGoogle: string;
      signOut: string;
      makerAccount: string;
      lightMode: string;
      darkMode: string;
      koreanSearchNoteTitle: string;
      koreanSearchNoteBody: string;
    };
    hero: {
      kicker: string;
      headline: string;
      subheadline: string;
      searchPlaceholder: string;
      searchButton: string;
      quickBrowseLabel: string;
      verifiedMetricNote: string;
    };
    home: {
      trendingTab: string;
      newlyLaunchedTab: string;
      risingOssTab: string;
      viewAllDiscover: string;
      mcpAndSkillsTitle: string;
      mcpAndSkillsSubtitle: string;
      stacksTitle: string;
      stacksSubtitle: string;
      koreanGlobalTitle: string;
      koreanGlobalSubtitle: string;
      featuredMakersTitle: string;
      featuredMakersSubtitle: string;
      submitCtaTitle: string;
      submitCtaBody: string;
      submitCtaButton: string;
      newsletterTitle: string;
      newsletterBody: string;
      newsletterPlaceholder: string;
      newsletterButton: string;
      newsletterSignInNotice: string;
      newsletterSuccess: string;
      syncAllLiveGithub: string;
      syncingGithub: string;
    };
    discover: {
      title: string;
      subtitle: string;
      filtersHeading: string;
      mobileFiltersButton: string;
      resetFilters: string;
      searchPlaceholder: string;
      sortLabel: string;
      resultsCount: string;
      emptyTitle: string;
      emptyBody: string;
      previousPage: string;
      nextPage: string;
      filterType: string;
      filterPlatform: string;
      filterHosting: string;
      filterBackend: string;
      filterCountry: string;
      filterLanguage: string;
      filterLicense: string;
      filterPricing: string;
      filterVerification: string;
      sortBy: string;
      sortRelevance: string;
      sortMostLiked: string;
      sortMostBookmarked: string;
      sortMostStarred: string;
      sortRecentlyAdded: string;
      sortRecentlyUpdated: string;
      filterMinStars: string;
      filterUpdatedWithin: string;
      allOption: string;
    };
    card: {
      githubStars: string;
      internalLikes: string;
      internalBookmarks: string;
      notSynced: string;
      trending: string;
      trendingTooltip: string;
      staleLabel: string;
      verifiedLabel: string;
      pendingLabel: string;
      unverifiedLabel: string;
      missingLicense: string;
      openDetail: string;
      likeAction: string;
      bookmarkAction: string;
    };
    detail: {
      close: string;
      fullscreenEnter: string;
      fullscreenExit: string;
      externalLinksTitle: string;
      internalActionsTitle: string;
      liveDemo: string;
      officialWebsite: string;
      githubRepository: string;
      syncGithubNow: string;
      syncing: string;
      provenanceTitle: string;
      provenanceSourceLabel: string;
      lastSyncedLabel: string;
      missingFieldsLabel: string;
      noneMissing: string;
      techAndPlatformTitle: string;
      platformLabel: string;
      hostingLabel: string;
      backendLabel: string;
      licenseLabel: string;
      pricingLabel: string;
      countryLangLabel: string;
      historyChartTitle: string;
      historyChartSubtitle: string;
      chartTabStars: string;
      chartTabInternal: string;
      chartUnsyncedStarsHint: string;
      chartLiveTotalLabel: string;
      chartDeltaLabel: string;
      chartBaselineNote: string;
      relatedTitle: string;
      reportButton: string;
      claimButton: string;
      reportTitle: string;
      claimTitle: string;
      submitReport: string;
      submitClaim: string;
      actionSubmitted: string;
      signInRequired: string;
    };
    projectActivity: {
      title: string;
      empty: string;
      loading: string;
      error: string;
      like: string;
      bookmark: string;
      report: string;
      claim: string;
      unknown: string;
      pending: string;
      approved: string;
      rejected: string;
      open: string;
      reviewed: string;
      resolved: string;
    };
    submit: {
      title: string;
      subtitle: string;
      githubImportTitle: string;
      githubImportHint: string;
      githubImportPlaceholder: string;
      githubFetchButton: string;
      fetchingGithub: string;
      nameLabel: string;
      taglineEnLabel: string;
      taglineKoLabel: string;
      descriptionEnLabel: string;
      descriptionKoLabel: string;
      contentTypeLabel: string;
      categoriesLabel: string;
      techStackLabel: string;
      platformLabel: string;
      hostingLabel: string;
      backendLabel: string;
      countryLabel: string;
      languageLabel: string;
      licenseLabel: string;
      pricingLabel: string;
      liveDemoLabel: string;
      websiteLabel: string;
      githubUrlLabel: string;
      makerNameLabel: string;
      makerHandleLabel: string;
      submitButton: string;
      submitting: string;
      signInPrompt: string;
      submitSuccess: string;
      draftRestoredNotice: string;
      draftAutosaveHint: string;
      clearDraftButton: string;
      validationSummaryPrefix: string;
    };
    maker: {
      title: string;
      subtitle: string;
      myProjectsTab: string;
      myBookmarksTab: string;
      claimsReportsTab: string;
      signInCtaTitle: string;
      signInCtaBody: string;
      noProjectsYet: string;
      noBookmarksYet: string;
      resyncGithub: string;
      deleteProject: string;
      analyticsTitle: string;
      analyticsSubtitle: string;
      metricOwnedProjects: string;
      metricTotalLikes: string;
      metricTotalBookmarks: string;
      metricTotalEngagement: string;
      metricExternalStarsNote: string;
      analyticsSortEngagement: string;
      analyticsSortLikes: string;
      analyticsSortBookmarks: string;
      analyticsSortRecent: string;
      tableProjectCol: string;
      tableLikesCol: string;
      tableBookmarksCol: string;
      tableTotalCol: string;
      tableSplitCol: string;
      tableGithubCol: string;
      topProjectLabel: string;
      analyticsEmptyHint: string;
      projectListHeading: string;
      likesUnit: string;
      bookmarksUnit: string;
      engagementUnit: string;
    };
    footer: {
      tagline: string;
      transparencyNote: string;
    };
    voiceSearch: {
      startLabel: string;
      stopLabel: string;
      listeningStatus: string;
      stopButton: string;
      unsupportedError: string;
      permissionDeniedError: string;
      noSpeechError: string;
      audioCaptureError: string;
      networkError: string;
      unknownError: string;
      dismissError: string;
    };
    githubStarsPage: {
      title: string;
      subtitle: string;
      refreshing: string;
      refreshButton: string;
      searchPlaceholder: string;
      allLanguagesOption: string;
      presetAll: string;
      presetWebApps: string;
      presetAiAgents: string;
      presetTypescript: string;
      presetPython: string;
      presetRust: string;
      presetGo: string;
      kpiRankedCount: string;
      kpiTopStars: string;
      kpiMedianStars: string;
      kpiLastUpdated: string;
      cachedFallbackBadge: string;
      translatingDescriptions: string;
      showingCountLabel: string;
      translationErrorNotice: string;
      retryButton: string;
      errorTitle: string;
      rateLimitResetPrefix: string;
      emptyTitle: string;
      emptyBody: string;
      emptyFilteredTitle: string;
      emptyFilteredBody: string;
      resetFilterButton: string;
      colRank: string;
      colRepository: string;
      colLanguageLicense: string;
      colForks: string;
      colStars: string;
      colActions: string;
      openInVibeAtlas: string;
      openGithub: string;
      showOriginal: string;
      showTranslated: string;
    };
  }
> = {
  ko: {
    nav: {
      home: '홈',
      discover: '탐색',
      makers: '메이커',
      submit: '등록하기',
      githubStars: 'GitHub 스타',
      primaryCta: '프로젝트 등록',
    },
    workspace: {
      savedBookmarks: '북마크',
      signInGoogle: 'Google 로그인',
      signOut: '로그아웃',
      makerAccount: '메이커 계정',
      lightMode: '라이트 모드',
      darkMode: '다크 모드',
      koreanSearchNoteTitle: '한/영 다국어 검색 안내',
      koreanSearchNoteBody:
        '기본 영문 형태소 토크나이저는 한국어 조사·어미를 분리하지 못하므로, W-Vibe는 한국어 부분 문자열 매칭과 기술 용어 한·영 동의어 확장(예: 에이전트↔agent, 서버↔server)을 병행합니다.',
    },
    hero: {
      kicker: '검증된 메타데이터 · 투명한 랭킹',
      headline: '바이브코딩 앱, MCP 서버, AI Skills를 한눈에 찾고 검증하세요',
      subheadline:
        'W-Vibe는 GitHub 스타와 내부 좋아요·북마크를 엄격히 분리하고, 미확인·오래된 데이터를 숨기지 않고 투명하게 표기하는 글로벌 메이커 디스커버리 플랫폼입니다.',
      searchPlaceholder: '예: MCP 서버, Lovable, 한국어 에이전트, Supabase...',
      searchButton: '검색',
      quickBrowseLabel: '빠른 탐색',
      verifiedMetricNote:
        'GitHub 지표는 공식 REST API로 실시간 동기화되며, 내부 북마크·좋아요와 절대 합산하지 않습니다.',
    },
    home: {
      trendingTab: '이번 주 트렌딩',
      newlyLaunchedTab: '신규 런칭',
      risingOssTab: '급상승 오픈소스',
      viewAllDiscover: '전체 디렉터리 탐색',
      mcpAndSkillsTitle: '인기 MCP 서버 & AI Skills',
      mcpAndSkillsSubtitle: '에이전트 워크플로우와 도구 프로토콜을 검증된 저장소 기준으로 탐색하세요.',
      stacksTitle: '빌드 스택별 큐레이션',
      stacksSubtitle: 'Lovable · Vercel · Supabase · Cursor 등 실제 운영 스택을 투명하게 공개한 프로젝트',
      koreanGlobalTitle: '한국 및 글로벌 메이커 스포트라이트',
      koreanGlobalSubtitle: '서울에서 샌프란시스코까지, 검증된 1인 개발자 및 AI 네이티브 팀의 프로덕트',
      featuredMakersTitle: '주목할 메이커 & 기여자',
      featuredMakersSubtitle: '메타데이터 출처와 저장소가 확인된 빌더들',
      submitCtaTitle: '만든 AI 툴이나 MCP 서버를 글로벌 사용자에게 알리세요',
      submitCtaBody:
        'GitHub 저장소를 연결해 별점·라이선스를 자동 검증하고, 사용 스택과 데모 링크를 투명하게 소개할 수 있습니다.',
      submitCtaButton: '지금 프로젝트 등록',
      newsletterTitle: '주간 W-Vibe 다이제스트',
      newsletterBody: '매주 검증된 신규 MCP 서버, AI Skills, 한국·글로벌 메이커 출시 소식을 받아보세요.',
      newsletterPlaceholder: '이메일 주소 입력 (Google 로그인 연동)',
      newsletterButton: '구독 신청',
      newsletterSignInNotice: '안전한 구독 저장을 위해 Google 로그인 후 신청해 주세요.',
      newsletterSuccess: '구독이 저장되었습니다.',
      syncAllLiveGithub: 'GitHub 스타 실시간 동기화',
      syncingGithub: 'GitHub 동기화 중...',
    },
    discover: {
      title: '프로젝트 & 리소스 탐색',
      subtitle: '모든 필터는 URL 쿼리와 동기화되어 링크 공유 및 새로고침 시 그대로 유지됩니다.',
      filtersHeading: '세부 필터',
      mobileFiltersButton: '필터',
      resetFilters: '필터 초기화',
      searchPlaceholder: '키워드, 스택, 메이커, 저장소 검색...',
      sortLabel: '정렬',
      resultsCount: '개 결과',
      emptyTitle: '조건에 일치하는 프로젝트가 없습니다',
      emptyBody: '필터 조건을 완화하거나 검색어를 변경해 보세요.',
      previousPage: '이전',
      nextPage: '다음',
      filterType: '콘텐츠 유형',
      filterPlatform: '개발 플랫폼',
      filterHosting: '호스팅',
      filterBackend: '백엔드',
      filterCountry: '국가',
      filterLanguage: '지원 언어',
      filterLicense: '라이선스',
      filterPricing: '가격 모델',
      filterVerification: '검증 상태',
      sortBy: '정렬 기준',
      sortRelevance: '관련도',
      sortMostLiked: '좋아요 많은 순',
      sortMostBookmarked: '북마크 많은 순',
      sortMostStarred: 'GitHub 스타 많은 순',
      sortRecentlyAdded: '최신 추가 순',
      sortRecentlyUpdated: '최근 업데이트 순',
      filterMinStars: '최소 GitHub 스타',
      filterUpdatedWithin: '최근 업데이트',
      allOption: '전체',
    },
    card: {
      githubStars: 'GitHub 스타',
      internalLikes: '좋아요',
      internalBookmarks: '북마크',
      notSynced: '미동기화',
      trending: '트렌딩',
      trendingTooltip: '최근 7일간 GitHub 스타가 가장 많이 증가한 프로젝트',
      staleLabel: '동기화 오래됨',
      verifiedLabel: '검증됨',
      pendingLabel: '검증 대기',
      unverifiedLabel: '미검증',
      missingLicense: '라이선스 미표기',
      openDetail: '상세 보기',
      likeAction: '좋아요',
      bookmarkAction: '북마크',
    },
    detail: {
      close: '닫기',
      fullscreenEnter: '전체화면으로 보기',
      fullscreenExit: '풀스크린 종료',
      externalLinksTitle: '외부 링크 (외부 사이트로 이동)',
      internalActionsTitle: 'W-Vibe 내부 액션',
      liveDemo: '라이브 데모',
      officialWebsite: '공식 웹사이트',
      githubRepository: 'GitHub 저장소',
      syncGithubNow: 'GitHub 지금 동기화',
      syncing: '동기화 중...',
      provenanceTitle: '메타데이터 출처 & 신선도',
      provenanceSourceLabel: '출처',
      lastSyncedLabel: '마지막 동기화',
      missingFieldsLabel: '누락 · 미확인 필드',
      noneMissing: '누락된 핵심 필드 없음',
      techAndPlatformTitle: '기술 스택 및 인프라 귀속',
      platformLabel: '개발 플랫폼',
      hostingLabel: '호스팅',
      backendLabel: '백엔드',
      licenseLabel: '라이선스',
      pricingLabel: '가격 정책',
      countryLangLabel: '국가 / 언어',
      historyChartTitle: '최근 14일 성장 추이 (GitHub 스타 · 내부 신호)',
      historyChartSubtitle: 'GitHub 스타 변화량과 W-Vibe 내부 북마크·좋아요는 별도 축으로 구분됩니다.',
      chartTabStars: 'GitHub 스타',
      chartTabInternal: '내부 좋아요·북마크',
      chartUnsyncedStarsHint: 'GitHub 저장소가 아직 동기화되지 않았습니다. 실시간 스타 수를 반영하려면 동기화하세요.',
      chartLiveTotalLabel: '현재 GitHub 스타',
      chartDeltaLabel: '14일 증가',
      chartBaselineNote: '현재 실시간 기준선 (일별 동기화 누적 시 변화 추이가 표시됩니다)',
      relatedTitle: '유사 프로젝트 및 대안',
      reportButton: '정보 오류/신고',
      claimButton: '소유권 인증 요청',
      reportTitle: '프로젝트 정보 오류 및 문제 신고',
      claimTitle: '메이커 소유권 인증 요청',
      submitReport: '신고 접수',
      submitClaim: '인증 요청 제출',
      actionSubmitted: 'Firestore에 안전하게 기록되었습니다.',
      signInRequired: '이 작업을 저장하려면 Google 로그인이 필요합니다.',
    },
    projectActivity: {
      title: '커뮤니티 활동',
      empty: '아직 기록된 활동이 없습니다',
      loading: '활동을 불러오는 중…',
      error: '활동을 불러오지 못했습니다',
      like: '좋아요',
      bookmark: '북마크',
      report: '신고',
      claim: '소유권 인증',
      unknown: '알 수 없음',
      pending: '대기',
      approved: '승인',
      rejected: '거부',
      open: '미처리',
      reviewed: '검토됨',
      resolved: '해결됨',
    },
    submit: {
      title: '새 프로젝트 등록',
      subtitle: '검증 가능한 메타데이터를 입력하면 즉시 디렉터리에 게시되고 Firestore에 저장됩니다.',
      githubImportTitle: 'GitHub 저장소에서 메타데이터 가져오기',
      githubImportHint: '예: modelcontextprotocol/servers 또는 https://github.com/cline/cline',
      githubImportPlaceholder: 'owner/repo 또는 GitHub URL 입력',
      githubFetchButton: '실시간 가져오기',
      fetchingGithub: '조회 중...',
      nameLabel: '프로젝트 이름 *',
      taglineEnLabel: '영문 한 줄 소개 (5~220자) *',
      taglineKoLabel: '한국어 한 줄 소개',
      descriptionEnLabel: '영문 상세 설명 (최소 20자) *',
      descriptionKoLabel: '한국어 상세 설명',
      contentTypeLabel: '콘텐츠 유형',
      categoriesLabel: '카테고리 (쉼표 구분, 최대 6개) *',
      techStackLabel: '기술 스택 (쉼표 구분, 최대 12개)',
      platformLabel: '개발 플랫폼',
      hostingLabel: '호스팅 제공자',
      backendLabel: '백엔드 기술',
      countryLabel: '국가 코드 (예: KR, US) *',
      languageLabel: '지원 언어',
      licenseLabel: '라이선스 (예: MIT, Apache-2.0) *',
      pricingLabel: '가격 모델',
      liveDemoLabel: '라이브 데모 URL (https://)',
      websiteLabel: '공식 웹사이트 URL (https://)',
      githubUrlLabel: 'GitHub URL (https://)',
      makerNameLabel: '메이커 / 팀 이름 *',
      makerHandleLabel: '메이커 핸들 (예: @handle)',
      submitButton: '디렉터리에 등록',
      submitting: '등록 중...',
      signInPrompt: '프로젝트를 Firestore에 게시하려면 먼저 Google 계정으로 로그인해 주세요.',
      submitSuccess: '프로젝트가 등록되었습니다!',
      draftRestoredNotice: '이전에 작성 중이던 임시 저장 내용을 로컬 스토리지에서 불러왔습니다.',
      draftAutosaveHint: '입력 중인 내용과 설정은 30초마다 브라우저 로컬 스토리지에 자동 저장됩니다.',
      clearDraftButton: '임시 저장 초기화',
      validationSummaryPrefix: '입력 항목을 확인해 주세요',
    },
    maker: {
      title: '메이커 대시보드 & 저장 목록',
      subtitle: '내가 등록한 프로젝트, 북마크한 리소스, 소유권 인증 및 신고 내역을 관리합니다.',
      myProjectsTab: '내 프로젝트',
      myBookmarksTab: '북마크 목록',
      claimsReportsTab: '소유권 인증 · 신고 내역',
      signInCtaTitle: 'Google 계정으로 로그인하여 메이커 대시보드 열기',
      signInCtaBody: '내 프로젝트 관리, 북마크 동기화, GitHub 메타데이터 재동기화를 이용할 수 있습니다.',
      noProjectsYet: '아직 등록한 프로젝트가 없습니다.',
      noBookmarksYet: '북마크한 프로젝트가 없습니다.',
      resyncGithub: 'GitHub 재동기화',
      deleteProject: '삭제',
      analyticsTitle: '프로젝트 참여도 애널리틱스',
      analyticsSubtitle: '내부 좋아요·북마크 합계는 외부 GitHub 스타와 분리 집계됩니다.',
      metricOwnedProjects: '등록 프로젝트',
      metricTotalLikes: '누적 좋아요',
      metricTotalBookmarks: '누적 북마크',
      metricTotalEngagement: '총 내부 참여도',
      metricExternalStarsNote: '외부 GitHub 스타 합계',
      analyticsSortEngagement: '총 참여순',
      analyticsSortLikes: '좋아요순',
      analyticsSortBookmarks: '북마크순',
      analyticsSortRecent: '최신순',
      tableProjectCol: '프로젝트',
      tableLikesCol: '좋아요',
      tableBookmarksCol: '북마크',
      tableTotalCol: '참여 합계',
      tableSplitCol: '참여 비중',
      tableGithubCol: 'GitHub 스타',
      topProjectLabel: '최다 참여 프로젝트',
      analyticsEmptyHint: '프로젝트를 등록하면 각 프로젝트별 좋아요·북마크 추이와 합계가 여기에 표시됩니다.',
      projectListHeading: '보유 프로젝트 목록',
      likesUnit: '좋아요',
      bookmarksUnit: '북마크',
      engagementUnit: '합계',
    },
    footer: {
      tagline: 'W-Vibe (Working Name) — 검증 가능한 AI 프로덕트 · MCP · AI Skills 디렉터리',
      transparencyNote: '모든 외부 GitHub 지표와 내부 활동 지표는 분리 집계됩니다.',
    },
    voiceSearch: {
      startLabel: '음성으로 검색',
      stopLabel: '음성 입력 중지',
      listeningStatus: '듣고 있습니다... 검색어를 말씀해 주세요',
      stopButton: '중지',
      unsupportedError: '이 브라우저는 음성 검색(Web Speech API)을 지원하지 않습니다. Chrome 또는 Edge에서 이용해 주세요.',
      permissionDeniedError: '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 접근을 허용해 주세요.',
      noSpeechError: '음성이 감지되지 않았습니다. 마이크에 대고 다시 말씀해 주세요.',
      audioCaptureError: '마이크 장치를 찾을 수 없습니다. 오디오 입력 장치를 확인해 주세요.',
      networkError: '음성 인식 서버와 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.',
      unknownError: '음성 인식을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      dismissError: '닫기',
    },
    githubStarsPage: {
      title: 'GitHub 스타 순위',
      subtitle: '공개 GitHub 저장소를 스타 수 기준으로 정렬해 보여드립니다. 외부 GitHub 지표로, 앱 내부 활동 지표와는 별도로 집계됩니다.',
      refreshing: '새로 고치는 중…',
      refreshButton: '새로 고침',
      searchPlaceholder: '저장소 또는 설명 검색',
      allLanguagesOption: '모든 언어',
      presetAll: '전체',
      presetWebApps: '웹앱',
      presetAiAgents: 'AI 에이전트',
      presetTypescript: '타입스크립트',
      presetPython: '파이썬',
      presetRust: '러스트',
      presetGo: 'Go',
      kpiRankedCount: '순위 포함 저장소',
      kpiTopStars: '1위 스타',
      kpiMedianStars: '중간값 스타',
      kpiLastUpdated: '마지막 업데이트',
      cachedFallbackBadge: '저장된 캐시 표시 중',
      translatingDescriptions: '설명 번역 중',
      showingCountLabel: '개 표시',
      translationErrorNotice: '설명 번역을 일시 중지했습니다.',
      retryButton: '다시 시도',
      errorTitle: '랭킹을 불러오지 못했습니다',
      rateLimitResetPrefix: '제한 초기화 예정:',
      emptyTitle: '표시할 저장소가 없습니다',
      emptyBody: '잠시 후 다시 시도하거나 새로 고침해 주세요.',
      emptyFilteredTitle: '조건에 맞는 저장소가 없습니다',
      emptyFilteredBody: '검색어나 언어 필터를 조정해 보세요.',
      resetFilterButton: '필터 초기화',
      colRank: '순위',
      colRepository: '저장소',
      colLanguageLicense: '언어 / 라이선스',
      colForks: '포크',
      colStars: '스타',
      colActions: '동작',
      openInVibeAtlas: 'VibeAtlas에서 열기',
      openGithub: 'GitHub에서 열기',
      showOriginal: '원어 보기',
      showTranslated: '번역 보기',
    },
  },
  en: {
    nav: {
      home: 'Home',
      discover: 'Discover',
      makers: 'Makers',
      submit: 'Submit',
      githubStars: 'GitHub Stars',
      primaryCta: 'Submit Project',
    },
    workspace: {
      savedBookmarks: 'Bookmarks',
      signInGoogle: 'Google Sign In',
      signOut: 'Sign Out',
      makerAccount: 'Maker Account',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      koreanSearchNoteTitle: 'Multilingual Search Strategy',
      koreanSearchNoteBody:
        'Standard English word stemmers skip Korean agglutinative tokens. W-Vibe pairs case-insensitive Korean/English substring matching with curated bilingual tech term expansion.',
    },
    hero: {
      kicker: 'Verifiable Metadata · Transparent Rankings',
      headline: 'Discover and evaluate vibe-coded apps, MCP servers, and AI Skills',
      subheadline:
        'W-Vibe separates GitHub stars from internal likes and bookmarks, surfaces metadata provenance, and transparently marks stale or unverified listings.',
      searchPlaceholder: 'Search MCP servers, Lovable apps, Korean makers, Supabase...',
      searchButton: 'Search',
      quickBrowseLabel: 'Quick Browse',
      verifiedMetricNote:
        'GitHub metrics sync via the official REST API and are never blended with internal W-Vibe engagement.',
    },
    home: {
      trendingTab: 'Trending This Week',
      newlyLaunchedTab: 'Newly Launched',
      risingOssTab: 'Rising Open Source',
      viewAllDiscover: 'Browse Full Directory',
      mcpAndSkillsTitle: 'Popular MCP Servers & AI Skills',
      mcpAndSkillsSubtitle: 'Inspect tool protocols, agent skills, and verified repositories.',
      stacksTitle: 'Built with Modern AI Stacks',
      stacksSubtitle: 'Transparent platform attribution across Lovable, Vercel, Supabase, and Cursor.',
      koreanGlobalTitle: 'Korean & Global Maker Spotlight',
      koreanGlobalSubtitle: 'Independent builders and AI-native teams shipping from Seoul and worldwide.',
      featuredMakersTitle: 'Featured Makers',
      featuredMakersSubtitle: 'Builders with verifiable repositories and documented provenance.',
      submitCtaTitle: 'Showcase your AI product or MCP server',
      submitCtaBody:
        'Connect your GitHub repository to pull verifiable license and star telemetry, and document your real build stack.',
      submitCtaButton: 'Submit Your Project',
      newsletterTitle: 'Weekly W-Vibe Digest',
      newsletterBody: 'Curated weekly launches across MCP servers, AI Skills, and Korean/global builders.',
      newsletterPlaceholder: 'Your email (requires Google sign-in)',
      newsletterButton: 'Subscribe',
      newsletterSignInNotice: 'Sign in with Google to save your subscription.',
      newsletterSuccess: 'Subscription saved.',
      syncAllLiveGithub: 'Sync Live GitHub Stars',
      syncingGithub: 'Syncing GitHub...',
    },
    discover: {
      title: 'Discover Projects & Resources',
      subtitle: 'All active filters synchronize with the browser URL for sharing and reloads.',
      filtersHeading: 'Filters',
      mobileFiltersButton: 'Filters',
      resetFilters: 'Reset Filters',
      searchPlaceholder: 'Search keywords, stack, makers, repos...',
      sortLabel: 'Sort',
      resultsCount: 'results',
      emptyTitle: 'No matching projects found',
      emptyBody: 'Try broadening your filters or clearing the search query.',
      previousPage: 'Previous',
      nextPage: 'Next',
      filterType: 'Content Type',
      filterPlatform: 'Dev Platform',
      filterHosting: 'Hosting',
      filterBackend: 'Backend',
      filterCountry: 'Country',
      filterLanguage: 'Language',
      filterLicense: 'License',
      filterPricing: 'Pricing',
      filterVerification: 'Verification',
      sortBy: 'Sort by',
      sortRelevance: 'Relevance',
      sortMostLiked: 'Most Liked',
      sortMostBookmarked: 'Most Bookmarked',
      sortMostStarred: 'Most Starred',
      sortRecentlyAdded: 'Recently Added',
      sortRecentlyUpdated: 'Recently Updated',
      filterMinStars: 'Min GitHub Stars',
      filterUpdatedWithin: 'Last Updated',
      allOption: 'All',
    },
    card: {
      githubStars: 'GitHub Stars',
      internalLikes: 'Likes',
      internalBookmarks: 'Bookmarks',
      notSynced: 'Not synced',
      trending: 'Trending',
      trendingTooltip: 'Top GitHub star gains over the last 7 days',
      staleLabel: 'Stale sync',
      verifiedLabel: 'Verified',
      pendingLabel: 'Pending',
      unverifiedLabel: 'Unverified',
      missingLicense: 'License unspecified',
      openDetail: 'Inspect',
      likeAction: 'Like',
      bookmarkAction: 'Bookmark',
    },
    detail: {
      close: 'Close',
      fullscreenEnter: 'View Fullscreen',
      fullscreenExit: 'Exit Fullscreen',
      externalLinksTitle: 'External Links (Leaves W-Vibe)',
      internalActionsTitle: 'W-Vibe Actions',
      liveDemo: 'Live Demo',
      officialWebsite: 'Official Website',
      githubRepository: 'GitHub Repo',
      syncGithubNow: 'Sync GitHub Now',
      syncing: 'Syncing...',
      provenanceTitle: 'Metadata Provenance & Freshness',
      provenanceSourceLabel: 'Source',
      lastSyncedLabel: 'Last Synced',
      missingFieldsLabel: 'Missing / Unverified Fields',
      noneMissing: 'All core metadata fields present',
      techAndPlatformTitle: 'Stack & Platform Attribution',
      platformLabel: 'Platform',
      hostingLabel: 'Hosting',
      backendLabel: 'Backend',
      licenseLabel: 'License',
      pricingLabel: 'Pricing',
      countryLangLabel: 'Country / Language',
      historyChartTitle: '14-Day Growth History (GitHub Stars & Internal Signals)',
      historyChartSubtitle: 'External GitHub stars and internal W-Vibe engagement are plotted on separate charts.',
      chartTabStars: 'GitHub Stars',
      chartTabInternal: 'Internal Signals',
      chartUnsyncedStarsHint: 'GitHub repository has not been synced yet. Sync now to plot live star totals.',
      chartLiveTotalLabel: 'Current GitHub Stars',
      chartDeltaLabel: '14d Gain',
      chartBaselineNote: 'Live baseline snapshot (daily deltas build over multiple sync days)',
      relatedTitle: 'Related Projects & Alternatives',
      reportButton: 'Report Issue',
      claimButton: 'Claim Ownership',
      reportTitle: 'Report Inaccurate or Broken Listing',
      claimTitle: 'Request Maker Ownership Verification',
      submitReport: 'Submit Report',
      submitClaim: 'Submit Claim',
      actionSubmitted: 'Saved securely to Firestore.',
      signInRequired: 'Please sign in with Google to save this action.',
    },
    projectActivity: {
      title: 'Community Activity',
      empty: 'No activity recorded yet',
      loading: 'Loading activity…',
      error: 'Could not load activity',
      like: 'Like',
      bookmark: 'Bookmark',
      report: 'Report',
      claim: 'Ownership Claim',
      unknown: 'Unknown',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      open: 'Open',
      reviewed: 'Reviewed',
      resolved: 'Resolved',
    },
    submit: {
      title: 'Submit a Project',
      subtitle: 'Publish verifiable metadata to the W-Vibe directory backed by Firestore.',
      githubImportTitle: 'Import Metadata from GitHub',
      githubImportHint: 'e.g. modelcontextprotocol/servers or https://github.com/cline/cline',
      githubImportPlaceholder: 'Enter owner/repo or GitHub URL',
      githubFetchButton: 'Fetch Live Metadata',
      fetchingGithub: 'Fetching...',
      nameLabel: 'Project Name *',
      taglineEnLabel: 'English Tagline (5-220 chars) *',
      taglineKoLabel: 'Korean Tagline',
      descriptionEnLabel: 'English Description (min 20 chars) *',
      descriptionKoLabel: 'Korean Description',
      contentTypeLabel: 'Content Type',
      categoriesLabel: 'Categories (comma-separated, max 6) *',
      techStackLabel: 'Tech Stack (comma-separated, max 12)',
      platformLabel: 'Development Platform',
      hostingLabel: 'Hosting Provider',
      backendLabel: 'Backend Tech',
      countryLabel: 'Country Code (e.g. KR, US) *',
      languageLabel: 'Language',
      licenseLabel: 'License (e.g. MIT, Apache-2.0) *',
      pricingLabel: 'Pricing Model',
      liveDemoLabel: 'Live Demo URL (https://)',
      websiteLabel: 'Official Website URL (https://)',
      githubUrlLabel: 'GitHub URL (https://)',
      makerNameLabel: 'Maker / Team Name *',
      makerHandleLabel: 'Maker Handle (e.g. @handle)',
      submitButton: 'Publish Listing',
      submitting: 'Publishing...',
      signInPrompt: 'Sign in with Google to publish a verified listing to Firestore.',
      submitSuccess: 'Project published to the directory!',
      draftRestoredNotice: 'Restored your previous in-progress draft from local storage.',
      draftAutosaveHint: 'Your notes and settings are automatically saved to local storage every 30 seconds.',
      clearDraftButton: 'Discard Draft',
      validationSummaryPrefix: 'Please fix the highlighted fields',
    },
    maker: {
      title: 'Maker Dashboard & Saved Library',
      subtitle: 'Manage your submitted projects, saved bookmarks, ownership claims, and reports.',
      myProjectsTab: 'My Projects',
      myBookmarksTab: 'Bookmarks',
      claimsReportsTab: 'Claims & Reports',
      signInCtaTitle: 'Sign in with Google to access Maker Dashboard',
      signInCtaBody: 'Manage listings, sync live GitHub metrics, and keep bookmarks across devices.',
      noProjectsYet: 'You have not published any projects yet.',
      noBookmarksYet: 'No bookmarked projects yet.',
      resyncGithub: 'Re-sync GitHub',
      deleteProject: 'Delete',
      analyticsTitle: 'Project Engagement Analytics',
      analyticsSubtitle: 'Internal likes and bookmarks are tallied separately from external GitHub stars.',
      metricOwnedProjects: 'Owned Projects',
      metricTotalLikes: 'Total Likes',
      metricTotalBookmarks: 'Total Bookmarks',
      metricTotalEngagement: 'Total Engagement',
      metricExternalStarsNote: 'Combined external GitHub stars',
      analyticsSortEngagement: 'Engagement',
      analyticsSortLikes: 'Most Liked',
      analyticsSortBookmarks: 'Most Bookmarked',
      analyticsSortRecent: 'Newest',
      tableProjectCol: 'Project',
      tableLikesCol: 'Likes',
      tableBookmarksCol: 'Bookmarks',
      tableTotalCol: 'Total',
      tableSplitCol: 'Engagement Share',
      tableGithubCol: 'GitHub Stars',
      topProjectLabel: 'Top engaging project',
      analyticsEmptyHint: 'Publish a project to inspect likes, bookmarks, and engagement breakdown per listing.',
      projectListHeading: 'Your Listed Projects',
      likesUnit: 'likes',
      bookmarksUnit: 'bookmarks',
      engagementUnit: 'total',
    },
    footer: {
      tagline: 'W-Vibe (Working Name) — Verifiable Discovery for AI Products, MCP & Skills',
      transparencyNote: 'External GitHub stars and internal engagement are always counted separately.',
    },
    voiceSearch: {
      startLabel: 'Search by voice',
      stopLabel: 'Stop voice input',
      listeningStatus: 'Listening... Speak your search query',
      stopButton: 'Stop',
      unsupportedError: 'Voice search (Web Speech API) is not supported in this browser. Please try Chrome or Edge.',
      permissionDeniedError: 'Microphone access was denied. Please allow microphone permission in your browser settings.',
      noSpeechError: 'No speech was detected. Please speak clearly and try again.',
      audioCaptureError: 'No microphone was detected. Check your audio input device.',
      networkError: 'Voice recognition network error. Check your connection and try again.',
      unknownError: 'Could not complete voice recognition. Please try again.',
      dismissError: 'Dismiss',
    },
    githubStarsPage: {
      title: 'GitHub Stars Ranking',
      subtitle: 'Public GitHub repositories ranked by stars. External GitHub metrics, tracked separately from in-app engagement.',
      refreshing: 'Refreshing…',
      refreshButton: 'Refresh',
      searchPlaceholder: 'Search repositories or descriptions',
      allLanguagesOption: 'All languages',
      presetAll: 'All',
      presetWebApps: 'Web Apps',
      presetAiAgents: 'AI Agents',
      presetTypescript: 'TypeScript',
      presetPython: 'Python',
      presetRust: 'Rust',
      presetGo: 'Go',
      kpiRankedCount: 'Ranked Repositories',
      kpiTopStars: 'Top Stars',
      kpiMedianStars: 'Median Stars',
      kpiLastUpdated: 'Last Updated',
      cachedFallbackBadge: 'Showing cached data',
      translatingDescriptions: 'Translating descriptions',
      showingCountLabel: 'shown',
      translationErrorNotice: 'Description translation paused.',
      retryButton: 'Retry',
      errorTitle: 'Could not load the ranking',
      rateLimitResetPrefix: 'Rate limit resets around:',
      emptyTitle: 'No repositories to show',
      emptyBody: 'Try again later or refresh the page.',
      emptyFilteredTitle: 'No repositories match these filters',
      emptyFilteredBody: 'Try adjusting the search or language filter.',
      resetFilterButton: 'Reset filters',
      colRank: 'Rank',
      colRepository: 'Repository',
      colLanguageLicense: 'Language / License',
      colForks: 'Forks',
      colStars: 'Stars',
      colActions: 'Actions',
      openInVibeAtlas: 'Open in VibeAtlas',
      openGithub: 'Open on GitHub',
      showOriginal: 'Show original',
      showTranslated: 'Show translation',
    },
  },
};

export const CONTENT_TYPE_LABELS: Record<AppLanguage, Record<ContentType, string>> = {
  ko: {
    web_app: '웹 애플리케이션',
    ai_tool: 'AI 툴',
    mcp_server: 'MCP 서버',
    ai_skill: 'AI Skills',
    ai_agent: 'AI 에이전트',
    template: '템플릿',
    open_source: '오픈소스',
  },
  en: {
    web_app: 'Web Apps',
    ai_tool: 'AI Tools',
    mcp_server: 'MCP Servers',
    ai_skill: 'AI Skills',
    ai_agent: 'AI Agents',
    template: 'Templates',
    open_source: 'Open Source',
  },
};

export const PLATFORM_LABELS: Record<DevelopmentPlatform, string> = {
  lovable: 'Lovable',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  bolt: 'Bolt.new',
  v0: 'v0 by Vercel',
  claude_code: 'Claude Code',
  replit: 'Replit',
  opencode: 'OpenCode',
  google_ai_studio: 'Google AI Studio',
  custom: 'Custom IDE',
};

/**
 * Internal taxonomy requested for the directory: coding agents and app
 * builders are grouped separately while still storing the concrete
 * `developmentPlatform` value on each project document.
 */
export const PLATFORM_CATEGORIES: Record<PlatformCategory, DevelopmentPlatform[]> = {
  ai_coding_agent: ['opencode', 'cursor', 'windsurf', 'claude_code'],
  ai_app_builder: ['google_ai_studio', 'lovable', 'bolt', 'v0', 'replit'],
  other: ['custom'],
};

export const PLATFORM_CATEGORY_LABELS: Record<AppLanguage, Record<PlatformCategory, string>> = {
  ko: {
    ai_coding_agent: 'AI 코딩 에이전트',
    ai_app_builder: 'AI 앱 빌더',
    other: '기타',
  },
  en: {
    ai_coding_agent: 'AI Coding Agent',
    ai_app_builder: 'AI App Builder',
    other: 'Other',
  },
};

export const ADMIN_STRINGS: Record<
  AppLanguage,
  {
    navLabel: string;
    title: string;
    subtitle: string;
    mainAdmin: string;
    subAdmin: string;
    backHome: string;
    accessDeniedTitle: string;
    accessDeniedBody: string;
    loading: string;
    errorPrefix: string;
    tabs: { overview: string; reports: string; claims: string; projects: string };
    stats: {
      projects: string;
      verified: string;
      openReports: string;
      pendingClaims: string;
      likes: string;
      bookmarks: string;
    };
    reports: {
      title: string;
      subtitle: string;
      empty: string;
      project: string;
      reporter: string;
      reason: string;
      details: string;
      createdAt: string;
      status: string;
      actions: string;
      markReviewed: string;
      markResolved: string;
      reopen: string;
    };
    claims: {
      title: string;
      subtitle: string;
      empty: string;
      project: string;
      claimant: string;
      method: string;
      proof: string;
      createdAt: string;
      status: string;
      actions: string;
      approve: string;
      reject: string;
    };
    projects: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      empty: string;
      name: string;
      platform: string;
      owner: string;
      verification: string;
      actions: string;
      view: string;
      delete: string;
      confirmDelete: string;
      seed: string;
      noActions: string;
    };
    status: {
      open: string;
      reviewed: string;
      resolved: string;
      pending: string;
      approved: string;
      rejected: string;
      verified: string;
      unverified: string;
    };
    reasons: Record<ProjectReportRecord['reason'], string>;
    methods: Record<OwnershipClaimRecord['verificationMethod'], string>;
    points?: {
      title: string;
      earned: string;
      total: string;
      event: string;
      date: string;
      noData: string;
      subtitle: string;
    };
    referrals?: {
      title: string;
      myCode: string;
      shareLink: string;
      codeCopied: string;
      generateCode: string;
      generateCodeSuccess: string;
      codeAlreadyExists: string;
      referrer: string;
      referee: string;
      referralEarned: string;
      refereeBonus: string;
      subtitle: string;
    };
    redemptions?: {
      title: string;
      type: string;
      pointsSpent: string;
      statusPending: string;
      statusApproved: string;
      statusRejected: string;
      submit: string;
      confirmDelete: string;
      subtitle: string;
    };
  }
> = {
  ko: {
    navLabel: '관리자',
    title: '관리자 대시보드',
    subtitle: '신고·소유권 클레임·프로젝트 검증 상태를 한곳에서 검토합니다.',
    mainAdmin: '메인 관리자',
    subAdmin: '서브 관리자',
    backHome: '홈으로',
    accessDeniedTitle: '관리자 전용 페이지입니다',
    accessDeniedBody: '메인 관리자(kwpark0047@gmail.com) 또는 서브 관리자(kwpark0047@iceu.kr) 계정으로 로그인해야 합니다.',
    loading: '불러오는 중…',
    errorPrefix: '작업을 완료하지 못했습니다:',
    tabs: { overview: '개요', reports: '신고', claims: '소유권 클레임', projects: '프로젝트' },
    stats: {
      projects: '등록 프로젝트',
      verified: '검증 완료',
      openReports: '미처리 신고',
      pendingClaims: '대기 클레임',
      likes: '좋아요',
      bookmarks: '북마크',
    },
    reports: {
      title: '신고 처리',
      subtitle: '신고 상태를 검토 중 또는 해결됨으로 변경할 수 있습니다.',
      empty: '접수된 신고가 없습니다.',
      project: '프로젝트',
      reporter: '신고자 UID',
      reason: '사유',
      details: '상세 내용',
      createdAt: '접수일',
      status: '상태',
      actions: '작업',
      markReviewed: '검토 중',
      markResolved: '해결됨',
      reopen: '다시 열기',
    },
    claims: {
      title: '소유권 클레임',
      subtitle: '프로젝트 소유권 주장을 승인하거나 거절합니다.',
      empty: '대기 중인 소유권 클레임이 없습니다.',
      project: '프로젝트',
      claimant: '신청자 UID',
      method: '검증 방식',
      proof: '증빙 메모',
      createdAt: '신청일',
      status: '상태',
      actions: '작업',
      approve: '승인',
      reject: '거절',
    },
    projects: {
      title: '프로젝트 관리',
      subtitle: '검증 상태를 변경하거나 프로젝트를 삭제합니다.',
      searchPlaceholder: '이름, 슬러그, 메이커 검색',
      empty: '조건에 맞는 프로젝트가 없습니다.',
      name: '프로젝트',
      platform: '플랫폼',
      owner: '소유자',
      verification: '검증 상태',
      actions: '작업',
      view: '상세',
      delete: '삭제',
      confirmDelete: '이 프로젝트를 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
      seed: '기본 카탈로그',
      noActions: '번들 시드는 여기서 수정할 수 없습니다.',
    },
    status: {
      open: '접수',
      reviewed: '검토 중',
      resolved: '해결됨',
      pending: '대기',
      approved: '승인',
      rejected: '거절',
      verified: '검증 완료',
      unverified: '미검증',
    },
    reasons: {
      broken_link: '깨진 링크',
      stale_metadata: '오래된 정보',
      spam: '스팸',
      misattribution: '출처 오표기',
      security_concern: '보안 우려',
    },
    methods: {
      github_repo: 'GitHub 저장소',
      domain_dns: '도메인 DNS',
      demo_meta: '데모 메타데이터',
    },
  },
  en: {
    navLabel: 'Admin',
    title: 'Admin dashboard',
    subtitle: 'Review reports, ownership claims, and project verification in one place.',
    mainAdmin: 'Main admin',
    subAdmin: 'Sub admin',
    backHome: 'Back home',
    accessDeniedTitle: 'Admins only',
    accessDeniedBody: 'Sign in with the main admin (kwpark0047@gmail.com) or sub admin (kwpark0047@iceu.kr) account.',
    loading: 'Loading…',
    errorPrefix: 'Could not complete the action:',
    tabs: { overview: 'Overview', reports: 'Reports', claims: 'Claims', projects: 'Projects' },
    stats: {
      projects: 'Projects',
      verified: 'Verified',
      openReports: 'Open reports',
      pendingClaims: 'Pending claims',
      likes: 'Likes',
      bookmarks: 'Bookmarks',
    },
    reports: {
      title: 'Report triage',
      subtitle: 'Move reports to reviewed or resolved.',
      empty: 'No reports yet.',
      project: 'Project',
      reporter: 'Reporter UID',
      reason: 'Reason',
      details: 'Details',
      createdAt: 'Created',
      status: 'Status',
      actions: 'Actions',
      markReviewed: 'Mark reviewed',
      markResolved: 'Mark resolved',
      reopen: 'Reopen',
    },
    claims: {
      title: 'Ownership claims',
      subtitle: 'Approve or reject project ownership claims.',
      empty: 'No pending ownership claims.',
      project: 'Project',
      claimant: 'Claimant UID',
      method: 'Method',
      proof: 'Proof note',
      createdAt: 'Created',
      status: 'Status',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
    },
    projects: {
      title: 'Project management',
      subtitle: 'Change verification status or delete projects.',
      searchPlaceholder: 'Search name, slug, maker',
      empty: 'No projects match the search.',
      name: 'Project',
      platform: 'Platform',
      owner: 'Owner',
      verification: 'Verification',
      actions: 'Actions',
      view: 'View',
      delete: 'Delete',
      confirmDelete: 'Delete this project? This cannot be undone.',
      seed: 'Bundled seed',
      noActions: 'Bundled seeds cannot be edited here.',
    },
    status: {
      open: 'Open',
      reviewed: 'Reviewed',
      resolved: 'Resolved',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      verified: 'Verified',
      unverified: 'Unverified',
    },
    reasons: {
      broken_link: 'Broken link',
      stale_metadata: 'Stale metadata',
      spam: 'Spam',
      misattribution: 'Misattribution',
      security_concern: 'Security concern',
    },
    methods: {
      github_repo: 'GitHub repository',
      domain_dns: 'Domain DNS',
      demo_meta: 'Demo metadata',
    },
    points: {
      title: '포인트 현황',
      earned: '적립 포인트',
      total: '총 포인트',
      event: '이벤트',
      date: '날짜',
      noData: '기록이 없습니다.',
      subtitle: '적립된 포인트 내역을 확인하세요.',
    },
    referrals: {
      title: '추천코드',
      myCode: '내 코드',
      shareLink: '공유 링크',
      codeCopied: '복사되었습니다!',
      generateCode: '추천코드 생성',
      generateCodeSuccess: '추천코드가 생성되었습니다. 20포인트가 적립되었습니다.',
      codeAlreadyExists: '이미 생성된 코드가 있습니다.',
      referrer: '추천인',
      referee: '피추천인',
      referralEarned: '추천으로 Earned',
      subtitle: '추천인 코드를 통한 포인트 적립 내역입니다.',
      refereeBonus: '피추천이 Earned',
    },
    redemptions: {
      title: '환급 신청',
      type: '환급 유형',
      pointsSpent: '소모 포인트',
      statusPending: '접수 대기',
      statusApproved: '승인',
      statusRejected: '거절',
      submit: '신청',
      confirmDelete: '정말로 삭제하시겠습니까?',
      subtitle: '포인트를 사용하여 상품을 신청할 수 있습니다.',
    },
  },
};

export const HOSTING_LABELS: Record<HostingProvider, string> = {
  vercel: 'Vercel',
  cloudflare: 'Cloudflare',
  aws: 'AWS',
  fly_io: 'Fly.io',
  gcp: 'Google Cloud',
  netlify: 'Netlify',
  self_hosted: 'Self-Hosted',
  unknown: 'Unspecified',
};

export const BACKEND_LABELS: Record<BackendTech, string> = {
  supabase: 'Supabase',
  firebase: 'Firebase',
  postgresql: 'PostgreSQL',
  nodejs: 'Node.js / Express',
  python_fastapi: 'Python / FastAPI',
  sqlite: 'SQLite',
  serverless: 'Serverless',
  none: 'Client-Only',
  unknown: 'Unspecified',
};

export const PRICING_LABELS: Record<AppLanguage, Record<PricingModel, string>> = {
  ko: {
    free: '무료',
    open_source: '오픈소스',
    freemium: '부분 유료',
    paid: '유료',
    enterprise: '엔터프라이즈',
  },
  en: {
    free: 'Free',
    open_source: 'Open Source',
    freemium: 'Freemium',
    paid: 'Paid',
    enterprise: 'Enterprise',
  },
};

export const SORT_LABELS: Record<AppLanguage, Record<SortOption, string>> = {
  ko: {
    relevance: '관련도순',
    trending_24h: '트렌딩 24시간',
    trending_7d: '트렌딩 7일',
    trending_30d: '트렌딩 30일',
    most_starred: 'GitHub 스타순',
    most_liked: 'W-Vibe 좋아요순',
    most_bookmarked: 'W-Vibe 북마크순',
    recently_added: '최신 등록순',
    recently_updated: '최근 업데이트순',
  },
  en: {
    relevance: 'Relevance',
    trending_24h: 'Trending 24h',
    trending_7d: 'Trending 7d',
    trending_30d: 'Trending 30d',
    most_starred: 'Most Starred (GitHub)',
    most_liked: 'Most Liked (W-Vibe)',
    most_bookmarked: 'Most Bookmarked',
    recently_added: 'Recently Added',
    recently_updated: 'Recently Updated',
  },
};

export const VERIFICATION_LABELS: Record<AppLanguage, Record<VerificationStatus, string>> = {
  ko: {
    verified: '검증됨',
    pending: '검증 대기',
    unverified: '미검증',
  },
  en: {
    verified: 'Verified',
    pending: 'Pending',
    unverified: 'Unverified',
  },
};
