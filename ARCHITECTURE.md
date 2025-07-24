# SNAPFIT 코디 시스템 아키텍처

```mermaid
flowchart TD
    subgraph Frontend (Next.js)
        A[CategoryTab] --> B[useCategoryProducts]
        B -->|REST| API[/Product API/]
        A --> C[AvatarCanvas]
        C --> D[WebSocket STOMP]
        A --> E[LikeButton]
        E -->|REST| API
        A --> F[SaveOutfitButton]
        F -->|REST| API[/Outfit API/]
    end

    API --> G((Spring Boot))
    G --> H[OutfitController]
    G --> I[LikeController]
    G --> J[ProductController]
    G --> K[ViewCounterService]
    K -->|Redis| R((Redis))
    G -->|JPA| P[(PostgreSQL)]

    subgraph Scheduler
        S[ViewCountFlushScheduler] --> P
    end

    P -. Flyway .-> M[DB Migration]
```

> Mermaid 다이어그램은 백엔드(Spring Boot)와 프론트엔드(Next.js)가 어떻게 연동되는지 큰 흐름을 보여 줍니다. 