# VistaHealth Pro Multi-Platform Specification

This document outlines the directory structure for VistaHealth Pro across three platforms:
- **Web** (`vistahealth-pro-web`) - React 19 + TanStack Start
- **Mobile** (`vistahealth-pro-mobile`) - React Native + Expo Router  
- **iOS (native)** (`VistaHealthPro`) - Swift 6 + SwiftUI

## Web Platform

**Folder Structure Generated:**
```
vistahealth-pro-web/src/
├── components/
│   ├── layout/             # Sidebar + main content wrapper
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── CommandPalette.tsx
│   │   └── nav-config.ts
│   ├── common/             # Reusable components
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── PageHeader.tsx
│   │   ├── AppointmentStatusChip.tsx
│   │   ├── StatusChip.tsx
│   │   └── EmptyState.tsx
│   └── ui/                 # Shadcn/Radix primitives
├── hooks/                  # use-mobile.tsx
├── lib/                    # Core types and utils
│   ├── types.ts           # Domain models
│   ├── rbac.ts            # Role access control
│   ├── utils.ts
│   ├── store/             # Zustand stores
│   │   ├── auth.ts
│   │   ├── notifications.ts
│   │   └── theme.ts
│   ├── mock/              # Mock data provider
│   │   └── data.ts
│   ├── error-capture.ts
│   └── error-page.ts
├── routes/                # TanStack Router (file-based)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── _app.tsx
│   └── role-specific routes...
├── routeTree.gen.ts
├── router.tsx
└── start.ts
└── server.ts
└── styles.css
```

## Mobile Platform

**Folder Structure Generated:**
```
vistahealth-pro-mobile/src/
├── components/
│   ├── layout/           # UI-specific components
│   │   ├── TabBar.tsx                # Bottom nav
│   │   ├── DrawerContent.tsx         # Side drawer
│   │   ├── Header.tsx                # Screen header
│   │   └── nav-config.ts
│   ├── common/
│   │   ├── StatCard.tsx
│   │   ├── DataCardList.tsx          # FlashList cards
│   │   ├── ScreenHeader.tsx
│   │   ├── AppointmentStatusChip.tsx
│   │   ├── StatusChip.tsx
│   │   └── EmptyState.tsx
│   └── ui/                 # RN reusables
├── hooks/                  # use-keyboard.tsx
├── lib/                    # Shared types/utils
│   ├── types.ts
│   ├── rbac.ts
│   ├── utils.ts
│   ├── store/             # RN stores
│   │   ├── auth.ts
│   │   ├── notifications.ts
│   │   └── theme.ts
│   └── mock/              # Same mock data
└── app/                   # Expo Router
    ├── _layout.tsx
    ├── (auth)/...
    ├── (app)/...
    └── +not-found.tsx
└── styles/tokens.ts
```

## iOS (Native) Platform

**Folder Structure Generated:**
```
VistaHealthPro/src/
├── App/                    # App entry point
│   ├── VistaHealthProApp.swift
│   ├── AppState.swift       # @Observable state
│   ├── RootCoordinator.swift
│   └── RBAC.swift
├── Core/                   # Cross-cutting concerns
│   ├── Models/             # Domain models
│   │   ├── User.swift
│   │   ├── Patient.swift
│   │   └── ...
│   ├── Persistence/        # SwiftData + Keychain
│   │   ├── VistaHealthSchema.swift
│   │   ├── KeychainStore.swift
│   │   └── MockDataProvider.swift
│   ├── Networking/          # Network layer
│   │   ├── APIClient.swift
│   │   └── HospitalDataProviding.swift
│   └── DesignSystem/        # UI components
│       ├── ColorTokens.swift
│       ├── Typography.swift
│       └── ... (StatCard, etc.)
└── Features/               # Role-based features
    ├── Admin/ -> AdminCoordinator + Views
    ├── Doctor/ -> DoctorCoordinator + Views
    └── ... (FrontDesk, Nurse, Pharmacy, Laboratory, Shared)
└── Resources/
    ├── Assets.xcassets
    └── Fonts/
```

## Next Steps

The directory structure has been created for all three platforms. Would you like me to:

1. **Implement core files** - Create essential files like `types.ts`, `rbac.ts`, and mock data
2. **Create navigation structures** - Set up the routing/coordinator files for each role
3. **Create UI components** - Build a subset of key components (StatCard, StatusChip, etc.)
4. **Analyze cross-platform consistency** - Review the architecture for any inconsistencies

Please let me know which approach you'd prefer, or if you'd like to specify different next steps.