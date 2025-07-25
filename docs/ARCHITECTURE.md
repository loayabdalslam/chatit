# System Architecture Documentation

## 1. High-Level Architecture

### 1.1 Component Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  React Components  │  OpenCV.js  │  Camera API  │  State Mgmt   │
│  - Registration    │  - Capture  │  - Access    │  - Zustand    │
│  - Authentication  │  - Process  │  - Stream    │  - Persist    │
│  - User Profile    │  - Quality  │  - Controls  │  - Security   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                               HTTPS/WSS
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                           │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions  │  Authentication  │  File Storage    │
│  - Biometric Processing   │  - JWT Tokens    │  - Temp Images   │
│  - Template Matching     │  - Session Mgmt  │  - Audit Files   │
│  - Quality Assessment    │  - Rate Limiting │  - Backups       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                               PostgreSQL
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Tables           │  Security        │  Monitoring              │
│  - users          │  - RLS Policies  │  - Audit Logs           │
│  - templates      │  - Encryption    │  - Performance Metrics  │
│  - auth_logs      │  - Key Vault     │  - Error Tracking       │
│  - sessions       │  - Backup/Restore│  - Usage Analytics       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Architecture

#### Registration Flow
```
User → Camera Capture → Quality Check → Template Extraction → 
Encryption → Database Storage → Registration Complete
```

#### Authentication Flow
```
User → Camera Capture → Template Extraction → Template Matching → 
Confidence Score → Authentication Decision → Session Creation
```

## 2. Technology Stack

### 2.1 Frontend Technologies
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type safety and developer experience
- **OpenCV.js** - Computer vision and image processing
- **Zustand** - Lightweight state management
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions

### 2.2 Backend Technologies
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Relational database with advanced features
- **Edge Functions** - Serverless compute for biometric processing
- **Row Level Security** - Database-level access control
- **Supabase Auth** - Authentication and session management

### 2.3 Security Technologies
- **AES-256** - Symmetric encryption for templates
- **JWT** - Stateless authentication tokens
- **bcrypt** - Password hashing for fallback auth
- **HTTPS/TLS** - Transport layer security
- **CSP** - Content Security Policy headers

## 3. Security Architecture

### 3.1 Encryption Strategy
```
Raw Iris Image → Feature Extraction → Template Generation → 
AES-256 Encryption → Encrypted Storage → Secure Retrieval
```

### 3.2 Key Management
- **Master Key**: Stored in Supabase Vault
- **User Keys**: Derived from master key + user ID
- **Session Keys**: Temporary keys for active sessions
- **Rotation Policy**: Keys rotated every 90 days

### 3.3 Access Control Matrix
```
Role          | Register | Authenticate | View Profile | Admin
User          |    ✓     |      ✓       |      ✓       |   ✗
Admin         |    ✓     |      ✓       |      ✓       |   ✓
System        |    ✓     |      ✓       |      ✓       |   ✓
Anonymous     |    ✗     |      ✗       |      ✗       |   ✗
```

## 4. Performance Architecture

### 4.1 Optimization Strategies
- **Template Caching**: In-memory cache for frequent matches
- **Database Indexing**: Optimized queries for template lookup
- **CDN Integration**: Static assets served from edge locations
- **Lazy Loading**: Components loaded on demand
- **Image Compression**: Optimized capture and processing

### 4.2 Scalability Considerations
- **Horizontal Scaling**: Multiple Edge Function instances
- **Database Sharding**: User data distributed across regions
- **Load Balancing**: Traffic distributed across servers
- **Caching Strategy**: Redis for session and template caching
- **Monitoring**: Real-time performance metrics and alerts